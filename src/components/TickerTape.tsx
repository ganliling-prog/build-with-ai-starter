import React from 'react';
import { useMarket } from '../context/MarketContext';
import { SymbolLogo } from './SymbolLogo';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const TickerTape: React.FC = () => {
  const { assets, selectSymbol, selectedSymbol, formatPrice, openDetail } = useMarket();

  // Pick prominent tape items: indices, crypto leaders, commodities, forex
  const tapeSymbols = ['SPX', 'NDX', 'DJI', 'BTCUSD', 'ETHUSD', 'XAUUSD', 'USOIL', 'US10Y', 'EURUSD', 'NVDA', 'TSLA'];
  const tapeAssets = tapeSymbols
    .map((s) => assets.find((a) => a.symbol === s))
    .filter(Boolean) as typeof assets;

  return (
    <div className="w-full bg-[#181c27] dark:bg-[#181c27] border-b border-[#2a2e39] overflow-hidden select-none">
      <div className="flex items-center overflow-x-auto no-scrollbar py-1.5 px-3 divide-x divide-[#2a2e39]/60">
        {tapeAssets.map((asset) => {
          const isUp = asset.change >= 0;
          const isSelected = selectedSymbol === asset.symbol;
          const tickFlashClass =
            asset.lastTickDir === 'up'
              ? 'animate-flash-up'
              : asset.lastTickDir === 'down'
              ? 'animate-flash-down'
              : '';

          return (
            <button
              key={asset.symbol}
              onClick={() => selectSymbol(asset.symbol)}
              onDoubleClick={() => openDetail(asset.symbol)}
              className={`flex items-center gap-2.5 px-3.5 py-1 text-xs shrink-0 group transition-all rounded-sm cursor-pointer ${tickFlashClass} ${
                isSelected
                  ? 'bg-[#2962ff]/10 text-white'
                  : 'hover:bg-[#222634] text-[#d1d4dc]'
              }`}
              title={`${asset.name} - Double-click to open full analysis`}
            >
              <SymbolLogo src={asset.logo} symbol={asset.symbol} size="xs" />

              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-[11px] text-[#f0f3fa] group-hover:text-[#2962ff] transition-colors">
                  {asset.symbol}
                </span>
                <span className="font-mono text-[11px] font-semibold text-[#f0f3fa] tabular-nums">
                  {asset.category === 'bonds'
                    ? `${asset.price.toFixed(3)}%`
                    : formatPrice(asset.price)}
                </span>
              </div>

              <div
                className={`flex items-center gap-0.5 font-mono text-[10px] font-semibold tabular-nums ${
                  isUp ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 shrink-0" />
                )}
                <span>
                  {isUp ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
