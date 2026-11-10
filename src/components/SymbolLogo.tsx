import React, { useState } from 'react';

interface SymbolLogoProps {
  src?: string;
  symbol: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-4 h-4 text-[9px]',
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-xs font-semibold',
  lg: 'w-10 h-10 text-sm font-bold',
  xl: 'w-12 h-12 text-base font-bold',
};

// Generate deterministic background color based on symbol
function getBgColor(symbol: string): string {
  const colors = [
    'bg-blue-600',
    'bg-indigo-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-purple-600',
    'bg-rose-600',
    'bg-cyan-600',
    'bg-teal-600',
  ];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export const SymbolLogo: React.FC<SymbolLogoProps> = ({
  src,
  symbol,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;
  const initial = symbol.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'TV';

  if (!src || hasError) {
    return (
      <div
        className={`${sizeClass} ${getBgColor(symbol)} rounded-full flex items-center justify-center text-white shrink-0 shadow-xs select-none ${className}`}
        title={symbol}
      >
        {initial}
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden shrink-0 bg-[#2a2e39] dark:bg-[#2a2e39] flex items-center justify-center p-0.5 select-none ${className}`}>
      <img
        src={src}
        alt={`${symbol} logo`}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className="w-full h-full object-contain rounded-full"
      />
    </div>
  );
};
