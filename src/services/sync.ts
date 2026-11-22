/**
 * Cross-Platform Sync and Real-Time Event Bus
 * Uses BroadcastChannel for real-time cross-tab/cross-window syncing
 * and localStorage for offline caching.
 */

import { Message, SyncDevice, DirectChat } from '../types';
import { getDeterministicChatTimestamps } from '../utils/chatTimestamps';
import { CURRENT_USER, resolveGenderMatchedAvatar } from '../data/mockData';

export type SyncEventType =
  | 'MESSAGE_SENT'
  | 'MESSAGE_EDITED'
  | 'MESSAGE_READ'
  | 'REACTION_ADDED'
  | 'TYPING_STATUS'
  | 'DEVICE_PING'
  | 'COMMUNITY_JOINED'
  | 'COMMUNITY_LEFT';

export interface SyncPayload {
  type: SyncEventType;
  deviceId: string;
  timestamp: number;
  data: unknown;
}

const SYNC_CHANNEL_NAME = 'cronium_cross_platform_sync_v1';
const CACHE_KEY_MESSAGES = 'cronium_cached_messages';
const CACHE_KEY_DIRECT_CHATS = 'cronium_cached_direct_chats';
const CACHE_KEY_DEVICES = 'cronium_sync_devices';

class CrossPlatformSyncService {
  private channel: BroadcastChannel | null = null;
  private currentDeviceId: string;
  private listeners: ((payload: SyncPayload) => void)[] = [];

  constructor() {
    this.currentDeviceId = this.getOrCreateDeviceId();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<SyncPayload>) => {
          this.handleIncomingSync(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }
    this.resetUserChatInputsOnce();
    this.migrateLegacyTimestamps();
  }

  private resetUserChatInputsOnce() {
    if (typeof window === 'undefined') return;
    try {
      const resetKey = 'cronium_clean_chats_reset_v1';
      if (localStorage.getItem(resetKey)) return;
      localStorage.removeItem(CACHE_KEY_MESSAGES);
      localStorage.removeItem(CACHE_KEY_DIRECT_CHATS);
      localStorage.setItem(resetKey, '1');
    } catch {
      // ignore storage reset errors
    }
  }

  private migrateLegacyTimestamps() {
    if (typeof window === 'undefined') return;
    try {
      const migrationKey = 'cronium_unique_timestamps_v2';
      if (localStorage.getItem(migrationKey)) return;

      const msgMap = this.getCachedMessagesMap();
      let msgsChanged = false;
      const updatedLastTimes: Record<string, string> = {};

      for (const [chatId, msgs] of Object.entries(msgMap)) {
        if (!Array.isArray(msgs) || msgs.length === 0) continue;

        const hasLegacyConvTimestamps = msgs.some(
          (m) =>
            m.id.startsWith('msg_conv_') &&
            (m.timestamp === '10:15 AM' || m.timestamp === '10:20 AM' || m.timestamp === 'Just now')
        );

        const hasLegacyChannelTimestamps = msgs.some(
          (m) => m.id.includes('_var_') && (m.timestamp.startsWith('Today, ') || m.timestamp.startsWith('Yesterday, '))
        );

        if (hasLegacyConvTimestamps || hasLegacyChannelTimestamps) {
          const slots = getDeterministicChatTimestamps(chatId, msgs.length);
          msgMap[chatId] = msgs.map((m, idx) => {
            if (m.id.startsWith('msg_conv_') || m.id.includes('_var_')) {
              return {
                ...m,
                timestamp: slots[idx].timestamp,
                createdAt: slots[idx].createdAt,
              };
            }
            return m;
          });
          const last = msgMap[chatId][msgMap[chatId].length - 1];
          if (last) updatedLastTimes[chatId] = last.timestamp;
          msgsChanged = true;
        }
      }

      if (msgsChanged) {
        localStorage.setItem(CACHE_KEY_MESSAGES, JSON.stringify(msgMap));
      }

      const chats = this.getCachedDirectChats();
      if (chats && chats.length > 0) {
        const refreshed = chats.map((c) => {
          if (updatedLastTimes[c.id]) {
            return { ...c, lastMessageTime: updatedLastTimes[c.id] };
          }
          if (c.lastMessageTime === 'Just now') {
            const [slot] = getDeterministicChatTimestamps(c.id, 1);
            return { ...c, lastMessageTime: slot.timestamp };
          }
          return c;
        });
        localStorage.setItem(CACHE_KEY_DIRECT_CHATS, JSON.stringify(refreshed));
      }

      localStorage.setItem(migrationKey, '1');
    } catch {
      // ignore migration errors
    }
  }

