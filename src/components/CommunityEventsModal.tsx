import React, { useState, useRef } from 'react';
import {
  Calendar,
  CalendarCheck,
  MapPin,
  Users,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  X,
  Check,
  Globe,
  ArrowRight,
  Sparkles,
  Lock,
  Radio,
} from 'lucide-react';
import { CommunityEvent, Community } from '../types';
import { INITIAL_COMMUNITY_EVENTS } from '../data/mockEventsData';
import {
  portraitMateoSilva,
  portraitAstridLindholm,
  portraitKenjiTakahashi,
  portraitCamilleLaurent,
  resolveGenderMatchedAvatar,
} from '../data/mockData';
import { notificationService } from '../services/notifications';
import { EventDetailsModal } from './EventDetailsModal';

interface CommunityEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  joinedCommunities: Community[];
  hasPrompted?: boolean;
  onNavigateToHome?: () => void;
  onOpenCommunity?: (community: Community) => void;
}

interface ParsedDateTile {
  weekday: string;
  day: string;
  month: string;
}

const parseEventDateTile = (dateStr: string): ParsedDateTile => {
  // Expected format e.g. "Thu, Nov 22 • 6:30 PM PST"
  const match = dateStr.match(/([A-Za-z]{3})[a-z]*,\s*([A-Za-z]{3})[a-z]*\s+(\d{1,2})/);
  if (match) {
    return {
      weekday: match[1].toUpperCase(),
      month: match[2].toUpperCase(),
      day: match[3],
    };
  }
  return {
    weekday: 'THU',
    day: '22',
    month: 'NOV',
  };
};

const EVENTS_STORAGE_KEY = 'cronium_community_events_v10';
const TOP_EVENT_EMBEDDED_COVER = '/assets/aistudio/event_pytorch_cover.png';

