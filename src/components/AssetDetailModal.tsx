import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { SymbolLogo } from './SymbolLogo';
import {
  X,
  TrendingUp,
  TrendingDown,
  Bookmark,
  Bell,
  CheckCircle2,
  Share2,
  DollarSign,
  Layers,
} from 'lucide-react';

export const AssetDetailModal: React.FC = () => {
  const {
    detailSymbol,
    closeDetail,
    assets,
    formatPrice,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    addAlert,
  } = useMarket();

  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [tradeShares, setTradeShares] = useState('10');
  const [tradeExecuted, setTradeExecuted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!detailSymbol) return null;

  const asset = assets.find((a) => a.symbol === detailSymbol);
  if (!asset) return null;

  const isUp = asset.change >= 0;
  const isFavorite = watchlist.includes(asset.symbol);

  // Compute 52W Range Progress %
  const range52w =
    asset.week52High && asset.week52Low
      ? Math.max(
          0,
          Math.min(
            100,
            ((asset.price - asset.week52Low) / (asset.week52High - asset.week52Low)) * 100
          )
        )
      : 50;

  // Day Range Progress %
  const dayRange =
    asset.high24h && asset.low24h && asset.high24h > asset.low24h
      ? Math.max(0, Math.min(100, ((asset.price - asset.low24h) / (asset.high24h - asset.low24h)) * 100))
      : 50;

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeExecuted(true);
    setTimeout(() => setTradeExecuted(false), 2500);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Mock Order Book Bids & Asks based on current price
  const bids = [
    { price: (asset.price * 0.999).toFixed(2), size: 1420 },
    { price: (asset.price * 0.998).toFixed(2), size: 3120 },
    { price: (asset.price * 0.997).toFixed(2), size: 5800 },
    { price: (asset.price * 0.996).toFixed(2), size: 8400 },
  ];

  const asks = [
    { price: (asset.price * 1.001).toFixed(2), size: 1100 },
    { price: (asset.price * 1.002).toFixed(2), size: 2850 },
    { price: (asset.price * 1.003).toFixed(2), size: 4900 },
    { price: (asset.price * 1.004).toFixed(2), size: 7600 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={closeDetail}
    >
      <div
        className="w-full max-w-4xl bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#2a2e39] bg-[#181c27] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SymbolLogo src={asset.logo} symbol={asset.symbol} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white">{asset.symbol}</span>
                <span className="text-xs uppercase font-semibold text-[#787b86] px-1.5 py-0.5 bg-[#131722] rounded">
                  {asset.exchange}
                </span>
                <span className="text-xs text-[#9598a1]">{asset.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#787b86]">
                <span>{asset.category.toUpperCase()}</span>
                {asset.sector && <span>· {asset.sector}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                isFavorite
                  ? removeFromWatchlist(asset.symbol)
                  : addToWatchlist(asset.symbol)
              }
              className={`p-2 rounded-md transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-[#2962ff] text-white'
                  : 'bg-[#2a2e39] text-[#787b86] hover:text-white'
              }`}
              title="Watchlist"
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-[#2a2e39] text-[#787b86] hover:text-white rounded-md transition-colors cursor-pointer"
              title="Copy share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={closeDetail}
              className="p-2 bg-[#2a2e39] text-[#787b86] hover:text-white rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {copiedLink && (
          <div className="py-1 px-4 bg-[#089981]/20 text-[#089981] text-xs font-semibold text-center">
            ✓ Copied market asset link to clipboard
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Price & Summary Header */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 p-4 bg-[#141720] border border-[#2a2e39] rounded-lg">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums">
                {asset.category === 'bonds'
                  ? `${asset.price.toFixed(3)}%`
                  : formatPrice(asset.price)}
              </div>
              <div
                className={`flex items-center gap-1.5 text-sm font-bold font-mono tabular-nums ${
                  isUp ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isUp ? '+' : ''}
                  {formatPrice(asset.change)} ({isUp ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%)
                </span>
                <span className="text-xs text-[#787b86] font-normal">Today</span>
              </div>
            </div>

            {/* Technical Gauge Meter */}
            <div className="flex flex-col items-end">
              <span className="text-[11px] uppercase font-bold text-[#787b86] mb-1">
                Technical Analysis Rating
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded ${
                    asset.technicalRating.includes('Buy')
                      ? 'bg-[#089981] text-white'
                      : asset.technicalRating.includes('Sell')
                      ? 'bg-[#f23645] text-white'
                      : 'bg-[#ff9800] text-white'
                  }`}
                >
                  {asset.technicalRating}
                </span>
              </div>
              <span className="text-[10px] text-[#787b86] mt-1">Based on 26 Indicators</span>
            </div>
          </div>

          {/* Ranges Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Day's Range */}
            <div className="p-4 bg-[#181c27] border border-[#2a2e39] rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-[#787b86] font-semibold">
                <span>Day's Range</span>
                <span className="font-mono text-white">
                  ${asset.low24h} - ${asset.high24h}
                </span>
              </div>
              <div className="w-full h-2 bg-[#2a2e39] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#2962ff] rounded-full"
                  style={{ width: `${dayRange}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#787b86]">
                <span>Low: ${asset.low24h}</span>
                <span>High: ${asset.high24h}</span>
              </div>
            </div>

            {/* 52-Week Range */}
            <div className="p-4 bg-[#181c27] border border-[#2a2e39] rounded-lg space-y-2">
              <div className="flex items-center justify-between text-xs text-[#787b86] font-semibold">
                <span>52-Week Range</span>
                <span className="font-mono text-white">
                  ${asset.week52Low || (asset.price * 0.7).toFixed(2)} - $
                  {asset.week52High || (asset.price * 1.3).toFixed(2)}
                </span>
              </div>
              <div className="w-full h-2 bg-[#2a2e39] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-[#089981] rounded-full"
                  style={{ width: `${range52w}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#787b86]">
                <span>Low: ${asset.week52Low || (asset.price * 0.7).toFixed(2)}</span>
                <span>High: ${asset.week52High || (asset.price * 1.3).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Key Fundamentals Grid */}
          <div className="p-4 bg-[#181c27] border border-[#2a2e39] rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Key Fundamentals &amp; Metrics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-[#787b86] block text-[11px]">Market Cap</span>
                <span className="font-bold text-white text-sm">{asset.marketCap}</span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">Volume (24H)</span>
                <span className="font-bold text-white text-sm">{asset.volume}</span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">P/E Ratio</span>
                <span className="font-bold text-white text-sm">
                  {asset.peRatio ? asset.peRatio.toFixed(2) : '—'}
                </span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">Dividend Yield</span>
                <span className="font-bold text-white text-sm">
                  {asset.dividendYield || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">Beta (1Y)</span>
                <span className="font-bold text-white text-sm">{asset.beta || '1.00'}</span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">Open Price</span>
                <span className="font-bold text-white text-sm">${asset.openPrice}</span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">Exchange</span>
                <span className="font-bold text-white text-sm">{asset.exchange}</span>
              </div>
              <div>
                <span className="text-[#787b86] block text-[11px]">Rating</span>
                <span className="font-bold text-[#089981] text-sm">{asset.technicalRating}</span>
              </div>
            </div>
          </div>

          {/* Order Book & Paper Trade Simulator Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Book Simulation */}
            <div className="p-4 bg-[#181c27] border border-[#2a2e39] rounded-lg space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#2962ff]" />
                  Level 2 Order Book Depth
                </span>
                <span className="text-[10px] text-[#787b86]">Spread: 0.02%</span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {/* Asks (Sell Orders) */}
                <div className="space-y-1 text-[#f23645]">
                  {asks.map((a, i) => (
                    <div key={`ask-${i}`} className="flex justify-between relative px-2 py-0.5">
                      <div
                        className="absolute inset-y-0 right-0 bg-[#f23645]/15"
                        style={{ width: `${(a.size / 8000) * 100}%` }}
                      />
                      <span className="z-10">${a.price}</span>
                      <span className="z-10 text-[#787b86]">{a.size}</span>
                    </div>
                  ))}
                </div>

                {/* Current Mid Price */}
                <div className="py-1 px-2 my-1 bg-[#131722] border-y border-[#2a2e39] font-bold text-center text-white text-xs">
                  Mid Market: ${asset.price.toFixed(2)}
                </div>

                {/* Bids (Buy Orders) */}
                <div className="space-y-1 text-[#089981]">
                  {bids.map((b, i) => (
                    <div key={`bid-${i}`} className="flex justify-between relative px-2 py-0.5">
                      <div
                        className="absolute inset-y-0 right-0 bg-[#089981]/15"
                        style={{ width: `${(b.size / 8000) * 100}%` }}
                      />
                      <span className="z-10">${b.price}</span>
                      <span className="z-10 text-[#787b86]">{b.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Paper Trading Simulator */}
            <div className="p-4 bg-[#181c27] border border-[#2a2e39] rounded-lg space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#089981]" />
                  Paper Trading Simulator
                </span>
                <span className="text-[10px] text-[#787b86]">Simulated Balance: $100,000</span>
              </div>

              <form onSubmit={handleExecuteTrade} className="space-y-3">
                {/* Buy / Sell Toggle */}
                <div className="grid grid-cols-2 gap-2 bg-[#131722] p-1 rounded-md">
                  <button
                    type="button"
                    onClick={() => setTradeAction('buy')}
                    className={`py-1.5 text-xs font-bold rounded cursor-pointer transition-colors ${
                      tradeAction === 'buy'
                        ? 'bg-[#089981] text-white'
                        : 'text-[#787b86] hover:text-white'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeAction('sell')}
                    className={`py-1.5 text-xs font-bold rounded cursor-pointer transition-colors ${
                      tradeAction === 'sell'
                        ? 'bg-[#f23645] text-white'
                        : 'text-[#787b86] hover:text-white'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] text-[#787b86] font-semibold mb-1">
                    Units / Shares
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tradeShares}
                    onChange={(e) => setTradeShares(e.target.value)}
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-1.5 text-xs text-white font-mono outline-none focus:border-[#2962ff]"
                  />
                </div>

                <div className="p-2.5 bg-[#131722] rounded text-xs flex justify-between font-mono">
                  <span className="text-[#787b86]">Total Estimated:</span>
                  <span className="font-bold text-white">
                    ${(asset.price * (parseFloat(tradeShares) || 0)).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 font-bold text-xs rounded transition-colors cursor-pointer text-white shadow-md ${
                    tradeAction === 'buy'
                      ? 'bg-[#089981] hover:bg-[#00705a]'
                      : 'bg-[#f23645] hover:bg-[#c02b37]'
                  }`}
                >
                  Confirm Paper {tradeAction.toUpperCase()} Order
                </button>

                {tradeExecuted && (
                  <div className="text-center text-xs font-semibold text-[#089981] flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Simulated {tradeAction.toUpperCase()} order executed for {tradeShares} units!
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Profile Description */}
          {asset.description && (
            <div className="p-4 bg-[#181c27] border border-[#2a2e39] rounded-lg space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Profile &amp; Business Summary
              </h4>
              <p className="text-xs text-[#9598a1] leading-relaxed">{asset.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
