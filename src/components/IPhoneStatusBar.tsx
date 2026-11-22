import React from 'react';

interface IPhoneStatusBarProps {
  bgClassName?: string;
}

export const IPhoneStatusBar: React.FC<IPhoneStatusBarProps> = ({
  bgClassName = 'bg-transparent',
}) => {
  return (
    <div
      className={`h-10 px-6 flex items-center justify-between shrink-0 z-30 select-none text-slate-900 dark:text-white ${bgClassName}`}
    >
      {/* Time: 9:41 */}
      <div className="w-16 flex items-center justify-start">
        <span className="text-[13px] font-semibold tracking-tight font-sans">
          9:41
        </span>
      </div>

      {/* Dynamic Island: iPhone 17 Pro Pill */}
      <div className="flex-1 flex justify-center">
        <div className="w-[108px] h-[28px] bg-black rounded-full flex items-center justify-between px-3 shadow-xs">
          {/* Subtle camera lens & sensor indication */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] ml-auto border border-[#262626]" />
        </div>
      </div>

      {/* Status Icons: Cellular, Wi-Fi, Battery */}
      <div className="w-16 flex items-center justify-end gap-1.5 text-slate-900 dark:text-white">
        {/* 4-Bar Cellular Signal */}
        <svg
          width="16"
          height="11"
          viewBox="0 0 16 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <rect x="0.5" y="7.5" width="2.5" height="3.5" rx="0.75" fill="currentColor" />
          <rect x="4.5" y="5" width="2.5" height="6" rx="0.75" fill="currentColor" />
          <rect x="8.5" y="2.5" width="2.5" height="8.5" rx="0.75" fill="currentColor" />
          <rect x="12.5" y="0" width="2.5" height="11" rx="0.75" fill="currentColor" />
        </svg>

        {/* Wi-Fi Icon */}
        <svg
          width="15"
          height="11"
          viewBox="0 0 15 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          <path
            d="M7.5 10.5C8.05228 10.5 8.5 10.0523 8.5 9.5C8.5 8.94772 8.05228 8.5 7.5 8.5C6.94772 8.5 6.5 8.94772 6.5 9.5C6.5 10.0523 6.94772 10.5 7.5 10.5Z"
            fill="currentColor"
          />
          <path
            d="M4.2 6.2C6 4.4 9 4.4 10.8 6.2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M1.5 3.5C4.8 0.2 10.2 0.2 13.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>

        {/* Battery Indicator (iPhone outline + terminal cap + fill) */}
        <svg
          width="24"
          height="11"
          viewBox="0 0 24 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          {/* Battery Outline */}
          <rect
            x="0.75"
            y="0.75"
            width="20"
            height="9.5"
            rx="3.25"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          {/* Battery Level Fill */}
          <rect
            x="2.25"
            y="2.25"
            width="14.5"
            height="6.5"
            rx="2"
            fill="currentColor"
          />
          {/* Terminal Cap */}
          <path
            d="M22.5 3.5C23.1 3.8 23.5 4.4 23.5 5.5C23.5 6.6 23.1 7.2 22.5 7.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