export const CommunityEventsModal: React.FC<CommunityEventsModalProps> = ({
  isOpen,
  onClose,
  joinedCommunities,
  hasPrompted = false,
  onNavigateToHome,
}) => {
  const [events, setEvents] = useState<CommunityEvent[]>(() => {
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((ev: CommunityEvent) => ({
            ...ev,
            coverImage:
              ev.id === 'evt_pytorch_triton_sprint_2026'
                ? TOP_EVENT_EMBEDDED_COVER
                : ev.coverImage,
            hostAvatar: ev.hostAvatar
              ? resolveGenderMatchedAvatar(ev.hostName || '', ev.hostAvatar)
              : ev.hostAvatar,
            guests: ev.guests?.map((g) => ({
              ...g,
              avatar: resolveGenderMatchedAvatar(g.name, g.avatar),
            })),
          }));
        }
      }
    } catch {
      // fallback to defaults
    }
    return INITIAL_COMMUNITY_EVENTS;
  });

  const [activeTab, setActiveTab] = useState<'all' | 'joined'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [locationFilter, setLocationFilter] = useState<'all' | 'online' | 'in-person' | 'hybrid'>('all');
  const [communityScope, setCommunityScope] = useState<'all' | 'my-servers'>('all');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const listContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const hasJoinedCommunities = joinedCommunities.length > 0;
  const isEventsUnlocked = Boolean(hasPrompted && hasJoinedCommunities);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  // Build a set of joined community names & IDs
  const joinedNames = new Set(joinedCommunities.map((c) => c.name.toLowerCase()));
  const joinedIds = new Set(joinedCommunities.map((c) => c.id));

  // Enrich events with joined-server status
  const enrichedEvents = events.map((evt) => {
    const isActuallyJoined =
      (evt.communityId && joinedIds.has(evt.communityId)) ||
      joinedNames.has(evt.communityName.toLowerCase()) ||
      evt.isWithinJoinedServer;
    return {
      ...evt,
      isWithinJoinedServer: isActuallyJoined,
    };
  });

  // "Joined" tab tracks events the user has registered/RSVPed to attend
  const joinedEvents = enrichedEvents.filter((e) => e.isRsvpd);

  const hasActiveFilters = locationFilter !== 'all' || communityScope !== 'all';

  // Filter based on active tab, search query, format filter, and community scope
  const filteredEvents = enrichedEvents.filter((evt) => {
    if (activeTab === 'joined' && !evt.isRsvpd) return false;
    if (communityScope === 'my-servers' && !evt.isWithinJoinedServer) return false;

    const isHybrid = evt.locationType === 'hybrid';
    const isOnline = !isHybrid && (evt.eventMode === 'online' || evt.locationType === 'virtual');
    const isInPerson = !isHybrid && !isOnline;

    if (locationFilter === 'online' && !isOnline) return false;
    if (locationFilter === 'in-person' && !isInPerson) return false;
    if (locationFilter === 'hybrid' && !isHybrid) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = evt.title.toLowerCase().includes(q);
      const matchComm = evt.communityName.toLowerCase().includes(q);
      const matchHost = evt.hostName.toLowerCase().includes(q);
      const matchCity = evt.city?.toLowerCase().includes(q);
      const matchDesc = evt.description.toLowerCase().includes(q);
      const matchTags = evt.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchComm || matchHost || matchCity || matchDesc || matchTags;
    }

    return true;
  });

  // Display all matching events immediately by default
  const visibleEvents = filteredEvents;

  const handleToggleRsvp = (eventId: string) => {
    notificationService.playSentChime();
    setEvents((prev) => {
      let targetEvent: CommunityEvent | null = null;
      let willJoin = false;
      const updated = prev.map((e) => {
        if (e.id === eventId) {
          targetEvent = e;
          const nextRsvp = !e.isRsvpd;
          willJoin = nextRsvp;
          const nextAttendees = nextRsvp
            ? e.attendeesCount + 1
            : Math.max(0, e.attendeesCount - 1);
          setToastMessage(
            nextRsvp
              ? `Registered to attend "${e.title}"`
              : `Removed attendance for "${e.title}"`
          );
          setTimeout(() => setToastMessage(null), 2500);
          return {
            ...e,
            isRsvpd: nextRsvp,
            attendeesCount: nextAttendees,
          };
        }
        return e;
      });

      if (targetEvent && willJoin) {
        const ev = targetEvent as CommunityEvent;
        notificationService.notify({
          title: `Event Confirmed: ${ev.title}`,
          body: `You are attending ${ev.title} (${ev.dateStr}) in ${ev.communityName}. RSVP confirmed!`,
          avatar: ev.coverImage || ev.communityAvatar,
          type: 'event',
        });

        const otherAttendees = [
          { name: 'Mateo Silva', avatar: portraitMateoSilva },
          { name: 'Astrid Lindholm', avatar: portraitAstridLindholm },
          { name: 'Kenji Takahashi', avatar: portraitKenjiTakahashi },
          { name: 'Camille Laurent', avatar: portraitCamilleLaurent },
        ];
        const randomPeer = otherAttendees[Math.floor(Math.random() * otherAttendees.length)];

        setTimeout(() => {
          notificationService.notify({
            title: `${randomPeer.name} joined ${ev.title}`,
            body: `${randomPeer.name} just registered to attend "${ev.title}" in ${ev.communityName}.`,
            avatar: randomPeer.avatar,
            type: 'event',
          });
        }, 2600);
      }

      try {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage quota errors
      }
      return updated;
    });
  };

  const handleShareEvent = async (evt: CommunityEvent) => {
    const text = `Join us at "${evt.title}" (${evt.dateStr}) hosted by ${evt.hostName}!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: evt.title,
          text,
          url: window.location.href,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      setToastMessage('Event link copied to clipboard');
      setTimeout(() => setToastMessage(null), 2000);
    } catch {
      // ignore
    }
  };

  const getModeLabel = (evt: CommunityEvent): { label: string; type: 'online' | 'in-person' | 'hybrid' } => {
    if (evt.locationType === 'hybrid') {
      return { label: 'Hybrid', type: 'hybrid' };
    }
    if (evt.eventMode === 'online' || evt.locationType === 'virtual') {
      return { label: 'Online', type: 'online' };
    }
    return { label: 'In-Person', type: 'in-person' };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Events & Meetups"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[465px] bg-white dark:bg-slate-900 rounded-[32px] px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5 shadow-[0_24px_60px_-16px_rgba(30,24,72,0.22)] border border-[#ECEAF6] dark:border-slate-800 text-left relative overflow-hidden max-h-[92vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 pb-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-[15px] bg-[#CFC6FF]/85 dark:bg-indigo-950/90 text-[#5B35F8] dark:text-indigo-300 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[#14112C] dark:text-white tracking-tight leading-none truncate">
              Events &amp; Meetups
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 -mr-1.5 rounded-full flex items-center justify-center text-[#7C7699] hover:text-[#14112C] hover:bg-[#F4F3FB] dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close"
            aria-label="Close Events & Meetups"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Pre-Unlock Interface when user has not prompted & joined communities yet */}
        {!isEventsUnlocked ? (
          <div className="overflow-y-auto flex-1 min-h-0 pt-2 pb-2">
            <div className="flex flex-col items-center text-center px-1">
              {/* Custom Calendar + Live Session Lock Emblem */}
              <div className="relative mb-5 mt-1">
                <div className="w-[88px] h-[88px] rounded-[26px] bg-gradient-to-br from-[#F3F0FF] via-[#EAE5FF] to-[#E0E7FF] dark:from-indigo-950 dark:via-violet-950/90 dark:to-slate-900 border border-[#DFD8FE] dark:border-indigo-800/80 shadow-[0_14px_30px_-14px_rgba(91,53,248,0.38)] flex flex-col items-center justify-center relative">
                  <div className="w-11 h-11 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-[#EAE6FF] dark:border-indigo-900 flex flex-col items-center justify-center leading-none">
                    <span className="text-[8px] font-extrabold uppercase tracking-wider text-[#5B35F8] dark:text-indigo-400">
                      LIVE
                    </span>
                    <Calendar className="w-5 h-5 text-[#14112C] dark:text-white mt-0.5 stroke-[2.1]" />
                  </div>
                </div>
                <span className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-[#E5E0FF] dark:border-indigo-800 shadow-sm flex items-center justify-center text-[#5B35F8] dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
                <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#5B35F8] text-white ring-3 ring-white dark:ring-slate-900 shadow-sm flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 stroke-[2.4]" />
                </span>
              </div>

              {/* Contextual Heading & Message */}
              <h3 className="text-[19px] sm:text-[20px] font-bold text-[#14112C] dark:text-white tracking-tight leading-snug max-w-[300px]">
                {!hasPrompted ? (
                  <>
                    Community events unlock with your{' '}
                    <span className="text-[#5B35F8] dark:text-indigo-400">matches</span>
                  </>
                ) : (
                  <>
                    Join a community to{' '}
                    <span className="text-[#5B35F8] dark:text-indigo-400">unlock events</span>
                  </>
                )}
              </h3>

              <p className="mt-2.5 text-[13px] text-[#5D5876] dark:text-slate-400 leading-relaxed max-w-[330px]">
                {!hasPrompted
                  ? 'Tell Cronium what you are interested in on Home and join your first community to access curated workshops, live sprints, and local meetups.'
                  : 'Your prompts are in! Join at least one matched community on Home to browse upcoming live rooms, speaker sessions, and member meetups.'}
              </p>

              {/* 2-Step Unlock Progress Card */}
              <div className="w-full mt-5 p-3.5 rounded-2xl bg-[#F7F6FC] dark:bg-slate-800/60 border border-[#EAE8F4] dark:border-slate-700/80 text-left space-y-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                      hasPrompted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#5B35F8] text-white shadow-xs'
                    }`}
                  >
                    {hasPrompted ? <Check className="w-3.5 h-3.5 stroke-[2.6]" /> : '1'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[13px] font-bold ${
                          hasPrompted
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-[#14112C] dark:text-white'
                        }`}
                      >
                        Share your prompts on Home
                      </span>
                      {hasPrompted && (
                        <span className="text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Done
                        </span>
                      )}
                    </div>
                    <p className="text-[11.5px] text-[#6F6A89] dark:text-slate-400 mt-0.5 leading-snug">
                      Match with communities based on your topics, hobbies, and goals.
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#EAE8F4] dark:border-slate-700/70" />

                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                      hasPrompted
                        ? 'bg-[#5B35F8] text-white shadow-xs'
                        : 'bg-[#E5E2F5] dark:bg-slate-700 text-[#6F6A89] dark:text-slate-400'
                    }`}
                  >
                    2
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-[13px] font-bold block ${
                        hasPrompted
                          ? 'text-[#14112C] dark:text-white'
                          : 'text-[#6F6A89] dark:text-slate-400'
                      }`}
                    >
                      Join at least one community
                    </span>
                    <p className="text-[11.5px] text-[#6F6A89] dark:text-slate-400 mt-0.5 leading-snug">
                      Instantly unlock live audio stages, technical sprints, and RSVP passes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Subtle Teaser of What Unlocks */}
              <div className="w-full mt-4 flex items-center justify-center flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F3FB] dark:bg-slate-800 text-[#524E6B] dark:text-slate-300 text-[11px] font-semibold">
                  <Radio className="w-3 h-3 text-[#5B35F8] dark:text-indigo-400" />
                  <span>Live Rooms</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F3FB] dark:bg-slate-800 text-[#524E6B] dark:text-slate-300 text-[11px] font-semibold">
                  <MapPin className="w-3 h-3 text-[#5B35F8] dark:text-indigo-400" />
                  <span>Local Meetups</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F3FB] dark:bg-slate-800 text-[#524E6B] dark:text-slate-300 text-[11px] font-semibold">
                  <Users className="w-3 h-3 text-[#5B35F8] dark:text-indigo-400" />
                  <span>Speaker Sprints</span>
                </span>
              </div>

              {/* Primary CTA & Dismiss */}
              <div className="w-full mt-5 space-y-2">
                {onNavigateToHome && (
                  <button
                    type="button"
                    onClick={onNavigateToHome}
                    className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-[#5B35F8] via-[#6B31F8] to-[#7C2BF7] hover:from-[#4F29EB] hover:to-[#6C1EE8] text-white text-[13.5px] font-semibold flex items-center justify-center gap-2 shadow-[0_10px_24px_-8px_rgba(91,53,248,0.58)] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>
                      {!hasPrompted ? 'Start Prompts on Home' : 'Explore Matched Communities'}
                    </span>
                    <ArrowRight className="w-4 h-4 stroke-[2.3]" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-[#6F6A89] dark:text-slate-400 hover:text-[#14112C] dark:hover:text-white hover:bg-[#F4F3FB] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        ) : (
        <>
        {/* Segmented Pill Tabs: All Events | Joined [count] */}
        <div className="pb-3.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2.5 px-5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap text-center ${
                activeTab === 'all'
                  ? 'bg-[#5B35F8] text-white shadow-[0_6px_18px_-6px_rgba(91,53,248,0.55)]'
                  : 'bg-[#F4F3FB] dark:bg-slate-800/80 text-[#524E6B] dark:text-slate-300 hover:bg-[#EAE7FA] dark:hover:bg-slate-800'
              }`}
            >
              All Events
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('joined')}
              className={`flex-1 py-2.5 px-5 rounded-full text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'joined'
                  ? 'bg-[#5B35F8] text-white shadow-[0_6px_18px_-6px_rgba(91,53,248,0.55)]'
                  : 'bg-[#F4F3FB] dark:bg-slate-800/80 text-[#524E6B] dark:text-slate-300 hover:bg-[#EAE7FA] dark:hover:bg-slate-800'
              }`}
            >
              <span>Joined</span>
              <span
                className={`min-w-[22px] h-[22px] px-1.5 rounded-full text-xs font-semibold tabular-nums inline-flex items-center justify-center ${
                  activeTab === 'joined'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#E4E1F5] dark:bg-slate-700 text-[#524E6B] dark:text-slate-200'
                }`}
              >
                {joinedEvents.length}
              </span>
            </button>
          </div>
        </div>

        {/* Search Input + Circular Filter Button Row */}
        <div className="pb-4 shrink-0 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-[17px] h-[17px] text-[#8D89A3] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-11 pr-9 py-2.5 text-sm bg-[#F5F5FA] dark:bg-slate-800/80 rounded-full border border-[#EAE8F4] dark:border-slate-700/80 text-[#14112C] dark:text-white placeholder-[#8D89A3] focus:outline-none focus:border-[#5B35F8] focus:ring-2 focus:ring-[#5B35F8]/15 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D89A3] hover:text-[#14112C] dark:hover:text-white p-1 rounded-full cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center border transition-all cursor-pointer relative ${
                showFilters || hasActiveFilters
                  ? 'bg-[#EEEBFE] dark:bg-indigo-950/90 border-[#CFC6FF] dark:border-indigo-700 text-[#5B35F8] dark:text-indigo-300'
                  : 'bg-[#F4F3FB] dark:bg-slate-800 border-[#EAE8F4] dark:border-slate-700 text-[#1E1A36] dark:text-slate-200 hover:bg-[#EAE7FA] dark:hover:bg-slate-700'
              }`}
              title="Filter events"
              aria-label="Filter events"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="w-[18px] h-[18px]" />
              {hasActiveFilters && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#5B35F8] ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          </div>

          {/* Expandable Filter Controls */}
          {showFilters && (
            <div className="p-3.5 rounded-2xl bg-[#F7F6FC] dark:bg-slate-800/70 border border-[#EAE8F4] dark:border-slate-700/80 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#524E6B] dark:text-slate-300">
                  Format
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocationFilter('all');
                      setCommunityScope('all');
                    }}
                    className="text-xs font-semibold text-[#5B35F8] dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-1.5">
                {(['all', 'online', 'in-person', 'hybrid'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setLocationFilter(mode)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      locationFilter === mode
                        ? 'bg-[#5B35F8] text-white'
                        : 'bg-white dark:bg-slate-900 text-[#524E6B] dark:text-slate-300 border border-[#E6E3F2] dark:border-slate-700 hover:border-[#CFC6FF]'
                    }`}
                  >
                    {mode === 'all'
                      ? 'All Formats'
                      : mode === 'online'
                      ? 'Online'
                      : mode === 'in-person'
                      ? 'In-Person'
                      : 'Hybrid'}
                  </button>
                ))}
              </div>

              <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t border-[#EAE8F4] dark:border-slate-700/70">
                <button
                  type="button"
                  onClick={() => setCommunityScope('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    communityScope === 'all'
                      ? 'bg-[#5B35F8] text-white'
                      : 'bg-white dark:bg-slate-900 text-[#524E6B] dark:text-slate-300 border border-[#E6E3F2] dark:border-slate-700 hover:border-[#CFC6FF]'
                  }`}
                >
                  All Communities
                </button>
                <button
                  type="button"
                  onClick={() => setCommunityScope('my-servers')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    communityScope === 'my-servers'
                      ? 'bg-[#5B35F8] text-white'
                      : 'bg-white dark:bg-slate-900 text-[#524E6B] dark:text-slate-300 border border-[#E6E3F2] dark:border-slate-700 hover:border-[#CFC6FF]'
                  }`}
                >
                  My Servers Only
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inline Toast Confirmation */}
        {toastMessage && (
          <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-[#EEEBFE] dark:bg-indigo-950/80 border border-[#D7D1FA] dark:border-indigo-800 text-[#3B26A8] dark:text-indigo-200 text-xs font-semibold flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#5B35F8] dark:text-indigo-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        {/* Scrollable Event Cards Area */}
        <div
          ref={listContainerRef}
          className="overflow-y-auto space-y-4 flex-1 min-h-0 pr-0.5 pb-1"
        >
          {visibleEvents.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-[24px] border border-[#ECEAF6] dark:border-slate-800 bg-[#FAF9FE] dark:bg-slate-900/60 space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-[#EEEBFE] dark:bg-indigo-950/70 text-[#5B35F8] dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#14112C] dark:text-white">
                {activeTab === 'joined' ? 'No joined events yet' : 'No matching events found'}
              </p>
              <p className="text-xs text-[#6F6A89] dark:text-slate-400 max-w-[260px] mx-auto leading-relaxed">
                {activeTab === 'joined'
                  ? 'Tap Attend on any meetup in All Events to reserve your spot and track it here.'
                  : 'Try adjusting your search keywords or clearing your active filters.'}
              </p>
              {activeTab === 'joined' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="mt-1 px-4 py-2 rounded-full bg-[#5B35F8] hover:bg-[#4B27E5] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Browse All Events
                </button>
              ) : (
                hasActiveFilters || searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setLocationFilter('all');
                      setCommunityScope('all');
                    }}
                    className="mt-1 px-4 py-2 rounded-full bg-[#EEEBFE] hover:bg-[#E1DBFD] dark:bg-indigo-950 text-[#4832B8] dark:text-indigo-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                ) : null
              )}
            </div>
          ) : (
            visibleEvents.map((evt) => {
              const dateTile = parseEventDateTile(evt.dateStr);
              const modeInfo = getModeLabel(evt);
              const hasImgError = Boolean(failedImages[evt.id]);
              const hasEmbeddedOverlay =
                evt.coverImage === TOP_EVENT_EMBEDDED_COVER && !hasImgError;

              return (
                <article
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className="rounded-[24px] bg-white dark:bg-slate-900 border border-[#ECEAF6] dark:border-slate-800 shadow-[0_10px_30px_-14px_rgba(30,24,72,0.14)] hover:shadow-[0_14px_34px_-12px_rgba(91,53,248,0.18)] hover:border-[#D7D1FA] dark:hover:border-indigo-700/80 transition-all overflow-hidden cursor-pointer group"
                >
                  {/* Event Hero Cover Photo */}
                  <div
                    className={`${
                      hasEmbeddedOverlay ? 'aspect-[907/346]' : 'h-[184px] sm:h-[202px]'
                    } w-full relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#EDE9FE] via-[#E0E7FF] to-[#F1F5F9] dark:from-indigo-950 dark:via-slate-900 dark:to-slate-800`}
                  >
                    {!hasImgError && evt.coverImage ? (
                      <img
                        src={evt.coverImage}
                        alt={evt.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [evt.id]: true }))
                        }
                        className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#5B35F8]/60 dark:text-indigo-400/60 p-4">
                        <Calendar className="w-9 h-9" />
                        <span className="text-xs font-semibold text-center line-clamp-1">
                          {evt.communityName}
                        </span>
                      </div>
                    )}

                    {/* Floating Date Calendar Tile & Mode Pill (skipped when already embedded in attached cover image) */}
                    {!hasEmbeddedOverlay && (
                      <>
                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-[15px] px-3 py-2 min-w-[54px] shadow-[0_6px_18px_-4px_rgba(15,23,42,0.18)] flex flex-col items-center justify-center leading-none">
                          <span className="text-[10px] font-bold tracking-wider text-[#5B5675] dark:text-slate-400 uppercase">
                            {dateTile.weekday}
                          </span>
                          <span className="text-[21px] font-extrabold text-[#14112C] dark:text-white leading-tight tabular-nums my-0.5">
                            {dateTile.day}
                          </span>
                          <span className="text-[10px] font-bold tracking-wider text-[#5B5675] dark:text-slate-400 uppercase">
                            {dateTile.month}
                          </span>
                        </div>

                        <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#D8D1FF]/95 dark:bg-indigo-950/90 backdrop-blur-md text-[#3B26A8] dark:text-indigo-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                          {modeInfo.type === 'online' ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          ) : modeInfo.type === 'in-person' ? (
                            <MapPin className="w-3 h-3 shrink-0" />
                          ) : (
                            <Globe className="w-3 h-3 shrink-0" />
                          )}
                          <span>{modeInfo.label}</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Card Details Content */}
                  <div className="px-4 pt-4 pb-4.5 sm:px-5 sm:pt-4.5 sm:pb-5 space-y-3">
                    {/* Event Title */}
                    <h3 className="text-[18px] sm:text-[19px] font-bold text-[#14112C] dark:text-white leading-snug tracking-tight line-clamp-2">
                      {evt.title}
                    </h3>

                    {/* Date & Attendees Row */}
                    <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1 text-[13px] font-medium text-[#5D5876] dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#6F6A89] dark:text-slate-400 shrink-0" />
                        <span>{evt.dateStr}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="h-3.5 w-px bg-[#DFDCEB] dark:bg-slate-700"
                      />
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Users className="w-3.5 h-3.5 text-[#6F6A89] dark:text-slate-400 shrink-0" />
                        <span>{evt.attendeesCount} attending</span>
                      </span>
                    </div>

                    {/* Topic Hashtags */}
                    {evt.tags && evt.tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-2 pt-0.5">
                        {evt.tags.slice(0, 2).map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-3 py-1 rounded-full bg-[#EEEBFE] dark:bg-indigo-950/70 text-[#4832B8] dark:text-indigo-300 text-xs font-medium whitespace-nowrap"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Host & Attend Action Row */}
                    <div className="pt-1.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {evt.hostAvatar ? (
                          <img
                            src={evt.hostAvatar}
                            alt={evt.hostName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E6E3F2] dark:ring-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#EEEBFE] dark:bg-indigo-950 text-[#5B35F8] dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {evt.hostName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="text-[13px] font-medium text-[#5D5876] dark:text-slate-400 truncate">
                          Hosted by {evt.hostName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRsvp(evt.id);
                        }}
                        className={`px-5 py-2.5 rounded-full text-[13.5px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.97] cursor-pointer shrink-0 whitespace-nowrap ${
                          evt.isRsvpd
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_8px_18px_-6px_rgba(5,150,105,0.45)]'
                            : 'bg-[#5B35F8] hover:bg-[#4B27E5] text-white shadow-[0_8px_18px_-6px_rgba(91,53,248,0.55)]'
                        }`}
                        title={
                          evt.isRsvpd
                            ? 'Click to cancel attendance'
                            : 'Click to register to attend'
                        }
                      >
                        {evt.isRsvpd ? (
                          <>
                            <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                            <span>Attending</span>
                          </>
                        ) : (
                          <>
                            <CalendarCheck className="w-4 h-4 shrink-0" />
                            <span>Attend</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
        </>
        )}
      </div>

      {/* Full Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEventId(null)}
        onToggleAttend={handleToggleRsvp}
        onShare={handleShareEvent}
      />
    </div>
  );
};