  private getOrCreateDeviceId(): string {
    const fallbackId = 'dev_' + Math.random().toString(36).substring(2, 9);
    if (typeof window === 'undefined') return fallbackId;
    try {
      const existing = window.localStorage.getItem('cronium_device_id');
      if (existing) return existing;
      window.localStorage.setItem('cronium_device_id', fallbackId);
      return fallbackId;
    } catch {
      return fallbackId;
    }
  }

  public getDeviceId(): string {
    return this.currentDeviceId;
  }

  public subscribe(cb: (payload: SyncPayload) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public broadcast(type: SyncEventType, data: unknown) {
    const payload: SyncPayload = {
      type,
      deviceId: this.currentDeviceId,
      timestamp: Date.now(),
      data,
    };

    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.warn('Sync broadcast error:', err);
      }
    }

    // Also notify local listeners
    this.listeners.forEach((l) => l(payload));
  }

  private handleIncomingSync(payload: SyncPayload) {
    if (payload.deviceId === this.currentDeviceId) return; // ignore self
    this.listeners.forEach((l) => l(payload));
  }

  // Offline Caching Helpers
  public saveMessagesToCache(chatId: string, messages: Message[]) {
    try {
      const all = this.getCachedMessagesMap();
      all[chatId] = messages;
      localStorage.setItem(CACHE_KEY_MESSAGES, JSON.stringify(all));
    } catch (e) {
      console.warn('Cache write failed:', e);
    }
  }

  public getCachedMessages(chatId: string): Message[] | null {
    try {
      const all = this.getCachedMessagesMap();
      return all[chatId] || null;
    } catch {
      return null;
    }
  }

  public getCachedMessagesMap(): Record<string, Message[]> {
    try {
      const raw = localStorage.getItem(CACHE_KEY_MESSAGES);
      if (!raw) return {};
      const parsed: Record<string, Message[]> = JSON.parse(raw);
      const sanitized: Record<string, Message[]> = {};
      for (const [chatId, msgs] of Object.entries(parsed)) {
        if (!Array.isArray(msgs)) continue;
        sanitized[chatId] = msgs.map((m) => ({
          ...m,
          senderAvatar:
            m.senderId === CURRENT_USER.id || m.senderId === 'current_user' || m.senderName === CURRENT_USER.name
              ? CURRENT_USER.avatar
              : resolveGenderMatchedAvatar(m.senderName, m.senderAvatar),
        }));
      }
      return sanitized;
    } catch {
      return {};
    }
  }

  // Direct Chats Caching & History Memory
  public saveDirectChats(chats: DirectChat[]) {
    try {
      localStorage.setItem(CACHE_KEY_DIRECT_CHATS, JSON.stringify(chats));
    } catch (e) {
      console.warn('Cache write direct chats failed:', e);
    }
  }

  public getCachedDirectChats(): DirectChat[] | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY_DIRECT_CHATS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((chat: DirectChat) => ({
            ...chat,
            user: {
              ...chat.user,
              avatar: resolveGenderMatchedAvatar(chat.user.name, chat.user.avatar),
            },
          }));
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  // Pre-seed initial messages map into offline cache so all previous messages are permanently remembered
  public seedInitialMessagesIfEmpty(initialMap: Record<string, Message[]>) {
    try {
      const currentMap = this.getCachedMessagesMap();
      let modified = false;
      for (const [chatId, msgs] of Object.entries(initialMap)) {
        if (!currentMap[chatId] || currentMap[chatId].length === 0) {
          currentMap[chatId] = msgs;
          modified = true;
        }
      }
      if (modified) {
        localStorage.setItem(CACHE_KEY_MESSAGES, JSON.stringify(currentMap));
      }
    } catch (e) {
      console.warn('Failed to seed initial messages cache:', e);
    }
  }

  public getConnectedDevices(): SyncDevice[] {
    const defaultDevices: SyncDevice[] = [
      {
        id: this.currentDeviceId,
        name: 'iPhone 16 Pro',
        type: 'phone',
        os: 'iOS 18.2 · Active Client',
        lastSync: 'Live sync active',
        isCurrent: true,
        status: 'synced',
      },
      {
        id: 'mac_01',
        name: 'MacBook Pro M3 Max',
        type: 'desktop',
        os: 'macOS Sequoia 15.1',
        lastSync: 'Synced 1m ago',
        isCurrent: false,
        status: 'synced',
      },
      {
        id: 'ipad_02',
        name: 'iPad Pro 13"',
        type: 'tablet',
        os: 'iPadOS 18.1',
        lastSync: 'Synced 14m ago',
        isCurrent: false,
        status: 'synced',
      },
    ];

    try {
      const saved = localStorage.getItem(CACHE_KEY_DEVICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((d: SyncDevice) => ({
          ...d,
          isCurrent: d.id === this.currentDeviceId,
        }));
      }
    } catch {
      // fallback
    }

    return defaultDevices;
  }
}

export const syncService = new CrossPlatformSyncService();
