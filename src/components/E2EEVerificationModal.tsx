import React, { useState } from 'react';
import { ShieldCheck, Lock, QrCode, CheckCircle2, Copy, X, Key, Terminal } from 'lucide-react';
import { User } from '../types';

interface E2EEVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactUser: User;
  sampleCiphertext?: {
    ciphertext: string;
    iv: string;
    algorithm: string;
  };
}

export const E2EEVerificationModal: React.FC<E2EEVerificationModalProps> = ({
  isOpen,
  onClose,
  contactUser,
  sampleCiphertext,
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [tab, setTab] = useState<'fingerprint' | 'cipher'>('fingerprint');

  if (!isOpen) return null;

  const safetyNumber = contactUser.safetyNumber || '48192 - 38102 - 19823 - 90182 - 44182 - 77192';

  const handleCopy = () => {
    navigator.clipboard?.writeText?.(safetyNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-left relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                End-to-End Encryption
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Verified with {contactUser.name}
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

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl my-4">
          <button
            onClick={() => setTab('fingerprint')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'fingerprint'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Safety Number
          </button>
          <button
            onClick={() => setTab('cipher')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'cipher'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-500" /> WebCrypto Inspector
          </button>
        </div>

        {tab === 'fingerprint' ? (
          <div>
            {/* QR Code and Safety Number */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
              {/* Simulated QR Code SVG */}
              <div className="w-36 h-36 bg-white p-3 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center mb-3">
                <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-1 p-1">
                  {[...Array(36)].map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30
                          ? 'bg-slate-900'
                          : i % 5 === 0
                          ? 'bg-indigo-600'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                Scan QR or compare 60-digit fingerprint
              </span>

              {/* Safety Number Display */}
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 w-full flex items-center justify-between">
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 tracking-wider">
                  {safetyNumber}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  title="Copy safety number"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/40 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  {isVerified ? 'Marked as Verified' : 'Unverified Identity'}
                </span>
              </div>
              <button
                onClick={() => setIsVerified(!isVerified)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {isVerified ? 'Change' : 'Verify'}
              </button>
            </div>
          </div>
        ) : (
          /* Cipher Inspector */
          <div className="space-y-3 mb-4">
            <div className="p-3 bg-slate-950 rounded-2xl text-emerald-400 font-mono text-[11px] overflow-x-auto space-y-2">
              <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>ALGORITHM:</span>
                <span className="text-cyan-400">AES-GCM (256-bit)</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">INITIALIZATION VECTOR (IV):</span>
                <span className="text-amber-300 break-all">
                  {sampleCiphertext?.iv || 'q8K+2A/vH3L9z9Xk'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">CIPHERTEXT (BASE64):</span>
                <span className="text-slate-200 break-all">
                  {sampleCiphertext?.ciphertext ||
                    '7F+9xK2A/vH3L9z9XkMwO4Q==::cronium_sig_99281920147'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400 border-t border-slate-800 pt-1">
                <span>RATINGS:</span>
                <span className="text-emerald-400">P-256 ECDH Key Exchange</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Messages are encrypted on your local device before transmission. No server or intermediate router can inspect message content.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
