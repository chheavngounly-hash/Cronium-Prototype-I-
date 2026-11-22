import React, { useState } from 'react';
import { Smartphone, Laptop, Tablet, RefreshCw, CheckCircle2, Shield, X, Wifi } from 'lucide-react';
import { syncService } from '../services/sync';
import { SyncDevice } from '../types';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({ isOpen, onClose }) => {
  const [devices, setDevices] = useState<SyncDevice[]>(syncService.getConnectedDevices());
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  if (!isOpen) return null;

  const handleForceSync = () => {
    setSyncing(true);
    syncService.broadcast('DEVICE_PING', { ping: Date.now() });

    setTimeout(() => {
      setSyncing(false);
      setLastSyncTime('Just now');
      setDevices(syncService.getConnectedDevices());
    }, 900);
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop':
        return <Laptop className="w-5 h-5 text-indigo-500" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-sky-500" />;
      default:
        return <Smartphone className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-left relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Cross-Platform Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-500" /> Real-time peer broadcast active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sync Status Banner */}
        <div className="my-4 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
              All messages & reactions synced
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">{lastSyncTime}</span>
        </div>

        {/* Device List */}
        <div className="space-y-2.5 mb-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Connected Devices ({devices.length})
          </span>
          {devices.map((device) => (
            <div
              key={device.id}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                device.isCurrent
                  ? 'bg-slate-50 dark:bg-slate-800/80 border-indigo-200 dark:border-indigo-800/60'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {device.name}
                    </span>
                    {device.isCurrent && (
                      <span className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                        This device
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {device.os} · {device.lastSync}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px]">Synced</span>
              </div>
            </div>
          ))}
        </div>

        {/* Security Info */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 mb-5">
          <Shield className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p>
            Cronium uses Multi-Device Key Ratchet sync. Message history is replicated across your authenticated clients with hardware-isolated keys.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleForceSync}
          disabled={syncing}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing across devices...' : 'Force Sync Now'}
        </button>
      </div>
    </div>
  );
};
