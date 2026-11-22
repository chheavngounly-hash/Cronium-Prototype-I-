/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useLayoutEffect, useRef, Suspense, lazy } from 'react';
import {
  Home,
  LayoutGrid,
  Heart,
  User as UserIcon,
  MessageSquare,
  Lock,
  Smartphone,
  Laptop,
  Moon,
  Sun,
  ShieldCheck,
  WifiOff,
  Bell,
  Sparkles,
  Maximize2,
  RefreshCw,
  X,
  ExternalLink,
  Share2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

import { Community, DirectChat, Message, User, UserPlan, ServerMember } from './types';
import {
  CURRENT_USER,
  INITIAL_COMMUNITIES,
  INITIAL_DIRECT_CHATS,
  INITIAL_MESSAGES_MAP,
  resolveGenderMatchedAvatar,
  earthSpaceAvatar,
} from './data/mockData';
import { notificationService } from './services/notifications';
import { syncService } from './services/sync';
import { getDeterministicChatTimestamps } from './utils/chatTimestamps';

import { HomeScreen } from './components/HomeScreen';
import { NavigationBar } from './components/NavigationBar';
import { BiometricModal } from './components/BiometricModal';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { NotificationToast } from './components/NotificationToast';
import { IPhoneStatusBar } from './components/IPhoneStatusBar';
import { CroniumLogo } from './components/CroniumLogo';
import { getAllCandidateServers, ensureUniqueServers } from './utils/serverMatcher';

const CommunitiesScreen = lazy(() =>
  import('./components/CommunitiesScreen').then((m) => ({ default: m.CommunitiesScreen }))
);
const ServersScreen = lazy(() =>
  import('./components/ServersScreen').then((m) => ({ default: m.ServersScreen }))
);
const ChatView = lazy(() =>
  import('./components/ChatView').then((m) => ({ default: m.ChatView }))
);
const ServerView = lazy(() =>
  import('./components/ServerView').then((m) => ({ default: m.ServerView }))
);
const ProfileScreen = lazy(() =>
  import('./components/ProfileScreen').then((m) => ({ default: m.ProfileScreen }))
);
const SocialFeedScreen = lazy(() =>
  import('./components/SocialFeedScreen').then((m) => ({ default: m.SocialFeedScreen }))
);
const TripleScreenPreview = lazy(() =>
  import('./components/TripleScreenPreview').then((m) => ({ default: m.TripleScreenPreview }))
);

const ScreenLoadingFallback: React.FC = () => (
  <div className="h-full w-full flex items-center justify-center bg-[#F5F8FF] dark:bg-slate-950">
    <div className="w-7 h-7 rounded-full border-2 border-indigo-200 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400 animate-spin" />
  </div>
);

type NavTab = 'home' | 'communities' | 'servers' | 'feed' | 'profile';
type ViewMode = 'interactive' | 'triple-mockup';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [visitedTabs, setVisitedTabs] = useState<Set<NavTab>>(() => new Set<NavTab>(['home']));
  const [viewMode, setViewMode] = useState<ViewMode>('interactive');

  useEffect(() => {
    setVisitedTabs((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  // Conversation & Server Navigation
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(null);

  // Modals & Overlays
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showDeviceSyncModal, setShowDeviceSyncModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [feedClickCounter, setFeedClickCounter] = useState<number>(0);

  // Per-tab persistent scroll & DOM container refs so switching features preserves exact position
  const tabPaneRefs = useRef<Partial<Record<NavTab, HTMLDivElement | null>>>({});
  const tabScrollPositionsRef = useRef<Record<string, number>>({
    home: 0,
    servers: 0,
    feed: 0,
    profile: 0,
  });
  const subviewScrollPositionsRef = useRef<Record<string, number>>({});

  // Dynamic In-App Notifications subscribed to notificationService
  // Starts empty on initialization; populated dynamically via unlock triggers, incoming messages, subscriptions, and events
  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    text: string;
    time: string;
    avatar?: string;
    chatId?: string;
    type?: 'comment' | 'event' | 'message' | 'system';
    isRead?: boolean;
  }[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((item) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setNotifications((prev) => {
        // Strict deduplication: ensure each notification shows only once
        const isDuplicate = prev.some((n) => {
          if (item.id && n.id === item.id) return true;
          const sameTitle = n.title.trim().toLowerCase() === item.title.trim().toLowerCase();
          const sameBody = n.text.trim().toLowerCase() === item.body.trim().toLowerCase();
          if (sameTitle && sameBody) return true;
          // For server join notifications, never duplicate for the same server
          if (item.title.toLowerCase().startsWith('joined ') && sameTitle) return true;
          // For milestone feature unlock alerts, show only once
          if (item.title.toLowerCase().includes('features unlocked') && sameTitle) return true;
          // For subscription tier upgrades, show only once per plan
          if (item.title.toLowerCase().includes('subscription') && sameTitle) return true;
          return false;
        });

        if (isDuplicate) {
          return prev;
        }

        return [
          {
            id: item.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            title: item.title,
            text: item.body,
            time: timeStr,
            avatar: item.avatar,
            type: item.type || 'system',
            isRead: false,
          },
          ...prev,
        ];
      });
    });

    return () => unsubscribe();
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Theme & Network states
  // Ensure consistent screen aesthetic across all smartphones and shared links:
  // Default to light mode (false). Do NOT inherit OS prefers-color-scheme automatically.
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const themeParam = urlParams.get('theme');
        if (themeParam === 'light') return false;
        if (themeParam === 'dark') return true;
      } catch {
        // Ignore malformed URL query strings
      }

      try {
        // Only enable dark mode if the user manually toggled it in their settings
        const manualTheme = window.localStorage.getItem('cronium_theme_manual');
        if (manualTheme === 'dark') return true;
      } catch {
        // Ignore storage restrictions in private browsing / strict WebViews
      }
      return false; // Always default to signature Light mode across devices
    }
    return false;
  });

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('cronium_theme_manual', next ? 'dark' : 'light');
        } catch {
          // Ignore storage restrictions
        }
      }
      return next;
    });
  };

  const handleShareApp = async () => {
    const shareUrl = window.location.origin + window.location.pathname;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cronium - Community & Encrypted Messaging',
          text: 'Check out Cronium!',
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // ignore
    }
  };

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // App Data State
  const [communities, setCommunities] = useState<Community[]>(() =>
    ensureUniqueServers(
      getAllCandidateServers(
        INITIAL_COMMUNITIES,
        ['Machine Learning', 'Space'],
        ['Photography', 'Chess'],
        ['Build an AI Startup', 'Find Hackathon Team']
      )
    )
  );
  const activeCommunity = communities.find((c) => c.id === activeCommunityId) || null;
  // Messages are hidden initially; users can only see them when they try to connect and DM people
  const [directChats, setDirectChats] = useState<DirectChat[]>([]);

  // Tracks whether the user has submitted their prompts (used for Feed post gating & Home matched results)
  const [hasPrompted, setHasPrompted] = useState<boolean>(false);
  // User Match Prompts: Interests, Hobbies, Goals from multi-step form
  const [userPrompts, setUserPrompts] = useState<{
    interests: string[];
    hobbies: string[];
    goals: string[];
  }>({
    interests: [],
    hobbies: [],
    goals: [],
  });
  // User Tier Model: Free tier (default), Cronium Plus, Cronium Pro
  const [userPlan, setUserPlan] = useState<UserPlan>('free');
  // Full-screen messages by default on server click, except when opening right after joining
  const [serverInitialCollapsed, setServerInitialCollapsed] = useState<boolean>(true);

  // Sync theme with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Restore saved scroll position synchronously whenever switching back to a tab or closing a subview
  useLayoutEffect(() => {
    const pane = tabPaneRefs.current[activeTab];
    if (!pane) return;

    const restore = () => {
      if (activeTab === 'servers' && (activeChatId || activeCommunityId)) {
        const subviewKey = activeChatId ? `chat:${activeChatId}` : `server:${activeCommunityId}`;
        const subScroller = pane.querySelector<HTMLElement>('[data-subview-scroller]');
        if (subScroller && subviewScrollPositionsRef.current[subviewKey] !== undefined) {
          subScroller.scrollTop = subviewScrollPositionsRef.current[subviewKey];
        }
        return;
      }

      const scroller = pane.querySelector<HTMLElement>(`[data-tab-scroller="${activeTab}"]`);
      if (scroller) {
        const savedTop = tabScrollPositionsRef.current[activeTab] ?? 0;
        scroller.scrollTop = savedTop;
      }
    };

    restore();
    const rafId = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(rafId);
  }, [activeTab, activeChatId, activeCommunityId]);

  const captureCurrentScrollPosition = (tab: NavTab) => {
    const pane = tabPaneRefs.current[tab];
    if (!pane) return;
    if (tab === 'servers' && (activeChatId || activeCommunityId)) {
      const subviewKey = activeChatId ? `chat:${activeChatId}` : `server:${activeCommunityId}`;
      const subScroller = pane.querySelector<HTMLElement>('[data-subview-scroller]');
      if (subScroller) {
        subviewScrollPositionsRef.current[subviewKey] = subScroller.scrollTop;
      }
      return;
    }
    const scroller = pane.querySelector<HTMLElement>(`[data-tab-scroller="${tab}"]`);
    if (scroller) {
      tabScrollPositionsRef.current[tab] = scroller.scrollTop;
    }
  };

  const scrollTabToTop = (tab: NavTab) => {
    tabScrollPositionsRef.current[tab] = 0;
    const pane = tabPaneRefs.current[tab];
    const scroller = pane?.querySelector<HTMLElement>(`[data-tab-scroller="${tab}"]`);
    if (scroller) {
      scroller.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTabScrollCapture = (tab: NavTab, e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (target.dataset?.tabScroller === tab) {
      tabScrollPositionsRef.current[tab] = target.scrollTop;
    } else if (tab === 'servers' && target.dataset?.subviewScroller) {
      const subviewKey = activeChatId
        ? `chat:${activeChatId}`
        : activeCommunityId
        ? `server:${activeCommunityId}`
        : target.dataset.subviewScroller;
      subviewScrollPositionsRef.current[subviewKey] = target.scrollTop;
    }
  };

  const handleSelectNavTab = (tab: NavTab) => {
    if (tab === activeTab) {
      // Clicking the active feature icon brings the user back to the top of that feature interface
      if (tab === 'servers' && (activeChatId || activeCommunityId)) {
        tabScrollPositionsRef.current.servers = 0;
        setActiveChatId(null);
        setActiveCommunityId(null);
        requestAnimationFrame(() => {
          scrollTabToTop('servers');
        });
        return;
      }

      if (tab === 'feed') {
        tabScrollPositionsRef.current.feed = 0;
        setFeedClickCounter((prev) => prev + 1);
        scrollTabToTop('feed');
        return;
      }

      scrollTabToTop(tab);
      return;
    }

    // Navigating to a different feature: save outgoing scroll and preserve target tab's last state & position
    captureCurrentScrollPosition(activeTab);
    setActiveTab(tab);
  };

  // Handle cross-platform sync bus events
  useEffect(() => {
    const unsubscribe = syncService.subscribe((payload) => {
      if (payload.deviceId === syncService.getDeviceId()) return;
      if (payload.type === 'COMMUNITY_JOINED') {
        const commId = payload.data as string;
        setCommunities((prev) =>
          prev.map((c) => (c.id === commId ? { ...c, joined: true } : c))
        );
      } else if (payload.type === 'COMMUNITY_LEFT') {
        const commId = payload.data as string;
        setCommunities((prev) =>
          prev.map((c) => (c.id === commId ? { ...c, joined: false } : c))
        );
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleJoin = (communityId: string, communityData?: Community, forceJoin?: boolean) => {
    // Check whether this action triggers a join notification cleanly outside state updater
    const existingCommunity = communities.find((c) => c.id === communityId) || communityData;
    const willJoin = forceJoin !== undefined ? forceJoin : existingCommunity ? !existingCommunity.joined : true;
    const wasJoined = existingCommunity ? existingCommunity.joined : false;

    if (willJoin && !wasJoined && existingCommunity) {
      setTimeout(() => {
        notificationService.playSentChime();
        notificationService.notify({
          id: `join_${communityId}`,
          title: `Joined ${existingCommunity.name}`,
          body: `You are now a member of ${existingCommunity.name}! Check channels and start messaging.`,
          avatar: existingCommunity.avatar,
          type: 'system',
        });
      }, 0);
    }

    const targetNameLower = existingCommunity?.name.trim().toLowerCase();

    setCommunities((prev) => {
      const exists = prev.find((c) => c.id === communityId);
      if (exists) {
        const next = forceJoin !== undefined ? forceJoin : !exists.joined;
        return ensureUniqueServers(
          prev.map((c) => {
            const matches =
              c.id === communityId ||
              (!next && targetNameLower && c.name.trim().toLowerCase() === targetNameLower);
            if (!matches) return c;
            return {
              ...c,
              joined: next,
              activeMembers: next
                ? (c.joined ? c.activeMembers : c.activeMembers + 1)
                : (c.joined ? Math.max(0, c.activeMembers - 1) : c.activeMembers),
            };
          })
        );
      } else if (communityData) {
        const next = forceJoin !== undefined ? forceJoin : true;
        return ensureUniqueServers([
          ...prev,
          {
            ...communityData,
            joined: next,
            activeMembers: next ? communityData.activeMembers + 1 : communityData.activeMembers,
          },
        ]);
      }
      return prev;
    });

    if (!willJoin) {
      if (activeCommunityId === communityId) {
        setActiveCommunityId(null);
      }
      setActiveTab('servers');
    } else if (activeCommunityId === communityId) {
      setActiveTab('servers');
    }

    syncService.broadcast(willJoin ? 'COMMUNITY_JOINED' : 'COMMUNITY_LEFT', communityId);
  };

  const handleOpenChat = (chatId: string) => {
    // Look up by id, user id, or name match in directChats or INITIAL_DIRECT_CHATS
    let target = directChats.find(
      (c) =>
        c.id === chatId ||
        c.user.id === chatId ||
        c.id === `chat_${chatId}` ||
        c.user.name.toLowerCase() === chatId.toLowerCase()
    );

    if (!target) {
      const initialMatch = INITIAL_DIRECT_CHATS.find(
        (c) =>
          c.id === chatId ||
          c.user.id === chatId ||
          c.id === `chat_${chatId}` ||
          c.user.name.toLowerCase() === chatId.toLowerCase()
      );
      if (initialMatch) {
        target = { ...initialMatch, unreadCount: 0 };
        setDirectChats((prev) => [target!, ...prev.filter((c) => c.id !== target!.id)]);
      }
    }

    const resolvedChatId = target ? target.id : chatId;

    // Clear unread count
    setDirectChats((prev) =>
      prev.map((c) => (c.id === resolvedChatId ? { ...c, unreadCount: 0 } : c))
    );
    captureCurrentScrollPosition(activeTab);
    setActiveCommunityId(null);
    setActiveChatId(resolvedChatId);
    setActiveTab('servers');
    if (viewMode === 'triple-mockup') {
      setViewMode('interactive');
    }
  };

  const handleOpenCommunity = (community: Community, justJoined: boolean = false) => {
    // When opening right after joining: show channels (sidebar open, collapsed=false).
    // On regular click: full-screen messages (sidebar collapsed, collapsed=true).
    setServerInitialCollapsed(!justJoined);
    // Ensure community is preserved and updated with exact title and avatar in communities state
    setCommunities((prev) => {
      const exists = prev.find((c) => c.id === community.id);
      if (!exists) {
        return [...prev, community];
      }
      return prev.map((c) => (c.id === community.id ? { ...c, ...community } : c));
    });
    setActiveChatId(null);
    setActiveCommunityId(community.id);
    captureCurrentScrollPosition(activeTab);
    setActiveTab('servers');
    if (viewMode === 'triple-mockup') {
      setViewMode('interactive');
    }
  };

  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);

  const handleToggleConnectMember = (member: ServerMember) => {
    const isAlreadyConnected = connectedUserIds.includes(member.id);
    if (isAlreadyConnected) {
      setConnectedUserIds((prev) => prev.filter((id) => id !== member.id));
    } else {
      setConnectedUserIds((prev) => [...prev, member.id]);

      // Ensure this member also appears in directChats with verified gender-matched avatar!
      const resolvedAvatar = resolveGenderMatchedAvatar(member.name, member.avatar);
      const userObj: User = {
        id: member.id,
        name: member.name,
        avatar: resolvedAvatar,
        status: member.status,
        customStatus: member.role,
        bio: member.bio,
        safetyNumber: member.safetyNumber,
      };

      setDirectChats((prev) => {
        if (prev.some((c) => c.user.id === member.id)) return prev;
        const newChat: DirectChat = {
          id: `chat_${member.id}`,
          user: userObj,
          lastMessage: `Following since ${new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })}`,
          lastMessageTime: 'Just now',
          unreadCount: 0,
        };
        return [newChat, ...prev];
      });
    }
  };

  const handleStartDirectChatWithUser = (user: User, initialGreeting?: string) => {
    setConnectedUserIds((prev) => (prev.includes(user.id) ? prev : [...prev, user.id]));

    const normalizedName = user.name.trim().toLowerCase();

    // 1. Look for existing conversation in directChats
    let targetChat = directChats.find(
      (c) =>
        c.user.id === user.id ||
        c.id === user.id ||
        c.id === `chat_${user.id}` ||
        c.user.name.trim().toLowerCase() === normalizedName
    );

    const resolvedUserAvatar = resolveGenderMatchedAvatar(user.name, user.avatar);
    const normalizedUser: User = {
      ...user,
      avatar: resolvedUserAvatar,
      status: user.status === 'typing' ? 'online' : (user.status || 'online'),
    };

    if (!targetChat) {
      // 2. Look for template in INITIAL_DIRECT_CHATS (e.g., Anna San, Dr. Hiroshi Tanaka, Liam Chen)
      const initialMatch = INITIAL_DIRECT_CHATS.find(
        (c) =>
          c.user.id === user.id ||
          c.id === user.id ||
          c.id === `chat_${user.id}` ||
          c.user.name.trim().toLowerCase() === normalizedName
      );

      if (initialMatch) {
        targetChat = {
          ...initialMatch,
          user: {
            ...initialMatch.user,
            ...normalizedUser,
            avatar: resolveGenderMatchedAvatar(normalizedUser.name, initialMatch.user.avatar),
          },
          unreadCount: 0,
        };
      } else {
        const newChatId = `chat_${user.id || normalizedName.replace(/[^a-z0-9]/g, '_')}`;
        targetChat = {
          id: newChatId,
          user: normalizedUser,
          lastMessage: 'Following on Cronium mesh',
          lastMessageTime: 'Just now',
          unreadCount: 0,
        };
      }
    } else {
      targetChat = {
        ...targetChat,
        user: {
          ...targetChat.user,
          ...normalizedUser,
          avatar: resolveGenderMatchedAvatar(normalizedUser.name, targetChat.user.avatar),
        },
        unreadCount: 0,
      };
    }

    // 3. Ensure clean peer-only initial messages exist in INITIAL_MESSAGES_MAP for targetChat.id
    if (!INITIAL_MESSAGES_MAP[targetChat.id] || INITIAL_MESSAGES_MAP[targetChat.id].length === 0) {
      const possibleKey = Object.keys(INITIAL_MESSAGES_MAP).find(
        (k) =>
          k.toLowerCase().includes(normalizedName.split(' ')[0]) ||
          (user.id && k.includes(user.id))
      );
      if (possibleKey && INITIAL_MESSAGES_MAP[possibleKey] && INITIAL_MESSAGES_MAP[possibleKey].length > 0) {
        INITIAL_MESSAGES_MAP[targetChat.id] = INITIAL_MESSAGES_MAP[possibleKey];
        const lastMsg = INITIAL_MESSAGES_MAP[possibleKey][INITIAL_MESSAGES_MAP[possibleKey].length - 1];
        if (lastMsg) {
          targetChat.lastMessageTime = lastMsg.timestamp;
        }
      } else {
        const [t1] = getDeterministicChatTimestamps(
          `${targetChat.id}::${normalizedName}`,
          1
        );
        INITIAL_MESSAGES_MAP[targetChat.id] = [
          {
            id: `msg_conv_1_${targetChat.id}`,
            chatId: targetChat.id,
            senderId: targetChat.user.id,
            senderName: targetChat.user.name,
            senderAvatar: targetChat.user.avatar,
            text: `Hey Jennies! Great connecting on Cronium. Would love to collaborate and exchange notes soon.`,
            timestamp: t1.timestamp,
            createdAt: t1.createdAt,
            status: 'read',
            reactions: [{ emoji: '👋', count: 1, users: ['user_jennies'] }],
          },
        ];
        targetChat.lastMessage = `Hey Jennies! Great connecting on Cronium...`;
        targetChat.lastMessageTime = t1.timestamp;
      }
    }

    // 3b. If the user composed a message in the Quick Message modal, append it immediately
    const trimmedGreeting = initialGreeting?.trim();
    if (trimmedGreeting) {
      const existingCached = syncService.getCachedMessages(targetChat.id);
      const baseMessages =
        existingCached && existingCached.length > 0
          ? existingCached
          : INITIAL_MESSAGES_MAP[targetChat.id] || [];
      const nowTime = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const outgoingMsg: Message = {
        id: `msg_quick_${Date.now()}`,
        chatId: targetChat.id,
        senderId: CURRENT_USER.id,
        senderName: CURRENT_USER.name,
        senderAvatar: CURRENT_USER.avatar,
        text: trimmedGreeting,
        timestamp: nowTime,
        createdAt: Date.now(),
        status: 'sent',
        reactions: [],
      };
      syncService.saveMessagesToCache(targetChat.id, [...baseMessages, outgoingMsg]);
      targetChat = {
        ...targetChat,
        lastMessage: trimmedGreeting,
        lastMessageTime: nowTime,
      };
    }

    // 4. Update directChats state so this exact individual appears in Direct Messages
    setDirectChats((prev) => {
      const filtered = prev.filter(
        (c) =>
          c.id !== targetChat!.id &&
          c.user.id !== targetChat!.user.id &&
          c.user.name.trim().toLowerCase() !== normalizedName
      );
      return [targetChat!, ...filtered];
    });

    // 5. Open conversational chat directly
    captureCurrentScrollPosition(activeTab);
    setActiveCommunityId(null);
    setActiveChatId(targetChat.id);
    setActiveTab('servers');
    if (viewMode === 'triple-mockup') {
      setViewMode('interactive');
    }
  };

  const handleFindCommunities = (
    _selectedInterests: string[],
    promptDetails?: { interests: string[]; hobbies: string[]; goals: string[] },
    isSilentOrOptions?: boolean | { silent?: boolean }
  ) => {
    const isSilent = typeof isSilentOrOptions === 'boolean' ? isSilentOrOptions : isSilentOrOptions?.silent ?? false;
    if (promptDetails) {
      setUserPrompts(promptDetails);
      // Ensure all custom candidate servers for user prompts are merged into communities state
      setCommunities((prev) => {
        const candidates = getAllCandidateServers(
          prev,
          promptDetails.interests,
          promptDetails.hobbies,
          promptDetails.goals
        );
        const merged: Community[] = [];
        const seen = new Set<string>();
        candidates.forEach((candidate) => {
          const existing = prev.find((p) => p.id === candidate.id);
          const item = existing || candidate;
          if (!seen.has(item.id)) {
            seen.add(item.id);
            merged.push(item);
          }
        });
        return merged;
      });
    }
    // Matched communities appear directly as part of the Home feature after prompt
    setActiveTab('home');
    setHasPrompted(true);

    // Silent while typing in prompt and during prompts 1 & 2; sound plays ONLY after sending the last prompt (the third prompt only)
    if (!isSilent) {
      notificationService.playSentChime();
      notificationService.notify({
        id: 'unlock_servers_and_dms',
        title: 'New Features Unlocked',
        body: 'Servers & DMs and Executive Profile are now unlocked!',
        type: 'system',
      });
    }
  };

  const handleUnlockPlan = (plan: UserPlan) => {
    setUserPlan(plan);
    const planName = plan === 'pro' ? 'Cronium Pro' : plan === 'plus' ? 'Cronium Plus' : 'Free tier';
    notificationService.notify({
      id: `subscription_${plan}`,
      title: 'Subscription Unlocked',
      body: `You are now subscribed to ${planName}. Enjoy expanded access!`,
      type: 'system',
    });
  };

  const handleTriggerTestPush = () => {
    if (directChats.length > 0) {
      const friend = directChats[0];
      notificationService.notify({
        title: friend.user.name,
        body: "Hey Jennies! The edge inferencing benchmarks are ready to review.",
        avatar: friend.user.avatar,
        chatId: friend.id,
      });
    } else {
      notificationService.notify({
        title: 'Beyond Earth Explorers',
        body: 'New orbital telemetry downlink locked and ready for review.',
        avatar: earthSpaceAvatar,
      });
    }
  };

  // Find active chat details - check both chat.id and user.id as fallback, plus INITIAL_DIRECT_CHATS fallback
  const activeChat =
    directChats.find((c) => c.id === activeChatId || c.user.id === activeChatId) ||
    INITIAL_DIRECT_CHATS.find((c) => c.id === activeChatId || c.user.id === activeChatId);

  return (
    <div className="h-full min-h-0 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-hidden">
      {/* Interactive Push Notification Toast */}
      <NotificationToast onSelectChat={handleOpenChat} />

      {/* Top Application Utility Bar */}
      <header className="bg-white/98 dark:bg-slate-900/98 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CroniumLogo variant="app-icon" className="w-6 h-6 rounded-lg shadow-2xs" />
            <span className="font-extrabold text-lg tracking-tight font-display text-slate-900 dark:text-white">
              Cronium
            </span>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> E2EE Active
          </span>
        </div>

        {/* View Switcher: 3-Screen Mockup vs Interactive App */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setViewMode('interactive')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'interactive'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Interactive App</span>
          </button>
          <button
            onClick={() => {
              setViewMode('triple-mockup');
              setActiveChatId(null);
              setActiveCommunityId(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'triple-mockup'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>3-Screen Mockup</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Device Sync Modal Trigger */}
          <button
            onClick={() => setShowDeviceSyncModal(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors hidden sm:flex items-center gap-1 text-xs font-medium"
            title="Cross-platform sync status"
          >
            <Laptop className="w-4 h-4 text-indigo-500" />
            <span className="hidden md:inline">Sync</span>
          </button>

          {/* Test Push Notification */}
          <button
            onClick={handleTriggerTestPush}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Trigger test push notification"
          >
            <Bell className="w-4 h-4 text-violet-500" />
          </button>

          {/* Lock App with Biometrics */}
          <button
            onClick={() => setIsLocked(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Lock with Face ID / Touch ID"
          >
            <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>

          {/* Share App Link */}
          <button
            onClick={handleShareApp}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Share App Link (copies consistent view link)"
          >
            <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </button>

          {/* Dark Mode Switcher */}
          <button
            onClick={handleToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Toggle Dark / Light theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        {viewMode === 'triple-mockup' ? (
          /* Triple Device Mockup matching user's uploaded reference image */
          <Suspense fallback={<ScreenLoadingFallback />}>
            <TripleScreenPreview
              communities={communities}
              directChats={directChats}
              onFindCommunities={handleFindCommunities}
              onSelectCommunity={handleOpenCommunity}
              onSelectChat={handleOpenChat}
              onOpenDirectChat={handleStartDirectChatWithUser}
              onToggleJoin={handleToggleJoin}
              onFocusScreen={(tab) => {
                setActiveTab(tab);
                setViewMode('interactive');
              }}
              onOpenNotifications={() => setShowNotificationsModal(true)}
              userInterests={userPrompts.interests}
              userHobbies={userPrompts.hobbies}
              userGoals={userPrompts.goals}
              userPlan={userPlan}
              onUnlockPlan={handleUnlockPlan}
            />
          </Suspense>
        ) : (
          /* Live Interactive App View */
          <div className="flex-1 flex justify-center p-0 sm:pt-2 sm:pb-4 sm:px-4 h-full min-h-0">
            <div className="w-full max-w-md h-full sm:h-[820px] bg-[#F5F8FF] dark:bg-slate-950 sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-900 dark:sm:border-slate-800 overflow-hidden flex flex-col relative ring-1 ring-slate-900/5 min-h-0">
              {/* iPhone 17 Pro Status Bar & Dynamic Island */}
              <IPhoneStatusBar bgClassName={activeTab === 'home' ? "bg-[#F7F9FC] dark:bg-slate-950" : "bg-white/95 dark:bg-slate-950/95"} />

              {/* View Container */}
              <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
                {/* Active Feature Screen - all 4 primary tabs stay mounted to preserve exact state & scroll position */}
                <div className="flex-1 overflow-hidden relative min-h-0">
                  <div className="h-full w-full overflow-hidden relative">
                    {/* Home Tab Pane */}
                    <div
                      ref={(el) => {
                        tabPaneRefs.current.home = el;
                      }}
                      onScrollCapture={(e) => handleTabScrollCapture('home', e)}
                      className={activeTab === 'home' ? 'h-full w-full flex flex-col' : 'hidden'}
                    >
                      <HomeScreen
                        communities={communities}
                        onToggleJoin={handleToggleJoin}
                        onOpenCommunity={handleOpenCommunity}
                        onNavigateToServers={() => {
                          captureCurrentScrollPosition(activeTab);
                          setActiveTab('servers');
                        }}
                        onNavigateToProfile={() => {
                          captureCurrentScrollPosition(activeTab);
                          setActiveTab('profile');
                        }}
                        onFindCommunities={handleFindCommunities}
                        onOpenNotifications={() => setShowNotificationsModal(true)}
                        unreadNotificationsCount={unreadNotificationsCount}
                        hasPrompted={hasPrompted}
                        savedInterests={userPrompts.interests}
                        savedHobbies={userPrompts.hobbies}
                        savedGoals={userPrompts.goals}
                        userPlan={userPlan}
                        onUnlockPlan={handleUnlockPlan}
                      />
                    </div>

                    {/* Communities Tab Pane (legacy route if activated) */}
                    {activeTab === 'communities' && (
                      <div className="h-full w-full flex flex-col">
                        <Suspense fallback={<ScreenLoadingFallback />}>
                          <CommunitiesScreen
                            communities={communities}
                            onSelectCommunity={handleOpenCommunity}
                            onToggleJoin={handleToggleJoin}
                            userPlan={userPlan}
                            onUnlockPlan={handleUnlockPlan}
                          />
                        </Suspense>
                      </div>
                    )}

                    {/* Servers & DMs Tab Pane (mounted on first visit, then kept alive to preserve state & scroll) */}
                    {(visitedTabs.has('servers') || activeTab === 'servers') && (
                      <div
                        ref={(el) => {
                          tabPaneRefs.current.servers = el;
                        }}
                        onScrollCapture={(e) => handleTabScrollCapture('servers', e)}
                        className={activeTab === 'servers' ? 'h-full w-full flex flex-col' : 'hidden'}
                      >
                        <Suspense fallback={<ScreenLoadingFallback />}>
                          <div
                            className={
                              !activeChat && !activeCommunity ? 'h-full w-full flex flex-col' : 'hidden'
                            }
                          >
                            <ServersScreen
                              communities={communities}
                              directChats={directChats}
                              onSelectCommunity={handleOpenCommunity}
                              onSelectChat={handleOpenChat}
                              onOpenDirectChat={handleStartDirectChatWithUser}
                              onSeeAllCommunities={() => {
                                captureCurrentScrollPosition(activeTab);
                                setActiveTab('home');
                              }}
                              onSeeAllMessages={() => {
                                captureCurrentScrollPosition(activeTab);
                                setActiveTab('servers');
                              }}
                              onToggleJoin={handleToggleJoin}
                              userInterests={userPrompts.interests}
                              userHobbies={userPrompts.hobbies}
                              userGoals={userPrompts.goals}
                              hasPrompted={hasPrompted}
                              userPlan={userPlan}
                              onUnlockPlan={handleUnlockPlan}
                              onNavigateToHome={() => {
                                captureCurrentScrollPosition(activeTab);
                                setActiveTab('home');
                              }}
                            />
                          </div>

                          {activeChat ? (
                            <ChatView
                              chatId={activeChat.id}
                              chatTitle={activeChat.user.name}
                              chatAvatar={activeChat.user.avatar}
                              contactUser={activeChat.user}
                              initialMessages={INITIAL_MESSAGES_MAP[activeChat.id] || []}
                              onBack={() => setActiveChatId(null)}
                              onLeaveChat={() => {
                                setDirectChats((prev) => prev.filter((c) => c.id !== activeChat.id));
                                setActiveChatId(null);
                              }}
                              isOfflineMode={isOfflineMode}
                              onOpenDirectChat={handleStartDirectChatWithUser}
                              userPlan={userPlan}
                              onUnlockPlan={handleUnlockPlan}
                            />
                          ) : activeCommunity ? (
                            <ServerView
                              community={activeCommunity}
                              initialCollapsed={serverInitialCollapsed}
                              onBack={() => setActiveCommunityId(null)}
                              onOpenDirectChat={(user) => {
                                handleStartDirectChatWithUser(user);
                              }}
                              onToggleJoin={handleToggleJoin}
                              isOfflineMode={isOfflineMode}
                              connectedUserIds={connectedUserIds}
                              onToggleConnect={handleToggleConnectMember}
                              userPlan={userPlan}
                              onUnlockPlan={handleUnlockPlan}
                            />
                          ) : null}
                        </Suspense>
                      </div>
                    )}

                    {/* Feed Tab Pane */}
                    {(visitedTabs.has('feed') || activeTab === 'feed') && (
                      <div
                        ref={(el) => {
                          tabPaneRefs.current.feed = el;
                        }}
                        onScrollCapture={(e) => handleTabScrollCapture('feed', e)}
                        className={activeTab === 'feed' ? 'h-full w-full flex flex-col' : 'hidden'}
                      >
                        <Suspense fallback={<ScreenLoadingFallback />}>
                          <SocialFeedScreen
                            feedClickCounter={feedClickCounter}
                            onNavigateToProfile={() => {
                              captureCurrentScrollPosition(activeTab);
                              setActiveTab('profile');
                            }}
                            onNavigateToHome={() => {
                              captureCurrentScrollPosition(activeTab);
                              setActiveTab('home');
                            }}
                            onNavigateToServers={() => {
                              captureCurrentScrollPosition(activeTab);
                              setActiveTab('servers');
                            }}
                            onStartDirectChatWithUser={handleStartDirectChatWithUser}
                            hasPrompted={hasPrompted}
                            hasJoinedServer={communities.some((c) => c.joined)}
                            userPlan={userPlan}
                            onUnlockPlan={handleUnlockPlan}
                          />
                        </Suspense>
                      </div>
                    )}

                    {/* Profile Tab Pane */}
                    {(visitedTabs.has('profile') || activeTab === 'profile') && (
                      <div
                        ref={(el) => {
                          tabPaneRefs.current.profile = el;
                        }}
                        onScrollCapture={(e) => handleTabScrollCapture('profile', e)}
                        className={activeTab === 'profile' ? 'h-full w-full flex flex-col' : 'hidden'}
                      >
                        <Suspense fallback={<ScreenLoadingFallback />}>
                          <ProfileScreen
                            darkMode={darkMode}
                            onToggleDarkMode={handleToggleDarkMode}
                            onLockApp={() => setIsLocked(true)}
                            onOpenDeviceSync={() => setShowDeviceSyncModal(true)}
                            isOfflineMode={isOfflineMode}
                            onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
                            onTriggerTestPush={handleTriggerTestPush}
                            userPlan={userPlan}
                            onUnlockPlan={handleUnlockPlan}
                            communities={communities}
                            connectedUserIds={connectedUserIds}
                            onStartDirectChatWithUser={handleStartDirectChatWithUser}
                          />
                        </Suspense>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation Bar docked at the bottom of the screen across all features */}
                <NavigationBar
                  activeTab={activeTab}
                  onSelectTab={handleSelectNavTab}
                  hasPrompted={hasPrompted}
                  directChats={directChats}
                />
              </div>

              {/* Bottom Home indicator for mobile simulator */}
              <div className="hidden sm:flex h-4 bg-white dark:bg-slate-950 items-center justify-center shrink-0 z-20">
                <div className="w-28 h-1 bg-slate-900 dark:bg-slate-300 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Biometric Authentication Lock Screen */}
      <BiometricModal
        isOpen={isLocked}
        onSuccess={() => setIsLocked(false)}
        title="Biometric Screen Lock"
        subtitle="Verify your Face ID, Touch ID, or PIN code to resume secure session"
        canDismiss={false}
      />

      {/* Device Sync Modal */}
      <DeviceSyncModal
        isOpen={showDeviceSyncModal}
        onClose={() => setShowDeviceSyncModal(false)}
      />

      {/* Notifications Drawer */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 text-left flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    Notifications
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {unreadNotificationsCount} unread
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={() =>
                      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
                    }
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline px-2 py-1 rounded-lg"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="py-3 space-y-2.5 overflow-y-auto flex-1 pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-10 px-4 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-inner">
                    <Bell className="w-7 h-7 text-indigo-400 stroke-[1.5]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-display">
                    No notifications yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px] leading-relaxed">
                    You'll see alerts here when you unlock new features, join servers, receive messages, or participate in events.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      ✨ Unlocks
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      💬 Messages
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      👑 Subscriptions
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      📅 Events
                    </span>
                  </div>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setNotifications((prev) =>
                        prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
                      );
                      if (n.chatId) handleOpenChat(n.chatId);
                      setShowNotificationsModal(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      !n.isRead
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/60'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="relative shrink-0 mt-0.5">
                        {n.avatar ? (
                          <img
                            src={n.avatar}
                            alt={n.title}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                            <Bell className="w-4 h-4" />
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white ${
                            n.type === 'comment'
                              ? 'bg-purple-600'
                              : n.type === 'event'
                              ? 'bg-emerald-600'
                              : n.type === 'message'
                              ? 'bg-indigo-600'
                              : 'bg-slate-600'
                          }`}
                        >
                          {n.type === 'comment' ? (
                            <MessageSquare className="w-2.5 h-2.5" />
                          ) : n.type === 'event' ? (
                            <Calendar className="w-2.5 h-2.5" />
                          ) : n.type === 'message' ? (
                            <ShieldCheck className="w-2.5 h-2.5" />
                          ) : (
                            <Bell className="w-2.5 h-2.5" />
                          )}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5 leading-relaxed">
                          {n.text}
                        </p>
                      </div>

                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 self-center" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowNotificationsModal(false)}
              className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl transition-colors shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
