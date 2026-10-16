import React from 'react';

interface ArdakLogoProps {
  variant?: 'full' | 'horizontal' | 'icon' | 'footer';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

/**
 * Official Ardak Brand Emblem (Icon)
 * Represents the agricultural parcel, curved pathway, green crop and seed
 */
export const ArdakEmblem: React.FC<{ className?: string; size?: number | string }> = ({
  className = 'w-10 h-10',
}) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* 1. Main Left Dark Green Parcel (Shield Left & Upper) */}
      <path
        d="M 64 56 
           H 116 
           V 88 
           C 106 94, 94 100, 64 104 
           V 56 
           Z"
        fill="#17432E"
      />

      {/* 2. Lower Left Dark Green Parcel (Shield Bottom-Left) */}
      <path
        d="M 64 112 
           C 88 108, 102 101, 110 94 
           C 106 116, 96 138, 76 148 
           C 71 143, 64 130, 64 112 
           Z"
        fill="#17432E"
      />
      {/* Combined smoothly: Left shield block with curved arc cutout */}
      <path
        d="M 64 56 
           H 116 
           V 92 
           L 109 105 
           C 100 125, 87 141, 64 148 
           V 56 
           Z"
        fill="#17432E"
      />
      {/* Precision path for Left Green Section */}
      <path
        d="M 64 56
           H 116
           V 89
           C 98 94, 80 99, 64 104
           V 56
           Z"
        fill="#17432E"
      />
      <path
        d="M 64 113
           C 80 108, 97 101, 107 94
           L 95 125
           C 87 141, 76 148, 64 148
           C 64 148, 64 125, 64 113
           Z"
        fill="#17432E"
      />

      {/* RE-RENDER: Clean Master Precision Vector matching the official brand logo */}
      <g>
        {/* Top-Left & Mid-Left Green Segment */}
        <path
          d="M 64 56 
             H 116 
             V 89.5 
             C 96 95, 80 100.5, 64 105 
             V 56 Z"
          fill="#17432E"
        />

        {/* Bottom-Left Green Segment with smooth curved bottom */}
        <path
          d="M 64 114 
             C 80 109, 97 103, 108 95 
             L 96 128 
             C 89 143, 76 148, 64 148 
             V 114 Z"
          fill="#17432E"
        />

        {/* Tall Right Green Sprout / Alif Pillar */}
        <path
          d="M 130 96 
             V 38 
             C 130 38, 137 28, 142 28 
             H 142.5 
             V 104 
             C 138 100, 133 97, 130 96 
             Z"
          fill="#17432E"
        />

        {/* Bottom-Right Soft Sand/Beige Parcel */}
        <path
          d="M 116 102 
             L 104 148 
             C 122 147, 137 136, 142 110 
             C 134 106, 124 103, 116 102 
             Z"
          fill="#DDD6C6"
        />

        {/* Terracotta Circular Seed / Sun Dot */}
        <circle cx="123" cy="94" r="4.2" fill="#C0623C" />
      </g>
    </svg>
  );
};

/**
 * Exact Vector Logo reproducing the uploaded brand logo image
 * High-resolution viewBox (0 0 500 500)
 */
export const ArdakLogoIcon: React.FC<{ className?: string; inverted?: boolean }> = ({
  className = 'w-12 h-12',
  inverted = false,
}) => {
  return (
    <svg
      viewBox="0 0 300 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(45, 25)">
        {/* 1. Top-Left Green Block */}
        <path
          d="M 30 50 
             H 116 
             V 96 
             C 84 103, 56 112, 30 119 
             V 50 
             Z"
          fill={inverted ? '#22c55e' : '#17432E'}
        />

        {/* 2. Bottom-Left Green Curved Segment */}
        <path
          d="M 30 132 
             C 58 124, 86 114, 105 103 
             L 90 148 
             C 74 172, 54 179, 30 179 
             V 132 
             Z"
          fill={inverted ? '#22c55e' : '#17432E'}
        />

        {/* 3. Tall Right Vertical Sprout / Alif */}
        <path
          d="M 138 102 
             V 38 
             C 138 38, 145 22, 155 22 
             H 156 
             V 112 
             C 150 108, 144 105, 138 102 
             Z"
          fill={inverted ? '#22c55e' : '#17432E'}
        />

        {/* 4. Bottom-Right Sand/Beige Parcel */}
        <path
          d="M 119 110 
             L 100 179 
             C 130 178, 150 158, 156 120 
             C 144 115, 131 112, 119 110 
             Z"
          fill={inverted ? '#fef3c7' : '#DDD6C6'}
        />

        {/* 5. Terracotta Accent Dot (The Seed / Sun) */}
        <circle cx="127" cy="98" r="6.8" fill="#C0623C" />
      </g>
    </svg>
  );
};

