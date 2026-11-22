export type UserPlan = 'free' | 'plus' | 'pro';

export interface PlanLimits {
  name: string;
  price: string;
  tagline: string;
  serversLimit: number | 'unlimited';
  connectionsPerDay: number | 'unlimited';
  postsPerDay: number;
  statements: string[];
  badgeVerification?: 'green' | 'gold' | null;
  ads: 'ads' | 'reduce-ads' | 'no-ads';
  matchTierDescription: string;
  hasAiProfileEditing: boolean;
  hasAiJobApplication?: boolean;
  hasBoostImpressions?: boolean;
  hasAchievementSummary: boolean;
  hasSuperAdvancedAlgorithm: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'typing';
  customStatus?: string;
  bio?: string;
  safetyNumber?: string;
}

export interface EmojiReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
}

export interface MessageReference {
  id: string;
  senderName: string;
  text: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'code' | 'document';
  name: string;
  url?: string;
  size?: string;
  fileExtension?: string;
  codeSnippet?: string | {
    language: string;
    code: string;
  };
}

export interface Message {
  id: string;
  chatId: string; // DM user ID or Server channel ID
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string; // e.g. "12:34 PM"
  createdAt: number; // unix timestamp for sorting
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'read';
  reference?: MessageReference;
  reactions: EmojiReaction[];
  encryptedPayload?: {
    ciphertext: string;
    iv: string;
    algorithm: string;
  };
  isVoiceNote?: boolean;
  audioUrl?: string;
  audioDuration?: number; // duration in seconds
  audioWaveform?: number[]; // normalized waveform amplitudes 0..1
  attachment?: MessageAttachment;
  isDeleted?: boolean;
  isEdited?: boolean;
}

export interface DirectChat {
  id: string;
  user: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned?: boolean;
}

export type NavTab = 'home' | 'communities' | 'servers' | 'feed' | 'profile';

export interface CallState {
  active: boolean;
  type: 'voice' | 'video';
  user: { name: string; avatar: string };
}

export interface UserProfile extends User {
  role?: string;
  roleBadge?: string;
  verified?: boolean;
  username?: string;
  specialization?: string;
  headline?: string;
  company?: string;
  location?: string;
  skills?: string[];
  contributionsCount?: number;
  joinedDate?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  github?: string;
  linkedin?: string;
  workEmail?: string;
  achievements?: any[];
  stats: {
    badgeRoundingClass?: string;
    cardRoundingClass?: string;
    communitiesCount?: number;
    connectionsCount: number;
    rankName?: string;
    level?: number;
    honors?: string | number;
    patentsAndPapers?: string | number;
    contributorRank?: string | number;
    brandLevel?: number;
    brandTitle?: string;
    githubContributions?: number;
    reposCount?: number;
    linkedinFollowers?: number;
    [key: string]: any;
  };
}

export interface CommunityTag {
  name: string;
  category?: string;
}

export interface Community {
  id: string;
  name: string;
  avatar: string;
  banner?: string;
  category?: string;
  topics?: string[];
  activeMembers: number;
  totalMembers: number;
  membersCount?: number;
  onlineCount?: number;
  matchScore?: number; // e.g. 92, 87, 78, 74
  badgeColor?: 'indigo' | 'emerald' | 'amber' | 'purple';
  tags: string[];
  description: string;
  joined: boolean;
  isJoined?: boolean;
  isVerified?: boolean;
  members?: any[];
  channels: CommunityChannel[];
  matchJustification?: string;
  matchedSignals?: string[];
}

export interface CommunityChannel {
  id: string;
  name: string;
  topic?: string;
  type: 'text' | 'voice' | 'announcements';
  unreadCount?: number;
}

export interface PromptHistoryItem {
  id: string;
  createdAt: number;
  timestamp: string; // e.g. "10m ago", "2h ago", "Yesterday"
  title: string;
  stage: 'interests' | 'hobbies' | 'goals' | 'all';
  interests: string[];
  hobbies: string[];
  goals: string[];
  rawInput?: string;
  matchedServers: Community[];
}

export interface ServerMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  role: string;
  company: string;
  headline: string;
  bio: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  skills: string[];
  contributionsCount: number;
  joinedDate: string;
  safetyNumber?: string;
  verified?: boolean;
  openToConnect?: boolean;
  sharedInterestsCount?: number;
}

export interface SyncDevice {
  id: string;
  name: string;
  type: 'phone' | 'desktop' | 'tablet';
  os: string;
  lastSync: string;
  isCurrent: boolean;
  status: 'synced' | 'syncing' | 'offline';
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  senderAvatar?: string;
  chatId?: string;
  isRead: boolean;
}

export interface EventScheduleItem {
  time: string;
  title: string;
  speaker?: string;
  description?: string;
}

export interface EventGuest {
  id: string;
  name: string;
  avatar: string;
  role: string;
  company?: string;
  isHost?: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  communityId?: string;
  communityName: string;
  communityAvatar?: string;
  isWithinJoinedServer: boolean;
  dateStr: string;
  locationType: 'in-person' | 'virtual' | 'hybrid';
  venueOrPlatform: string;
  city?: string;
  attendeesCount: number;
  coverImage: string;
  tags: string[];
  isRsvpd?: boolean;
  hostName: string;
  hostRole: string;
  eventMode?: 'online' | 'in-person';
  // Rich details:
  fullDescription?: string;
  onlineJoinUrl?: string;
  schedule?: EventScheduleItem[];
  hostAvatar?: string;
  hostBio?: string;
  guests?: EventGuest[];
  prerequisites?: string[];
}

export interface ActivityAlert {
  id: string;
  sourceType: 'channel' | 'dm';
  sourceName: string;
  channelId?: string;
  communityId?: string;
  chatId?: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  type: 'tag' | 'reply' | 'message';
}
