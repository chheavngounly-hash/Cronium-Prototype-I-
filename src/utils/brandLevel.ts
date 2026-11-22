export interface BrandMetrics {
  level: number;
  rankName: string;
  rankTitle?: string;
  points: number;
  nextTierPoints: number;
  progressPercent: number;
  [key: string]: any;
}

export interface BrandLevelStatus {
  badgeEmoji: string;
  level: number;
  rankTitle: string;
  totalXp: number;
  points: number;
  nextRank: string;
  progressPercent: number;
  currentTierMinXp: number;
  nextTierMinXp: number;
  stats: {
    postedImages: number;
    postedVideos: number;
    achievements: number;
    connections: number;
    joinedCommunities: number;
  };
}

export interface QuestSimulationState {
  extraImages: number;
  extraVideos: number;
  extraConnections: number;
  extraCommunities: number;
  isTopActive: boolean;
}

const STORAGE_KEY = 'cronium_quest_simulation_state';

export function getStoredQuestState(): QuestSimulationState {
  if (typeof window === 'undefined') {
    return {
      extraImages: 0,
      extraVideos: 0,
      extraConnections: 0,
      extraCommunities: 0,
      isTopActive: true,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return {
    extraImages: 0,
    extraVideos: 0,
    extraConnections: 0,
    extraCommunities: 0,
    isTopActive: true,
  };
}

export function saveStoredQuestState(state: QuestSimulationState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function calculateBrandLevel(
  joinedServersCount: number,
  dmsCount: number,
  achievementsCount: number = 5
): any {
  // Level is strictly proportionate to total achievements:
  // 8 achievements -> Level 85 (e.g. Dr. Hiroshi Tanaka)
  // 7 achievements -> Level 74 (e.g. Anna San)
  // 6 achievements -> Level 66-68 (e.g. Elena Rostova, Alexander Patrick)
  // 5 achievements -> Level 58 (Jennies Vance)
  // 4 achievements -> Level 42-45 (Liam Chen, Sofia Rodriguez, Classie Willey)
  // 3 achievements -> Level 38 (Mateo Silva)
  const baseLevel = achievementsCount === 8
    ? 85
    : achievementsCount === 7
    ? 74
    : achievementsCount === 6
    ? 66
    : achievementsCount === 5
    ? 58
    : achievementsCount === 4
    ? 45
    : achievementsCount === 3
    ? 38
    : Math.max(18, achievementsCount * 11 + 3);

  const level = Math.min(99, baseLevel);
  const points = level * 100 + joinedServersCount * 25 + dmsCount * 10;

  let rankName = 'Legend II';
  let rankTitle = 'Legend II';
  let badgeEmoji = '👑';

  if (level >= 80) {
    rankName = 'Grandmaster Fellow';
    rankTitle = 'Grandmaster Fellow';
    badgeEmoji = '🎖️';
  } else if (level >= 70) {
    rankName = 'Mythical Glory';
    rankTitle = 'Mythical Glory';
    badgeEmoji = '👑';
  } else if (level >= 60) {
    rankName = 'Mythic II';
    rankTitle = 'Mythic II';
    badgeEmoji = '💎';
  } else if (level >= 50) {
    rankName = 'Legend II';
    rankTitle = 'Legend II';
    badgeEmoji = '👑';
  } else if (level >= 40) {
    rankName = 'Master III';
    rankTitle = 'Master III';
    badgeEmoji = '⚡';
  } else {
    rankName = 'Adept I';
    rankTitle = 'Adept I';
    badgeEmoji = '⭐';
  }

  const nextTierPoints = (Math.floor(level / 10) + 1) * 1000;
  const progressPercent = Math.min(100, Math.round(((level % 10) / 10) * 100));

  return {
    badgeEmoji,
    level,
    rankName,
    rankTitle,
    points,
    nextRank: level >= 80 ? 'Immortal' : 'Next Tier',
    nextTierPoints,
    progressPercent,
    currentTierMinXp: (Math.floor(level / 10)) * 1000,
    nextTierMinXp: nextTierPoints,
    stats: {
      postedImages: 12,
      postedVideos: 4,
      achievements: achievementsCount,
      connections: 1480,
      joinedCommunities: joinedServersCount,
    },
    totalXp: points * 12,
  };
}
