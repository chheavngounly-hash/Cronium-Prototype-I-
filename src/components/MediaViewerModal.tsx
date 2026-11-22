import React, { useEffect } from 'react';
import { X, Play } from 'lucide-react';
import { Post } from '../types/social';

interface MediaViewerModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
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

  if (!isOpen || !post) return null;

  const isVideo = post.mediaType === 'video' || !!post.videoUrl;
  const mediaSrc = post.videoUrl || post.mediaUrl;
  const isNativeVideo =
    isVideo &&
    !!mediaSrc &&
    (mediaSrc.startsWith('blob:') ||
      mediaSrc.startsWith('data:video/') ||
      /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(mediaSrc));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Floating Close Button Top Right */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
        aria-label="Close"
        title="Close (Esc)"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Pure Media Display: shows ONLY the image or video without any post description */}
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col items-center justify-center pointer-events-auto">
        <div className="relative w-full flex items-center justify-center max-h-[82vh] overflow-hidden rounded-2xl bg-black/40 shadow-2xl">
          {isNativeVideo ? (
            <video
              src={mediaSrc}
              controls
              autoPlay
              playsInline
              className="max-h-[82vh] max-w-full rounded-2xl object-contain bg-black shadow-2xl"
            />
          ) : isVideo ? (
            <div className="relative w-full h-full max-h-[82vh] flex items-center justify-center bg-black rounded-2xl overflow-hidden">
              <img
                src={mediaSrc || post.mediaUrl}
                alt={post.authorName}
                className="max-h-[82vh] max-w-full object-contain rounded-2xl select-none"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/90 text-slate-900 shadow-2xl flex items-center justify-center pl-1 backdrop-blur-xs">
                  <Play className="w-8 h-8 fill-current text-indigo-600" />
                </div>
              </div>
              {post.videoDuration && (
                <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-mono backdrop-blur-sm shadow-md">
                  ▶ Playing {post.videoDuration}
                </div>
              )}
            </div>
          ) : (
            <img
              src={mediaSrc || post.mediaUrl}
              alt={post.authorName}
              className="max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl select-none"
            />
          )}
        </div>

        {/* Clean Done Button */}
        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md transition-all cursor-pointer shadow-lg border border-white/20 active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
