/**
 * Push Notification Service & Sound Synthesis
 */

export interface InAppNotificationPayload {
  id?: string;
  title: string;
  body: string;
  avatar?: string;
  chatId?: string;
  type?: 'comment' | 'event' | 'message' | 'system';
  silent?: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private soundEnabled: boolean = true;
  private audioContext: AudioContext | null = null;
  private listeners: ((notification: InAppNotificationPayload) => void)[] = [];
  private recentEmissions: Map<string, number> = new Map();
  private sentNotificationIds: Set<string> = new Set();

  constructor() {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        this.permission = Notification.permission;
      }
    } catch {
      this.permission = 'denied';
    }
  }

  public subscribe(cb: (notification: InAppNotificationPayload) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        this.permission = result;
        return result === 'granted';
      } catch {
        return false;
      }
    }
    return false;
  }

  public getPermissionStatus(): NotificationPermission {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission;
      }
    } catch {
      // ignore restricted notification environments
    }
    return 'denied';
  }

  public toggleSound(enabled?: boolean) {
    if (enabled !== undefined) {
      this.soundEnabled = enabled;
    } else {
      this.soundEnabled = !this.soundEnabled;
    }
    return this.soundEnabled;
  }

  public isSoundEnabled() {
    return this.soundEnabled;
  }

  public playNotificationChime() {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext && AudioCtx) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      if (this.audioContext) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        // Pleasant modern two-tone chime
        osc.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, this.audioContext.currentTime + 0.1); // E6

        gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.35);
      }
    } catch {
      // Audio not permitted yet or not supported
    }
  }

  public playSentChime() {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext && AudioCtx) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(720, this.audioContext.currentTime + 0.08);

        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.15);
      }
    } catch {
      // Audio fallback
    }
  }

  public playCallingRing() {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext && AudioCtx) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext) {
        const now = this.audioContext.currentTime;
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.setValueAtTime(0.06, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioContext.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);
      }
    } catch {
      // Audio fallback
    }
  }

  public playCallConnected() {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext && AudioCtx) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch {
      // Audio fallback
    }
  }

  public playCallHangup() {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext && AudioCtx) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Audio fallback
    }
  }

  public notify(
    optionsOrTitle: string | InAppNotificationPayload,
    body?: string,
    avatar?: string,
    chatId?: string,
    type?: 'comment' | 'event' | 'message' | 'system'
  ) {
    const options: InAppNotificationPayload =
      typeof optionsOrTitle === 'string'
        ? { title: optionsOrTitle, body: body || '', avatar, chatId, type }
        : optionsOrTitle;

    if (options.silent) return;

    // Deduplication check: prevent identical alerts from emitting more than once
    const now = Date.now();
    const cleanTitle = (options.title || '').trim().toLowerCase();
    const cleanBody = (options.body || '').trim().toLowerCase();
    const idKey = options.id || `${cleanTitle}:::${cleanBody}`;

    if (options.id && this.sentNotificationIds.has(options.id)) {
      return;
    }

    const lastEmitted = this.recentEmissions.get(idKey);
    if (lastEmitted && now - lastEmitted < 4000) {
      return;
    }

    this.recentEmissions.set(idKey, now);
    if (options.id) {
      this.sentNotificationIds.add(options.id);
    }

    // Clean up stale cache keys if map grows large
    if (this.recentEmissions.size > 80) {
      for (const [k, time] of this.recentEmissions.entries()) {
        if (now - time > 30000) {
          this.recentEmissions.delete(k);
        }
      }
    }

    // 1. Play sound
    this.playNotificationChime();

    // 2. Dispatch to internal in-app listeners (interactive toast UI) deferred out of current render cycle
    setTimeout(() => {
      this.listeners.forEach((listener) => {
        try {
          listener(options);
        } catch (err) {
          console.error('Notification listener error:', err);
        }
      });
    }, 0);

    // 3. Dispatch to native browser Push Notification if granted
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(options.title, {
          body: options.body,
          icon: options.avatar || '/cronium-logo.svg',
          badge: '/cronium-logo.svg',
        });
      }
    } catch {
      // Ignored in restricted WebViews / iframes
    }
  }
}

export const notificationService = new NotificationService();
