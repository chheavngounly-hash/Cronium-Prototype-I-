import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  Image as ImageIcon,
  Video,
  ThumbsUp,
  Heart,
  MessageSquare,
  Share2,
  Send,
  MoreHorizontal,
  Bookmark,
  Check,
  Play,
  Maximize2,
  Copy,
  Repeat2,
  UserCheck,
  UserPlus,
  Smile,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  AlertTriangle,
  Flame,
  Briefcase,
  Compass,
  Coffee,
  Crown,
  ArrowLeft,
} from 'lucide-react';
import { Post, PostComment, PostCommentReply, PostReactionType } from '../types/social';
import { INITIAL_SOCIAL_POSTS } from '../data/mockSocialPosts';
import {
  CURRENT_USER,
  portraitAnnaSan,
  portraitAlexanderPatrick,
  portraitElenaRostova,
  portraitHiroshiTanaka,
  portraitCamilleLaurent,
  resolveGenderMatchedAvatar,
} from '../data/mockData';
import { MediaViewerModal } from './MediaViewerModal';
import { CreatePostModal, CreatePostMode } from './CreatePostModal';
import { PostCommentsModal } from './PostCommentsModal';
import { UserProfileModal } from './UserProfileModal';
import { PremiumUnlockModal } from './PremiumUnlockModal';
import { GamificationDashboard } from './GamificationDashboard';
import { MemberProfileDetail, getMemberProfile } from '../data/mockMemberProfiles';
import { User, UserPlan } from '../types';
import { followService } from '../utils/followService';
import { notificationService } from '../services/notifications';
import { COMPREHENSIVE_FRESH_POSTS } from '../data/freshFeedPostsData';
import { sanitizePostReactionsAndComments } from '../utils/commentsManager';
import { gamificationService } from '../utils/gamificationService';

const FRESH_COMMUNITY_POSTS = COMPREHENSIVE_FRESH_POSTS;


const REACTION_CONFIG: Record<
  PostReactionType,
  { label: string; emoji: string; color: string; activeClass: string }
> = {
  like: {
    label: 'Like',
    emoji: '👍',
    color: 'text-indigo-600 dark:text-indigo-400',
    activeClass: 'bg-indigo-50 dark:bg-indigo-950/60 font-bold',
  },
  insightful: {
    label: 'Insightful',
    emoji: '💡',
    color: 'text-amber-600 dark:text-amber-400',
    activeClass: 'bg-amber-50 dark:bg-amber-950/60 font-bold',
  },
  celebrate: {
    label: 'Celebrate',
    emoji: '🚀',
    color: 'text-emerald-600 dark:text-emerald-400',
    activeClass: 'bg-emerald-50 dark:bg-emerald-950/60 font-bold',
  },
  love: {
    label: 'Love',
    emoji: '❤️',
    color: 'text-rose-600 dark:text-rose-400',
    activeClass: 'bg-rose-50 dark:bg-rose-950/60 font-bold',
  },
  support: {
    label: 'Support',
    emoji: '👏',
    color: 'text-sky-600 dark:text-sky-400',
    activeClass: 'bg-sky-50 dark:bg-sky-950/60 font-bold',
  },
  brilliant: {
    label: 'Brilliant',
    emoji: '🧠',
    color: 'text-purple-600 dark:text-purple-400',
    activeClass: 'bg-purple-50 dark:bg-purple-950/60 font-bold',
  },
};

const FILTER_TAGS = [
  { id: 'all', label: 'All Posts' },
  { id: 'hackathons', label: '⚡ Hackathons' },
  { id: 'workplace', label: '💼 Workplace & Culture' },
  { id: 'hiking', label: '🌲 Hiking & Outdoors' },
  { id: 'lifestyle', label: '🌿 Daily Lifestyle' },
  { id: 'video', label: '▶ Videos Only' },
  { id: 'startups', label: 'Startups' },
  { id: 'robotics', label: 'Robotics & AI' },
];

const COMMENT_QUICK_EMOJIS = ['👏', '🔥', '🚀', '💡', '💯', '❤️', '🙌', '🎯'];

