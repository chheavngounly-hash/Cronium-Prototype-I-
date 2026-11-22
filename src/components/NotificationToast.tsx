import React, { useEffect, useState } from 'react';
import { Bell, X, Shield, MessageSquare, Calendar } from 'lucide-react';
import { notificationService } from '../services/notifications';

interface ToastData {
  id: string;
  title: string;
  body: string;
  avatar?: string;
  chatId?: string;
  type?: 'comment' | 'event' | 'message' | 'system';
}

interface NotificationToastProps {
  onSelectChat?: (chatId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onSelectChat }) => {
  const [toast, setToast] = useState<ToastData | null>(null);

  useEffect(() => {
    let dismissTimer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = notificationService.subscribe((data) => {
      const newToast = {
        id: Math.random().toString(),
        ...data,
      };
      setToast(newToast);

      if (dismissTimer) {
        clearTimeout(dismissTimer);
      }
      // Auto dismiss after 4.5 seconds
      dismissTimer = setTimeout(() => {
        setToast((current) => (current?.id === newToast.id ? null : current));
      }, 4500);
    });

    return () => {
      if (dismissTimer) clearTimeout(dismissTimer);
      unsubscribe();
    };
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-3 pointer-events-none animate-in slide-in-from-top-6 duration-300">
      <div
        onClick={() => {
          if (toast.chatId && onSelectChat) {
            onSelectChat(toast.chatId);
          }
          setToast(null);
        }}
        className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-indigo-100 dark:border-indigo-900/40 p-3 rounded-2xl shadow-xl shadow-indigo-950/10 flex items-center gap-3 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
      >
        <div className="relative shrink-0">
          {toast.avatar ? (
            <img
              src={toast.avatar}
              alt={toast.title}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              {toast.type === 'comment' ? (
                <MessageSquare className="w-5 h-5" />
              ) : toast.type === 'event' ? (
                <Calendar className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>
          )}
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {toast.title}
            </span>
            {toast.type === 'comment' ? (
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-0.5 shrink-0 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.2 rounded-full">
                <MessageSquare className="w-2.5 h-2.5" /> Comment
              </span>
            ) : toast.type === 'event' ? (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 shrink-0 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full">
                <Calendar className="w-2.5 h-2.5" /> Event
              </span>
            ) : (
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-0.5 shrink-0">
                <Shield className="w-2.5 h-2.5" /> E2EE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
            {toast.body}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setToast(null);
          }}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
