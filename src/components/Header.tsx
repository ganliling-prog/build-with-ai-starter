import React from 'react';
import { useMarket, ScreenType, CurrencyType } from '../context/MarketContext';
import {
  Search,
  Bookmark,
  Sun,
  Moon,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    watchlist,
    toggleWatchlist,
    isWatchlistOpen,
    setIsSearchOpen,
    theme,
    toggleTheme,
    currency,
    setCurrency,
    isLiveTicking,
    toggleLiveTicking,
  } = useMarket();

  const navItems: { id: ScreenType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'indices', label: 'Indices' },
    { id: 'futures', label: 'Futures' },
    { id: 'bonds', label: 'Bonds' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'screener', label: 'Screener' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#131722]/95 dark:bg-[#131722]/95 backdrop-blur-md border-b border-[#2a2e39] dark:border-[#2a2e39] text-[#d1d4dc] transition-colors">
      <div className="max-w-[1720px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Single text element wordmark with iconic TradingView styling */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveScreen('overview')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            {/* Iconic TradingView Geometric Symbol Logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2962ff] to-[#1e53e5] flex items-center justify-center shadow-md shadow-[#2962ff]/20 group-hover:brightness-110 transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <rect x="4" y="5" width="4" height="14" rx="1" fill="currentColor" fillOpacity="0.8" />
                <rect x="10" y="9" width="4" height="10" rx="1" fill="currentColor" />
                <rect x="16" y="3" width="4" height="16" rx="1" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white dark:text-white leading-tight">
                TradingView
              </span>
              <span className="text-[10px] uppercase font-semibold text-[#787b86] tracking-wider leading-none">
                Markets
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean tabs) */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#2a2e39] text-[#2962ff] dark:text-[#2962ff] shadow-xs'
                    : 'text-[#9598a1] hover:text-white hover:bg-[#1e222d]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Essential Controls (Search, Live toggle, Watchlist, Currency, Theme) */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          
          {/* Quick Search Button (opens Ctrl+K command search) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#1e222d] hover:bg-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc] border border-[#2a2e39] rounded-md transition-all cursor-pointer"
            title="Search symbols (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-[#787b86]" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#131722] text-[#787b86] rounded border border-[#2a2e39]">
              ⌘K
            </kbd>
          </button>

          {/* Live Tick Stream Indicator Toggle */}
          <button
            onClick={toggleLiveTicking}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-all cursor-pointer ${
              isLiveTicking
                ? 'bg-[#089981]/10 text-[#089981] border-[#089981]/30 hover:bg-[#089981]/20'
                : 'bg-[#2a2e39] text-[#787b86] border-[#363c4e] hover:bg-[#363c4e]'
            }`}
            title={isLiveTicking ? 'Live streaming market quotes active' : 'Simulation paused'}
          >
            <Radio className={`w-3 h-3 ${isLiveTicking ? 'animate-pulse text-[#089981]' : 'text-[#787b86]'}`} />
            <span className="text-[11px] font-semibold">{isLiveTicking ? 'LIVE' : 'PAUSED'}</span>
          </button>

          {/* Currency Switcher */}
          <div className="relative hidden md:block">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyType)}
              className="appearance-none bg-[#1e222d] hover:bg-[#2a2e39] text-[#d1d4dc] text-xs font-semibold px-2.5 py-1.5 pr-6 border border-[#2a2e39] rounded-md cursor-pointer outline-none transition-colors"
              title="Change base currency"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-[#787b86]">
              <span className="text-[9px]">▼</span>
            </div>
          </div>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 text-[#787b86] hover:text-white bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] rounded-md transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#2962ff]" />
            )}
          </button>

          {/* Watchlist Toggle Button */}
          <button
            onClick={toggleWatchlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
              isWatchlistOpen
                ? 'bg-[#2962ff] text-white border-[#2962ff] shadow-sm shadow-[#2962ff]/30'
                : 'bg-[#1e222d] hover:bg-[#2a2e39] text-[#d1d4dc] border-[#2a2e39]'
            }`}
            title="Toggle Watchlist Sidebar"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isWatchlistOpen ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">Watchlist</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isWatchlistOpen ? 'bg-white/20 text-white' : 'bg-[#2a2e39] text-[#787b86]'}`}>
              {watchlist.length}
            </span>
          </button>

        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 border-t border-[#2a2e39] overflow-x-auto no-scrollbar bg-[#131722]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeScreen === item.id
                ? 'bg-[#2962ff] text-white'
                : 'text-[#9598a1] hover:text-white bg-[#1e222d]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