export const ArdakLogo: React.FC<ArdakLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  // Sizing map
  const sizeMap = {
    sm: {
      icon: 'w-7 h-7 sm:w-8 sm:h-8',
      title: 'text-base sm:text-lg',
      sub: 'text-[9px] sm:text-[10px]',
      gap: 'gap-2',
    },
    md: {
      icon: 'w-9 h-9 sm:w-11 sm:h-11',
      title: 'text-lg sm:text-xl',
      sub: 'text-[10px] sm:text-[11px]',
      gap: 'gap-2.5',
    },
    lg: {
      icon: 'w-12 h-12 sm:w-14 sm:h-14',
      title: 'text-2xl sm:text-3xl',
      sub: 'text-xs sm:text-sm',
      gap: 'gap-3',
    },
    xl: {
      icon: 'w-20 h-20 sm:w-24 sm:h-24',
      title: 'text-3xl sm:text-4xl',
      sub: 'text-sm sm:text-base',
      gap: 'gap-4',
    },
  }[size];

  // 1. Icon Only Variant
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <ArdakLogoIcon className={sizeMap.icon} />
      </div>
    );
  }

  // 2. Full Stacked Variant (Centered like the official logo card)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center justify-center text-center ${className}`}>
        <ArdakLogoIcon className={sizeMap.icon} />
        <div className="mt-2 flex flex-col items-center">
          <div className="flex items-center justify-center font-black text-[#14281D] tracking-tight text-2xl sm:text-3xl leading-none">
            <span className="text-[#C0623C] inline-block -ml-0.5">أ</span>
            <span>رضك</span>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-[#C0623C] tracking-[0.25em] mt-1 uppercase font-sans">
            A r d a k
          </span>
          {showSubtitle && (
            <span className="text-[10px] text-[#527963] font-medium mt-1">
              سوق الأراضي والمزارع الزراعية
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. Footer Variant (On Dark Green Background)
  if (variant === 'footer') {
    return (
      <div className={`flex items-center ${sizeMap.gap} text-right ${className}`} dir="rtl">
        <div className="p-1 rounded-xl bg-white/10 backdrop-blur-xs shrink-0 border border-white/15">
          <ArdakLogoIcon className={sizeMap.icon} inverted />
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-white text-xl sm:text-2xl leading-tight">
              أرضك
            </span>
            <span className="font-bold text-[#fde047] text-xs sm:text-sm font-sans tracking-widest">
              Ardak
            </span>
          </div>
          {showSubtitle && (
            <span className="text-[11px] text-[#9eb4a5] font-medium leading-tight">
              سوق الأراضي والمزارع في مصر
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. Horizontal Variant (Default: Header Navigation)
  return (
    <div className={`flex items-center ${sizeMap.gap} text-right group ${className}`} dir="rtl">
      {/* Brand Icon Shield */}
      <div className="shrink-0 group-hover:scale-105 transition-transform duration-200">
        <ArdakLogoIcon className={sizeMap.icon} />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col text-right">
        <div className="flex items-baseline gap-1.5 leading-none">
          {/* Arabic Brand with orange hamza */}
          <span className="font-black text-[#14281d] text-xl sm:text-2xl tracking-tight">
            أرضك
          </span>
          {/* English Brand Subtitle */}
          <span className="font-bold text-[#C0623C] text-xs sm:text-sm tracking-wider font-sans uppercase">
            Ardak
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] sm:text-[11px] text-[#527963] font-semibold leading-tight mt-0.5">
            سوق الأراضي والمزارع في مصر
          </span>
        )}
      </div>
    </div>
  );
};
