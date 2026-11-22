import React, { useState, useMemo } from 'react';
import { ArrowRight, Trash2, Check } from 'lucide-react';
import { Post } from '../types/social';
import { FeedPostCard } from './FeedPostCard';
import { MediaViewerModal } from './MediaViewerModal';
import { PostCommentsModal } from './PostCommentsModal';
import { SharePostModal } from './SharePostModal';
import { CURRENT_USER } from '../data/mockData';

interface UserPostsSectionProps {
  authorName: string;
  posts: Post[];
  onOpenAllPosts: (targetPostId?: string) => void;
  onOpenProfile?: (authorId: string, authorName: string, authorAvatar: string, authorHeadline: string) => void;
  onDeletePost?: (postId: string) => void;
  onRepostPost?: (post: Post, thoughts: string) => void;
  className?: string;
}

export const UserPostsSection: React.FC<UserPostsSectionProps> = ({
  authorName: _authorName,
  posts,
  onOpenAllPosts,
  onOpenProfile,
  onDeletePost,
  onRepostPost,
  className = '',
}) => {
  const [selectedMediaPost, setSelectedMediaPost] = useState<Post | null>(null);
  const [selectedCommentsPost, setSelectedCommentsPost] = useState<Post | null>(null);
  const [shareModalPost, setShareModalPost] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'top'>('recent');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  const sortedPosts = useMemo(() => {
    if (!posts) return [];
    if (sortBy === 'recent') return posts;
    const getEngagementScore = (post: Post) => {
      const reactionsSum = Object.values(post.reactions || {}).reduce<number>(
        (acc, val) => acc + (typeof val === 'number' ? val : 0),
        0
      );
      return reactionsSum + (post.totalCommentsCount || post.comments?.length || 0) + (post.sharesCount || 0);
    };
    return [...posts].sort((a, b) => getEngagementScore(b) - getEngagementScore(a));
  }, [posts, sortBy]);

  if (!posts || posts.length === 0) {
    if (!onDeletePost) return null;
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
              Posts
            </h3>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums">
              0
            </span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No posts yet</p>
          <p className="text-[11px] text-slate-400">
            Posts you share with the Cronium network will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Show up to 3 posts on the profile preview
  const displayedPosts = sortedPosts.slice(0, 3);

  const handleConfirmDelete = () => {
    if (!postToDelete || !onDeletePost) return;
    onDeletePost(postToDelete.id);
    setPostToDelete(null);
    showToast('Post deleted successfully');
  };

  const handleExecuteRepost = (post: Post, thoughts: string) => {
    onRepostPost?.(post, thoughts);
    showToast('Reposted to your network!');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Clean Posts Section Header with Recent / Top Pill Toggle */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-baseline gap-2">
          <h3 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">
            Posts
          </h3>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tabular-nums">
            {posts.length}
          </span>
        </div>

        <div className="flex items-center p-1 bg-[#F1F5F9] dark:bg-slate-800 rounded-full">
          <button
            type="button"
            onClick={() => setSortBy('recent')}
            className={`px-3.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
              sortBy === 'recent'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            Recent
          </button>
          <button
            type="button"
            onClick={() => setSortBy('top')}
            className={`px-3.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
              sortBy === 'top'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            Top
          </button>
        </div>
      </div>

      {/* The Posts rendered with the EXACT same style and structure as in the Feed */}
      <div className="space-y-4">
        {displayedPosts.map((post) => (
          <FeedPostCard
            key={post.id}
            post={post}
            onOpenMedia={(p) => setSelectedMediaPost(p)}
            onOpenComments={(p) => setSelectedCommentsPost(p)}
            onOpenProfile={onOpenProfile}
            onShare={(p) => setShareModalPost(p)}
            onDelete={onDeletePost ? (p) => setPostToDelete(p) : undefined}
          />
        ))}
      </div>

      {/* "View all posts" button if there are more than 3 posts */}
      {posts.length > 3 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => onOpenAllPosts()}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-50/90 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/90 dark:border-indigo-800/80 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-[0.98] group"
          >
            <span>View all posts</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-200/80 dark:bg-indigo-800/70 text-[10px] font-bold text-indigo-800 dark:text-indigo-200">
              {posts.length}
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Share Post to Network Modal */}
      <SharePostModal
        post={shareModalPost}
        onClose={() => setShareModalPost(null)}
        onRepost={handleExecuteRepost}
        onCopyLink={() => showToast('Post link copied to clipboard!')}
      />

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPostToDelete(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delete this post?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This post will be permanently removed from your profile and network feed.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              &ldquo;{postToDelete.content}&rdquo;
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors active:scale-95 cursor-pointer"
              >
                Delete Permanently
              </button>
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
      {selectedCommentsPost && (
        <PostCommentsModal
          post={selectedCommentsPost}
          isOpen={!!selectedCommentsPost}
          onClose={() => setSelectedCommentsPost(null)}
          onAddComment={(_postId, text) => {
            if (!selectedCommentsPost) return;
            const newComment = {
              id: `c_${Date.now()}`,
              authorId: CURRENT_USER.id,
              authorName: CURRENT_USER.name,
              authorAvatar: CURRENT_USER.avatar,
              authorHeadline: 'Head of AI Product & Systems Architecture',
              text,
              timestamp: 'Just now',
              likes: 0,
              hasLiked: false,
            };
            setSelectedCommentsPost({
              ...selectedCommentsPost,
              comments: [newComment, ...(selectedCommentsPost.comments || [])],
              totalCommentsCount: (selectedCommentsPost.totalCommentsCount || 0) + 1,
            });
          }}
          onToggleCommentLike={() => {}}
          onToggleCommentReaction={() => {}}
          onToggleReplyLike={() => {}}
          onToggleReplyReaction={() => {}}
          onViewProfile={onOpenProfile}
        />
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