const getTimeUntilDailyReset = (): string => {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const diffMs = Math.max(60_000, nextMidnight.getTime() - now.getTime());
  const totalMinutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

interface SocialFeedScreenProps {
  feedClickCounter?: number;
  onNavigateToProfile?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToServers?: () => void;
  onStartDirectChatWithUser?: (user: User) => void;
  hasPrompted?: boolean;
  hasJoinedServer?: boolean;
  userPlan?: UserPlan;
  onUnlockPlan?: (plan: UserPlan) => void;
}

export const SocialFeedScreen: React.FC<SocialFeedScreenProps> = ({
  feedClickCounter,
  onNavigateToProfile,
  onNavigateToHome,
  onNavigateToServers,
  onStartDirectChatWithUser,
  hasPrompted = false,
  hasJoinedServer = false,
  userPlan = 'free',
  onUnlockPlan,
}) => {
  const canViewFeed = hasPrompted && hasJoinedServer;
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const [selectedProfile, setSelectedProfile] = useState<MemberProfileDetail | null>(null);
  const [freshPostIndex, setFreshPostIndex] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const [bonusFeedViews, setBonusFeedViews] = useState<number>(() =>
    gamificationService.getBonusFeedViews()
  );
  const [resetCountdown, setResetCountdown] = useState<string>(() => getTimeUntilDailyReset());

  useEffect(() => {
    const interval = setInterval(() => {
      setResetCountdown(getTimeUntilDailyReset());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gamificationService.resetFeedGamification();
    setBonusFeedViews(0);
    return gamificationService.subscribe(() => {
      const updated = gamificationService.getBonusFeedViews();
      setBonusFeedViews(updated);
    });
  }, []);

  const sanitizePostAvatars = (post: Post): Post => {
    const sanitized = sanitizePostReactionsAndComments(post);
    return {
      ...sanitized,
      authorAvatar: resolveGenderMatchedAvatar(sanitized.authorName, sanitized.authorAvatar),
      comments: (sanitized.comments || []).map((c) => ({
        ...c,
        authorAvatar: resolveGenderMatchedAvatar(c.authorName, c.authorAvatar),
        replies: (c.replies || []).map((r) => ({
          ...r,
          authorAvatar: resolveGenderMatchedAvatar(r.authorName, r.authorAvatar),
        })),
      })),
    };
  };

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('cronium_social_posts_v18');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length >= 20 &&
          parsed.some((p) => p.id === 'post_venture_funding_yc_a16z')
        ) {
          const restored = parsed.filter((p) => !String(p.id).startsWith('fresh_post_'));
          if (restored.length >= 20) {
            return restored.map(sanitizePostAvatars);
          }
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_SOCIAL_POSTS.slice(0, 20).map(sanitizePostAvatars);
  });

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReactionTrayPostId, setActiveReactionTrayPostId] = useState<string | null>(null);
  const [expandedContentPostIds, setExpandedContentPostIds] = useState<Set<string>>(new Set());
  const [commentsModalPost, setCommentsModalPost] = useState<Post | null>(null);
  const [selectedMediaPost, setSelectedMediaPost] = useState<Post | null>(null);
  const [createModalMode, setCreateModalMode] = useState<CreatePostMode | null>(null);
  const [followingAuthorIds, setFollowingAuthorIds] = useState<Set<string>>(() => followService.getFollowingIds());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Comments expansion state: beyond first 2 comments per post
  const [expandedPostCommentsPostIds, setExpandedPostCommentsPostIds] = useState<Set<string>>(new Set());
  // Individual comment replies expansion state ("View more" on each comment)
  const [expandedRepliesCommentIds, setExpandedRepliesCommentIds] = useState<Set<string>>(new Set());
  // Inline comment drafts per post
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  // Inline reply drafts per comment
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = followService.subscribe((ids) => setFollowingAuthorIds(ids));
    return unsub;
  }, []);
  const [shareModalPost, setShareModalPost] = useState<Post | null>(null);
  const [repostThoughts, setRepostThoughts] = useState('');

  // Dropdown menu state for post actions
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  // Post delete confirmation modal state
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  // During Feed scrolling, when users click on the Feeds icon:
  // 1. Show new posts from new people (zero duplicates, unique authors, topics, images/videos)
  // 2. Smoothly scroll container to top so Network Feed header is visible again
  const lastFeedClickRef = useRef<number | undefined>(feedClickCounter);
  useEffect(() => {
    if (
      hasPrompted &&
      feedClickCounter !== undefined &&
      feedClickCounter > 0 &&
      feedClickCounter !== lastFeedClickRef.current
    ) {
      lastFeedClickRef.current = feedClickCounter;
      // Scroll to the very top cleanly
      feedContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

      // Reset feed views & feed milestones gamification so bottom feed starts over identically
      gamificationService.resetFeedGamification();
      setBonusFeedViews(0);

      // Find an unseen post from COMPREHENSIVE_FRESH_POSTS whose authorName is not currently in the feed
      const existingAuthorNames = new Set(posts.slice(0, 20).map((p) => p.authorName.trim().toLowerCase()));
      const availableUnseen = COMPREHENSIVE_FRESH_POSTS.filter(
        (p) => !existingAuthorNames.has(p.authorName.trim().toLowerCase())
      );

      const postTemplate =
        availableUnseen.length > 0
          ? availableUnseen[freshPostIndex % availableUnseen.length]
          : COMPREHENSIVE_FRESH_POSTS[freshPostIndex % COMPREHENSIVE_FRESH_POSTS.length];

      const newPostItem: Post = sanitizePostReactionsAndComments({
        ...postTemplate,
        id: `fresh_post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: 'Just now',
      });
      setFreshPostIndex((idx) => idx + 1);
      setPosts((prev) => [newPostItem, ...prev]);
      showToast(`✨ New post from ${postTemplate.authorName}!`);
    }
  }, [feedClickCounter, freshPostIndex, posts]);

  const handleOpenProfile = (
    authorId: string,
    authorName: string,
    authorAvatar: string,
    authorHeadline: string
  ) => {
    const profile = getMemberProfile(authorId, authorName, authorAvatar, authorHeadline);
    setSelectedProfile(profile);
  };

  // Close active dropdown menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.post-options-dropdown-container')) {
        setActiveMenuPostId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Persist non-temporary posts changes
  useEffect(() => {
    try {
      const persistable = posts.filter((p) => !String(p.id).startsWith('fresh_post_'));
      localStorage.setItem('cronium_social_posts_v18', JSON.stringify(persistable));
    } catch {
      // ignore
    }
  }, [posts]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const toggleExpandContent = (postId: string) => {
    setExpandedContentPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleToggleReaction = (postId: string, reactionType: PostReactionType) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const currentReaction = post.userReaction;
        const newReactions = { ...post.reactions };

        if (currentReaction === reactionType) {
          // Untoggle
          newReactions[reactionType] = Math.max(0, (newReactions[reactionType] || 1) - 1);
          return {
            ...post,
            userReaction: null,
            reactions: newReactions,
          };
        } else {
          // Decrement previous if existed
          if (currentReaction) {
            newReactions[currentReaction] = Math.max(0, (newReactions[currentReaction] || 1) - 1);
          }
          // Increment new
          newReactions[reactionType] = (newReactions[reactionType] || 0) + 1;

          // Safeguard: Ensure total reactions strictly never surpasses comments
          const commentsTotal = post.totalCommentsCount || 100;
          const sumReactions = Object.values(newReactions).reduce((a, b) => a + b, 0);
          if (sumReactions >= commentsTotal) {
            newReactions[reactionType] = Math.max(1, newReactions[reactionType] - (sumReactions - commentsTotal + 2));
          }

          return {
            ...post,
            userReaction: reactionType,
            reactions: newReactions,
          };
        }
      })
    );
    setActiveReactionTrayPostId(null);
  };

  const handleToggleFollow = (authorId: string, authorName: string) => {
    const isNowFollowing = followService.toggleFollow(authorId, authorName);
    showToast(isNowFollowing ? `Following ${authorName}` : `Unfollowed ${authorName}`);
  };

  const handleAddCommentFromModal = (
    postId: string,
    text: string,
    replyToCommentId?: string,
    replyToAuthorName?: string
  ) => {
    if (!text.trim()) return;

    setPosts((prev) => {
      const updated = prev.map((post) => {
        if (post.id !== postId) return post;
        const currentTotal = post.totalCommentsCount || 100;

        if (replyToCommentId) {
          const newReply: PostCommentReply = {
            id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            commentId: replyToCommentId,
            authorId: CURRENT_USER.id,
            authorName: CURRENT_USER.name,
            authorAvatar: CURRENT_USER.avatar,
            authorHeadline: CURRENT_USER.customStatus || 'Head of AI Product & Systems Architecture',
            text: text.trim(),
            timestamp: 'Just now',
            likes: 0,
            hasLiked: false,
            reactions: {},
            userReactions: [],
            replyToAuthorName,
          };

          const updatedComments = post.comments.map((c) => {
            if (c.id !== replyToCommentId) return c;
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          });

          const postWithNewReply = {
            ...post,
            comments: updatedComments,
            totalCommentsCount: currentTotal + 1,
          };
          setCommentsModalPost(postWithNewReply);
          return postWithNewReply;
        } else {
          const newComment: PostComment = {
            id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            authorId: CURRENT_USER.id,
            authorName: CURRENT_USER.name,
            authorAvatar: CURRENT_USER.avatar,
            authorHeadline: CURRENT_USER.customStatus || 'Head of AI Product & Systems Architecture',
            text: text.trim(),
            timestamp: 'Just now',
            likes: 0,
            hasLiked: false,
            reactions: {},
            userReactions: [],
            replies: [],
          };

          const postWithNewComment = {
            ...post,
            comments: [newComment, ...post.comments],
            totalCommentsCount: currentTotal + 1,
          };
          setCommentsModalPost(postWithNewComment);
          return postWithNewComment;
        }
      });

      try {
        localStorage.setItem('cronium_social_posts_v18', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    showToast(replyToCommentId ? 'Reply published!' : 'Comment published!');

    // Simulate active peer reply and trigger notification when someone comments on them
    const peerReplies = [
      {
        name: 'Anna San',
        avatar: portraitAnnaSan,
        headline: 'Founding Engineer @ Modal Labs',
        text: 'Great point @Jennies Vance! Totally aligned with this approach.',
      },
      {
        name: 'Alexander Patrick',
        avatar: portraitAlexanderPatrick,
        headline: 'Distributed Systems & WebCrypto Architect',
        text: 'Strongly agree with your insight @Jennies! The consensus latency confirms it.',
      },
      {
        name: 'Elena Rostova',
        avatar: portraitElenaRostova,
        headline: 'VP of AI Infrastructure & Hardware Acceleration',
        text: 'Spot on @Jennies Vance! We saw identical gains on our testbed.',
      },
    ];
    const chosen = peerReplies[Math.floor(Math.random() * peerReplies.length)];

    setTimeout(() => {
      const newSimReply: PostCommentReply = {
        id: `reply_${Date.now()}_sim`,
        commentId: replyToCommentId || 'comm_top',
        authorId: `user_${chosen.name.toLowerCase().replace(/\s+/g, '_')}`,
        authorName: chosen.name,
        authorAvatar: chosen.avatar,
        authorHeadline: chosen.headline,
        text: chosen.text,
        timestamp: 'Just now',
        likes: 1,
        hasLiked: false,
        reactions: { '👍': 1 },
        userReactions: [],
        replyToAuthorName: CURRENT_USER.name,
      };

      setPosts((prev) => {
        const updated = prev.map((p) => {
          if (p.id !== postId) return p;
          let updatedComments = p.comments;
          if (replyToCommentId) {
            updatedComments = p.comments.map((c) => {
              if (c.id !== replyToCommentId) return c;
              return {
                ...c,
                replies: [...(c.replies || []), newSimReply],
              };
            });
          } else if (p.comments.length > 0) {
            updatedComments = [
              {
                ...p.comments[0],
                replies: [...(p.comments[0].replies || []), newSimReply],
              },
              ...p.comments.slice(1),
            ];
          }
          const postWithReply = {
            ...p,
            comments: updatedComments,
            totalCommentsCount: (p.totalCommentsCount || 100) + 1,
          };
          setCommentsModalPost((curr) => (curr?.id === postId ? postWithReply : curr));
          return postWithReply;
        });

        try {
          localStorage.setItem('cronium_social_posts_v18', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      notificationService.notify({
        title: `${chosen.name} commented on your discussion`,
        body: `"${chosen.text}"`,
        avatar: chosen.avatar,
        type: 'comment',
      });
    }, 3600);
  };

  const handleToggleCommentLike = (postId: string, commentId: string) => {
    setPosts((prev) => {
      const updated = prev.map((post) => {
        if (post.id !== postId) return post;
        const updatedComments = post.comments.map((c) => {
          if (c.id !== commentId) return c;
          const hasLiked = !c.hasLiked;
          return {
            ...c,
            hasLiked,
            likes: hasLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        });
        const updatedPost = { ...post, comments: updatedComments };
        if (commentsModalPost?.id === postId) {
          setCommentsModalPost(updatedPost);
        }
        return updatedPost;
      });
      try {
        localStorage.setItem('cronium_social_posts_v18', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleToggleCommentReaction = (postId: string, commentId: string, emoji: string) => {
    setPosts((prev) => {
      const updated = prev.map((post) => {
        if (post.id !== postId) return post;
        const updatedComments = post.comments.map((comment) => {
          if (comment.id !== commentId) return comment;
          const currentReactions = { ...(comment.reactions || {}) };
          const currentUserReactions = [...(comment.userReactions || [])];
          const hasReacted = currentUserReactions.includes(emoji);

          if (hasReacted) {
            const nextCount = Math.max(0, (currentReactions[emoji] || 1) - 1);
            if (nextCount === 0) {
              delete currentReactions[emoji];
            } else {
              currentReactions[emoji] = nextCount;
            }
            return {
              ...comment,
              reactions: currentReactions,
              userReactions: currentUserReactions.filter((e) => e !== emoji),
            };
          } else {
            currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
            currentUserReactions.push(emoji);
            return {
              ...comment,
              reactions: currentReactions,
              userReactions: currentUserReactions,
            };
          }
        });
        const updatedPost = { ...post, comments: updatedComments };
        if (commentsModalPost?.id === postId) {
          setCommentsModalPost(updatedPost);
        }
        return updatedPost;
      });
      try {
        localStorage.setItem('cronium_social_posts_v18', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleToggleReplyLike = (postId: string, commentId: string, replyId: string) => {
    setPosts((prev) => {
      const updated = prev.map((post) => {
        if (post.id !== postId) return post;
        const updatedComments = post.comments.map((c) => {
          if (c.id !== commentId) return c;
          return {
            ...c,
            replies: (c.replies || []).map((r) => {
              if (r.id !== replyId) return r;
              const hasLiked = !r.hasLiked;
              return {
                ...r,
                hasLiked,
                likes: hasLiked ? r.likes + 1 : Math.max(0, r.likes - 1),
              };
            }),
          };
        });
        const updatedPost = { ...post, comments: updatedComments };
        if (commentsModalPost?.id === postId) {
          setCommentsModalPost(updatedPost);
        }
        return updatedPost;
      });
      try {
        localStorage.setItem('cronium_social_posts_v18', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleToggleReplyReaction = (
    postId: string,
    commentId: string,
    replyId: string,
    emoji: string
  ) => {
    setPosts((prev) => {
      const updated = prev.map((post) => {
        if (post.id !== postId) return post;
        const updatedComments = post.comments.map((c) => {
          if (c.id !== commentId) return c;
          return {
            ...c,
            replies: (c.replies || []).map((reply) => {
              if (reply.id !== replyId) return reply;
              const currentReactions = { ...(reply.reactions || {}) };
              const currentUserReactions = [...(reply.userReactions || [])];
              const hasReacted = currentUserReactions.includes(emoji);

              if (hasReacted) {
                const nextCount = Math.max(0, (currentReactions[emoji] || 1) - 1);
                if (nextCount === 0) {
                  delete currentReactions[emoji];
                } else {
                  currentReactions[emoji] = nextCount;
                }
                return {
                  ...reply,
                  reactions: currentReactions,
                  userReactions: currentUserReactions.filter((e) => e !== emoji),
                };
              } else {
                currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
                currentUserReactions.push(emoji);
                return {
                  ...reply,
                  reactions: currentReactions,
                  userReactions: currentUserReactions,
                };
              }
            }),
          };
        });
        const updatedPost = { ...post, comments: updatedComments };
        if (commentsModalPost?.id === postId) {
          setCommentsModalPost(updatedPost);
        }
        return updatedPost;
      });
      try {
        localStorage.setItem('cronium_social_posts_v18', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const toggleExpandPostComments = (postId: string) => {
    setExpandedPostCommentsPostIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const toggleExpandReplies = (commentId: string) => {
    setExpandedRepliesCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const handleInlineSubmitComment = (postId: string) => {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    handleAddCommentFromModal(postId, text);
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const handleQuickEmojiComment = (postId: string, emoji: string) => {
    handleAddCommentFromModal(postId, emoji);
  };

  const handleInlineSubmitReply = (postId: string, commentId: string, authorName: string) => {
    const text = replyDrafts[commentId]?.trim();
    if (!text) return;
    handleAddCommentFromModal(postId, text, commentId, authorName);
    setReplyDrafts((prev) => ({ ...prev, [commentId]: '' }));
  };

  const handlePublishNewPost = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    showToast('Post published to network!');

    // Simulate peer commenting on user's newly published post
    setTimeout(() => {
      const peerComments = [
        {
          authorName: 'Anna San',
          authorAvatar: portraitAnnaSan,
          authorHeadline: 'Founding Engineer @ Modal Labs',
          text: 'Brilliant update @Jennies Vance! Excited to see this deployed across the cluster.',
        },
        {
          authorName: 'Dr. Hiroshi Tanaka',
          authorAvatar: portraitHiroshiTanaka,
          authorHeadline: 'Principal AI Scientist & Quantum ML Researcher',
          text: 'Fascinating architecture. Our lab is eager to benchmark this formulation.',
        },
        {
          authorName: 'Camille Laurent',
          authorAvatar: portraitCamilleLaurent,
          authorHeadline: 'Lead Neural Codec Researcher @ SoundAI',
          text: 'Very impressive progress! The latency benchmarks look incredible.',
        },
      ];
      const chosen = peerComments[Math.floor(Math.random() * peerComments.length)];
      const simulatedComment: PostComment = {
        id: `comm_${Date.now()}_sim`,
        authorId: `user_${chosen.authorName.toLowerCase().replace(/\s+/g, '_')}`,
        authorName: chosen.authorName,
        authorAvatar: chosen.authorAvatar,
        authorHeadline: chosen.authorHeadline,
        text: chosen.text,
        timestamp: 'Just now',
        likes: 1,
        hasLiked: false,
        reactions: { '👏': 1 },
        userReactions: [],
        replies: [],
      };

      setPosts((prev) => {
        const updated = prev.map((p) => {
          if (p.id === newPost.id) {
            return {
              ...p,
              comments: [simulatedComment, ...p.comments],
              totalCommentsCount: (p.totalCommentsCount || 0) + 1,
            };
          }
          return p;
        });
        try {
          localStorage.setItem('cronium_social_posts_v18', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      notificationService.notify({
        title: `${chosen.authorName} commented on your post`,
        body: `"${chosen.text}"`,
        avatar: chosen.authorAvatar,
        type: 'comment',
      });
    }, 4000);
  };

  const handleExecuteRepost = () => {
    if (!shareModalPost) return;

    const repostItem: Post = {
      id: `post_repost_${Date.now()}`,
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      authorAvatar: CURRENT_USER.avatar,
      authorHeadline: CURRENT_USER.customStatus || 'Head of AI Product & Systems Architecture',
      communityId: shareModalPost.communityId,
      communityName: shareModalPost.communityName,
      communityColor: shareModalPost.communityColor,
      timestamp: 'Just now',
      content: repostThoughts.trim()
        ? `${repostThoughts.trim()}\n\n---\nReposting @${shareModalPost.authorName}:\n${shareModalPost.content}`
        : `Reposting from @${shareModalPost.authorName}:\n\n${shareModalPost.content}`,
      tags: shareModalPost.tags,
      mediaType: shareModalPost.mediaType,
      mediaUrl: shareModalPost.mediaUrl,
      mediaThumbnail: shareModalPost.mediaThumbnail,
      videoDuration: shareModalPost.videoDuration,
      reactions: {
        like: 1,
        insightful: 0,
        celebrate: 0,
        love: 0,
        support: 0,
        brilliant: 0,
      },
      userReaction: 'like',
      comments: [],
      totalCommentsCount: Math.floor(Math.random() * (240 - 110 + 1)) + 110,
      sharesCount: 0,
      hasShared: false,
      repostOf: {
        authorName: shareModalPost.authorName,
        authorHeadline: shareModalPost.authorHeadline,
        content: shareModalPost.content,
      },
    };

    setPosts((prev) => [
      repostItem,
      ...prev.map((p) =>
        p.id === shareModalPost.id ? { ...p, sharesCount: (p.sharesCount || 0) + 1, hasShared: true } : p
      ),
    ]);

    setShareModalPost(null);
    setRepostThoughts('');
    showToast('Reposted to your network feed!');
  };

  const handleCopyPostLink = (post: Post) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/#post-${post.id}`);
    }
    showToast('Link copied to clipboard!');
    setShareModalPost(null);
    setActiveMenuPostId(null);
  };

  // Delete Post handler
  const handleConfirmDeletePost = () => {
    if (!postToDelete) return;

    setPosts((prev) => {
      const updated = prev.filter((p) => p.id !== postToDelete.id);
      try {
        localStorage.setItem('cronium_social_posts_v18', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    showToast('Post deleted successfully');
    setPostToDelete(null);
    setActiveMenuPostId(null);
  };

  // Filter posts (memoized so comment typing & UI state changes stay 60fps on mobile)
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      if (q) {
        const matchText = `${post.authorName} ${post.authorHeadline} ${post.content} ${post.tags.join(' ')} ${post.communityName || ''}`.toLowerCase();
        if (!matchText.includes(q)) return false;
      }

      if (activeFilter === 'all') return true;
      if (activeFilter === 'hackathons') {
        return (
          post.tags.some((t) =>
            ['hackathon', 'hackathons', 'sprint', 'demo day', 'competition'].some((k) =>
              t.toLowerCase().includes(k)
            )
          ) ||
          ['hackathon', 'sprint', 'demo day', 'whiteboard', '48 hours'].some((k) =>
            post.content.toLowerCase().includes(k)
          )
        );
      }
      if (activeFilter === 'workplace') {
        return (
          post.tags.some((t) =>
            ['workplace', 'remotework', 'wellbeing', 'ergonomics', 'desksetup', 'culture', 'hiring'].some(
              (k) => t.toLowerCase().includes(k)
            )
          ) ||
          ['workplace', 'remote', 'meeting', 'ergonomic', 'desk', 'posture', 'team'].some((k) =>
            post.content.toLowerCase().includes(k)
          )
        );
      }
      if (activeFilter === 'hiking') {
        return (
          post.tags.some((t) =>
            ['hiking', 'outdoors', 'trailrunning', 'trail', 'nature', 'camping', 'retreat'].some((k) =>
              t.toLowerCase().includes(k)
            )
          ) ||
          ['hiking', 'trail', 'mountain', 'ridge', 'summit', 'elevation', 'backpacking'].some((k) =>
            post.content.toLowerCase().includes(k)
          )
        );
      }
      if (activeFilter === 'lifestyle') {
        return (
          post.tags.some((t) =>
            ['lifestyle', 'coffee', 'cooking', 'sourdough', 'slowliving', 'mindfulness', 'weekend'].some(
              (k) => t.toLowerCase().includes(k)
            )
          ) ||
          ['coffee', 'sourdough', 'cooking', 'ritual', 'morning', 'mindful', 'offline', 'baking'].some((k) =>
            post.content.toLowerCase().includes(k)
          )
        );
      }
      if (activeFilter === 'video') return post.mediaType === 'video';
      if (activeFilter === 'startups') {
        return (
          post.tags.some((t) =>
            ['startup', 'founder', 'funding', 'venture', 'ycombinator', 'a16z'].some((k) =>
              t.toLowerCase().includes(k)
            )
          ) ||
          post.communityName?.toLowerCase().includes('startup') ||
          ['y combinator', 'a16z', 'funding', 'series a', 'venture capital'].some((k) =>
            post.content.toLowerCase().includes(k)
          )
        );
      }
      if (activeFilter === 'robotics') {
        return (
          post.tags.some((t) =>
            t.toLowerCase().includes('robot') || t.toLowerCase().includes('ai') || t.toLowerCase().includes('machine')
          ) ||
          post.communityName?.toLowerCase().includes('robot') ||
          post.communityName?.toLowerCase().includes('machine')
        );
      }

      return true;
    });
  }, [posts, searchQuery, activeFilter]);

  const FEED_LIMIT =
    userPlan === 'pro'
      ? 40
      : userPlan === 'plus'
      ? 30 + bonusFeedViews
      : 20 + bonusFeedViews;

  const { visiblePosts, hasReachedFeedLimit } = useMemo(() => {
    const extraUnlockedPosts =
      FEED_LIMIT > filteredPosts.length && activeFilter === 'all' && !searchQuery.trim()
        ? COMPREHENSIVE_FRESH_POSTS.filter(
            (fp) => !filteredPosts.some((p) => p.id === fp.id || (fp.mediaUrl && p.mediaUrl === fp.mediaUrl))
          ).map(sanitizePostAvatars)
        : [];

    const combined = [...filteredPosts, ...extraUnlockedPosts];
    const visible = combined.slice(0, FEED_LIMIT);
    const reached =
      (activeFilter === 'all' && !searchQuery.trim() && visible.length > 0) ||
      combined.length >= FEED_LIMIT;

    return { visiblePosts: visible, hasReachedFeedLimit: reached };
  }, [filteredPosts, FEED_LIMIT, activeFilter, searchQuery]);

  return (
    <div
      ref={feedContainerRef}
      data-tab-scroller="feed"
      className={`flex flex-col flex-1 h-full min-h-0 text-slate-900 dark:text-slate-100 overflow-y-auto ${
        !canViewFeed ? 'bg-[#F8FAFC] dark:bg-slate-950' : 'bg-[#F5F8FF] dark:bg-slate-950'
      }`}
    >
      {/* Top App Header - shown once feed is unlocked */}
      {canViewFeed && (
        <div className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-4 py-3 shrink-0 shadow-2xs">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight font-display tracking-tight">
                Network Feed
              </h2>
            </div>
          </div>

          <div className="max-w-xl mx-auto mt-2.5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hackathons, workplace topics, hiking trails, or posts..."
              className="w-full h-8 pl-9 pr-3 text-xs bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-full border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills with Hackathons, Workplace, Hiking & Daily Lifestyle */}
          <div className="max-w-xl mx-auto mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {FILTER_TAGS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeFilter === filter.id
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feed Stream */}
      {!canViewFeed ? (
        <div className="max-w-[440px] mx-auto w-full px-3 py-6 flex-1 flex items-center justify-center">
          <div className="w-full bg-white dark:bg-slate-900 rounded-[26px] border border-slate-200/80 dark:border-slate-800 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.08)] dark:shadow-2xl px-6 py-8 sm:px-7 sm:py-9 text-center flex flex-col items-center">
            {/* Custom Checklist + Plus Badge Illustration */}
            <div className="mb-4 select-none" aria-hidden="true">
              <svg
                width="84"
                height="84"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[84px] h-[84px]"
              >
                {/* Playful sparkle accent ticks top-right */}
                <path
                  d="M73 16L76.5 8.5"
                  stroke="#A89DFC"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M80 22L86.5 18.5"
                  stroke="#A89DFC"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Tilted lavender checklist card */}
                <g transform="rotate(-7 46 48)">
                  <rect
                    x="18"
                    y="15"
                    width="52"
                    height="62"
                    rx="11"
                    className="fill-[#F3F0FF] dark:fill-indigo-950/80 stroke-[#D1C8FF] dark:stroke-indigo-700/80"
                    strokeWidth="2.4"
                  />

                  {/* Row 1 */}
                  <path
                    d="M27 32L30 35L35 28.5"
                    stroke="#5B35F8"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="40"
                    y="30"
                    width="22"
                    height="4.4"
                    rx="2.2"
                    className="fill-[#C8C0FA] dark:fill-indigo-500/50"
                  />

                  {/* Row 2 */}
                  <path
                    d="M27 45.5L30 48.5L35 42"
                    stroke="#5B35F8"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="40"
                    y="43.5"
                    width="19"
                    height="4.4"
                    rx="2.2"
                    className="fill-[#C8C0FA] dark:fill-indigo-500/50"
                  />

                  {/* Row 3 */}
                  <path
                    d="M27 59L30 62L35 55.5"
                    stroke="#5B35F8"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="40"
                    y="57"
                    width="14"
                    height="4.4"
                    rx="2.2"
                    className="fill-[#C8C0FA] dark:fill-indigo-500/50"
                  />
                </g>

                {/* Bottom-right circular vibrant violet Plus badge */}
                <circle cx="67" cy="67" r="14.5" fill="#5B35F8" />
                <path
                  d="M67 60.5V73.5M60.5 67H73.5"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h3 className="text-[20px] sm:text-[21px] font-bold font-sans text-slate-900 dark:text-white leading-snug">
              Finish your{' '}
              <span className="text-[#5B35F8] dark:text-indigo-400">setup</span>{' '}
              first
            </h3>

            <p className="mt-2 text-[13px] sm:text-sm font-sans font-normal text-slate-500 dark:text-slate-400 leading-relaxed max-w-[245px]">
              Go to your prompts and join servers to unlock your feed.
            </p>

            {onNavigateToHome && (
              <button
                type="button"
                onClick={onNavigateToHome}
                className="mt-5.5 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#5B35F8] to-[#522EEB] hover:from-[#4F2BE6] hover:to-[#4522D9] text-white font-sans text-[13px] font-bold shadow-[0_8px_20px_-6px_rgba(91,53,248,0.48)] active:scale-[0.97] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>{hasPrompted ? 'Join Servers' : 'Go to Prompts'}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
      <div className="max-w-xl mx-auto w-full px-3 sm:px-4 py-4 space-y-4">
        {/* "Start a post" Top Prompt Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
            />
            <button
              onClick={() => setCreateModalMode('post')}
              className="flex-1 h-10 px-4 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-left text-xs sm:text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center"
            >
              Share a hackathon win, workplace topic, or hiking story...
            </button>
          </div>

          <div className="flex items-center justify-around pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => setCreateModalMode('photo')}
              className="flex items-center gap-2 py-1 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-semibold">Photo</span>
            </button>
            <button
              onClick={() => setCreateModalMode('video')}
              className="flex items-center gap-2 py-1 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Video className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold">Video</span>
            </button>
            <button
              onClick={() => setCreateModalMode('story')}
              className="flex items-center gap-2 py-1 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold">Hackathon / Story</span>
            </button>
          </div>
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No posts found for this filter.
            </p>
            <p className="text-xs text-slate-400">
              Try selecting "All Posts" or "⚡ Hackathons" to explore community discussions.
            </p>
          </div>
        ) : (
          visiblePosts.map((post) => {
            const isMyPost = post.authorId === CURRENT_USER.id;
            const isFollowing = followingAuthorIds.has(post.authorId);
            const isContentExpanded = expandedContentPostIds.has(post.id);
            const isMenuOpen = activeMenuPostId === post.id;
            
            // Comments count: varies between 100 and 300 across posts, all unique
            const displayCommentsCount = post.totalCommentsCount || 100 + post.comments.length;
            
            // Reactions: "If the number of likes or other emojis in the post surpasses the number of comments, make it less"
            const rawReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);
            const totalReactions = rawReactions >= displayCommentsCount
              ? Math.max(1, displayCommentsCount - 15)
              : rawReactions;

            const userReactionObj = post.userReaction ? REACTION_CONFIG[post.userReaction] : null;

            // Long post threshold (more than 220 chars or contains more than 1 paragraph)
            const isLongPost =
              post.content.length > 220 || post.content.split('\n\n').filter((l) => l.trim()).length > 1;

            // Compute truncated preview if not expanded
            let previewText = post.content;
            if (isLongPost && !isContentExpanded) {
              const paragraphs = post.content.split('\n\n').filter((l) => l.trim());
              const firstParagraph = paragraphs[0] || post.content;
              if (firstParagraph.length <= 260) {
                previewText = firstParagraph;
              } else {
                previewText = firstParagraph.slice(0, 240).trim() + '...';
              }
            }

            return (
              <article
                key={post.id}
                className="relative isolate feed-card-opt bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-shadow duration-150 hover:shadow-sm"
              >
                {/* Author & Community Header */}
                <div className="p-3.5 sm:p-4 pb-2 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      loading="lazy"
                      decoding="async"
                      onClick={() => handleOpenProfile(post.authorId, post.authorName, post.authorAvatar, post.authorHeadline)}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-shadow duration-150"
                      title={`View ${post.authorName}'s Profile`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          onClick={() => handleOpenProfile(post.authorId, post.authorName, post.authorAvatar, post.authorHeadline)}
                          className="text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {post.authorName}
                        </h3>

                        {/* Author tag: "You" or Follow button */}
                        {isMyPost ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Author (You)
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleFollow(post.authorId, post.authorName)}
                            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                              isFollowing
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3" />
                                <span>+ Follow</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-normal">
                        {post.authorHeadline}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span>{post.timestamp}</span>
                        {post.communityName && (
                          <>
                            <span>•</span>
                            <span
                              className={`px-2 py-0.5 rounded-md font-medium border text-[10px] truncate max-w-[200px] ${
                                post.communityColor ||
                                'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              #{post.communityName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Post Options Menu Dropdown Container */}
                  <div className="relative flex items-center gap-0.5 post-options-dropdown-container">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuPostId(isMenuOpen ? null : post.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Post options"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <>
                        {/* Backdrop to close menu on click outside */}
                        <div
                          className="fixed inset-0 z-20"
                          onClick={() => setActiveMenuPostId(null)}
                        />
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                          {/* Delete Post option - ONLY for personal posts */}
                          {isMyPost && (
                            <button
                              onClick={() => {
                                setActiveMenuPostId(null);
                                setPostToDelete(post);
                              }}
                              className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                              <span>Delete Post</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setActiveMenuPostId(null);
                              setShareModalPost(post);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-slate-500" />
                            <span>Share / Repost</span>
                          </button>

                          <button
                            onClick={() => handleCopyPostLink(post)}
                            className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Copy className="w-4 h-4 text-slate-500" />
                            <span>Copy Post Link</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Post Content Text with "See More" (Default) and "See Less" at bottom */}
                <div className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {isLongPost && !isContentExpanded ? (
                    <div>
                      <span className="whitespace-pre-line">{previewText}</span>
                      <button
                        type="button"
                        onClick={() => toggleExpandContent(post.id)}
                        className="inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 rounded-md text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer select-none"
                      >
                        <span>See More</span>
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="whitespace-pre-line">{post.content}</div>
                      {isLongPost && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => toggleExpandContent(post.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs select-none active:scale-95"
                          >
                            <span>See Less</span>
                            <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Hashtags Bar */}
                {post.tags && post.tags.length > 0 && (
                  <div className="px-3.5 sm:px-4 pb-2.5 flex items-center gap-1.5 flex-wrap">
                    {post.tags.map((t) => (
                      <span
                        key={t}
                        onClick={() => setSearchQuery(t)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Media Attachment (Video or Image) */}
                {(post.mediaUrl || (post as any).media?.url) && (
                  <div className="relative bg-slate-950 overflow-hidden border-y border-slate-200/80 dark:border-slate-800">
                    {post.mediaType === 'video' ? (
                      (() => {
                        const url = post.mediaUrl || (post as any).media?.url || '';
                        return (
                          url.startsWith('blob:') ||
                          url.startsWith('data:video/') ||
                          /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)
                        );
                      })() ? (
                        <div className="relative group">
                          <video
                            src={post.mediaUrl || (post as any).media?.url}
                            poster={post.mediaThumbnail}
                            playsInline
                            preload="metadata"
                            controls
                            className="w-full max-h-[380px] object-contain bg-black"
                          />
                          <button
                            onClick={() => setSelectedMediaPost(post)}
                            className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all cursor-pointer opacity-80 hover:opacity-100"
                            title="Open Fullscreen Theater View"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          {post.videoDuration && (
                            <span className="absolute bottom-12 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono pointer-events-none">
                              ▶ {post.videoDuration}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => setSelectedMediaPost(post)}
                          className="relative group cursor-pointer overflow-hidden w-full aspect-[16/10] bg-slate-900"
                        >
                          <img
                            src={post.mediaUrl || (post as any).media?.url}
                            alt="Video preview"
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 block"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80';
                            }}
                          />
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-white/90 text-slate-900 group-hover:scale-110 group-hover:bg-white transition-transform duration-150 shadow-xl flex items-center justify-center pl-1">
                              <Play className="w-6 h-6 fill-current text-indigo-600" />
                            </div>
                          </div>
                          {/* Duration Badge & HD Video Tag */}
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-black/80 text-white text-[11px] font-mono font-medium flex items-center gap-1.5 shadow-md">
                              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                              <span>▶ {post.videoDuration || '0:48'}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-200 border border-indigo-700/50 text-[10px] font-bold uppercase tracking-wider shadow-md">
                              HD Video
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMediaPost(post);
                            }}
                            className="absolute top-3 right-3 p-2 rounded-lg bg-black/65 hover:bg-black/85 text-white transition-opacity cursor-pointer opacity-80 hover:opacity-100"
                            title="Open Fullscreen Theater View"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    ) : (
                      <div
                        onClick={() => setSelectedMediaPost(post)}
                        className="relative group cursor-pointer overflow-hidden w-full aspect-[16/10] bg-slate-900"
                      >
                        <img
                          src={post.mediaUrl || (post as any).media?.url}
                          alt="Post media"
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 block"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-sm transition-opacity flex items-center gap-1.5 shadow-lg">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>View Full Image</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reactions Count & Summary */}
                <div className="px-3.5 sm:px-4 py-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-1">
                      <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] flex items-center justify-center shadow-xs">
                        👍
                      </span>
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center shadow-xs">
                        💡
                      </span>
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center shadow-xs">
                        ❤️
                      </span>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {totalReactions}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px]">
                    <button
                      onClick={() => setCommentsModalPost(post)}
                      className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-medium"
                    >
                      {displayCommentsCount} comments
                    </button>
                    <span>•</span>
                    <span>{post.sharesCount} reposts</span>
                  </div>
                </div>

                {/* Action Bar (Celebrate/Like, Comment, Share) */}
                <div className="px-3 py-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Reaction Button with Floating Tray */}
                  <div
                    className="relative flex-1"
                    onMouseEnter={() => setActiveReactionTrayPostId(post.id)}
                    onMouseLeave={() => setActiveReactionTrayPostId(null)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (userReactionObj) {
                          handleToggleReaction(post.id, post.userReaction!);
                        } else {
                          setActiveReactionTrayPostId(activeReactionTrayPostId === post.id ? null : post.id);
                        }
                      }}
                      className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                        userReactionObj
                          ? `${userReactionObj.color} ${userReactionObj.activeClass}`
                          : 'text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-950/40'
                      }`}
                    >
                      <span className="text-sm">
                        {userReactionObj ? userReactionObj.emoji : '🚀'}
                      </span>
                      <span>{userReactionObj ? userReactionObj.label : 'Celebrate'}</span>
                    </button>

                    {/* Floating Reaction Tray with Backdrop */}
                    {activeReactionTrayPostId === post.id && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveReactionTrayPostId(null);
                          }}
                        />
                        <div className="absolute left-0 bottom-full mb-1 z-30 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                          {(Object.keys(REACTION_CONFIG) as PostReactionType[]).map((key) => {
                            const item = REACTION_CONFIG[key];
                            const isSelected = post.userReaction === key;
                            return (
                              <button
                                key={key}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleReaction(post.id, key);
                                  setActiveReactionTrayPostId(null);
                                }}
                                className={`p-1.5 text-lg hover:scale-130 transition-transform rounded-full cursor-pointer ${
                                  isSelected ? 'bg-indigo-100 dark:bg-indigo-950 scale-115' : ''
                                }`}
                                title={item.label}
                              >
                                {item.emoji}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Comment Button -> Opens Dedicated Comments Interface */}
                  <button
                    onClick={() => setCommentsModalPost(post)}
                    className="flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Comment</span>
                  </button>

                  {/* Share / Repost Button */}
                  <button
                    onClick={() => setShareModalPost(post)}
                    className="flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>

              </article>
            );
          })
        )}

        {/* Feed Limit Card: Daily Limit Reached + Reset Countdown + Secondary Exit Path */}
        {hasReachedFeedLimit && userPlan !== 'pro' && (
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-50/95 via-white to-purple-50/95 dark:from-slate-900 dark:via-slate-850 dark:to-indigo-950/40 border border-indigo-200/90 dark:border-indigo-800/70 shadow-lg text-center space-y-4 my-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-600/20">
              <Crown className="w-6 h-6 fill-white" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>
                  Daily Limit Reached · {visiblePosts.length}/{FEED_LIMIT} Viewed
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-display leading-snug">
                {`You've caught up on today's ${visiblePosts.length} posts`}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                {userPlan === 'plus' ? (
                  <>
                    Expand your daily feed to{' '}
                    <span className="font-semibold not-italic text-slate-700 dark:text-slate-200">
                      40 posts/day
                    </span>{' '}
                    with Cronium Pro, plus unlimited connections and zero ads.
                  </>
                ) : (
                  <>
                    Expand your daily feed to{' '}
                    <span className="font-semibold not-italic text-slate-700 dark:text-slate-200">
                      30 posts/day
                    </span>{' '}
                    with Cronium Plus, or{' '}
                    <span className="font-semibold not-italic text-slate-700 dark:text-slate-200">
                      40 posts/day
                    </span>{' '}
                    with Cronium Pro.
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2.5 pt-1">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-indigo-600 to-violet-600 hover:from-amber-600 hover:to-violet-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Crown className="w-4 h-4 fill-white" />
                <span>{userPlan === 'plus' ? 'Upgrade to Cronium Pro' : 'Upgrade Plan'}</span>
              </button>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                {userPlan === 'plus' ? 'Plus views reset in' : 'Free views reset in'} {resetCountdown}
              </p>

              {/* Secondary Action Text Links (Milestones unlock + Jump to Servers & DMs) */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => setShowMilestonesModal(true)}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
                >
                  Earn +10 views via Milestones
                </button>
                {onNavigateToServers && (
                  <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
                    ·
                  </span>
                )}
                {onNavigateToServers && (
                  <button
                    type="button"
                    onClick={onNavigateToServers}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
                  >
                    Jump to Servers &amp; DMs →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {userPlan === 'pro' && filteredPosts.length >= FEED_LIMIT && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-center my-3">
            <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
              <Crown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
              <span>Cronium Pro · Daily feeds up to 40 posts / day ({visiblePosts.length} posts shown)</span>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delete this post?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This post will be permanently removed from your network feed.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              "{postToDelete.content}"
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePost}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share / Repost Modal */}
      {shareModalPost && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Share Post to Network
              </h3>
              <button
                onClick={() => setShareModalPost(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Add your thoughts (optional):
              </label>
              <textarea
                value={repostThoughts}
                onChange={(e) => setRepostThoughts(e.target.value)}
                placeholder="What do you think about this update or story?"
                rows={3}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Repost summary box */}
            <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs">
              <img
                src={shareModalPost.authorAvatar}
                alt={shareModalPost.authorName}
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
              />
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white truncate block">
                  {shareModalPost.authorName}
                </span>
                <p className="text-slate-600 dark:text-slate-300 line-clamp-2 text-[11px]">
                  {shareModalPost.content}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleCopyPostLink(shareModalPost)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShareModalPost(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteRepost}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Repeat2 className="w-3.5 h-3.5" />
                  <span>Repost Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Media Viewer Modal */}
      {selectedMediaPost && (
        <MediaViewerModal
          post={selectedMediaPost}
          isOpen={!!selectedMediaPost}
          onClose={() => setSelectedMediaPost(null)}
        />
      )}

      {/* Dedicated Post Comments Modal Interface */}
      {commentsModalPost && (
        <PostCommentsModal
          post={commentsModalPost}
          isOpen={!!commentsModalPost}
          onClose={() => setCommentsModalPost(null)}
          onAddComment={handleAddCommentFromModal}
          onToggleCommentLike={handleToggleCommentLike}
          onToggleCommentReaction={handleToggleCommentReaction}
          onToggleReplyLike={handleToggleReplyLike}
          onToggleReplyReaction={handleToggleReplyReaction}
          onViewProfile={handleOpenProfile}
        />
      )}

      {/* Executive / Member Profile Modal */}
      {selectedProfile && (
        <UserProfileModal
          profile={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          isFollowing={followingAuthorIds.has(selectedProfile.id)}
          onToggleFollow={handleToggleFollow}
          onStartDirectMessage={(member) => {
            setSelectedProfile(null);
            onStartDirectChatWithUser?.({
              id: member.id,
              name: member.name,
              avatar: member.avatar,
              status: 'online',
              customStatus: member.role || 'Community Member',
            });
          }}
          userPlan={userPlan}
          onUnlockPlan={onUnlockPlan}
        />
      )}

      {/* Create Post / Photo / Video / Story Modal */}
      <CreatePostModal
        isOpen={createModalMode !== null}
        initialMode={createModalMode || 'post'}
        onClose={() => setCreateModalMode(null)}
        onPublishPost={handlePublishNewPost}
      />

      {/* Premium Upgrade Modal */}
      {showUpgradeModal && (
        <PremiumUnlockModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUnlock={(plan) => {
            if (onUnlockPlan && plan) {
              onUnlockPlan(plan);
            }
            setShowUpgradeModal(false);
            setToastMessage(
              plan === 'pro'
                ? 'Cronium Pro Active: Daily feeds up to 40 posts / day!'
                : plan === 'plus'
                ? 'Cronium Plus Active: Read up to 30 posts / day!'
                : 'Free tier Active: Only 20 posts views / day'
            );
            setTimeout(() => setToastMessage(null), 3500);
          }}
          currentPlan={userPlan}
          initialPlanTab="plus"
        />
      )}

      {/* Milestones Unlock Modal (Earn +10 feed views via Milestones) */}
      {showMilestonesModal && (
        <GamificationDashboard
          isModal
          mode="feed"
          onClose={() => setShowMilestonesModal(false)}
          onFeedViewsUnlocked={(views) => {
            setBonusFeedViews(views);
            if (views > 0) {
              setShowMilestonesModal(false);
              showToast(`🎉 Unlocked +${views} extra feed views via Milestones!`);
            }
          }}
        />
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 text-xs font-semibold shadow-xl border border-white/10 dark:border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
