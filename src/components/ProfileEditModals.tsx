import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Globe,
  Link2,
  Briefcase,
  Mail,
  Linkedin,
  Github,
  Check,
  Trophy,
  BookOpen,
  MessageCircle,
  Play,
  Camera,
  Music2,
  Building2,
  BarChart3,
  RotateCcw,
} from 'lucide-react';

export type SocialLinkPlatform =
  | 'x'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'discord'
  | 'website'
  | 'portfolio'
  | 'substack'
  | 'other';

export interface SocialProfileLink {
  id: string;
  platform: SocialLinkPlatform;
  label: string;
  url: string;
}

export interface AchievementItem {
  id: string;
  icon: string;
  title: string;
  organization: string;
  year: string;
  badge: string;
  description: string;
}

export interface AchievementMetrics {
  honors: string;
  patents: string;
  contributor: string;
}

export interface ProfileMetricsOverride {
  communities?: number;
  connections?: number;
  achievements?: number;
}

export const SOCIAL_PLATFORM_OPTIONS: Array<{
  id: SocialLinkPlatform;
  label: string;
  placeholder: string;
  defaultUrl: string;
  colorClass: string;
  bgClass: string;
}> = [
  {
    id: 'x',
    label: 'X / Twitter',
    placeholder: 'x.com/username',
    defaultUrl: 'x.com/jennies',
    colorClass: 'text-slate-900 dark:text-white',
    bgClass: 'bg-slate-900/10 dark:bg-white/10',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    placeholder: 'instagram.com/username',
    defaultUrl: 'instagram.com/jennies',
    colorClass: 'text-pink-600 dark:text-pink-400',
    bgClass: 'bg-pink-500/10',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    placeholder: 'youtube.com/@channel',
    defaultUrl: 'youtube.com/@jennies',
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-500/10',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    placeholder: 'tiktok.com/@username',
    defaultUrl: 'tiktok.com/@jennies',
    colorClass: 'text-slate-900 dark:text-white',
    bgClass: 'bg-slate-900/10 dark:bg-white/10',
  },
  {
    id: 'discord',
    label: 'Discord',
    placeholder: 'discord.gg/invite',
    defaultUrl: 'discord.gg/jennies',
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    bgClass: 'bg-indigo-500/10',
  },
  {
    id: 'website',
    label: 'Website',
    placeholder: 'yourdomain.com',
    defaultUrl: 'jenniesvance.com',
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500/10',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    placeholder: 'portfolio.dev/you',
    defaultUrl: 'portfolio.dev/jennies',
    colorClass: 'text-violet-600 dark:text-violet-400',
    bgClass: 'bg-violet-500/10',
  },
  {
    id: 'substack',
    label: 'Substack',
    placeholder: 'you.substack.com',
    defaultUrl: 'jennies.substack.com',
    colorClass: 'text-orange-600 dark:text-orange-400',
    bgClass: 'bg-orange-500/10',
  },
  {
    id: 'other',
    label: 'Other Link',
    placeholder: 'https://example.com',
    defaultUrl: 'jennies.network',
    colorClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-500/10',
  },
];

export const ACHIEVEMENT_ICONS = ['🏆', '📜', '🚀', '🎓', '🌐', '⚡', '💡', '🤖', '🛡️', '🌿', '🎯', '⭐'];

