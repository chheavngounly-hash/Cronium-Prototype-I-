/**
 * Follow Service
 * Keeps following state synchronized across Feed, Servers, DMs, and Profile Modals.
 */

const STORAGE_KEY = 'cronium_following_v1';
const EVENT_NAME = 'cronium_follow_changed';

class FollowService {
  private followingIds: Set<string>;
  private listeners: ((ids: Set<string>) => void)[] = [];

  constructor() {
    this.followingIds = new Set<string>();
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.followingIds = new Set(parsed);
          }
        }
      } catch {
        // fallback to empty set
      }

      window.addEventListener(EVENT_NAME, (e: Event) => {
        const customEvent = e as CustomEvent<string[]>;
        if (customEvent.detail && Array.isArray(customEvent.detail)) {
          this.followingIds = new Set(customEvent.detail);
          this.notifyListeners();
        }
      });
    }
  }

  public getFollowingIds(): Set<string> {
    return new Set(this.followingIds);
  }

  public isFollowing(userId: string): boolean {
    if (!userId) return false;
    return this.followingIds.has(userId);
  }

  public toggleFollow(userId: string, userName?: string): boolean {
    if (!userId) return false;
    const nextState = !this.followingIds.has(userId);
    if (nextState) {
      this.followingIds.add(userId);
    } else {
      this.followingIds.delete(userId);
    }

    this.save();
    this.notifyListeners();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: Array.from(this.followingIds),
        })
      );
    }

    return nextState;
  }

  public subscribe(cb: (ids: Set<string>) => void): () => void {
    this.listeners.push(cb);
    cb(new Set(this.followingIds));
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private save() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.followingIds)));
      } catch {
        // ignore
      }
    }
  }

  private notifyListeners() {
    const copy = new Set(this.followingIds);
    this.listeners.forEach((cb) => {
      try {
        cb(copy);
      } catch (e) {
        console.error('Error in follow listener', e);
      }
    });
  }
}

export const followService = new FollowService();
