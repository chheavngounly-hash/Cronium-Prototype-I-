import React from 'react';
import croniumAppLogo from '../assets/images/cronium_app_logo_1791151735037.jpg';

export interface CroniumLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | string;
  variant?: 'app-icon' | 'badge' | 'default' | string;
}

export const CroniumLogo: React.FC<CroniumLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap: Record<string, string> = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const resolvedSize = sizeMap[size] || size || 'w-9 h-9';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${resolvedSize} ${className}`}
      title="Cronium"
    >
      <svg
        viewBox="0 0 1024 1024"
        className="w-full h-full block select-none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {/* Sky-blue rounded icon frame matching user attachment */}
        <rect x="8" y="8" width="1008" height="1008" rx="236" fill="#52B6FF" />
        <rect x="98" y="98" width="828" height="828" rx="156" fill="#FFFFFF" />

        {/* The Bold Stylized Cronium / Instanc Emblem */}
        <g fill="#171717">
          {/* Left Main Wing with Triangle Cutout */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 194 172 C 236 270 298 450 220 760 L 315 628 L 352 788 L 514 456 L 470 428 C 376 322 284 232 194 172 Z M 288 288 C 346 342 418 412 472 454 L 418 528 L 326 626 C 334 502 318 382 288 288 Z"
          />

          {/* Top-Right Wedge Wingtip */}
          <path d="M 410 278 L 750 338 C 675 382 610 410 546 418 Z" />

          {/* Lower-Right Sweeping Wing Swoop */}
          <path d="M 470 540 C 575 500 710 472 876 486 C 715 540 545 640 352 788 C 390 705 440 595 470 540 Z" />
        </g>
      </svg>
    </div>
  );
};