export function normalizeExternalHref(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '#';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function formatDisplayUrl(rawUrl: string): string {
  return rawUrl.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

export function normalizeLinkKey(rawUrl: string): string {
  return formatDisplayUrl(rawUrl).replace(/^www\./i, '').toLowerCase();
}

export const SocialPlatformIcon: React.FC<{ platform: SocialLinkPlatform; className?: string }> = ({
  platform,
  className = 'w-4 h-4',
}) => {
  switch (platform) {
    case 'x':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'instagram':
      return <Camera className={className} />;
    case 'youtube':
      return <Play className={className} />;
    case 'tiktok':
      return <Music2 className={className} />;
    case 'discord':
      return <MessageCircle className={className} />;
    case 'website':
      return <Globe className={className} />;
    case 'portfolio':
      return <Briefcase className={className} />;
    case 'substack':
      return <BookOpen className={className} />;
    default:
      return <Link2 className={className} />;
  }
};

export function getPlatformMeta(platform: SocialLinkPlatform) {
  return (
    SOCIAL_PLATFORM_OPTIONS.find((opt) => opt.id === platform) ||
    SOCIAL_PLATFORM_OPTIONS[SOCIAL_PLATFORM_OPTIONS.length - 1]
  );
}

interface PendingSocialDraft {
  draftId: string;
  platform: SocialLinkPlatform;
  label: string;
  url: string;
}

interface EditIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  workEmail: string;
  linkedinUrl: string;
  githubUrl: string;
  socialLinks: SocialProfileLink[];
  onSave: (
    data: {
      workEmail: string;
      linkedinUrl: string;
      githubUrl: string;
      socialLinks: SocialProfileLink[];
    },
    options?: { silent?: boolean }
  ) => void;
}

export const EditIdentityModal: React.FC<EditIdentityModalProps> = ({
  isOpen,
  onClose,
  workEmail,
  linkedinUrl,
  githubUrl,
  socialLinks,
  onSave,
}) => {
  const [draftEmail, setDraftEmail] = useState(workEmail);
  const [draftLinkedin, setDraftLinkedin] = useState(linkedinUrl);
  const [draftGithub, setDraftGithub] = useState(githubUrl);
  const [draftLinks, setDraftLinks] = useState<SocialProfileLink[]>(socialLinks);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);

  // Multi-select pending platforms so users can choose multiple platforms at once
  const [pendingDrafts, setPendingDrafts] = useState<PendingSocialDraft[]>([]);
  const wasOpenRef = useRef(false);

  const sanitizeAndDedupeLinks = (
    links: SocialProfileLink[],
    linkedinVal = draftLinkedin,
    githubVal = draftGithub
  ): SocialProfileLink[] => {
    const seenPlatforms = new Set<SocialLinkPlatform>();
    const seenUrlKeys = new Set<string>();
    const linkedinKey = normalizeLinkKey(linkedinVal);
    const githubKey = normalizeLinkKey(githubVal);
    if (linkedinKey) seenUrlKeys.add(linkedinKey);
    if (githubKey) seenUrlKeys.add(githubKey);

    const unique: SocialProfileLink[] = [];
    for (const l of links) {
      const cleanedUrl = formatDisplayUrl(l.url);
      const urlKey = normalizeLinkKey(cleanedUrl);
      if (!cleanedUrl || !urlKey) continue;
      if (seenPlatforms.has(l.platform) || seenUrlKeys.has(urlKey)) continue;
      seenPlatforms.add(l.platform);
      seenUrlKeys.add(urlKey);
      unique.push({
        ...l,
        label: l.label.trim() || getPlatformMeta(l.platform).label,
        url: cleanedUrl,
      });
    }
    return unique;
  };

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setDraftEmail(workEmail);
      setDraftLinkedin(linkedinUrl);
      setDraftGithub(githubUrl);
      setDraftLinks(sanitizeAndDedupeLinks(socialLinks, linkedinUrl, githubUrl));
      setPendingDrafts([]);
      setDuplicateNotice(null);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, workEmail, linkedinUrl, githubUrl, socialLinks]);

  if (!isOpen) return null;

  // Platforms already added to Identity & Credentials — hidden from the add selector
  const addedPlatforms = new Set<SocialLinkPlatform>(draftLinks.map((l) => l.platform));
  const availablePlatforms = SOCIAL_PLATFORM_OPTIONS.filter((opt) => !addedPlatforms.has(opt.id));

  // Primary credential URL keys (LinkedIn & GitHub) for duplicate detection
  const primaryUrlKeys = new Set<string>();
  const linkedinKey = normalizeLinkKey(draftLinkedin);
  const githubKey = normalizeLinkKey(draftGithub);
  if (linkedinKey) primaryUrlKeys.add(linkedinKey);
  if (githubKey) primaryUrlKeys.add(githubKey);

  // Detect any duplicate URLs among active edited links
  const duplicateExistingIds = new Set<string>();
  const seenExistingUrlMap = new Map<string, string>();
  for (const link of draftLinks) {
    const key = normalizeLinkKey(link.url);
    if (!key) continue;
    if (primaryUrlKeys.has(key)) {
      duplicateExistingIds.add(link.id);
    } else if (seenExistingUrlMap.has(key)) {
      duplicateExistingIds.add(link.id);
      duplicateExistingIds.add(seenExistingUrlMap.get(key)!);
    } else {
      seenExistingUrlMap.set(key, link.id);
    }
  }

  // Detect any duplicate URLs or platforms among pending drafts
  const duplicatePendingIds = new Set<string>();
  const usedUrlKeys = new Set<string>([...primaryUrlKeys, ...seenExistingUrlMap.keys()]);
  const usedPendingPlatforms = new Set<SocialLinkPlatform>();
  for (const draft of pendingDrafts) {
    const key = normalizeLinkKey(draft.url);
    if (
      addedPlatforms.has(draft.platform) ||
      usedPendingPlatforms.has(draft.platform) ||
      (key && usedUrlKeys.has(key))
    ) {
      duplicatePendingIds.add(draft.draftId);
    } else {
      usedPendingPlatforms.add(draft.platform);
      if (key) usedUrlKeys.add(key);
    }
  }

  const syncLiveToProfile = (
    nextLinks: SocialProfileLink[],
    overrides?: { email?: string; linkedin?: string; github?: string }
  ) => {
    const emailVal = (overrides?.email ?? draftEmail).trim() || workEmail;
    const linkedinVal = formatDisplayUrl(overrides?.linkedin ?? draftLinkedin);
    const githubVal = formatDisplayUrl(overrides?.github ?? draftGithub);
    onSave(
      {
        workEmail: emailVal,
        linkedinUrl: linkedinVal,
        githubUrl: githubVal,
        socialLinks: sanitizeAndDedupeLinks(nextLinks, linkedinVal, githubVal),
      },
      { silent: true }
    );
  };

  const handleTogglePlatformChoice = (platform: SocialLinkPlatform) => {
    if (addedPlatforms.has(platform)) return;
    setDuplicateNotice(null);
    const meta = getPlatformMeta(platform);
    setPendingDrafts((prev) => {
      const existing = prev.find((d) => d.platform === platform);
      if (existing) {
        return prev.filter((d) => d.platform !== platform);
      }
      return [
        ...prev,
        {
          draftId: `draft_${platform}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          platform,
          label: meta.label,
          url: meta.defaultUrl,
        },
      ];
    });
  };

  const handleUpdatePendingDraft = (draftId: string, field: 'label' | 'url', value: string) => {
    setDuplicateNotice(null);
    setPendingDrafts((prev) =>
      prev.map((d) => (d.draftId === draftId ? { ...d, [field]: value } : d))
    );
  };

  const handleRemovePendingDraft = (draftId: string) => {
    setDuplicateNotice(null);
    setPendingDrafts((prev) => prev.filter((d) => d.draftId !== draftId));
  };

  const collectUniquePendingEntries = (drafts: PendingSocialDraft[]) => {
    const seenPlatforms = new Set<SocialLinkPlatform>(draftLinks.map((l) => l.platform));
    const seenUrls = new Set<string>(primaryUrlKeys);
    for (const l of draftLinks) {
      const k = normalizeLinkKey(l.url);
      if (k) seenUrls.add(k);
    }

    const added: SocialProfileLink[] = [];
    const addedDraftIds = new Set<string>();
    let skippedDuplicate = false;

    drafts.forEach((d, idx) => {
      const meta = getPlatformMeta(d.platform);
      const cleanedUrl = formatDisplayUrl(d.url);
      const urlKey = normalizeLinkKey(cleanedUrl);
      if (!cleanedUrl || !urlKey) return;

      if (seenPlatforms.has(d.platform) || seenUrls.has(urlKey)) {
        skippedDuplicate = true;
        return;
      }

      seenPlatforms.add(d.platform);
      seenUrls.add(urlKey);
      addedDraftIds.add(d.draftId);
      added.push({
        id: `link_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
        platform: d.platform,
        label: d.label.trim() || meta.label,
        url: cleanedUrl,
      });
    });

    return { added, addedDraftIds, skippedDuplicate };
  };

  const handleAddSelectedLinks = () => {
    const { added, addedDraftIds, skippedDuplicate } = collectUniquePendingEntries(pendingDrafts);
    if (skippedDuplicate) {
      setDuplicateNotice('Duplicate links cannot be added. Each platform and URL must be unique.');
    } else {
      setDuplicateNotice(null);
    }

    if (added.length === 0) return;

    const nextLinks = [...draftLinks, ...added];
    setDraftLinks(nextLinks);
    // Remove added platforms from pendingDrafts (and their chips automatically disappear from the selector)
    setPendingDrafts((prev) =>
      prev.filter((d) => !addedDraftIds.has(d.draftId) && !added.some((a) => a.platform === d.platform))
    );
    syncLiveToProfile(nextLinks);
  };

  const handleUpdateExistingLink = (id: string, field: 'label' | 'url', value: string) => {
    setDuplicateNotice(null);
    const nextLinks = draftLinks.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );
    setDraftLinks(nextLinks);
    syncLiveToProfile(nextLinks);
  };

  const handleRemoveExistingLink = (id: string) => {
    setDuplicateNotice(null);
    const nextLinks = draftLinks.filter((link) => link.id !== id);
    setDraftLinks(nextLinks);
    syncLiveToProfile(nextLinks);
  };

  const handleSaveAll = () => {
    if (duplicateExistingIds.size > 0 || duplicatePendingIds.size > 0) {
      setDuplicateNotice('Duplicate links are not allowed. Please update or remove duplicate URLs.');
      return;
    }

    const { added, skippedDuplicate } = collectUniquePendingEntries(pendingDrafts);
    if (skippedDuplicate) {
      setDuplicateNotice('Duplicate links are not allowed. Please update or remove duplicate URLs.');
      return;
    }

    const finalLinkedin = formatDisplayUrl(draftLinkedin);
    const finalGithub = formatDisplayUrl(draftGithub);
    const finalLinks = sanitizeAndDedupeLinks([...draftLinks, ...added], finalLinkedin, finalGithub);

    onSave(
      {
        workEmail: draftEmail.trim() || workEmail,
        linkedinUrl: finalLinkedin,
        githubUrl: finalGithub,
        socialLinks: finalLinks,
      },
      { silent: false }
    );
    onClose();
  };

  const readyPendingCount = pendingDrafts.filter(
    (d) => formatDisplayUrl(d.url).length > 0 && !duplicatePendingIds.has(d.draftId)
  ).length;
  const hasAnyDuplicate = duplicateExistingIds.size > 0 || duplicatePendingIds.size > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 max-h-[88dvh] flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-display leading-tight truncate">
                Edit Identity &amp; Links
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Update credentials and add unique social or custom links
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close edit identity modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {duplicateNotice && (
            <div className="px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
              {duplicateNotice}
            </div>
          )}

          {/* Primary Credentials */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Verified Credentials
            </span>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Work Email</span>
              </label>
              <input
                type="email"
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>LinkedIn Profile</span>
              </label>
              <input
                type="text"
                value={draftLinkedin}
                onChange={(e) => setDraftLinkedin(e.target.value)}
                placeholder="linkedin.com/in/your-handle"
                className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                <Github className="w-3.5 h-3.5 text-slate-800 dark:text-slate-200" />
                <span>GitHub Profile</span>
              </label>
              <input
                type="text"
                value={draftGithub}
                onChange={(e) => setDraftGithub(e.target.value)}
                placeholder="github.com/your-handle"
                className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Existing Social & Custom Links (Synced live with Identity & Credentials) */}
          {draftLinks.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active Social &amp; Other Links ({draftLinks.length})
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Live in Identity &amp; Credentials
                </span>
              </div>

              <div className="space-y-2">
                {draftLinks.map((link) => {
                  const meta = getPlatformMeta(link.platform);
                  const isDup = duplicateExistingIds.has(link.id);
                  return (
                    <div
                      key={link.id}
                      className={`p-2.5 rounded-2xl border space-y-2 ${
                        isDup
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                          : 'bg-slate-50/90 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div
                            className={`w-7 h-7 rounded-xl ${meta.bgClass} ${meta.colorClass} flex items-center justify-center shrink-0`}
                          >
                            <SocialPlatformIcon platform={link.platform} className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            value={link.label}
                            onChange={(e) =>
                              handleUpdateExistingLink(link.id, 'label', e.target.value)
                            }
                            placeholder="Link label"
                            className="flex-1 min-w-0 text-xs font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none border-b border-transparent focus:border-indigo-500 py-0.5"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingLink(link.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer shrink-0"
                          title="Remove link immediately"
                          aria-label={`Remove ${link.label}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => handleUpdateExistingLink(link.id, 'url', e.target.value)}
                        placeholder={meta.placeholder}
                        className={`w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-900 rounded-xl border focus:outline-none text-slate-700 dark:text-slate-200 ${
                          isDup
                            ? 'border-rose-400 dark:border-rose-700 focus:border-rose-500'
                            : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                        }`}
                      />
                      {isDup && (
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                          Duplicate link — this URL is already added.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Multiple Social Media or Other Links — each platform bar disappears after being added */}
          {availablePlatforms.length > 0 ? (
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Add Social Media or Other Links
                </span>
                {pendingDrafts.length > 0 && (
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {pendingDrafts.length} selected
                  </span>
                )}
              </div>

              {/* Multi-Select Platform Selector Grid (only shows platforms not yet added) */}
              <div className="flex flex-wrap gap-1.5">
                {availablePlatforms.map((opt) => {
                  const isSelected = pendingDrafts.some((d) => d.platform === opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleTogglePlatformChoice(opt.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border active:scale-95 ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3 shrink-0 stroke-[2.5]" />
                      ) : (
                        <SocialPlatformIcon platform={opt.id} className="w-3 h-3 shrink-0" />
                      )}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Inputs for EVERY selected platform */}
              {pendingDrafts.length > 0 ? (
                <div className="space-y-2.5">
                  {pendingDrafts.map((draft) => {
                    const meta = getPlatformMeta(draft.platform);
                    const isDup = duplicatePendingIds.has(draft.draftId);
                    return (
                      <div
                        key={draft.draftId}
                        className={`p-2.5 rounded-2xl border space-y-2 ${
                          isDup
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                            : 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-800/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-lg ${meta.bgClass} ${meta.colorClass} flex items-center justify-center shrink-0`}
                            >
                              <SocialPlatformIcon platform={draft.platform} className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                              {meta.label}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePendingDraft(draft.draftId)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                            aria-label={`Deselect ${meta.label}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={draft.label}
                            onChange={(e) =>
                              handleUpdatePendingDraft(draft.draftId, 'label', e.target.value)
                            }
                            placeholder="Display label"
                            className="w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                          />
                          <input
                            type="text"
                            value={draft.url}
                            onChange={(e) =>
                              handleUpdatePendingDraft(draft.draftId, 'url', e.target.value)
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSelectedLinks();
                              }
                            }}
                            placeholder={meta.placeholder}
                            className={`w-full text-xs px-2.5 py-2 bg-white dark:bg-slate-900 rounded-xl border focus:outline-none text-slate-900 dark:text-white ${
                              isDup
                                ? 'border-rose-400 dark:border-rose-700 focus:border-rose-500'
                                : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                            }`}
                          />
                        </div>
                        {isDup && (
                          <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                            This link is already added — enter a unique URL.
                          </p>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleAddSelectedLinks}
                    disabled={readyPendingCount === 0}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {readyPendingCount > 1
                        ? `Add ${readyPendingCount} Links to Profile`
                        : 'Add Link to Profile'}
                    </span>
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Select one or more platforms above to enter their links and add them to Identity &amp; Credentials.
                </p>
              )}
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 text-center py-1">
                All available social media &amp; link platforms have been added.
              </p>
            </div>
          )}
        </div>

        {/* Sticky Bottom CTA */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={hasAnyDuplicate}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface EditAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: AchievementItem[];
  metrics: AchievementMetrics;
  initialEditId?: string | null;
  onSave: (
    achievements: AchievementItem[],
    metrics: AchievementMetrics,
    options?: { silent?: boolean }
  ) => void;
}

export const EditAchievementsModal: React.FC<EditAchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  metrics,
  initialEditId = null,
  onSave,
}) => {
  const [draftList, setDraftList] = useState<AchievementItem[]>(achievements);
  const [draftMetrics, setDraftMetrics] = useState<AchievementMetrics>(metrics);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formIcon, setFormIcon] = useState('🏆');
  const [formTitle, setFormTitle] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formYear, setFormYear] = useState('2025');
  const [formBadge, setFormBadge] = useState('Verified Honor');
  const [formDesc, setFormDesc] = useState('');
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      setDraftList(achievements);
      setDraftMetrics(metrics);
      setIsAddingNew(false);
      if (initialEditId) {
        const target = achievements.find((a) => a.id === initialEditId);
        if (target) {
          setEditingId(target.id);
          setFormIcon(target.icon);
          setFormTitle(target.title);
          setFormOrg(target.organization);
          setFormYear(target.year);
          setFormBadge(target.badge);
          setFormDesc(target.description);
          wasOpenRef.current = true;
          return;
        }
      }
      setEditingId(null);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, achievements, metrics, initialEditId]);

  if (!isOpen) return null;

  const normalizeMetrics = (m: AchievementMetrics, count: number): AchievementMetrics => ({
    honors: m.honors.trim() || '1st',
    patents: m.patents.trim() || String(count),
    contributor: m.contributor.trim() || 'Top 0.1%',
  });

  const startEditItem = (item: AchievementItem) => {
    setIsAddingNew(false);
    setEditingId(item.id);
    setFormIcon(item.icon);
    setFormTitle(item.title);
    setFormOrg(item.organization);
    setFormYear(item.year);
    setFormBadge(item.badge);
    setFormDesc(item.description);
  };

  const startAddItem = () => {
    setEditingId(null);
    setIsAddingNew(true);
    setFormIcon('🏆');
    setFormTitle('');
    setFormOrg('');
    setFormYear(String(new Date().getFullYear()));
    setFormBadge('Honor');
    setFormDesc('');
  };

  const commitActiveForm = (instantPersist = true): AchievementItem[] => {
    if (!editingId && !isAddingNew) return draftList;
    const trimmedTitle = formTitle.trim();
    if (!trimmedTitle) {
      setEditingId(null);
      setIsAddingNew(false);
      return draftList;
    }

    const updatedItem: AchievementItem = {
      id: editingId || `ach_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      icon: formIcon || '🏆',
      title: trimmedTitle,
      organization: formOrg.trim() || 'Cronium Verified Registry',
      year: formYear.trim() || String(new Date().getFullYear()),
      badge: formBadge.trim() || 'Honor',
      description: formDesc.trim() || 'Verified milestone recognized across the Cronium network.',
    };

    const nextList = editingId
      ? draftList.map((item) => (item.id === editingId ? updatedItem : item))
      : [updatedItem, ...draftList];

    setDraftList(nextList);
    setEditingId(null);
    setIsAddingNew(false);

    if (instantPersist) {
      onSave(nextList, normalizeMetrics(draftMetrics, nextList.length), { silent: true });
    }
    return nextList;
  };

  const handleDeleteItem = (id: string) => {
    const nextList = draftList.filter((item) => item.id !== id);
    setDraftList(nextList);
    if (editingId === id) {
      setEditingId(null);
    }
    // Persist deletion immediately so Key Achievements updates instantly
    onSave(nextList, normalizeMetrics(draftMetrics, nextList.length), { silent: true });
  };

  const handleMetricChange = (field: keyof AchievementMetrics, value: string) => {
    const nextMetrics = { ...draftMetrics, [field]: value };
    setDraftMetrics(nextMetrics);
    onSave(draftList, normalizeMetrics(nextMetrics, draftList.length), { silent: true });
  };

  const handleSaveAll = () => {
    const finalList = commitActiveForm(false);
    onSave(finalList, normalizeMetrics(draftMetrics, finalList.length), { silent: false });
    onClose();
  };

  const isEditingFormOpen = Boolean(editingId || isAddingNew);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 max-h-[88dvh] flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-display leading-tight truncate">
                Edit Key Achievements
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Changes update your profile immediately
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close edit achievements modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {isEditingFormOpen ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isAddingNew ? 'New Achievement' : 'Edit Achievement'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setIsAddingNew(false);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  Back to list
                </button>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Icon
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ACHIEVEMENT_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormIcon(emoji)}
                      className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all cursor-pointer ${
                        formIcon === emoji
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Achievement Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Systems Architect of the Year"
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  value={formOrg}
                  onChange={(e) => setFormOrg(e.target.value)}
                  placeholder="e.g. IEEE / Stanford AI Lab"
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Year / Period
                  </label>
                  <input
                    type="text"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="2025"
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Global Award"
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Describe the impact and verification context..."
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="button"
                onClick={() => commitActiveForm(true)}
                disabled={!formTitle.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isAddingNew ? 'Add Achievement Now' : 'Apply Achievement Update'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* Summary Metrics Editor */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Highlights Summary
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Honors
                    </label>
                    <input
                      type="text"
                      value={draftMetrics.honors}
                      onChange={(e) => handleMetricChange('honors', e.target.value)}
                      className="w-full text-xs font-bold text-center px-2 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Patents &amp; Papers
                    </label>
                    <input
                      type="text"
                      value={draftMetrics.patents}
                      onChange={(e) => handleMetricChange('patents', e.target.value)}
                      className="w-full text-xs font-bold text-center px-2 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                      Contributor
                    </label>
                    <input
                      type="text"
                      value={draftMetrics.contributor}
                      onChange={(e) => handleMetricChange('contributor', e.target.value)}
                      className="w-full text-xs font-bold text-center px-2 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Add New Achievement Button */}
              <button
                type="button"
                onClick={startAddItem}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Key Achievement</span>
              </button>

              {/* Achievements List */}
              <div className="space-y-2">
                {draftList.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">
                    No achievements yet. Tap Add Key Achievement above to add one.
                  </p>
                ) : (
                  draftList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-2.5"
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-base shrink-0">
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 truncate">
                            {item.organization}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            {item.year} · {item.badge}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditItem(item)}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                          title="Edit achievement"
                          aria-label={`Edit ${item.title}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                          title="Delete achievement immediately"
                          aria-label={`Delete ${item.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Sticky Bottom CTA */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface EditProfileMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  communitiesCount: number;
  connectionsCount: number;
  achievementsCount: number;
  hasCustomOverrides: boolean;
  onSave: (next: ProfileMetricsOverride) => void;
  onResetToAuto: () => void;
}

export const EditProfileMetricsModal: React.FC<EditProfileMetricsModalProps> = ({
  isOpen,
  onClose,
  communitiesCount,
  connectionsCount,
  achievementsCount,
  hasCustomOverrides,
  onSave,
  onResetToAuto,
}) => {
  const [communitiesInput, setCommunitiesInput] = useState(String(communitiesCount));
  const [connectionsInput, setConnectionsInput] = useState(String(connectionsCount));
  const [achievementsInput, setAchievementsInput] = useState(String(achievementsCount));

  useEffect(() => {
    if (isOpen) {
      setCommunitiesInput(String(communitiesCount));
      setConnectionsInput(String(connectionsCount));
      setAchievementsInput(String(achievementsCount));
    }
  }, [isOpen, communitiesCount, connectionsCount, achievementsCount]);

  if (!isOpen) return null;

  const parseNonNegativeInt = (val: string, fallback: number): number => {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (!cleaned) return fallback;
    const parsed = parseInt(cleaned, 10);
    return Number.isNaN(parsed) ? fallback : Math.max(0, parsed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      communities: parseNonNegativeInt(communitiesInput, communitiesCount),
      connections: parseNonNegativeInt(connectionsInput, connectionsCount),
      achievements: parseNonNegativeInt(achievementsInput, achievementsCount),
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-display leading-tight truncate">
                Edit Profile Metrics
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Update displayed Communities, Connections &amp; Achievements
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close edit profile metrics modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-5 space-y-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1.5 text-center">
                Communities
              </label>
              <input
                type="number"
                min={0}
                value={communitiesInput}
                onChange={(e) => setCommunitiesInput(e.target.value)}
                className="w-full text-sm font-extrabold text-center px-2 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1.5 text-center">
                Connections
              </label>
              <input
                type="number"
                min={0}
                value={connectionsInput}
                onChange={(e) => setConnectionsInput(e.target.value)}
                className="w-full text-sm font-extrabold text-center px-2 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1.5 text-center">
                Achievements
              </label>
              <input
                type="number"
                min={0}
                value={achievementsInput}
                onChange={(e) => setAchievementsInput(e.target.value)}
                className="w-full text-sm font-extrabold text-center px-2 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          {hasCustomOverrides && (
            <button
              type="button"
              onClick={() => {
                onResetToAuto();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Automatic Counts</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer active:scale-[0.98]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Metrics</span>
          </button>
        </div>
      </form>
    </div>
  );
};
