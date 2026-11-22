import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  X,
  CheckCircle2,
  Trash2,
  Check,
} from 'lucide-react';
import { Post } from '../types/social';
import { FeedPostCard } from './FeedPostCard';
import { MediaViewerModal } from './MediaViewerModal';
import { PostCommentsModal } from './PostCommentsModal';
import { SharePostModal } from './SharePostModal';
import { CURRENT_USER } from '../data/mockData';

interface UserPostsScreenProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    headline?: string;
    username?: string;
    organization?: string;
  };
  posts: Post[];
  isOpen: boolean;
  onClose: () => void;
  targetPostId?: string | null;
  onDeletePost?: (postId: string) => void;
  onRepostPost?: (post: Post, thoughts: string) => void;
}

export const UserPostsScreen: React.FC<UserPostsScreenProps> = ({
  user,
  posts,
  isOpen,
  onClose,
  targetPostId,
  onDeletePost,
  onRepostPost,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'media' | 'discussed'>('all');
  const [selectedMediaPost, setSelectedMediaPost] = useState<Post | null>(null);
  const [selectedCommentsPost, setSelectedCommentsPost] = useState<Post | null>(null);
  const [shareModalPost, setShareModalPost] = useState<Post | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2600);
  };

  const filteredPosts = useMemo(() => {
    let list = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.content.toLowerCase().includes(q) ||
          p.communityName?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (activeFilter === 'media') {
      list = list.filter((p) => Boolean(p.mediaUrl));
    } else if (activeFilter === 'discussed') {
      list = list.filter((p) => (p.totalCommentsCount || p.comments?.length || 0) > 0);
    }

    return list;
  }, [posts, searchQuery, activeFilter]);

  if (!isOpen) return null;

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
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col bg-slate-100/98 dark:bg-slate-950/98 overflow-hidden animate-in fade-in duration-150"
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/98 dark:bg-slate-900/98 border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-2 -ml-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-xs font-bold transition-colors duration-150 cursor-pointer active:scale-95"
            title="Return to profile"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Profile</span>
          </button>

          <div className="flex items-center gap-2.5">
            <img
              src={user.avatar}
              alt={user.name}
              decoding="async"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30 border border-slate-200 dark:border-slate-700"
            />
            <div className="text-left">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                <span>{user.name}</span>
                <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950/60 shrink-0" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                {user.username || `@${user.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold font-mono">
            {posts.length} {posts.length === 1 ? 'Post' : 'Posts'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 max-w-xl mx-auto w-full space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search keywords in ${user.name.split(' ')[0]}'s posts...`}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              All Posts ({posts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('media')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                activeFilter === 'media'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              With Media ({posts.filter((p) => Boolean(p.mediaUrl)).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('discussed')}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                activeFilter === 'discussed'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              Discussions ({posts.filter((p) => (p.totalCommentsCount || p.comments?.length || 0) > 0).length})
            </button>
          </div>
        </div>

        {/* Posts Feed rendered with EXACT same style and structure as Feed */}
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No matching posts found
            </p>
            <p className="text-xs text-slate-400">
              Try adjusting your search terms or filter selection.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const displayPost: Post = {
                ...post,
                authorAvatar: user.avatar || post.authorAvatar,
                authorName: user.name || post.authorName,
                authorHeadline: user.headline || post.authorHeadline,
              };
              return (
                <FeedPostCard
                  key={post.id}
                  post={displayPost}
                  onOpenMedia={(p) => setSelectedMediaPost(p)}
                  onOpenComments={(p) => setSelectedCommentsPost(p)}
                  onShare={(p) => setShareModalPost(p)}
                  onDelete={onDeletePost ? (p) => setPostToDelete(p) : undefined}
                  className={targetPostId && post.id === targetPostId ? 'ring-2 ring-indigo-500' : ''}
                />
              );
            })}
          </div>
        )}
      </div>

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
        />
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold px-4 py-2 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
