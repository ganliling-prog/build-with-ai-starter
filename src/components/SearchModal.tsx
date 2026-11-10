import React, { useState, useEffect, useRef } from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetCategory } from '../types/market';
import { SymbolLogo } from './SymbolLogo';
import { Search, X, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, assets, selectSymbol, formatPrice, openDetail } =
    useMarket();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AssetCategory | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filtered = assets.filter((a) => {
    if (category !== 'all' && a.category !== category) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.symbol.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.sector && a.sector.toLowerCase().includes(q))
    );
  });

  const handleSelect = (symbol: string) => {
    selectSymbol(symbol);
    setIsSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].symbol);
      }
    }
  };

  const categories: { id: AssetCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'indices', label: 'Indices' },
    { id: 'futures', label: 'Futures' },
    { id: 'bonds', label: 'Bonds' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4 animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#2a2e39] flex items-center gap-3 bg-[#181c27]">
          <Search className="w-5 h-5 text-[#2962ff] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by symbol, company, currency or commodity (e.g. AAPL, BTC, Gold)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-[#787b86]"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-[#787b86] hover:text-white rounded hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 bg-[#131722] border-b border-[#2a2e39] flex items-center gap-1 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                category === cat.id
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#787b86]">
              No instruments match "{query}" in this category.
            </div>
          ) : (
            filtered.map((asset, idx) => {
              const isUp = asset.change >= 0;
              const isHighlighted = idx === selectedIndex;

              return (
                <div
                  key={asset.symbol}
                  onClick={() => handleSelect(asset.symbol)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isHighlighted ? 'bg-[#2962ff]/15' : 'hover:bg-[#222634]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <SymbolLogo src={asset.logo} symbol={asset.symbol} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{asset.symbol}</span>
                        <span className="text-[10px] uppercase font-semibold text-[#787b86] bg-[#131722] px-1.5 py-0.2 rounded">
                          {asset.exchange}
                        </span>
                        <span className="text-[10px] text-[#787b86] capitalize">
                          {asset.category}
                        </span>
                      </div>
                      <div className="text-xs text-[#9598a1] truncate max-w-[280px] sm:max-w-md">
                        {asset.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-white tabular-nums">
                      {asset.category === 'bonds'
                        ? `${asset.price.toFixed(3)}%`
                        : formatPrice(asset.price)}
                    </div>
                    <div
                      className={`text-[11px] font-mono font-semibold flex items-center justify-end gap-0.5 tabular-nums ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? (
                        <TrendingUp className="w-2.5 h-2.5" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5" />
                      )}
                      <span>
                        {isUp ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-[#181c27] border-t border-[#2a2e39] flex items-center justify-between text-[11px] text-[#787b86]">
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="px-1.5 py-0.5 bg-[#131722] rounded border border-[#2a2e39]">↑</kbd>{' '}
              <kbd className="px-1.5 py-0.5 bg-[#131722] rounded border border-[#2a2e39]">↓</kbd> to
              navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-[#131722] rounded border border-[#2a2e39]">Enter</kbd>{' '}
              to select
            </span>
          </div>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
