import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Repeat2 } from 'lucide-react';
import { Post } from '../types/social';

interface SharePostModalProps {
  post: Post | null;
  onClose: () => void;
  onRepost: (post: Post, thoughts: string) => void;
  onCopyLink?: (post: Post) => void;
}

export const SharePostModal: React.FC<SharePostModalProps> = ({
  post,
  onClose,
  onRepost,
  onCopyLink,
}) => {
  const [thoughts, setThoughts] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (post) {
      setThoughts('');
      setCopied(false);
    }
  }, [post]);

  if (!post) return null;

  const handleCopy = () => {
    try {
      const shareUrl = `${window.location.origin}/?post=${encodeURIComponent(post.id)}`;
      navigator.clipboard.writeText(shareUrl);
    } catch {
      // ignore clipboard errors
    }
    setCopied(true);
    onCopyLink?.(post);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRepostClick = () => {
    onRepost(post, thoughts.trim());
    setThoughts('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share Post to Network"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-left"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Share Post to Network
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            aria-label="Close share dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Add your thoughts (optional):
          </label>
          <textarea
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            placeholder="What do you think about this update or story?"
            rows={3}
            className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Repost summary box */}
        <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            decoding="async"
            className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
          />
          <div className="min-w-0">
            <span className="font-bold text-slate-900 dark:text-white truncate block">
              {post.authorName}
            </span>
            <p className="text-slate-600 dark:text-slate-300 line-clamp-2 text-[11px]">
              {post.content}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRepostClick}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors active:scale-95 cursor-pointer"
            >
              <Repeat2 className="w-3.5 h-3.5" />
              <span>Repost Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
