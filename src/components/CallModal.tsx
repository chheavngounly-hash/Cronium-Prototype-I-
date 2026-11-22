import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, PhoneOff, Shield, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { CallState } from '../types';
import { CURRENT_USER, resolveGenderMatchedAvatar } from '../data/mockData';

interface CallModalProps {
  call?: {
    active?: boolean;
    type: 'voice' | 'video';
    user: { name: string; avatar: string };
  } | null;
  onEndCall?: () => void;
  callType?: 'voice' | 'video';
  calleeName?: string;
  calleeAvatar?: string;
  calleeSubtitle?: string;
  isServerHuddle?: boolean;
  onClose?: (duration?: number) => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  call,
  onEndCall,
  callType,
  calleeName,
  calleeAvatar,
  calleeSubtitle,
  isServerHuddle,
  onClose,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const peerName = call?.user?.name || calleeName || 'Member';
  const rawPeerAvatar = call?.user?.avatar || calleeAvatar || '';
  const peerAvatar = resolveGenderMatchedAvatar(peerName, rawPeerAvatar);
  const currentType = call?.type || callType || 'voice';

  const handleEnd = () => {
    onEndCall?.();
    onClose?.(seconds);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isVideoCall = currentType === 'video' && !isVideoOff;

  // Minimized floating bubble
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white rounded-2xl p-3 shadow-2xl border border-indigo-500/40 flex items-center gap-3 animate-slideUp">
        <div className="relative">
          <img src={peerAvatar} alt={peerName} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-1 ring-slate-900" />
        </div>
        <div>
          <div className="text-xs font-bold leading-tight">{peerName}</div>
          <div className="text-[10px] text-emerald-400 font-mono">{formatDuration(seconds)}</div>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleEnd}
          className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
        >
          <PhoneOff className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md h-[560px] max-h-[90vh] bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between text-white">
        
        {/* Top Bar with Call Info */}
        <div className="flex items-center justify-between p-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] text-slate-300">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            title="Minimize call"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center Display: Audio call avatar pulse OR Video feed */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-6 text-center">
          {isVideoCall ? (
            <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden">
              <img
                src={peerAvatar}
                alt={peerName}
                className="w-full h-full object-cover"
              />
              {/* Subtle camera overlay & live status */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{peerName}</span>
                <span className="text-[10px] text-slate-300 font-normal">· HD 1080p Encrypted</span>
              </div>
              <div className="absolute bottom-4 left-4 font-mono text-xs text-white/90 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                {formatDuration(seconds)}
              </div>
              {/* Picture in picture self-view */}
              <div className="absolute top-4 right-4 w-24 h-32 rounded-2xl overflow-hidden ring-2 ring-white/30 shadow-xl bg-slate-800">
                <img
                  src={CURRENT_USER.avatar}
                  alt="Self"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded bg-black/60 text-white">You</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center">
              {/* Pulsing Avatar */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                <div className="absolute -inset-3 rounded-full bg-indigo-500/10 animate-pulse" />
                <img
                  src={peerAvatar}
                  alt={peerName}
                  className="relative w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500/50 shadow-2xl"
                />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight">{peerName}</h3>
                <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Connected · {currentType === 'video' ? 'HD Video Call' : 'HD Voice Call'}</span>
                </div>
                <div className="font-mono text-sm text-slate-400 font-semibold pt-1">
                  {formatDuration(seconds)}
                </div>
              </div>

              {/* Audio Waveform Animation */}
              <div className="flex items-center gap-1 h-6">
                <div className="w-1 bg-indigo-400 rounded-full h-3 animate-pulse" />
                <div className="w-1 bg-indigo-400 rounded-full h-6 animate-pulse" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 bg-indigo-400 rounded-full h-4 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-1 bg-indigo-400 rounded-full h-7 animate-pulse" style={{ animationDelay: '0.15s' }} />
                <div className="w-1 bg-indigo-400 rounded-full h-3 animate-pulse" style={{ animationDelay: '0.25s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Messenger-style Call Action Controls Bar */}
        <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center gap-4 z-10">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition-all ${
              isMuted ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-3.5 rounded-full transition-all ${
              isVideoOff ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 rounded-full transition-all ${
              !isSpeakerOn ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isSpeakerOn ? 'Speaker Off' : 'Speaker On'}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* End Call Button (Big Red Messenger style) */}
          <button
            onClick={handleEnd}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-lg shadow-rose-600/40 transition-all cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};
