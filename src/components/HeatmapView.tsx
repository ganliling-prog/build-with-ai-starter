import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { SymbolLogo } from './SymbolLogo';
import { MarketAsset } from '../types/market';
import { LayoutGrid, TrendingUp, TrendingDown, Info, ExternalLink } from 'lucide-react';

type HeatmapMode = 'stocks' | 'crypto';

export const HeatmapView: React.FC = () => {
  const { assets, selectSymbol, openDetail, formatPrice } = useMarket();
  const [mode, setMode] = useState<HeatmapMode>('stocks');
  const [period, setPeriod] = useState<'1D' | '1W' | '1M'>('1D');

  const stockAssets = assets.filter((a) => a.category === 'stocks');
  const cryptoAssets = assets.filter((a) => a.category === 'crypto');

  const currentAssets = mode === 'stocks' ? stockAssets : cryptoAssets;

  // Group by sector
  const sectors = Array.from(
    new Set(currentAssets.map((a) => a.sector || (mode === 'stocks' ? 'Other' : 'Layer 1 / DeFi')))
  );

  // Color generator for heatmap tile based on % change
  const getTileBg = (changePercent: number): string => {
    if (changePercent >= 4) return 'bg-[#00705a] text-white';
    if (changePercent >= 2) return 'bg-[#089981] text-white';
    if (changePercent > 0) return 'bg-[#089981]/80 text-white';
    if (changePercent === 0) return 'bg-[#363a45] text-white';
    if (changePercent > -2) return 'bg-[#f23645]/80 text-white';
    if (changePercent > -4) return 'bg-[#f23645] text-white';
    return 'bg-[#a31520] text-white';
  };

  return (
    <div className="space-y-4">
      {/* Heatmap Controls Bar */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#2962ff]" />
            <h2 className="text-lg font-bold text-white tracking-tight">Market Treemap Heatmap</h2>
          </div>
          <p className="text-xs text-[#787b86]">
            Visual treemap performance mapped by market capitalization and sector allocation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-[#131722] p-1 rounded-md border border-[#2a2e39]">
            <button
              onClick={() => setMode('stocks')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                mode === 'stocks'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-white'
              }`}
            >
              US Stocks
            </button>
            <button
              onClick={() => setMode('crypto')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                mode === 'crypto'
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-white'
              }`}
            >
              Crypto
            </button>
          </div>

          {/* Timeframe */}
          <div className="flex items-center bg-[#131722] p-1 rounded-md border border-[#2a2e39]">
            {(['1D', '1W', '1M'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                  period === p
                    ? 'bg-[#2a2e39] text-[#2962ff]'
                    : 'text-[#787b86] hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Treemap Grid Container */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 space-y-4 shadow-lg">
        {sectors.map((sector) => {
          const sectorAssets = currentAssets.filter(
            (a) => (a.sector || (mode === 'stocks' ? 'Other' : 'Layer 1 / DeFi')) === sector
          );

          if (sectorAssets.length === 0) return null;

          return (
            <div key={sector} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#787b86] border-b border-[#2a2e39]/60 pb-1 uppercase tracking-wider">
                <span>{sector}</span>
                <span className="text-[11px] font-mono text-[#9598a1]">
                  {sectorAssets.length} symbols
                </span>
              </div>

              {/* Grid of sector tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {sectorAssets.map((asset) => {
                  const isUp = asset.change >= 0;
                  const tileBg = getTileBg(asset.changePercent);

                  return (
                    <div
                      key={asset.symbol}
                      onClick={() => selectSymbol(asset.symbol)}
                      onDoubleClick={() => openDetail(asset.symbol)}
                      className={`${tileBg} rounded-md p-3 flex flex-col justify-between min-h-[110px] cursor-pointer hover:scale-[1.02] hover:brightness-110 transition-all shadow-sm group select-none relative`}
                      title={`${asset.name} · Click to view chart, double click for details`}
                    >
                      {/* Top row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <SymbolLogo src={asset.logo} symbol={asset.symbol} size="xs" />
                          <span className="font-extrabold text-sm tracking-tight">
                            {asset.symbol}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(asset.symbol);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/20 rounded transition-opacity"
                        >
                          <ExternalLink className="w-3 h-3 text-white" />
                        </button>
                      </div>

                      {/* Middle row: Price and % */}
                      <div className="my-1">
                        <div className="font-extrabold text-base sm:text-lg font-mono tabular-nums leading-tight">
                          {isUp ? '+' : ''}
                          {asset.changePercent.toFixed(2)}%
                        </div>
                        <div className="text-[11px] font-mono opacity-90 tabular-nums">
                          {formatPrice(asset.price)}
                        </div>
                      </div>

                      {/* Bottom row: Market Cap */}
                      <div className="text-[10px] opacity-75 font-mono truncate">
                        Cap: {asset.marketCap}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Heatmap Color Scale Indicator Legend */}
        <div className="pt-3 border-t border-[#2a2e39] flex flex-wrap items-center justify-between gap-3 text-xs text-[#787b86]">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#2962ff]" />
            Color scale represents percentage price change
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span className="text-[#f23645] font-bold">-3%</span>
            <div className="w-4 h-3 bg-[#a31520] rounded-xs" />
            <div className="w-4 h-3 bg-[#f23645] rounded-xs" />
            <div className="w-4 h-3 bg-[#f23645]/70 rounded-xs" />
            <div className="w-4 h-3 bg-[#363a45] rounded-xs" />
            <div className="w-4 h-3 bg-[#089981]/70 rounded-xs" />
            <div className="w-4 h-3 bg-[#089981] rounded-xs" />
            <div className="w-4 h-3 bg-[#00705a] rounded-xs" />
            <span className="text-[#089981] font-bold">+3%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
