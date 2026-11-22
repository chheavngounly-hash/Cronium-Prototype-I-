import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Share2,
  Check,
  ChevronLeft,
  ChevronDown,
  Link2,
  ArrowUpRight,
  Mic,
  MicOff,
  Hand,
  Radio,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { CommunityEvent, EventGuest } from '../types';
import {
  portraitMarcusVance,
  portraitAnnaSan,
  portraitElenaRostova,
} from '../data/mockData';

interface EventDetailsModalProps {
  event: CommunityEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleAttend: (eventId: string) => void;
  onShare: (event: CommunityEvent) => void;
}

interface ParsedDateTile {
  weekday: string;
  day: string;
  month: string;
}

const parseEventDateTile = (dateStr: string): ParsedDateTile => {
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

const formatStartSubtitle = (dateStr: string): string => {
  if (dateStr.includes('•')) {
    return dateStr.replace(/\s*•\s*/, ' at ');
  }
  return dateStr;
};

const formatDisplayUrl = (url?: string): string => {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
};

const TOP_EVENT_EMBEDDED_COVER = '/assets/aistudio/event_pytorch_cover.png';

const FALLBACK_ATTENDEE_AVATARS = [
  portraitMarcusVance,
  portraitAnnaSan,
  portraitElenaRostova,
];

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onToggleAttend,
  onShare,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [isPrereqsExpanded, setIsPrereqsExpanded] = useState(false);
  const [showLiveRoomSheet, setShowLiveRoomSheet] = useState(false);
  const [showHostProfile, setShowHostProfile] = useState(false);
  const [activeRoom, setActiveRoom] = useState<'cronium' | 'meet' | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset transient modal state and scroll to top whenever a different event opens
  useEffect(() => {
    setCopiedLink(false);
    setAddedToCalendar(false);
    setIsOverviewExpanded(false);
    setIsPrereqsExpanded(false);
    setShowLiveRoomSheet(false);
    setShowHostProfile(false);
    setActiveRoom(null);
    setIsMuted(true);
    setHandRaised(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [event?.id, isOpen]);

  const attendeeAvatars = useMemo(() => {
    if (!event) return FALLBACK_ATTENDEE_AVATARS;
    const pool: string[] = [];
    if (event.hostAvatar) pool.push(event.hostAvatar);
    if (event.guests) {
      event.guests.forEach((g) => {
        if (g.avatar && !pool.includes(g.avatar)) {
          pool.push(g.avatar);
        }
      });
    }
    FALLBACK_ATTENDEE_AVATARS.forEach((avatar) => {
      if (!pool.includes(avatar)) {
        pool.push(avatar);
      }
    });
    return pool.slice(0, 3);
  }, [event]);

  if (!isOpen || !event) return null;

  const isHybrid = event.locationType === 'hybrid';
  const isOnline = !isHybrid && (event.eventMode === 'online' || event.locationType === 'virtual');
  const modeLabel = isHybrid ? 'Hybrid' : isOnline ? 'Online' : 'In-Person';
  const sessionPillLabel = isOnline
    ? 'Live Session'
    : isHybrid
    ? 'Hybrid Live'
    : event.city?.split(',')[0] || 'In-Person';

  const dateTile = parseEventDateTile(event.dateStr);
  const hasEmbeddedCoverOverlay = event.coverImage === TOP_EVENT_EMBEDDED_COVER;
  const primaryOverview = event.fullDescription || event.description;
  const hasExtraDescription =
    Boolean(event.fullDescription && event.description && event.fullDescription !== event.description);
  const canToggleOverview = hasExtraDescription || primaryOverview.length > 145;

  const displayTags = (event.tags || []).slice(0, 2);

  const handleCopyLink = () => {
    const url = event.onlineJoinUrl || window.location.href;
    try {
      navigator.clipboard.writeText(url);
    } catch {
      // ignore clipboard errors
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddToCalendar = () => {
    try {
      const sanitizedTitle = event.title.replace(/[,;\n]/g, ' ');
      const locationText = event.onlineJoinUrl || event.venueOrPlatform;
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Cronium//Community Events//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${sanitizedTitle}`,
        `DESCRIPTION:${(event.fullDescription || event.description).replace(/\n/g, ' ')}`,
        `LOCATION:${locationText}`,
        'DTSTART:20261122T183000Z',
        'DTEND:20261122T203000Z',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${event.id}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // fallback to visual confirmation only
    }
    setAddedToCalendar(true);
    setTimeout(() => setAddedToCalendar(false), 2500);
  };

  const findSpeakerGuest = (speakerName?: string): EventGuest | null => {
    if (!speakerName) return null;
    const lower = speakerName.toLowerCase();
    const matchedGuest = event.guests?.find(
      (g) => g.name.toLowerCase() === lower || g.name.toLowerCase().includes(lower) || lower.includes(g.name.toLowerCase())
    );
    if (matchedGuest) return matchedGuest;
    if (
      event.hostName.toLowerCase() === lower ||
      event.hostName.toLowerCase().includes(lower) ||
      lower.includes(event.hostName.toLowerCase())
    ) {
      return {
        id: 'host_speaker',
        name: event.hostName,
        avatar: event.hostAvatar || portraitMarcusVance,
        role: event.hostRole,
        isHost: true,
      };
    }
    return null;
  };

  const getRoomOptions = () => {
    const primaryTag = event.tags?.[0] || 'Technical';
    const isPyTorchSprint = event.id === 'evt_pytorch_triton_sprint_2026';
    return [
      {
        id: 'cronium' as const,
        title: 'Join Cronium Live Audio & Screen Room',
        subtitle: isPyTorchSprint
          ? 'Primary kernel profiling & live terminal share'
          : `Primary ${primaryTag} live stage & interactive screen share`,
      },
      {
        id: 'meet' as const,
        title: 'Join Google Meet Live Room',
        subtitle: isPyTorchSprint
          ? 'High-bitrate slides & Q&A overflow'
          : `High-bitrate slides, ${event.hostName.split(' ')[0]}'s deck & Q&A overflow`,
      },
    ];
  };

  const hostGuest = event.guests?.find((g) => g.isHost);
  const locationSubtext = event.onlineJoinUrl
    ? formatDisplayUrl(event.onlineJoinUrl)
    : event.city || event.communityName;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] sm:max-w-[465px] bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_24px_64px_-16px_rgba(15,23,42,0.4)] overflow-hidden border border-slate-200/90 dark:border-slate-800 max-h-[92vh] flex flex-col text-left relative font-sans animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Bar */}
        <div className="px-3.5 py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back"
            aria-label="Back to Events"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2]" />
          </button>

          <div className="min-w-0 flex-1 flex justify-center">
            <span className="px-3.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 text-[12px] font-medium text-slate-600 dark:text-slate-300 truncate max-w-[230px]">
              {event.communityName}
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onShare(event)}
              className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Share Event"
              aria-label="Share Event"
            >
              <Share2 className="w-[17px] h-[17px]" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
              aria-label="Close Event Details"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Scrollable Event Content */}
        <div
          ref={scrollContainerRef}
          className="overflow-y-auto px-4 sm:px-5 pt-4 pb-6 flex-1 min-h-0"
        >
          {/* Exact Event Hero Cover Photo shown first before details */}
          <div
            className={`relative ${
              hasEmbeddedCoverOverlay ? 'aspect-[907/346]' : 'h-[196px] sm:h-[212px]'
            } w-full rounded-[20px] overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.2)]`}
          >
            <img
              src={event.coverImage}
              alt={event.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {!hasEmbeddedCoverOverlay && (
              <>
                {/* Floating Top-Left Date Tile */}
                <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-[14px] px-2.5 py-1.5 min-w-[48px] shadow-[0_6px_18px_-4px_rgba(15,23,42,0.22)] flex flex-col items-center justify-center leading-none">
                  <span className="text-[9.5px] font-bold tracking-wider text-[#6342F5] dark:text-indigo-400 uppercase">
                    {dateTile.weekday}
                  </span>
                  <span className="text-[19px] font-extrabold text-[#14112C] dark:text-white leading-tight tabular-nums my-0.5">
                    {dateTile.day}
                  </span>
                  <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase">
                    {dateTile.month}
                  </span>
                </div>

                {/* Floating Top-Right Live Session Badge */}
                <span className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-[#14112C] dark:text-white text-xs font-semibold flex items-center gap-1.5 shadow-[0_4px_14px_-4px_rgba(15,23,42,0.2)]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOnline || isHybrid ? 'bg-emerald-500' : 'bg-[#6342F5]'
                    }`}
                  />
                  <span>{sessionPillLabel}</span>
                </span>
              </>
            )}
          </div>

          {/* Schedule Line, Tags & Main Title */}
          <div className="pt-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <span className="text-[12.5px] font-semibold text-[#6342F5] dark:text-indigo-400">
                {event.dateStr} • {modeLabel}
              </span>

              {displayTags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {displayTags.map((tag, idx) => (
                    <span
                      key={tag}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
                        idx === 0
                          ? 'bg-[#F1EEFF] dark:bg-indigo-950/80 text-[#5B35F8] dark:text-indigo-300 font-semibold'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <h2 className="text-[21px] sm:text-[22px] font-bold text-[#14112C] dark:text-white leading-[1.24] tracking-tight">
              {event.title}
            </h2>
          </div>

          {/* Attendees Avatar Stack + Copy Link */}
          <div className="py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex -space-x-2 shrink-0">
                {attendeeAvatars.map((avatar, idx) => (
                  <img
                    key={idx}
                    src={avatar}
                    alt="Verified engineer attendee"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 bg-slate-100"
                  />
                ))}
              </div>
              <div className="min-w-0">
                <span className="text-[13.5px] font-bold text-[#14112C] dark:text-white block leading-tight tabular-nums">
                  {event.attendeesCount.toLocaleString()} attending
                </span>
                <span className="text-[11.5px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                  Verified engineers
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Overview Section */}
          <div className="py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-[14.5px] font-bold text-[#14112C] dark:text-white mb-1.5">
              Overview
            </h3>
            <p className="text-[13.5px] text-slate-600 dark:text-slate-300 leading-[1.6]">
              {isOverviewExpanded ? (
                <>
                  {primaryOverview}
                  {hasExtraDescription && (
                    <span className="block mt-2 text-slate-500 dark:text-slate-400">
                      {event.description}
                    </span>
                  )}
                </>
              ) : (
                primaryOverview
              )}
              {canToggleOverview && (
                <button
                  type="button"
                  onClick={() => setIsOverviewExpanded((prev) => !prev)}
                  className="ml-1.5 text-[13px] font-semibold text-[#6342F5] dark:text-indigo-400 hover:underline cursor-pointer inline"
                >
                  {isOverviewExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </p>
          </div>

          {/* Prerequisites Accordion */}
          {event.prerequisites && event.prerequisites.length > 0 && (
            <div className="border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPrereqsExpanded((prev) => !prev)}
                className="w-full py-3.5 flex items-center justify-between gap-2 text-left cursor-pointer group"
                aria-expanded={isPrereqsExpanded}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-emerald-500 shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span className="text-[13.5px] font-medium text-slate-800 dark:text-slate-200">
                    Prerequisites ({event.prerequisites.length})
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    isPrereqsExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isPrereqsExpanded && (
                <ul className="pb-4 pl-7.5 space-y-2 animate-in fade-in duration-150">
                  {event.prerequisites.map((prereq, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-[13px] text-slate-600 dark:text-slate-300"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Schedule & Speakers Section */}
          {event.schedule && event.schedule.length > 0 && (
            <div className="py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-[15px] font-bold text-[#14112C] dark:text-white">
                  Schedule &amp; Speakers
                </h3>
                <span className="text-xs font-medium text-slate-400">
                  {event.schedule.length} {event.schedule.length === 1 ? 'session' : 'sessions'}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {event.schedule.map((item, idx) => {
                  const matchedSpeaker = findSpeakerGuest(item.speaker);
                  const shortCompany = matchedSpeaker?.company
                    ? matchedSpeaker.company.replace(/\s+Systems$/i, '')
                    : null;

                  return (
                    <div
                      key={idx}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3"
                    >
                      <div className="w-[66px] shrink-0 pt-0.5">
                        <span
                          className={`text-xs font-semibold tabular-nums block ${
                            idx === 0
                              ? 'text-[#6342F5] dark:text-indigo-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.time}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <h4 className="text-[14px] font-bold text-[#14112C] dark:text-white leading-snug">
                          {item.title}
                        </h4>

                        {matchedSpeaker ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <img
                              src={matchedSpeaker.avatar}
                              alt={matchedSpeaker.name}
                              referrerPolicy="no-referrer"
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                            />
                            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                              {matchedSpeaker.name}
                            </span>
                            {matchedSpeaker.isHost ? (
                              <span className="px-2 py-0.5 rounded-full bg-[#F1EEFF] dark:bg-indigo-950/80 text-[#6342F5] dark:text-indigo-300 text-[10.5px] font-semibold">
                                Host
                              </span>
                            ) : shortCompany ? (
                              <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 text-[10.5px] font-medium">
                                {shortCompany}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          (item.description || item.speaker) && (
                            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              {item.description || `Facilitated by ${item.speaker}`}
                            </p>
                          )
                        )}

                        {matchedSpeaker && item.description && (
                          <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location / Platform + Calendar Action */}
          <div className="py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#F6F4FF] dark:bg-indigo-950/70 border border-[#EAE5FF] dark:border-indigo-900 text-[#6342F5] dark:text-indigo-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[13.5px] font-bold text-[#14112C] dark:text-white block leading-snug">
                  {event.venueOrPlatform}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                  {locationSubtext}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCalendar}
              className="px-3.5 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              {addedToCalendar ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                  <span className="text-emerald-600 dark:text-emerald-400">Added</span>
                </>
              ) : (
                <span>+ Calendar</span>
              )}
            </button>
          </div>

          {/* Hosted By Row */}
          <div className="pt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {event.hostAvatar ? (
                <img
                  src={event.hostAvatar}
                  alt={event.hostName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#F1EEFF] dark:bg-indigo-950 flex items-center justify-center font-bold text-[#6342F5] text-xs shrink-0">
                  {event.hostName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-[13.5px] text-slate-500 dark:text-slate-400 truncate">
                Hosted by{' '}
                <strong className="font-bold text-[#14112C] dark:text-white">
                  {event.hostName}
                </strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowHostProfile(true)}
              className="text-[13px] font-semibold text-[#6342F5] dark:text-indigo-400 hover:text-[#4F2EE0] dark:hover:text-indigo-300 transition-colors cursor-pointer shrink-0"
            >
              Profile
            </button>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="px-4 sm:px-5 py-3.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onToggleAttend(event.id)}
            className={`px-4 py-3 rounded-full text-[13.5px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] whitespace-nowrap border ${
              event.isRsvpd
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[#14112C] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-750'
                : 'bg-[#F6F4FF] dark:bg-indigo-950/60 border-[#DDD6FE] dark:border-indigo-800 text-[#5B35F8] dark:text-indigo-300 hover:bg-[#EEEAFF]'
            }`}
          >
            {event.isRsvpd ? (
              <>
                <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                <span>Attending</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Attend</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRoom(null);
              setShowLiveRoomSheet(true);
            }}
            className="flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-[#5B35F8] via-[#6B31F8] to-[#7C2BF7] hover:from-[#4F29EB] hover:to-[#6C1EE8] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_10px_24px_-8px_rgba(107,49,248,0.6)] transition-all cursor-pointer active:scale-[0.98] whitespace-nowrap"
          >
            <span>Join Live Room</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Join Live Room Bottom Sheet */}
        {showLiveRoomSheet && (
          <div
            className="absolute inset-0 z-20 flex flex-col justify-end bg-slate-950/45 backdrop-blur-[1.5px] animate-in fade-in duration-150"
            onClick={() => setShowLiveRoomSheet(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-t-[28px] px-5 pt-3 pb-6 shadow-[0_-16px_44px_-12px_rgba(15,23,42,0.28)] border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-6 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag Indicator */}
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-3.5" />

              {/* Status Pill & Close */}
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{activeRoom ? 'Connected Live' : 'Live Session Ready'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setShowLiveRoomSheet(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close Live Room Options"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Venue Title & Start Time */}
              <h3 className="text-[18px] font-bold text-[#14112C] dark:text-white tracking-tight mt-2.5 leading-snug">
                {event.venueOrPlatform}
              </h3>
              <p className="text-[13.5px] text-slate-500 dark:text-slate-400 mt-1">
                Starts {formatStartSubtitle(event.dateStr)}
              </p>

              <div className="border-t border-slate-100 dark:border-slate-800 my-4" />

              {!activeRoom ? (
                <div className="space-y-3">
                  {getRoomOptions().map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setActiveRoom(room.id)}
                      className="w-full text-left px-4 py-4 rounded-[18px] bg-[#F8F9FC] dark:bg-slate-800/70 hover:bg-[#F3F0FF] dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-[#D6CEFF] dark:hover:border-indigo-700 transition-all flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99]"
                    >
                      <div className="min-w-0">
                        <span className="text-[14.5px] font-bold text-[#14112C] dark:text-white block leading-snug">
                          {room.title}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                          {room.subtitle}
                        </span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#6342F5] dark:text-indigo-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-[18px] bg-[#F8F9FC] dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#F1EEFF] dark:bg-indigo-950 text-[#6342F5] dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[13.5px] font-bold text-[#14112C] dark:text-white block truncate">
                            {activeRoom === 'cronium'
                              ? 'Cronium Live Audio & Screen Room'
                              : 'Google Meet Live Room'}
                          </span>
                          <span className="text-[11.5px] text-emerald-600 dark:text-emerald-400 font-medium block">
                            {event.attendeesCount} engineers in stage • E2EE stream
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsMuted((prev) => !prev)}
                        className={`flex-1 py-2.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                          isMuted
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                            : 'bg-[#F1EEFF] dark:bg-indigo-950 border-[#D6CEFF] dark:border-indigo-700 text-[#5B35F8] dark:text-indigo-300'
                        }`}
                      >
                        {isMuted ? (
                          <>
                            <MicOff className="w-3.5 h-3.5" />
                            <span>Muted</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span>Mic Live</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setHandRaised((prev) => !prev)}
                        className={`flex-1 py-2.5 px-3 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                          handRaised
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <Hand className="w-3.5 h-3.5" />
                        <span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveRoom(null)}
                      className="flex-1 py-2.5 px-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      Switch Room
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveRoom(null);
                        setShowLiveRoomSheet(false);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Leave Stage
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Host Profile Quick Sheet */}
        {showHostProfile && (
          <div
            className="absolute inset-0 z-20 flex flex-col justify-end bg-slate-950/45 backdrop-blur-[1.5px] animate-in fade-in duration-150"
            onClick={() => setShowHostProfile(false)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-t-[28px] px-5 pt-3 pb-6 shadow-[0_-16px_44px_-12px_rgba(15,23,42,0.28)] border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-6 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-3.5" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {event.hostAvatar ? (
                    <img
                      src={event.hostAvatar}
                      alt={event.hostName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#EEEBFE] dark:ring-indigo-900 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#F1EEFF] flex items-center justify-center font-bold text-[#6342F5] shrink-0">
                      {event.hostName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[16px] font-bold text-[#14112C] dark:text-white truncate">
                        {event.hostName}
                      </h4>
                      <ShieldCheck className="w-4 h-4 text-[#6342F5] shrink-0" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {event.hostRole}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHostProfile(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer shrink-0"
                  aria-label="Close Host Profile"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 p-3.5 rounded-2xl bg-[#F8F9FC] dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-[#6342F5] shrink-0" />
                  <span>
                    {hostGuest?.company || event.communityName}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {event.hostBio ||
                    `Event host & verified community lead in ${event.communityName}. Hosting technical deep dives, live architecture sessions, and peer sprints.`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHostProfile(false)}
                className="w-full mt-4 py-2.5 rounded-full bg-[#F1EEFF] hover:bg-[#E5DFFF] dark:bg-indigo-950 dark:hover:bg-indigo-900 text-[#5B35F8] dark:text-indigo-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
