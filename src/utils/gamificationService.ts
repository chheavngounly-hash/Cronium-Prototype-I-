export interface GamificationTask {
  id: string;
  title: string;
  description: string;
  rewardSlots: number;
  xpReward: number;
  category: 'profile' | 'social' | 'community' | 'daily';
  iconName: 'UserCheck' | 'MessageSquare' | 'Share2' | 'Users' | 'Sparkles' | 'Trophy';
  progressCurrent?: number;
  progressTarget?: number;
  actionText: string;
}

export const INITIAL_GAMIFICATION_TASKS: GamificationTask[] = [
  {
    id: 'task_profile_complete',
    title: 'Complete Professional Bio & Specialties',
    description: 'Add your engineering specialties, verified credentials, and bio to your executive profile.',
    rewardSlots: 1,
    xpReward: 150,
    category: 'profile',
    iconName: 'UserCheck',
    actionText: 'Claim Server Slot',
  },
  {
    id: 'task_publish_feed',
    title: 'Share a Technical Insight in Feed',
    description: 'Post an architecture update, paper breakdown, or tech milestone to the Cronium network feed.',
    rewardSlots: 1,
    xpReward: 200,
    category: 'social',
    iconName: 'Share2',
    actionText: 'Post & Claim',
  },
  {
    id: 'task_engage_discussions',
    title: 'Engage in 3 Peer Discussions',
    description: 'React or leave thoughtful commentary on 3 technical posts across your communities.',
    rewardSlots: 1,
    xpReward: 120,
    category: 'social',
    iconName: 'MessageSquare',
    progressCurrent: 3,
    progressTarget: 3,
    actionText: 'Claim Server Slot',
  },
  {
    id: 'task_connect_peers',
    title: 'Connect with 2 Verified Members',
    description: 'Establish direct encrypted connections with 2 developers or researchers in Servers & DMs.',
    rewardSlots: 1,
    xpReward: 180,
    category: 'community',
    iconName: 'Users',
    progressCurrent: 2,
    progressTarget: 2,
    actionText: 'Claim Server Slot',
  },
  {
    id: 'task_weekly_challenge',
    title: 'Weekly Architecture Challenge',
    description: 'Vote or submit your approach to this week’s high-throughput raft consensus challenge.',
    rewardSlots: 2,
    xpReward: 350,
    category: 'community',
    iconName: 'Trophy',
    actionText: 'Complete Challenge',
  },
  {
    id: 'task_daily_streak',
    title: 'Active Node Check-in Streak',
    description: 'Keep your node active 3 days in a row to maintain high peer-to-peer reputation score.',
    rewardSlots: 1,
    xpReward: 100,
    category: 'daily',
    iconName: 'Sparkles',
    progressCurrent: 3,
    progressTarget: 3,
    actionText: 'Claim Daily Slot',
  },
];

type Listener = () => void;

class GamificationService {
  private bonusSlotsKey = 'cronium_bonus_server_slots_clean';
  private completedTasksKey = 'cronium_completed_gamification_tasks_clean';
  private bonusFeedViewsKey = 'cronium_bonus_feed_views_clean';
  private completedFeedTasksKey = 'cronium_completed_feed_tasks_clean';
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cronium_bonus_server_slots');
        localStorage.removeItem('cronium_completed_gamification_tasks');
        localStorage.removeItem(this.bonusSlotsKey);
        localStorage.removeItem(this.completedTasksKey);
        localStorage.removeItem(this.bonusFeedViewsKey);
        localStorage.removeItem(this.completedFeedTasksKey);
      } catch {}
    }
  }

  public resetFeedGamification(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.bonusFeedViewsKey);
        localStorage.removeItem(this.completedFeedTasksKey);
      } catch {}
    }
    this.notify();
  }

  public resetToOriginalState(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.bonusSlotsKey);
        localStorage.removeItem(this.completedTasksKey);
        localStorage.removeItem(this.bonusFeedViewsKey);
        localStorage.removeItem(this.completedFeedTasksKey);
      } catch {}
    }
    this.notify();
  }

  public getBonusServerSlots(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem(this.bonusSlotsKey);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  public getBonusFeedViews(): number {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem(this.bonusFeedViewsKey);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  public getCompletedFeedTaskIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(this.completedFeedTasksKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public completeFeedTask(taskId: string): { success: boolean; earnedViews: number; totalViews: number } {
    const completed = new Set(this.getCompletedFeedTaskIds());
    if (completed.has(taskId)) {
      return { success: false, earnedViews: 0, totalViews: this.getBonusFeedViews() };
    }

    const task = INITIAL_GAMIFICATION_TASKS.find((t) => t.id === taskId);
    const viewsToAdd = (task ? task.rewardSlots : 1) * 10;

    completed.add(taskId);
    const newTotalViews = this.getBonusFeedViews() + viewsToAdd;

    try {
      localStorage.setItem(this.completedFeedTasksKey, JSON.stringify(Array.from(completed)));
      localStorage.setItem(this.bonusFeedViewsKey, newTotalViews.toString());
    } catch {
      // ignore
    }

    this.notify();
    return { success: true, earnedViews: viewsToAdd, totalViews: newTotalViews };
  }

  public getCompletedTaskIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(this.completedTasksKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  public isTaskCompleted(taskId: string): boolean {
    return this.getCompletedTaskIds().includes(taskId);
  }

  public completeTask(taskId: string): { success: boolean; earnedSlots: number; totalSlots: number } {
    const completed = new Set(this.getCompletedTaskIds());
    if (completed.has(taskId)) {
      return { success: false, earnedSlots: 0, totalSlots: this.getBonusServerSlots() };
    }

    const task = INITIAL_GAMIFICATION_TASKS.find((t) => t.id === taskId);
    const slotsToAdd = task ? task.rewardSlots : 1;

    completed.add(taskId);
    const newTotalBonus = this.getBonusServerSlots() + slotsToAdd;

    try {
      localStorage.setItem(this.completedTasksKey, JSON.stringify(Array.from(completed)));
      localStorage.setItem(this.bonusSlotsKey, newTotalBonus.toString());
    } catch {
      // ignore
    }

    this.notify();
    return { success: true, earnedSlots: slotsToAdd, totalSlots: newTotalBonus };
  }

  public completeAllTasks(): { success: boolean; earnedSlots: number; totalSlots: number } {
    const completed = new Set(this.getCompletedTaskIds());
    let earned = 0;
    INITIAL_GAMIFICATION_TASKS.forEach((task) => {
      if (!completed.has(task.id)) {
        completed.add(task.id);
        earned += task.rewardSlots;
      }
    });

    if (earned === 0) {
      return { success: false, earnedSlots: 0, totalSlots: this.getBonusServerSlots() };
    }

    const newTotalBonus = this.getBonusServerSlots() + earned;
    try {
      localStorage.setItem(this.completedTasksKey, JSON.stringify(Array.from(completed)));
      localStorage.setItem(this.bonusSlotsKey, newTotalBonus.toString());
    } catch {
      // ignore
    }

    this.notify();
    return { success: true, earnedSlots: earned, totalSlots: newTotalBonus };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const gamificationService = new GamificationService();
