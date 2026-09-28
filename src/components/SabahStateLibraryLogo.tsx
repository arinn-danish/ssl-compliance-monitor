import React from 'react';

interface SabahStateLibraryLogoProps {
  variant?: 'full' | 'compact' | 'icon-only';
  className?: string;
  maxHeight?: number; // default ~44px (fits optimal 40px-50px requirement)
}

export const SabahStateLibraryLogo: React.FC<SabahStateLibraryLogoProps> = ({
  variant = 'full',
  className = '',
  maxHeight = 44
}) => {
  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      style={{ maxHeight: `${maxHeight}px` }}
    >
      {/* Emblem Graphic: Mount Kinabalu + Knowledge Pages + State Blue & Amber Crest */}
      <svg
        viewBox="0 0 100 100"
        className="shrink-0 transition-transform hover:scale-105 duration-200 drop-shadow-sm"
        style={{ width: `${maxHeight}px`, height: `${maxHeight}px` }}
        aria-label="Sabah State Library Emblem"
      >
        <defs>
          <linearGradient id="sslSkyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="60%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="sslMountainGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="sslGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="sslPageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <filter id="sslShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Outer Circular Medallion */}
        <circle cx="50" cy="50" r="48" fill="url(#sslSkyGrad)" stroke="#38bdf8" strokeWidth="2.5" />

        {/* Decorative Golden Outer Ring Accent */}
        <circle cx="50" cy="50" r="44" fill="none" stroke="url(#sslGoldGrad)" strokeWidth="1" strokeDasharray="2 1.5" opacity="0.6" />

        {/* Radiating Rays of Dawn / Knowledge */}
        <g stroke="#ffffff" strokeWidth="0.8" opacity="0.25">
          <line x1="50" y1="12" x2="50" y2="28" />
          <line x1="32" y1="18" x2="38" y2="30" />
          <line x1="68" y1="18" x2="62" y2="30" />
          <line x1="20" y1="32" x2="32" y2="38" />
          <line x1="80" y1="32" x2="68" y2="38" />
        </g>

        {/* Iconic Mount Kinabalu Peaks (Silhouette of Sabah's Crown Jewel) */}
        <path
          d="M18 64 L34 38 L42 46 L50 26 L62 48 L70 42 L82 64 Z"
          fill="url(#sslMountainGrad)"
          filter="url(#sslShadow)"
        />

        {/* Snow/Light Peak Highlights */}
        <path
          d="M50 26 L46 34 L54 34 Z M34 38 L31 43 L38 43 Z M70 42 L67 47 L74 47 Z"
          fill="#ffffff"
          opacity="0.85"
        />

        {/* Open Book Foundation (Statutory & Knowledge Repository) */}
        <g filter="url(#sslShadow)">
          {/* Left Page */}
          <path
            d="M20 70 C32 66, 44 68, 49 75 L49 84 C43 78, 31 76, 20 79 Z"
            fill="url(#sslPageGrad)"
            stroke="#0284c7"
            strokeWidth="0.8"
          />
          {/* Right Page */}
          <path
            d="M80 70 C68 66, 56 68, 51 75 L51 84 C57 78, 69 76, 80 79 Z"
            fill="url(#sslPageGrad)"
            stroke="#0284c7"
            strokeWidth="0.8"
          />
          {/* Book Spine Center */}
          <path
            d="M49 75 L50 85 L51 75 Z"
            fill="url(#sslGoldGrad)"
          />
          {/* Page Lines (Knowledge / Enactment Law) */}
          <line x1="25" y1="72" x2="43" y2="70" stroke="#94a3b8" strokeWidth="0.7" />
          <line x1="25" y1="75" x2="43" y2="73" stroke="#94a3b8" strokeWidth="0.7" />
          <line x1="57" y1="70" x2="75" y2="72" stroke="#94a3b8" strokeWidth="0.7" />
          <line x1="57" y1="73" x2="75" y2="75" stroke="#94a3b8" strokeWidth="0.7" />
        </g>

        {/* Sabah State Star / Diamond Emblem at Base */}
        <polygon
          points="50,86 52,90 56,90 53,92 54,96 50,93 46,96 47,92 44,90 48,90"
          fill="url(#sslGoldGrad)"
        />
      </svg>

      {/* Typography: Bilingual Official Department Branding */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center leading-tight">
          <span className="text-[13px] font-black uppercase tracking-wider text-slate-900 dark:text-white font-sans">
            Perpustakaan Negeri Sabah
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tracking-wide uppercase">
              Sabah State Library
            </span>
            {variant === 'full' && (
              <>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">•</span>
                <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                  Enakmen 1988
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
