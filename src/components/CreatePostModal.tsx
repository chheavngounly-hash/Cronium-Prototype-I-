import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Video,
  Sparkles,
  Send,
  Users,
  Hash,
  Upload,
  Play,
  Film,
  Volume2,
  VolumeX,
  Subtitles,
  Camera,
  MapPin,
  Sliders,
  Flame,
  Trophy,
  Rocket,
  Mountain,
  Briefcase,
  Link2,
} from 'lucide-react';
import { Post } from '../types/social';
import { CURRENT_USER } from '../data/mockData';

export type CreatePostMode = 'post' | 'photo' | 'video' | 'story';

interface CreatePostModalProps {
  isOpen: boolean;
  initialMode?: CreatePostMode;
  onClose: () => void;
  onPublishPost: (post: Post) => void;
}

const PHOTO_GALLERY_PRESETS = [
  {
    label: 'Architecture',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Cluster Metrics',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Quantum Lab',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Robotics Rig',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
];

const VIDEO_STUDIO_CLIPS = [
  {
    label: 'Robotics Demo',
    duration: '0:42',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'H100 Cluster',
    duration: '1:15',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Live Pitch',
    duration: '0:58',
    thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Lab Run',
    duration: '0:34',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
  },
];

const STORY_COVER_PRESETS = [
  {
    label: 'Hackathon Demo',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Launch Day',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Summit Trail',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Team Sprint',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
];

const PHOTO_FILTERS = [
  { id: 'original', label: 'Original', css: '' },
  { id: 'vivid', label: 'Vivid', css: 'saturate-150 contrast-110' },
  { id: 'warm', label: 'Warm', css: 'sepia-[.25] saturate-125 brightness-105' },
  { id: 'bw', label: 'B&W', css: 'grayscale contrast-125' },
  { id: 'cool', label: 'Cool', css: 'hue-rotate-15 saturate-110 contrast-105' },
] as const;

type PhotoFilterId = (typeof PHOTO_FILTERS)[number]['id'];

const STORY_CATEGORIES = [
  {
    id: 'hackathon',
    label: 'Hackathon Win',
    icon: Trophy,
    defaultTags: 'Hackathon, BuildInPublic, DemoDay',
    headlinePlaceholder: 'Story headline (e.g. Shipped a mesh agent in 36 hours)',
    milestonePlaceholder: 'Key win (e.g. 1st Place · 42ms p99)',
    bodyPlaceholder: 'Share what your team built, what broke at 3 AM, and how the demo landed...',
  },
  {
    id: 'launch',
    label: 'Build & Launch',
    icon: Rocket,
    defaultTags: 'Launch, Engineering, Systems',
    headlinePlaceholder: 'Story headline (e.g. Launching v2.0 of our inference router)',
    milestonePlaceholder: 'Milestone (e.g. 3.4x throughput · 1.2k stars)',
    bodyPlaceholder: 'Walk through the architecture choices, benchmarks, and lessons from shipping...',
  },
  {
    id: 'trail',
    label: 'Trail & Off-Grid',
    icon: Mountain,
    defaultTags: 'Hiking, OffGrid, WeekendReset',
    headlinePlaceholder: 'Story headline (e.g. Sunrise loop along Marin Headlands)',
    milestonePlaceholder: 'Trail stat (e.g. 12.4 mi · 2,100 ft gain)',
    bodyPlaceholder: 'Share the trail conditions, views, or how stepping offline recharged you...',
  },
  {
    id: 'workplace',
    label: 'Workplace Story',
    icon: Briefcase,
    defaultTags: 'Workplace, Leadership, Culture',
    headlinePlaceholder: 'Story headline (e.g. Replacing standups with async memos)',
    milestonePlaceholder: 'Impact (e.g. +6 hrs deep work/week)',
    bodyPlaceholder: 'What changed for your team, what surprised you, and what worked best?',
  },
] as const;

type StoryCategoryId = (typeof STORY_CATEGORIES)[number]['id'];

const COMMUNITIES = [
  'Artificial Intelligence',
  'Systems & Kernel Architecture',
  'Robotics & Embodied AI',
  'Founders & Open Source',
  'Edge Inference & Silicon',
];

const formatSecondsToDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:45';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  initialMode = 'post',
  onClose,
  onPublishPost,
}) => {
  const [mode, setMode] = useState<CreatePostMode>(initialMode);
  const [selectedCommunity, setSelectedCommunity] = useState(COMMUNITIES[0]);

  // General Post state
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('AI, Engineering, Systems');

  // Photo Composer state
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoLocation, setPhotoLocation] = useState('');
  const [photoFilter, setPhotoFilter] = useState<PhotoFilterId>('original');
  const [photoTags, setPhotoTags] = useState('Photography, Lab, BuildInPublic');
  const [showPhotoUrlInput, setShowPhotoUrlInput] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Video Studio state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoDuration, setVideoDuration] = useState('0:48');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [videoMuted, setVideoMuted] = useState(false);
  const [autoCaptions, setAutoCaptions] = useState(true);
  const [videoTags, setVideoTags] = useState('Video, Demo, Engineering');
  const [showVideoUrlInput, setShowVideoUrlInput] = useState(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Hackathon / Story Composer state
  const [storyCategory, setStoryCategory] = useState<StoryCategoryId>('hackathon');
  const [storyCoverUrl, setStoryCoverUrl] = useState('');
  const [showStoryUrlInput, setShowStoryUrlInput] = useState(false);
  const [storyHeadline, setStoryHeadline] = useState('');
  const [storyMilestone, setStoryMilestone] = useState('');
  const [storyBody, setStoryBody] = useState('');
  const [storyLink, setStoryLink] = useState('');
  const [storyTags, setStoryTags] = useState<string>(STORY_CATEGORIES[0].defaultTags);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);

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

  if (!isOpen) return null;

  const parseTags = (raw: string, fallback: string[]) => {
    const parsed = raw
      .split(/[, #]+/)
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);
    return parsed.length > 0 ? parsed : fallback;
  };

  const resetAllForms = () => {
    setPostContent('');
    setPhotoUrl('');
    setPhotoCaption('');
    setPhotoLocation('');
    setPhotoFilter('original');
    setShowPhotoUrlInput(false);
    setVideoUrl('');
    setVideoTitle('');
    setVideoDescription('');
    setVideoDuration('0:48');
    setVideoAspect('16:9');
    setVideoMuted(false);
    setAutoCaptions(true);
    setShowVideoUrlInput(false);
    setStoryCoverUrl('');
    setShowStoryUrlInput(false);
    setStoryHeadline('');
    setStoryMilestone('');
    setStoryBody('');
    setStoryLink('');
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    let finalContent = '';
    let finalTags: string[] = [];
    let finalMediaType: 'image' | 'video' | undefined;
    let finalMediaUrl: string | undefined;
    let finalDuration: string | undefined;

    if (mode === 'video') {
      if (!videoUrl.trim() && !videoTitle.trim() && !videoDescription.trim()) return;
      const parts: string[] = [];
      if (videoTitle.trim()) parts.push(videoTitle.trim());
      if (videoDescription.trim()) parts.push(videoDescription.trim());
      const badges: string[] = [];
      if (autoCaptions) badges.push('CC Enabled');
      if (videoMuted) badges.push('Silent Clip');
      if (videoAspect !== '16:9') badges.push(`${videoAspect} Reel`);
      if (badges.length > 0) parts.push(badges.join(' · '));
      finalContent = parts.join('\n\n') || 'Shared a new video clip with the community.';
      finalTags = parseTags(videoTags, ['Video', 'Demo']);
      if (videoUrl.trim()) {
        finalMediaType = 'video';
        finalMediaUrl = videoUrl.trim();
        finalDuration = videoDuration;
      }
    } else if (mode === 'photo') {
      if (!photoUrl.trim() && !photoCaption.trim()) return;
      const parts: string[] = [];
      if (photoCaption.trim()) parts.push(photoCaption.trim());
      if (photoLocation.trim()) parts.push(`Location: ${photoLocation.trim()}`);
      finalContent = parts.join('\n\n') || 'Shared a new photo snapshot.';
      finalTags = parseTags(photoTags, ['Photo', 'Community']);
      if (photoUrl.trim()) {
        finalMediaType = 'image';
        finalMediaUrl = photoUrl.trim();
      }
    } else if (mode === 'story') {
      if (!storyCoverUrl.trim() && !storyHeadline.trim() && !storyBody.trim()) return;
      const activeCat = STORY_CATEGORIES.find((c) => c.id === storyCategory) || STORY_CATEGORIES[0];
      const parts: string[] = [];
      if (storyHeadline.trim()) {
        parts.push(`${activeCat.label} — ${storyHeadline.trim()}`);
      } else {
        parts.push(activeCat.label);
      }
      if (storyMilestone.trim()) {
        parts.push(`Highlight: ${storyMilestone.trim()}`);
      }
      if (storyBody.trim()) {
        parts.push(storyBody.trim());
      }
      if (storyLink.trim()) {
        parts.push(`Project Link: ${storyLink.trim()}`);
      }
      finalContent = parts.join('\n\n');
      finalTags = parseTags(storyTags, ['Hackathon', 'Story']);
      if (storyCoverUrl.trim()) {
        finalMediaType = 'image';
        finalMediaUrl = storyCoverUrl.trim();
      }
    } else {
      if (!postContent.trim()) return;
      finalContent = postContent.trim();
      finalTags = parseTags(postTags, ['Innovation', 'Tech']);
    }

    const newPost: Post = {
      id: `post_user_${Date.now()}`,
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      authorAvatar: CURRENT_USER.avatar,
      authorHeadline: CURRENT_USER.customStatus || 'Head of AI Product & Systems Architecture',
      communityName: selectedCommunity,
      timestamp: 'Just now',
      content: finalContent,
      tags: finalTags,
      mediaType: finalMediaType,
      mediaUrl: finalMediaUrl,
      videoDuration: finalDuration,
      reactions: {
        like: 1,
      },
      userReaction: 'like',
      comments: [],
      totalCommentsCount: 0,
      sharesCount: 0,
    };

    onPublishPost(newPost);
    resetAllForms();
    onClose();
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUrl(URL.createObjectURL(file));
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUrl(URL.createObjectURL(file));
    if (!videoTitle.trim()) {
      setVideoTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '));
    }
  };

  const handleStoryCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStoryCoverUrl(URL.createObjectURL(file));
  };

  const isPlayableVideoSource = (url: string) =>
    url.startsWith('blob:') ||
    url.startsWith('data:video/') ||
    /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);

  // =========================================================================
  // 1. VIDEO STUDIO INTERFACE (Light-Mode Photo-Style Layout · Indigo-Violet Accent)
  // =========================================================================
  if (mode === 'video') {
    const canPublishVideo = Boolean(videoUrl.trim() || videoTitle.trim() || videoDescription.trim());

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-indigo-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Light Video Header matching Photo interface */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-50/90 via-violet-50/40 to-white dark:from-indigo-950/35 dark:via-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Film className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight">
                  Share a Video
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload a clip, set framing &amp; captions, and add notes
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Close Share Video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePublish} className="overflow-y-auto p-5 space-y-4 flex-1">
            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              className="hidden"
            />

            {/* Video Preview OR Light Upload Dropzone + Quick Clips Strip */}
            {videoUrl ? (
              <div className="space-y-3">
                <div
                  className={`relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center ${
                    videoAspect === '9:16'
                      ? 'aspect-[9/12] max-w-[230px] mx-auto'
                      : videoAspect === '1:1'
                      ? 'aspect-square max-w-[260px] mx-auto'
                      : 'aspect-[16/10] w-full'
                  }`}
                >
                  {isPlayableVideoSource(videoUrl) ? (
                    <video
                      src={videoUrl}
                      controls
                      muted={videoMuted}
                      playsInline
                      onLoadedMetadata={(e) => {
                        const dur = (e.currentTarget as HTMLVideoElement).duration;
                        if (dur) setVideoDuration(formatSecondsToDuration(dur));
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img
                        src={videoUrl}
                        alt="Selected video preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg pl-0.5">
                          <Play className="w-5 h-5 fill-current" />
                        </div>
                      </div>
                      <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-slate-950/75 text-white text-[11px] font-mono tabular-nums">
                        {videoDuration}
                      </span>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setVideoUrl('')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white cursor-pointer"
                    title="Change video"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Light-Mode Video Controls Bar matching Photo Look bar */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <Sliders className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      Frame:
                    </span>
                    {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setVideoAspect(ratio)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          videoAspect === ratio
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setVideoMuted((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                        videoMuted
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50'
                      }`}
                    >
                      {videoMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />}
                      <span>{videoMuted ? 'Muted' : 'Audio'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAutoCaptions((prev) => !prev)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                        autoCaptions
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50'
                      }`}
                    >
                      <Subtitles className="w-3 h-3" />
                      <span>CC</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/40 dark:bg-indigo-950/15 p-5 text-center space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <Video className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Add a video from your device
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVideoUrlInput((prev) => !prev)}
                      className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Video URL
                    </button>
                  </div>
                </div>

                {showVideoUrlInput && (
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/demo-clip.mp4"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                )}

                {/* Visual 4-Clip Strip matching Photo Gallery Picks */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                    Quick studio clips
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {VIDEO_STUDIO_CLIPS.map((clip) => (
                      <button
                        key={clip.label}
                        type="button"
                        onClick={() => {
                          setVideoUrl(clip.thumbnail);
                          setVideoDuration(clip.duration);
                          if (!videoTitle.trim()) setVideoTitle(clip.label);
                        }}
                        className="group relative rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all cursor-pointer"
                      >
                        <img
                          src={clip.thumbnail}
                          alt={clip.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 right-1 px-1 py-0.5 rounded bg-slate-950/75 text-[8px] font-mono text-white tabular-nums">
                          {clip.duration}
                        </span>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-1">
                          <span className="text-[9px] font-semibold text-white block truncate">
                            {clip.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Video Notes / Description */}
            <textarea
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
              placeholder="Write notes, timestamps, or context for your video..."
              rows={2}
              className="w-full resize-none bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            />

            {/* Video Title + Community */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Film className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Video title (optional)"
                  className="flex-1 text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="flex-1 text-xs font-medium bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {COMMUNITIES.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-slate-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <input
                type="text"
                value={videoTags}
                onChange={(e) => setVideoTags(e.target.value)}
                placeholder="Tags (Video, Demo, Engineering)"
                className="flex-1 text-xs bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Footer matching Photo */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canPublishVideo}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Video</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. PHOTO COMPOSER INTERFACE (Gallery & Filter Lightbox · Indigo-Violet Accent)
  // =========================================================================
  if (mode === 'photo') {
    const activeFilterObj =
      PHOTO_FILTERS.find((f) => f.id === photoFilter) || PHOTO_FILTERS[0];
    const canPublishPhoto = Boolean(photoUrl.trim() || photoCaption.trim());

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-indigo-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Photo Lightbox Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-50/90 via-violet-50/40 to-white dark:from-indigo-950/35 dark:via-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Camera className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight">
                  Share a Photo
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Upload a snapshot, apply a look, and add a caption
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Close Share Photo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePublish} className="overflow-y-auto p-5 space-y-4 flex-1">
            <input
              ref={photoFileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoFileChange}
              className="hidden"
            />

            {/* Photo Preview OR Gallery Picker */}
            {photoUrl ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 aspect-[16/10] flex items-center justify-center">
                  <img
                    src={photoUrl}
                    alt="Selected photo preview"
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-all duration-200 ${activeFilterObj.css}`}
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white cursor-pointer"
                    title="Change photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Visual Filter Bar */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                    <Sliders className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    Look:
                  </span>
                  {PHOTO_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPhotoFilter(f.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        photoFilter === f.id
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/40 dark:bg-indigo-950/15 p-5 text-center space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Add a photo from your device
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => photoFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPhotoUrlInput((prev) => !prev)}
                      className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {showPhotoUrlInput && (
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                )}

                {/* Visual 4-Photo Gallery Strip */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                    Quick gallery picks
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {PHOTO_GALLERY_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setPhotoUrl(preset.url)}
                        className="group relative rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all cursor-pointer"
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-1">
                          <span className="text-[9px] font-semibold text-white block truncate">
                            {preset.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Caption */}
            <textarea
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              placeholder="Write a caption for your photo..."
              rows={2}
              className="w-full resize-none bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            />

            {/* Location + Community + Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={photoLocation}
                  onChange={(e) => setPhotoLocation(e.target.value)}
                  placeholder="Add location (optional)"
                  className="flex-1 text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="flex-1 text-xs font-medium bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {COMMUNITIES.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-slate-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1">
              <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <input
                type="text"
                value={photoTags}
                onChange={(e) => setPhotoTags(e.target.value)}
                placeholder="Tags (Photography, Lab, Hardware)"
                className="flex-1 text-xs bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canPublishPhoto}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Photo</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. HACKATHON / STORY INTERFACE (Photo-Style Light Layout · Indigo-Violet Accent)
  // =========================================================================
  if (mode === 'story') {
    const activeCat =
      STORY_CATEGORIES.find((c) => c.id === storyCategory) || STORY_CATEGORIES[0];
    const ActiveCatIcon = activeCat.icon;
    const canPublishStory = Boolean(
      storyCoverUrl.trim() || storyHeadline.trim() || storyBody.trim()
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-indigo-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Light Story Header matching Photo interface */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-50/90 via-violet-50/40 to-white dark:from-indigo-950/35 dark:via-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Flame className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-[15px] leading-tight">
                  Hackathon &amp; Story
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Add a cover moment, choose a story type, and share your win
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              aria-label="Close Hackathon / Story"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePublish} className="overflow-y-auto p-5 space-y-4 flex-1">
            <input
              ref={storyFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleStoryCoverChange}
              className="hidden"
            />

            {/* Story Cover Preview OR Photo-Style Upload Dropzone + Quick Story Covers */}
            {storyCoverUrl ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 aspect-[16/10] flex items-center justify-center">
                  <img
                    src={storyCoverUrl}
                    alt="Story cover preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                    <ActiveCatIcon className="w-3 h-3" />
                    <span>{activeCat.label}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStoryCoverUrl('')}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white cursor-pointer"
                    title="Change cover image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/40 dark:bg-indigo-950/15 p-5 text-center space-y-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Add a hackathon or story cover
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => storyFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Cover</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowStoryUrlInput((prev) => !prev)}
                      className="px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Cover URL
                    </button>
                  </div>
                </div>

                {showStoryUrlInput && (
                  <input
                    type="url"
                    value={storyCoverUrl}
                    onChange={(e) => setStoryCoverUrl(e.target.value)}
                    placeholder="https://example.com/hackathon-cover.jpg"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                )}

                {/* Visual 4-Cover Story Strip matching Photo Gallery Picks */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                    Quick story covers
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {STORY_COVER_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setStoryCoverUrl(preset.url)}
                        className="group relative rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all cursor-pointer"
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-1">
                          <span className="text-[9px] font-semibold text-white block truncate">
                            {preset.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Story Type Pill Bar matching Photo Look Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                <Flame className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Type:
              </span>
              {STORY_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = storyCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setStoryCategory(cat.id);
                      setStoryTags(cat.defaultTags);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Headline + Story Narrative */}
            <div className="space-y-2.5">
              <input
                type="text"
                value={storyHeadline}
                onChange={(e) => setStoryHeadline(e.target.value)}
                placeholder={activeCat.headlinePlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <textarea
                value={storyBody}
                onChange={(e) => setStoryBody(e.target.value)}
                placeholder={activeCat.bodyPlaceholder}
                rows={2}
                className="w-full resize-none bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Milestone + Community Row matching Photo Location + Community */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Trophy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={storyMilestone}
                  onChange={(e) => setStoryMilestone(e.target.value)}
                  placeholder={activeCat.milestonePlaceholder}
                  className="flex-1 text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="flex-1 text-xs font-medium bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {COMMUNITIES.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-slate-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Repo/Demo Link + Tags Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Link2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <input
                  type="url"
                  value={storyLink}
                  onChange={(e) => setStoryLink(e.target.value)}
                  placeholder="Demo / repo link (optional)"
                  className="flex-1 text-xs bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={storyTags}
                  onChange={(e) => setStoryTags(e.target.value)}
                  placeholder="Tags (Hackathon, Story)"
                  className="flex-1 text-xs bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer matching Photo */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canPublishStory}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-45 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Story</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. STANDARD TEXT POST COMPOSER (Quick Thought + Mode Switchers)
  // =========================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Create a Post</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handlePublish} className="p-5 flex flex-col gap-4">
          {/* Author Row */}
          <div className="flex items-center gap-3">
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                {CURRENT_USER.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 font-medium px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60 focus:outline-none cursor-pointer"
                >
                  {COMMUNITIES.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content Textarea */}
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's happening in your engineering orbit? Share insights, architecture patterns, or quick updates..."
            rows={4}
            className="w-full resize-none bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            autoFocus
          />

          {/* Tags row */}
          <div className="flex items-center gap-2 px-1">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={postTags}
              onChange={(e) => setPostTags(e.target.value)}
              placeholder="Tags separated by commas (e.g. AI, CUDA, Hardware)"
              className="flex-1 text-xs bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none"
            />
          </div>

          {/* Action Row with Direct Switchers to Dedicated Photo / Video / Story Interfaces */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMode('photo')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
                title="Switch to Photo composer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('video')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition-colors cursor-pointer"
                title="Switch to Video composer"
              >
                <Video className="w-3.5 h-3.5 text-emerald-500" />
                <span>Video</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('story')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 transition-colors cursor-pointer"
                title="Switch to Hackathon / Story"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Story</span>
              </button>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!postContent.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
