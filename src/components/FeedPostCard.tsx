import React, { useState } from 'react';
import {
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Play,
  MessageSquare,
  Share2,
  UserCheck,
  UserPlus,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';
import { Post, PostReactionType } from '../types/social';
import { CURRENT_USER } from '../data/mockData';
import { followService } from '../utils/followService';

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

interface FeedPostCardProps {
  post: Post;
  currentUserId?: string;
  onOpenMedia?: (post: Post) => void;
  onOpenComments?: (post: Post) => void;
  onOpenProfile?: (authorId: string, authorName: string, authorAvatar: string, authorHeadline: string) => void;
  onShare?: (post: Post) => void;
  onDelete?: (post: Post) => void;
  className?: string;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = React.memo(({
  post,
  currentUserId = CURRENT_USER.id,
  onOpenMedia,
  onOpenComments,
  onOpenProfile,
  onShare,
  onDelete,
  className = '',
}) => {
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [activeReactionTrayOpen, setActiveReactionTrayOpen] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<PostReactionType | null>(
    post.userReaction || null
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(() =>
    followService.isFollowing(post.authorId)
  );

  const isMyPost =
    post.authorId === currentUserId ||
    post.authorId === 'user_jennies' ||
    post.authorName === CURRENT_USER.name;

  // Comments count
  const displayCommentsCount = post.totalCommentsCount || 100 + (post.comments?.length || 0);

  // Reactions count
  const rawReactions = Object.values(post.reactions || {}).reduce((a, b) => a + (b || 0), 0);
  const baseReactions = rawReactions >= displayCommentsCount
    ? Math.max(1, displayCommentsCount - 15)
    : rawReactions;
  const totalReactions = baseReactions + (currentReaction && !post.userReaction ? 1 : 0);

  const userReactionObj = currentReaction ? REACTION_CONFIG[currentReaction] : null;

  // Long post threshold (>220 chars or multiple paragraphs)
  const isLongPost =
    post.content.length > 220 ||
    post.content.split('\n\n').filter((l) => l.trim()).length > 1;

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

  const handleToggleReaction = (key: PostReactionType) => {
    setCurrentReaction((prev) => (prev === key ? null : key));
    setActiveReactionTrayOpen(false);
  };

  const handleToggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextVal = followService.toggleFollow(post.authorId, post.authorName);
    setIsFollowing(nextVal);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(post.content);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      setIsMenuOpen(false);
    } catch {
      // ignore
    }
  };

  return (
    <article
      className={`feed-card-opt bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-shadow duration-150 hover:shadow-sm text-left ${className}`}
    >
      {/* Author & Community Header (Exact match to image_4ac67c5e.png) */}
      <div className="p-3.5 sm:p-4 pb-2 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            loading="lazy"
            decoding="async"
            onClick={() =>
              onOpenProfile?.(
                post.authorId,
                post.authorName,
                post.authorAvatar,
                post.authorHeadline
              )
            }
            className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all"
            title={`View ${post.authorName}'s Profile`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                onClick={() =>
                  onOpenProfile?.(
                    post.authorId,
                    post.authorName,
                    post.authorAvatar,
                    post.authorHeadline
                  )
                }
                className="text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {post.authorName}
              </h3>

              {/* Author tag: "Author (You)" or "+ Follow" */}
              {isMyPost ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Author (You)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                    isFollowing
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3 h-3 text-emerald-500" />
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
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Post options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onShare?.(post);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Share / Repost</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy Post Text</span>
                    </>
                  )}
                </button>

                {isMyPost && onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onDelete(post);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-100 dark:border-slate-700/80"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Post</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Post Content Text with "See More" and "See Less" (Exact match) */}
      <div className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
        {isLongPost && !isContentExpanded ? (
          <div>
            <span className="whitespace-pre-line">{previewText}</span>
            <button
              type="button"
              onClick={() => setIsContentExpanded(true)}
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
                  onClick={() => setIsContentExpanded(false)}
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
            <div
              onClick={() => onOpenMedia?.(post)}
              className="relative group cursor-pointer overflow-hidden min-h-[220px] max-h-[460px] bg-slate-900 flex items-center justify-center"
            >
              <img
                src={post.mediaUrl || (post as any).media?.url}
                alt="Video preview"
                className="w-full h-auto min-h-[220px] max-h-[460px] object-cover group-hover:scale-[1.01] transition-transform duration-300 block"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 text-slate-900 group-hover:scale-110 group-hover:bg-white transition-all shadow-xl flex items-center justify-center pl-1 backdrop-blur-xs">
                  <Play className="w-6 h-6 fill-current text-indigo-600" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-black/80 text-white text-[11px] font-mono font-medium backdrop-blur-xs flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>▶ {post.videoDuration || '1:04'}</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-200 border border-indigo-700/50 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs shadow-md">
                  HD Video
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMedia?.(post);
                }}
                className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-all cursor-pointer opacity-80 hover:opacity-100"
                title="Open Fullscreen Theater View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => onOpenMedia?.(post)}
              className="relative group cursor-pointer overflow-hidden min-h-[220px] max-h-[460px] bg-slate-900 flex items-center justify-center"
            >
              <img
                src={post.mediaUrl || (post as any).media?.url}
                alt="Post media"
                className="w-full h-auto min-h-[220px] max-h-[460px] object-cover group-hover:scale-[1.01] transition-transform duration-300 block"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80';
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

      {/* Reactions Count & Summary Bar (Exact match to image_4ac67c5e.png) */}
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
            type="button"
            onClick={() => onOpenComments?.(post)}
            className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer font-medium"
          >
            {displayCommentsCount} comments
          </button>
          <span>•</span>
          <span>{post.sharesCount || 78} reposts</span>
        </div>
      </div>

      {/* Action Bar (Celebrate, Comment, Share) matching image_4ac67c5e.png */}
      <div className="px-3 py-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* Reaction Button with Floating Tray */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setActiveReactionTrayOpen(true)}
          onMouseLeave={() => setActiveReactionTrayOpen(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (currentReaction) {
                handleToggleReaction(currentReaction);
              } else {
                setActiveReactionTrayOpen((prev) => !prev);
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
          {activeReactionTrayOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveReactionTrayOpen(false);
                }}
              />
              <div className="absolute left-0 bottom-full mb-1 z-30 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                {(Object.keys(REACTION_CONFIG) as PostReactionType[]).map((key) => {
                  const item = REACTION_CONFIG[key];
                  const isSelected = currentReaction === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleReaction(key);
                        setActiveReactionTrayOpen(false);
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

        {/* Comment Button */}
        <button
          type="button"
          onClick={() => onOpenComments?.(post)}
          className="flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Comment</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => onShare?.(post)}
          className="flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
});
