import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { MarketAsset, AssetCategory } from '../types/market';
import { SymbolLogo } from './SymbolLogo';
import {
  TrendingUp,
  TrendingDown,
  Bookmark,
  ExternalLink,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';

type TabType = 'active' | 'gainers' | 'losers' | 'high52' | 'marketcap' | 'all';

interface MiniSparklineProps {
  data: number[];
  isUp: boolean;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({ data, isUp }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 24;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const strokeColor = isUp ? '#089981' : '#f23645';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(' ')}
      />
    </svg>
  );
};

export const MarketMoversTable: React.FC<{ initialCategory?: AssetCategory | 'all' }> = ({
  initialCategory = 'all',
}) => {
  const {
    assets,
    selectSymbol,
    selectedSymbol,
    openDetail,
    formatPrice,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
  } = useMarket();

  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort items based on tabs
  const filteredAssets = useMemo(() => {
    let list = [...assets];

    // Category filter
    if (categoryFilter !== 'all') {
      list = list.filter((a) => a.category === categoryFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.sector && a.sector.toLowerCase().includes(q))
      );
    }

    // Sort by tab
    switch (activeTab) {
      case 'active':
        return list.sort((a, b) => b.volumeNum - a.volumeNum);
      case 'gainers':
        return list.sort((a, b) => b.changePercent - a.changePercent);
      case 'losers':
        return list.sort((a, b) => a.changePercent - b.changePercent);
      case 'marketcap':
        return list.sort((a, b) => b.marketCapNum - a.marketCapNum);
      case 'high52':
        return list.sort((a, b) => {
          const ratioA = a.week52High ? a.price / a.week52High : 0;
          const ratioB = b.week52High ? b.price / b.week52High : 0;
          return ratioB - ratioA;
        });
      default:
        return list;
    }
  }, [assets, categoryFilter, activeTab, searchTerm]);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'active', label: 'Most Active' },
    { id: 'gainers', label: 'Top Gainers' },
    { id: 'losers', label: 'Top Losers' },
    { id: 'marketcap', label: 'Market Cap' },
    { id: 'high52', label: '52-Week High' },
    { id: 'all', label: 'All Assets' },
  ];

  const categories: { id: AssetCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Markets' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'indices', label: 'Indices' },
    { id: 'futures', label: 'Futures' },
    { id: 'bonds', label: 'Bonds' },
  ];

  return (
    <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg overflow-hidden shadow-lg">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-[#2a2e39] space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Market Movers &amp; Trending</h2>
            <p className="text-xs text-[#787b86]">
              Real-time quotes, technical momentum, and volatility ratings across global markets
            </p>
          </div>

          {/* Quick Search inside Table */}
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Filter by ticker, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded-md px-3 py-1.5 text-xs text-white placeholder-[#787b86] outline-none focus:border-[#2962ff]"
            />
          </div>
        </div>

        {/* Tab row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#2a2e39]/60">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#2962ff] text-white shadow-xs'
                    : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat.id
                    ? 'bg-[#2a2e39] text-[#2962ff] font-semibold'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High-density Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2a2e39] bg-[#181c27] text-[11px] font-semibold text-[#787b86] uppercase tracking-wider">
              <th className="py-2.5 px-4">Symbol / Name</th>
              <th className="py-2.5 px-3 text-right">Price</th>
              <th className="py-2.5 px-3 text-right">Change ($)</th>
              <th className="py-2.5 px-3 text-right">Change (%)</th>
              <th className="py-2.5 px-3 text-center">Technical Rating</th>
              <th className="py-2.5 px-3 text-right hidden sm:table-cell">Volume</th>
              <th className="py-2.5 px-3 text-right hidden md:table-cell">Market Cap</th>
              <th className="py-2.5 px-3 text-right hidden lg:table-cell">P/E (TTM)</th>
              <th className="py-2.5 px-3 text-center hidden xl:table-cell">Trend (7D)</th>
              <th className="py-2.5 px-3 text-center w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50 text-xs text-[#d1d4dc]">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-sm text-[#787b86]">
                  No financial instruments found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const isUp = asset.change >= 0;
                const isSelected = selectedSymbol === asset.symbol;
                const isFavorite = watchlist.includes(asset.symbol);

                const tickFlashClass =
                  asset.lastTickDir === 'up'
                    ? 'animate-flash-up'
                    : asset.lastTickDir === 'down'
                    ? 'animate-flash-down'
                    : '';

                const ratingBadge =
                  asset.technicalRating === 'Strong Buy'
                    ? 'text-[#089981] bg-[#089981]/10 border-[#089981]/30'
                    : asset.technicalRating === 'Buy'
                    ? 'text-[#089981] bg-[#089981]/10 border-[#089981]/30'
                    : asset.technicalRating === 'Sell'
                    ? 'text-[#f23645] bg-[#f23645]/10 border-[#f23645]/30'
                    : asset.technicalRating === 'Strong Sell'
                    ? 'text-[#f23645] bg-[#f23645]/10 border-[#f23645]/30'
                    : 'text-[#ff9800] bg-[#ff9800]/10 border-[#ff9800]/30';

                return (
                  <tr
                    key={asset.symbol}
                    onClick={() => selectSymbol(asset.symbol)}
                    className={`group transition-colors cursor-pointer ${tickFlashClass} ${
                      isSelected
                        ? 'bg-[#2962ff]/10 hover:bg-[#2962ff]/15'
                        : 'hover:bg-[#222634]'
                    }`}
                  >
                    {/* Symbol / Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <SymbolLogo src={asset.logo} symbol={asset.symbol} size="sm" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                              {asset.symbol}
                            </span>
                            <span className="text-[10px] text-[#787b86] font-medium uppercase px-1 py-0.2 bg-[#131722] rounded">
                              {asset.exchange}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#787b86] truncate max-w-[140px] sm:max-w-[200px]">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-white tabular-nums">
                      {asset.category === 'bonds'
                        ? `${asset.price.toFixed(3)}%`
                        : formatPrice(asset.price)}
                    </td>

                    {/* Change $ */}
                    <td
                      className={`py-3 px-3 text-right font-mono font-medium tabular-nums ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {formatPrice(asset.change)}
                    </td>

                    {/* Change % */}
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 font-mono font-bold text-[11px] px-1.5 py-0.5 rounded tabular-nums ${
                          isUp
                            ? 'bg-[#089981]/15 text-[#089981]'
                            : 'bg-[#f23645]/15 text-[#f23645]'
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="w-2.5 h-2.5" />
                        ) : (
                          <TrendingDown className="w-2.5 h-2.5" />
                        )}
                        {isUp ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Technical Rating */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${ratingBadge}`}
                      >
                        {asset.technicalRating}
                      </span>
                    </td>

                    {/* Volume */}
                    <td className="py-3 px-3 text-right font-mono text-[#9598a1] tabular-nums hidden sm:table-cell">
                      {asset.volume}
                    </td>

                    {/* Market Cap */}
                    <td className="py-3 px-3 text-right font-mono text-[#9598a1] tabular-nums hidden md:table-cell">
                      {asset.marketCap}
                    </td>

                    {/* P/E Ratio */}
                    <td className="py-3 px-3 text-right font-mono text-[#9598a1] tabular-nums hidden lg:table-cell">
                      {asset.peRatio ? asset.peRatio.toFixed(1) : '—'}
                    </td>

                    {/* 7D Trend Sparkline */}
                    <td className="py-3 px-3 text-center hidden xl:table-cell">
                      <div className="flex justify-center">
                        <MiniSparkline data={asset.sparkline} isUp={isUp} />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            isFavorite
                              ? removeFromWatchlist(asset.symbol)
                              : addToWatchlist(asset.symbol)
                          }
                          className={`p-1 rounded hover:bg-[#2a2e39] transition-colors cursor-pointer ${
                            isFavorite ? 'text-[#2962ff]' : 'text-[#787b86]'
                          }`}
                          title={isFavorite ? 'In Watchlist' : 'Add to Watchlist'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => openDetail(asset.symbol)}
                          className="p-1 rounded text-[#787b86] hover:text-[#2962ff] hover:bg-[#2a2e39] transition-colors cursor-pointer"
                          title="Open Asset Analysis"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 border-t border-[#2a2e39] bg-[#181c27] flex items-center justify-between text-xs text-[#787b86]">
        <span>Showing {filteredAssets.length} symbols</span>
        <span className="text-[11px]">Real-time quotes with continuous price updates</span>
      </div>
    </div>
  );
};
