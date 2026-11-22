import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Send,
  ThumbsUp,
  MessageSquare,
  CornerDownRight,
  Reply,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Smile,
  Sparkles,
} from 'lucide-react';
import { Post, PostComment, PostCommentReply } from '../types/social';
import { CURRENT_USER } from '../data/mockData';
import { getPostFullComments, sanitizePostReactionsAndComments } from '../utils/commentsManager';

interface PostCommentsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onAddComment: (
    postId: string,
    text: string,
    replyToCommentId?: string,
    replyToAuthorName?: string
  ) => void;
  onToggleCommentLike: (postId: string, commentId: string) => void;
  onToggleCommentReaction: (postId: string, commentId: string, emoji: string) => void;
  onToggleReplyLike: (postId: string, commentId: string, replyId: string) => void;
  onToggleReplyReaction: (
    postId: string,
    commentId: string,
    replyId: string,
    emoji: string
  ) => void;
  onViewProfile?: (
    authorId: string,
    authorName: string,
    authorAvatar: string,
    authorHeadline: string
  ) => void;
}

const REACTION_EMOJIS = ['👍', '❤️', '🔥', '👏', '🚀', '💡', '💯', '🎯'];
const BATCH_SIZE = 25;

export const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  post,
  isOpen,
  onClose,
  onAddComment,
  onToggleCommentLike,
  onToggleCommentReaction,
  onToggleReplyLike,
  onToggleReplyReaction,
  onViewProfile,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<{
    commentId: string;
    authorName: string;
  } | null>(null);

  // Set of comment IDs whose replies are expanded
  const [expandedRepliesCommentIds, setExpandedRepliesCommentIds] = useState<Set<string>>(new Set());

  // Active floating emoji tray state for comment or reply
  const [activeReactionCommentId, setActiveReactionCommentId] = useState<string | null>(null);
  const [activeReactionReplyId, setActiveReactionReplyId] = useState<string | null>(null);

  // Number of top-level comments currently rendered
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Ensure post reactions never surpass comments and comments are populated
  const sanitizedPost = useMemo(() => {
    if (!post) return null;
    return sanitizePostReactionsAndComments(post);
  }, [post]);

  // Compute full comments list matching the post's exact comment count (between 100 and 300)
  const fullComments = useMemo(() => {
    if (!sanitizedPost) return [];
    return getPostFullComments(sanitizedPost);
  }, [sanitizedPost]);

  // "with the first two comments with Replies visible and not hidden"
  useEffect(() => {
    if (isOpen && sanitizedPost && fullComments.length > 0) {
      setVisibleCount(BATCH_SIZE);
      setReplyTarget(null);
      setCommentText('');
      setActiveReactionCommentId(null);
      setActiveReactionReplyId(null);

      // Identify first two comments that have replies and make them visible by default
      const commentsWithReplies = fullComments.filter(
        (c) => c.replies && c.replies.length >= 2
      );
      const initialExpanded = new Set<string>();
      if (commentsWithReplies[0]) initialExpanded.add(commentsWithReplies[0].id);
      if (commentsWithReplies[1]) initialExpanded.add(commentsWithReplies[1].id);
      setExpandedRepliesCommentIds(initialExpanded);
    }
  }, [isOpen, sanitizedPost?.id, fullComments]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !sanitizedPost) return null;

  // Calculate top-level comments and total replies
  const totalTopLevel = fullComments.length;
  const totalReplies = fullComments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);
  const totalCommentsAndReplies = totalTopLevel + totalReplies;

  const toggleReplies = (commentId: string) => {
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

  const handleStartReply = (commentId: string, authorName: string) => {
    setExpandedRepliesCommentIds((prev) => new Set(prev).add(commentId));
    setReplyTarget({ commentId, authorName });
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    onAddComment(
      sanitizedPost.id,
      commentText.trim(),
      replyTarget?.commentId,
      replyTarget?.authorName
    );

    setCommentText('');
    setReplyTarget(null);
  };

  // Quick emoji click generates an authentic 1-to-3 sentence response
  const handleQuickReaction = (emoji: string) => {
    const statements: Record<string, string> = {
      '👏': 'Outstanding architectural milestone for the entire team! The execution here is world-class.',
      '🔥': 'The latency drops and performance gains on this cluster are astonishing! Inspiring work.',
      '🚀': 'Huge leap forward for real-time generative systems! Thrilled to see this deployed to production.',
      '💡': 'Fascinating perspective on distributed state topologies. The telemetry traces validate the thesis beautifully.',
      '💯': 'Completely agree with this assessment. Minimizing communication overhead is the real secret.',
      '❤️': 'Love seeing this level of community dedication and deep technical craft. Keep raising the bar!',
      '🙌': 'Remarkable achievement across the board! Our lab is excited to benchmark this architecture.',
      '🎯': 'Spot-on analysis of the core engineering tradeoffs. The microsecond synchronization is textbook perfection.',
    };

    const text = statements[emoji] || `${emoji} Excellent progress and thoughtful insights shared here!`;

    if (replyTarget) {
      onAddComment(sanitizedPost.id, text, replyTarget.commentId, replyTarget.authorName);
      setReplyTarget(null);
    } else {
      onAddComment(sanitizedPost.id, text);
    }
  };

  const visibleComments = fullComments.slice(0, visibleCount);
  const hasMoreComments = visibleCount < fullComments.length;

  const isPostCreator = (authorId: string, authorName: string) => {
    return (
      authorId === sanitizedPost.authorId ||
      authorName.trim().toLowerCase() === sanitizedPost.authorName.trim().toLowerCase()
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Dedicated Full-Screen Comments View (creator's description removed from top) */}
      <div className="relative z-10 w-full h-full sm:max-w-2xl sm:h-[92vh] sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Top Sticky Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Back to feed"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg font-display tracking-tight">
                  Comments
                </h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80">
                  {totalCommentsAndReplies}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {totalTopLevel} comments • {totalReplies} replies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Comments List: Allows seeing all other comments instead of four */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4"
        >
          {visibleComments.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-500" />
              <p className="text-sm font-medium">No comments yet.</p>
              <p className="text-xs text-slate-400 mt-1">Be the first to share an architectural insight!</p>
            </div>
          ) : (
            visibleComments.map((comment) => {
              const hasReplies = comment.replies && comment.replies.length >= 2;
              const isRepliesOpen = expandedRepliesCommentIds.has(comment.id);
              const repliesCount = comment.replies?.length || 0;
              const isCommentByCreator = isPostCreator(comment.authorId, comment.authorName);

              return (
                <div key={comment.id} className="space-y-2 group">
                  {/* Top-Level Comment Bubble */}
                  <div className="flex items-start gap-3">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      onClick={() =>
                        onViewProfile?.(
                          comment.authorId,
                          comment.authorName,
                          comment.authorAvatar,
                          comment.authorHeadline
                        )
                      }
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200/90 dark:border-slate-750 shadow-2xs">
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() =>
                                onViewProfile?.(
                                  comment.authorId,
                                  comment.authorName,
                                  comment.authorAvatar,
                                  comment.authorHeadline
                                )
                              }
                              className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:underline cursor-pointer truncate"
                            >
                              {comment.authorName}
                            </span>
                            {isCommentByCreator && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 flex items-center gap-1 shrink-0">
                                <Sparkles className="w-2.5 h-2.5 text-indigo-500 fill-indigo-500" />
                                <span>Creator</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0 font-normal">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {comment.authorHeadline}
                        </p>
                        {/* 1 to 3 sentences long comment text */}
                        <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 mt-2 leading-relaxed whitespace-pre-line">
                          {comment.text}
                        </p>
                      </div>

                      {/* Comment Actions: Various emojis instead of only "Like" */}
                      <div className="flex items-center gap-3 mt-2 px-1 text-xs text-slate-600 dark:text-slate-400 font-medium flex-wrap relative">
                        {/* Interactive Reaction Button with Floating Emoji Tray */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveReactionCommentId(
                                activeReactionCommentId === comment.id ? null : comment.id
                              )
                            }
                            className={`flex items-center gap-1.5 py-0.5 px-2 rounded-full transition-colors cursor-pointer border ${
                              comment.hasLiked
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-bold'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <Smile className="w-3.5 h-3.5" />
                            <span>React</span>
                          </button>

                          {activeReactionCommentId === comment.id && (
                            <div className="absolute left-0 bottom-full mb-1 z-30 p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                              {REACTION_EMOJIS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => {
                                    onToggleCommentReaction(sanitizedPost.id, comment.id, emoji);
                                    setActiveReactionCommentId(null);
                                  }}
                                  className="p-1 hover:scale-130 transition-transform text-sm cursor-pointer rounded-full"
                                  title={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Display Active Emoji Reaction Badges */}
                        {comment.reactions &&
                          Object.entries(comment.reactions).map(([emoji, count]) =>
                            count > 0 ? (
                              <button
                                key={emoji}
                                onClick={() =>
                                  onToggleCommentReaction(sanitizedPost.id, comment.id, emoji)
                                }
                                className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                              >
                                <span>{emoji}</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {count}
                                </span>
                              </button>
                            ) : null
                          )}

                        {/* Replies Button: Range from 2 to 6, first two visible and not hidden */}
                        {hasReplies ? (
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer font-semibold ml-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>
                              {isRepliesOpen ? 'Hide replies' : `Replies (${repliesCount})`}
                            </span>
                            {isRepliesOpen ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        ) : null}

                        {/* Reply CTA */}
                        <button
                          onClick={() => handleStartReply(comment.id, comment.authorName)}
                          className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Nested Replies Section (2 to 6 replies, first 2 comments visible by default) */}
                      {hasReplies && isRepliesOpen && (
                        <div className="mt-3 ml-2 pl-3.5 border-l-2 border-indigo-200 dark:border-indigo-900/60 space-y-2.5 animate-in fade-in duration-150">
                          {comment.replies!.map((reply) => {
                            const isReplyByCreator = isPostCreator(reply.authorId, reply.authorName);

                            return (
                              <div key={reply.id} className="flex items-start gap-2.5">
                                <img
                                  src={reply.authorAvatar}
                                  alt={reply.authorName}
                                  onClick={() =>
                                    onViewProfile?.(
                                      reply.authorId,
                                      reply.authorName,
                                      reply.authorAvatar,
                                      reply.authorHeadline
                                    )
                                  }
                                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer shrink-0 mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="bg-slate-100/90 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/70 dark:border-slate-700/60">
                                    <div className="flex items-center justify-between gap-1 flex-wrap">
                                      <div className="flex items-center gap-1.5">
                                        <span
                                          onClick={() =>
                                            onViewProfile?.(
                                              reply.authorId,
                                              reply.authorName,
                                              reply.authorAvatar,
                                              reply.authorHeadline
                                            )
                                          }
                                          className="font-bold text-xs text-slate-900 dark:text-white hover:underline cursor-pointer truncate"
                                        >
                                          {reply.authorName}
                                        </span>
                                        {/* Creator active engagement badge */}
                                        {isReplyByCreator && (
                                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 flex items-center gap-1 shrink-0">
                                            <Sparkles className="w-2.5 h-2.5 text-indigo-500 fill-indigo-500" />
                                            <span>Creator</span>
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400 font-normal shrink-0">
                                        {reply.timestamp}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                      {reply.authorHeadline}
                                    </p>
                                    {/* 1 to 3 sentences long reply */}
                                    <p className="text-xs text-slate-800 dark:text-slate-200 mt-1.5 leading-relaxed">
                                      {reply.replyToAuthorName && (
                                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold mr-1">
                                          @{reply.replyToAuthorName}
                                        </span>
                                      )}
                                      {reply.text}
                                    </p>
                                  </div>

                                  {/* Reply Actions: Various emojis instead of only "Like" */}
                                  <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-500 flex-wrap relative">
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setActiveReactionReplyId(
                                            activeReactionReplyId === reply.id ? null : reply.id
                                          )
                                        }
                                        className="hover:text-indigo-600 p-0.5 cursor-pointer flex items-center gap-1"
                                      >
                                        <Smile className="w-3 h-3 text-slate-400" />
                                      </button>

                                      {activeReactionReplyId === reply.id && (
                                        <div className="absolute left-0 bottom-full mb-1 z-30 p-1 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 animate-in fade-in duration-150">
                                          {REACTION_EMOJIS.map((emoji) => (
                                            <button
                                              key={emoji}
                                              onClick={() => {
                                                onToggleReplyReaction(
                                                  sanitizedPost.id,
                                                  comment.id,
                                                  reply.id,
                                                  emoji
                                                );
                                                setActiveReactionReplyId(null);
                                              }}
                                              className="p-1 hover:scale-130 transition-transform text-xs cursor-pointer"
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Active reaction emojis on reply */}
                                    {reply.reactions &&
                                      Object.entries(reply.reactions).map(([emoji, count]) =>
                                        count > 0 ? (
                                          <button
                                            key={emoji}
                                            onClick={() =>
                                              onToggleReplyReaction(
                                                sanitizedPost.id,
                                                comment.id,
                                                reply.id,
                                                emoji
                                              )
                                            }
                                            className="px-1.5 py-0.2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] flex items-center gap-0.5 cursor-pointer"
                                          >
                                            <span>{emoji}</span>
                                            <span>{count}</span>
                                          </button>
                                        ) : null
                                      )}

                                    <button
                                      onClick={() => handleStartReply(comment.id, reply.authorName)}
                                      className="hover:text-indigo-600 cursor-pointer font-medium ml-1"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Load More Comments button so user can scroll through ALL comments beyond four */}
          {hasMoreComments && (
            <div className="pt-2 pb-4 text-center">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, fullComments.length))}
                className="px-5 py-2.5 rounded-full bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-300 font-semibold text-xs transition-colors cursor-pointer shadow-2xs border border-indigo-200/80 dark:border-indigo-800"
              >
                Load more comments ({fullComments.length - visibleCount} remaining) ˅
              </button>
            </div>
          )}
        </div>

        {/* Replying banner */}
        {replyTarget && (
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 border-t border-indigo-100 dark:border-indigo-900 flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 shrink-0">
            <span className="flex items-center gap-1.5 font-medium">
              <CornerDownRight className="w-3.5 h-3.5 text-indigo-500" />
              Replying to <strong className="font-bold">@{replyTarget.authorName}</strong>
            </span>
            <button
              onClick={() => setReplyTarget(null)}
              className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-full text-indigo-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Input Composer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-2">
          {/* Quick reactions strip */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-1 select-none flex-wrap">
            <span className="text-[11px] font-medium text-slate-400">Quick reaction:</span>
            <div className="flex items-center gap-2">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleQuickReaction(emoji)}
                  className="hover:scale-130 active:scale-110 transition-transform cursor-pointer text-sm leading-none"
                  title={`Comment with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-500/30 shrink-0"
            />
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  replyTarget
                    ? `Reply to @${replyTarget.authorName}...`
                    : 'Add a thoughtful comment (1-3 sentences)...'
                }
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 border border-slate-200/70 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={() => setCommentText((t) => t + ' 👏 ')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                title="Add emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!commentText.trim()}
              className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
