export interface DeterministicTimestamp {
  timestamp: string;
  createdAt: number;
}

/**
 * Deterministic 32-bit FNV-1a hash for stable per-chat timestamp generation.
 */
export function hashChatSeed(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Formats a Date into concise chat time string (e.g. "9:42 AM" or "Yesterday, 4:18 PM").
 */
export function formatChatTimestamp(date: Date, referenceNow: number = Date.now()): string {
  const refDate = new Date(referenceNow);
  const startOfToday = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate()).getTime();
  const startOfMsgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfMsgDay) / (24 * 60 * 60 * 1000));

  const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (dayDiff <= 0) {
    return timeStr;
  }
  if (dayDiff === 1) {
    return `Yesterday, ${timeStr}`;
  }
  return `${dayDiff}d ago, ${timeStr}`;
}

/**
 * Generates an ordered list (oldest -> newest) of realistic, deterministic timestamps
 * that vary uniquely per chatSeed (different start offset and different gaps per message).
 */
export function getDeterministicChatTimestamps(
  chatSeed: string,
  count: number,
  referenceNow: number = Date.now()
): DeterministicTimestamp[] {
  if (count <= 0) return [];

  const baseHash = hashChatSeed(chatSeed);

  // Pick a unique starting age for the newest message in this chat (between 8 mins and ~32 hours ago)
  // Using prime multipliers ensures distinct chats don't land on the same HH:MM.
  const newestMinutesAgo = 8 + (baseHash % 1400);
  const newestSecondOffset = (baseHash >> 5) % 60;

  // Build backwards from newest -> oldest with varied per-message gaps (3..29 minutes)
  const agesInMinutes: number[] = new Array(count);
  agesInMinutes[count - 1] = newestMinutesAgo;

  for (let i = count - 2; i >= 0; i--) {
    const stepHash = hashChatSeed(`${chatSeed}::step::${i}`);
    const gapMinutes = 3 + (stepHash % 27);
    agesInMinutes[i] = agesInMinutes[i + 1] + gapMinutes;
  }

  return agesInMinutes.map((minsAgo, idx) => {
    const msgSecondOffset = (newestSecondOffset + idx * 17) % 60;
    const ms = referenceNow - (minsAgo * 60 + msgSecondOffset) * 1000;
    const date = new Date(ms);
    return {
      timestamp: formatChatTimestamp(date, referenceNow),
      createdAt: ms,
    };
  });
}
