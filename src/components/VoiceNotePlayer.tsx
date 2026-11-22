import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Lock, Volume2 } from 'lucide-react';
import { audioRecorderService } from '../services/audioRecorder';

interface VoiceNotePlayerProps {
  audioUrl?: string;
  duration?: number;
  waveform?: number[];
  isMe?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  duration = 8,
  waveform,
  isMe = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  // Default fallback waveform if none provided (28 bars)
  const defaultWaveform = [
    0.25, 0.4, 0.65, 0.85, 0.5, 0.35, 0.7, 0.95, 0.8, 0.6, 0.45, 0.75,
    0.9, 0.7, 0.5, 0.65, 0.85, 0.4, 0.3, 0.6, 0.8, 0.75, 0.5, 0.35,
    0.45, 0.65, 0.4, 0.25,
  ];

  const bars = waveform && waveform.length > 0 ? waveform : defaultWaveform;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      setIsPlaying(false);
    } else {
      if (audioUrl) {
        audioRef.current = audioRecorderService.play(audioUrl, playbackRate, () => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (timerRef.current) window.clearInterval(timerRef.current);
        });

        // Set current time if resuming
        if (audioRef.current && currentTime > 0) {
          audioRef.current.currentTime = currentTime;
        }
      }

      setIsPlaying(true);
      const start = Date.now() - currentTime * 1000;

      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - start) / 1000;
        if (elapsed >= duration) {
          setIsPlaying(false);
          setCurrentTime(0);
          if (timerRef.current) window.clearInterval(timerRef.current);
        } else {
          setCurrentTime(elapsed);
        }
      }, 100);
    }
  };

  const handleSeek = (index: number) => {
    const fraction = index / bars.length;
    const seekTime = fraction * duration;
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const togglePlaybackRate = () => {
    const rates = [1.0, 1.5, 2.0];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="flex flex-col gap-1.5 w-64 sm:w-72 select-none">
      {/* Top row: Play/Pause button + Waveform + Speed control */}
      <div className="flex items-center gap-2.5">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm cursor-pointer ${
            isMe
              ? 'bg-white text-indigo-600 hover:bg-indigo-50'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
          title={isPlaying ? 'Pause voice message' : 'Play voice message'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Visualization Bars */}
        <div className="flex-1 flex items-center gap-[3px] h-8 cursor-pointer py-1">
          {bars.map((bar, index) => {
            const barProgress = index / bars.length;
            const isPassed = barProgress <= progress;
            const heightPercent = Math.max(16, Math.min(100, Math.round(bar * 100)));

            return (
              <div
                key={index}
                onClick={() => handleSeek(index)}
                className="flex-1 h-full flex items-center justify-center group/bar"
              >
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-full transition-all duration-150 ${
                    isMe
                      ? isPassed
                        ? 'bg-white shadow-xs'
                        : 'bg-indigo-300/60 dark:bg-indigo-400/40 hover:bg-white/80'
                      : isPassed
                      ? 'bg-indigo-600 dark:bg-indigo-400 shadow-xs'
                      : 'bg-slate-300 dark:bg-slate-700 hover:bg-indigo-400'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Speed Toggle (1x, 1.5x, 2x) */}
        <button
          onClick={togglePlaybackRate}
          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold tracking-tight shrink-0 transition-colors ${
            isMe
              ? 'bg-white/20 hover:bg-white/30 text-white'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
          title="Playback speed"
        >
          {playbackRate}x
        </button>
      </div>

      {/* Bottom meta row: Timestamps & Audio tag */}
      <div
        className={`flex items-center justify-between text-[10px] font-mono px-0.5 ${
          isMe ? 'text-indigo-100' : 'text-slate-400'
        }`}
      >
        <div className="flex items-center gap-1 font-semibold">
          <Volume2 className="w-3 h-3 opacity-80" />
          <span>{isPlaying ? formatTime(currentTime) : formatTime(duration)}</span>
        </div>

        <span className="flex items-center gap-1 text-[9px] opacity-75">
          <Lock className="w-2.5 h-2.5" />
          <span>Encrypted Voice</span>
        </span>
      </div>
    </div>
  );
};
