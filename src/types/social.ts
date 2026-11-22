export type PostReactionType =
  | 'like'
  | 'insightful'
  | 'celebrate'
  | 'love'
  | 'support'
  | 'brilliant';

export interface PostCommentReply {
  id: string;
  commentId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorHeadline: string;
  text: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
  reactions?: Record<string, number>;
  userReactions?: string[];
  replyToAuthorName?: string;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorHeadline: string;
  text: string;
  timestamp: string;
  likes: number;
  hasLiked?: boolean;
  reactions?: Record<string, number>;
  userReactions?: string[];
  replies?: PostCommentReply[];
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorHeadline: string;
  communityId?: string;
  communityName: string;
  communityColor?: string;
  timestamp: string;
  content: string;
  tags: string[];
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  videoDuration?: string;
  likesCount?: number;
  reactions: Partial<Record<PostReactionType, number>>;
  userReaction?: PostReactionType | null;
  comments: PostComment[];
  totalCommentsCount?: number;
  sharesCount?: number;
  [key: string]: any;
}
