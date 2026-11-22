import React, { useState } from 'react';
import { Fingerprint, Lock, ShieldCheck, KeyRound, CheckCircle2, Sparkles } from 'lucide-react';
import { biometricsService } from '../services/biometrics';
import { notificationService } from '../services/notifications';

interface BiometricModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  canDismiss?: boolean;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
  title = 'Biometric Authentication',
  subtitle = 'Verify your identity to access encrypted Cronium conversations',
  canDismiss = false,
}) => {
  const [scanning, setScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pinDigits, setPinDigits] = useState<string>('');
  const [pinError, setPinError] = useState(false);

  if (!isOpen) return null;

  const handleBiometricScan = async () => {
    if (scanning || scanSuccess) return;
    setScanning(true);

    try {
      const res = await biometricsService.authenticateBiometric();
      if (res.success) {
        setScanning(false);
        setScanSuccess(true);
        notificationService.playSentChime();
        setTimeout(() => {
          setScanSuccess(false);
          onSuccess();
        }, 700);
      } else {
        setScanning(false);
      }
    } catch {
      setScanning(false);
    }
  };

  const handlePinInput = (num: number) => {
    if (pinDigits.length >= 4) return;
    const newPin = pinDigits + num.toString();
    setPinDigits(newPin);
    setPinError(false);

    if (newPin.length === 4) {
      const saved = biometricsService.getSavedPin();
      if (newPin === saved || newPin === '1234') {
        setScanSuccess(true);
        notificationService.playSentChime();
        setTimeout(() => {
          setScanSuccess(false);
          setPinDigits('');
          setShowPin(false);
          onSuccess();
        }, 500);
      } else {
        setPinError(true);
        setTimeout(() => {
          setPinDigits('');
          setPinError(false);
        }, 800);
      }
    }
  };

  const handlePinDelete = () => {
    setPinDigits((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Security badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>E2EE Hardware Vault</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-display">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 px-2">
          {subtitle}
        </p>

        {!showPin ? (
          <div className="flex flex-col items-center">
            {/* Interactive Biometric Sensor Circle */}
            <button
              onClick={handleBiometricScan}
              disabled={scanning || scanSuccess}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none ${
                scanSuccess
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : scanning
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 ring-4 ring-indigo-400/30 ring-offset-2 dark:ring-offset-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700/80 active:scale-95'
              }`}
              title="Click or tap to scan Face ID / Touch ID"
            >
              {/* Animated scan wave */}
              {scanning && (
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-60 pointer-events-none" />
              )}
              {scanSuccess ? (
                <CheckCircle2 className="w-14 h-14 animate-in zoom-in-75 duration-200" />
              ) : (
                <Fingerprint className={`w-14 h-14 ${scanning ? 'animate-pulse' : ''}`} />
              )}
            </button>

            <div className="mt-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              {scanSuccess ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 justify-center">
                  <Sparkles className="w-3.5 h-3.5" /> Identity Verified!
                </span>
              ) : scanning ? (
                <span className="text-indigo-600 dark:text-indigo-400 animate-pulse">
                  Scanning Touch ID / Face ID sensor...
                </span>
              ) : (
                <span>Tap fingerprint or sensor to unlock</span>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2 w-full">
              <button
                onClick={handleBiometricScan}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Scan Biometrics (Face ID / Touch ID)
              </button>

              <button
                onClick={() => setShowPin(true)}
                className="w-full py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Use PIN Code instead (Default: 1234)
              </button>
            </div>
          </div>
        ) : (
          /* PIN keypad */
          <div className="flex flex-col items-center">
            {/* PIN indicators */}
            <div className={`flex justify-center gap-3 mb-6 ${pinError ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 ${
                    idx < pinDigits.length
                      ? 'bg-indigo-600 border-indigo-600 scale-110'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                />
              ))}
            </div>

            {pinError && (
              <p className="text-xs text-rose-500 font-medium mb-3">Incorrect PIN. Try 1234.</p>
            )}

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[220px] mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handlePinInput(num)}
                  className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-lg font-semibold hover:bg-indigo-50 dark:hover:bg-slate-700 active:scale-95 transition-transform"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setShowPin(false)}
                className="h-12 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium flex items-center justify-center"
              >
                Back
              </button>
              <button
                onClick={() => handlePinInput(0)}
                className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-lg font-semibold hover:bg-indigo-50 dark:hover:bg-slate-700 active:scale-95 transition-transform"
              >
                0
              </button>
              <button
                onClick={handlePinDelete}
                className="h-12 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-medium flex items-center justify-center"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="mt-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
