import React, { useState, useRef, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { Timeframe, ChartType, CandlePoint } from '../types/market';
import { SymbolLogo } from './SymbolLogo';
import {
  TrendingUp,
  TrendingDown,
  Maximize2,
  Bookmark,
  Bell,
  LineChart as LineChartIcon,
  CandlestickChart,
  Activity,
  Layers,
} from 'lucide-react';

export const InteractiveChart: React.FC = () => {
  const {
    selectedAsset,
    timeframe,
    setTimeframe,
    chartType,
    setChartType,
    indicators,
    toggleIndicator,
    formatPrice,
    openDetail,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    addAlert,
  } = useMarket();

  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);

  // Select candle series based on timeframe
  const candles: CandlePoint[] = useMemo(() => {
    switch (timeframe) {
      case '1D':
        return selectedAsset.candles1D;
      case '5D':
      case '1M':
        return selectedAsset.candles1M;
      case '6M':
      case 'YTD':
      case '1Y':
      case 'ALL':
        return selectedAsset.candles1Y;
      default:
        return selectedAsset.candles1D;
    }
  }, [timeframe, selectedAsset]);

  // Calculate scales and geometry
  const chartWidth = 900;
  const mainChartHeight = indicators.rsi ? 240 : 320;
  const volumeHeight = 60;
  const rsiHeight = indicators.rsi ? 90 : 0;
  const totalHeight = mainChartHeight + volumeHeight + rsiHeight + 30;

  const minPrice = useMemo(() => {
    if (!candles.length) return 0;
    return Math.min(...candles.map((c) => c.low)) * 0.996;
  }, [candles]);

  const maxPrice = useMemo(() => {
    if (!candles.length) return 100;
    return Math.max(...candles.map((c) => c.high)) * 1.004;
  }, [candles]);

  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = useMemo(() => {
    if (!candles.length) return 1;
    return Math.max(...candles.map((c) => c.volume));
  }, [candles]);

  // Compute 20-period Moving Average
  const ma20Points = useMemo(() => {
    if (!indicators.ma20 || candles.length < 5) return [];
    const points: { x: number; y: number }[] = [];
    const period = Math.min(20, Math.floor(candles.length / 2));
    const stepX = (chartWidth - 60) / (candles.length - 1 || 1);

    for (let i = 0; i < candles.length; i++) {
      const start = Math.max(0, i - period + 1);
      const slice = candles.slice(start, i + 1);
      const avg = slice.reduce((sum, c) => sum + c.close, 0) / slice.length;
      const x = i * stepX + 30;
      const y = mainChartHeight - ((avg - minPrice) / priceRange) * mainChartHeight + 10;
      points.push({ x, y });
    }
    return points;
  }, [candles, indicators.ma20, minPrice, priceRange, mainChartHeight]);

  // Compute RSI values
  const rsiPoints = useMemo(() => {
    if (!indicators.rsi || candles.length < 5) return [];
    const rsiValues: number[] = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < candles.length; i++) {
      const diff = candles[i].close - candles[i - 1].close;
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);

      const avgGain = gains / i || 0.0001;
      const avgLoss = losses / i || 0.0001;
      const rs = avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      rsiValues.push(rsi);
    }

    const stepX = (chartWidth - 60) / (candles.length - 1 || 1);
    return rsiValues.map((val, idx) => {
      const x = (idx + 1) * stepX + 30;
      const y = totalHeight - 20 - (val / 100) * (rsiHeight - 20);
      return { x, y, val };
    });
  }, [candles, indicators.rsi, totalHeight, rsiHeight]);

  // Mouse move handler for crosshair HUD
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - svgRect.left;
    const clientY = e.clientY - svgRect.top;

    const scaleX = chartWidth / svgRect.width;
    const scaleY = totalHeight / svgRect.height;
    const x = clientX * scaleX;
    const y = clientY * scaleY;

    const stepX = (chartWidth - 60) / (candles.length - 1 || 1);
    const idx = Math.min(
      candles.length - 1,
      Math.max(0, Math.round((x - 30) / stepX))
    );

    setHoverIndex(idx);
    setCrosshairPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setCrosshairPos(null);
  };

  const activeCandle =
    hoverIndex !== null && candles[hoverIndex]
      ? candles[hoverIndex]
      : candles[candles.length - 1] || null;

  const isUp = selectedAsset.change >= 0;
  const isFavorite = isInWatchlist(selectedAsset.symbol);

  // Technical badge coloring
  const ratingColor =
    selectedAsset.technicalRating === 'Strong Buy'
      ? 'bg-[#089981] text-white'
      : selectedAsset.technicalRating === 'Buy'
      ? 'bg-[#089981]/80 text-white'
      : selectedAsset.technicalRating === 'Sell'
      ? 'bg-[#f23645]/80 text-white'
      : selectedAsset.technicalRating === 'Strong Sell'
      ? 'bg-[#f23645] text-white'
      : 'bg-[#ff9800]/80 text-white';

  const timeframes: Timeframe[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', 'ALL'];

  return (
    <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg overflow-hidden shadow-lg flex flex-col">
      {/* Chart Top Info Bar */}
      <div className="p-4 sm:p-5 border-b border-[#2a2e39] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SymbolLogo src={selectedAsset.logo} symbol={selectedAsset.symbol} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white tracking-tight">
                {selectedAsset.symbol}
              </span>
              <span className="text-xs font-semibold text-[#787b86] uppercase px-1.5 py-0.5 bg-[#2a2e39] rounded">
                {selectedAsset.exchange}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${ratingColor}`}>
                {selectedAsset.technicalRating}
              </span>
            </div>
            <div className="text-xs text-[#9598a1] truncate max-w-[280px] sm:max-w-md">
              {selectedAsset.name} {selectedAsset.sector ? `· ${selectedAsset.sector}` : ''}
            </div>
          </div>
        </div>

        {/* Live Quotes Price Block */}
        <div className="flex items-baseline gap-3">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {selectedAsset.category === 'bonds'
                ? `${selectedAsset.price.toFixed(3)}%`
                : formatPrice(selectedAsset.price)}
            </div>
            <div
              className={`flex items-center justify-end gap-1 text-xs sm:text-sm font-bold font-mono tabular-nums ${
                isUp ? 'text-[#089981]' : 'text-[#f23645]'
              }`}
            >
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isUp ? '+' : ''}
                {formatPrice(selectedAsset.change)} ({isUp ? '+' : ''}
                {selectedAsset.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#2a2e39]">
            <button
              onClick={() =>
                isFavorite
                  ? removeFromWatchlist(selectedAsset.symbol)
                  : addToWatchlist(selectedAsset.symbol)
              }
              className={`p-2 rounded-md transition-colors cursor-pointer ${
                isFavorite
                  ? 'bg-[#2962ff] text-white'
                  : 'bg-[#2a2e39] text-[#787b86] hover:text-white'
              }`}
              title={isFavorite ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => addAlert(selectedAsset.symbol, selectedAsset.price * 1.05, 'above')}
              className="p-2 bg-[#2a2e39] text-[#787b86] hover:text-white rounded-md transition-colors cursor-pointer"
              title="Set Price Alert"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDetail(selectedAsset.symbol)}
              className="p-2 bg-[#2a2e39] text-[#787b86] hover:text-[#2962ff] rounded-md transition-colors cursor-pointer"
              title="Open Full Technical Chart & Order Book"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Toolbar: Timeframes, Chart Types, Indicators */}
      <div className="px-4 py-2 border-b border-[#2a2e39] bg-[#181c27] flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 font-semibold rounded transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#2962ff] text-white shadow-xs'
                  : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style Switcher */}
        <div className="flex items-center gap-1 bg-[#1e222d] p-0.5 rounded border border-[#2a2e39]">
          <button
            onClick={() => setChartType('area')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              chartType === 'area'
                ? 'bg-[#2a2e39] text-[#2962ff]'
                : 'text-[#787b86] hover:text-white'
            }`}
            title="Area Chart"
          >
            <LineChartIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType('candlestick')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              chartType === 'candlestick'
                ? 'bg-[#2a2e39] text-[#2962ff]'
                : 'text-[#787b86] hover:text-white'
            }`}
            title="Candlestick Chart"
          >
            <CandlestickChart className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Technical Indicators */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleIndicator('ma20')}
            className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
              indicators.ma20
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'text-[#787b86] border-[#2a2e39] hover:text-white'
            }`}
          >
            MA (20)
          </button>
          <button
            onClick={() => toggleIndicator('volume')}
            className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
              indicators.volume
                ? 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/30'
                : 'text-[#787b86] border-[#2a2e39] hover:text-white'
            }`}
          >
            Volume
          </button>
          <button
            onClick={() => toggleIndicator('rsi')}
            className={`px-2 py-0.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
              indicators.rsi
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'text-[#787b86] border-[#2a2e39] hover:text-white'
            }`}
          >
            RSI (14)
          </button>
        </div>
      </div>

      {/* Crosshair HUD Status Line */}
      {activeCandle && (
        <div className="px-4 py-1.5 bg-[#141720] border-b border-[#2a2e39]/60 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-[#787b86]">
          <span>
            Time: <strong className="text-white">{activeCandle.timestamp}</strong>
          </span>
          <span>
            O: <strong className="text-white">${activeCandle.open}</strong>
          </span>
          <span>
            H: <strong className="text-[#089981]">${activeCandle.high}</strong>
          </span>
          <span>
            L: <strong className="text-[#f23645]">${activeCandle.low}</strong>
          </span>
          <span>
            C: <strong className="text-white">${activeCandle.close}</strong>
          </span>
          {indicators.volume && (
            <span>
              Vol: <strong className="text-[#2962ff]">{activeCandle.volume.toLocaleString()}</strong>
            </span>
          )}
        </div>
      )}

      {/* SVG Interactive Canvas */}
      <div ref={containerRef} className="relative w-full overflow-hidden bg-[#131722] p-2 select-none">
        <svg
          viewBox={`0 0 ${chartWidth} ${totalHeight}`}
          className="w-full h-[320px] sm:h-[400px] cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Green Area Gradient */}
            <linearGradient id="areaGradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#089981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#089981" stopOpacity="0.0" />
            </linearGradient>
            {/* Red Area Gradient */}
            <linearGradient id="areaGradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f23645" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f23645" stopOpacity="0.0" />
            </linearGradient>
            {/* Grid Pattern */}
            <pattern id="grid" width="60" height="40" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#1f2430" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width={chartWidth} height={totalHeight} fill="url(#grid)" />

          {/* Volume Section Separator Line */}
          {indicators.volume && (
            <line
              x1="0"
              y1={mainChartHeight + 10}
              x2={chartWidth}
              y2={mainChartHeight + 10}
              stroke="#2a2e39"
              strokeDasharray="3 3"
            />
          )}

          {/* RSI Section Separator Line */}
          {indicators.rsi && (
            <line
              x1="0"
              y1={mainChartHeight + volumeHeight + 20}
              x2={chartWidth}
              y2={mainChartHeight + volumeHeight + 20}
              stroke="#2a2e39"
              strokeDasharray="3 3"
            />
          )}

          {/* Render Volume Bars */}
          {indicators.volume &&
            candles.map((candle, i) => {
              const stepX = (chartWidth - 60) / (candles.length - 1 || 1);
              const x = i * stepX + 30;
              const barH = (candle.volume / maxVolume) * (volumeHeight - 10);
              const y = mainChartHeight + volumeHeight + 5 - barH;
              const isGreen = candle.close >= candle.open;
              return (
                <rect
                  key={`vol-${i}`}
                  x={x - 2.5}
                  y={y}
                  width="5"
                  height={Math.max(2, barH)}
                  fill={isGreen ? '#089981' : '#f23645'}
                  opacity={0.5}
                />
              );
            })}

          {/* Render Area or Line Chart */}
          {chartType === 'area' && candles.length > 1 && (
            <>
              {/* Path Generator */}
              {(() => {
                const stepX = (chartWidth - 60) / (candles.length - 1 || 1);
                const points = candles.map((c, i) => {
                  const x = i * stepX + 30;
                  const y =
                    mainChartHeight -
                    ((c.close - minPrice) / priceRange) * mainChartHeight +
                    10;
                  return `${x},${y}`;
                });
                const lineD = `M ${points.join(' L ')}`;
                const areaD = `${lineD} L ${
                  (candles.length - 1) * stepX + 30
                },${mainChartHeight + 10} L 30,${mainChartHeight + 10} Z`;

                const strokeColor = isUp ? '#089981' : '#f23645';
                const fillColor = isUp ? 'url(#areaGradGreen)' : 'url(#areaGradRed)';

                return (
                  <>
                    <path d={areaD} fill={fillColor} />
                    <path
                      d={lineD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </>
                );
              })()}
            </>
          )}

          {/* Render Candlesticks */}
          {chartType === 'candlestick' &&
            candles.map((candle, i) => {
              const stepX = (chartWidth - 60) / (candles.length - 1 || 1);
              const x = i * stepX + 30;
              const isGreen = candle.close >= candle.open;
              const candleColor = isGreen ? '#089981' : '#f23645';

              const yHigh =
                mainChartHeight -
                ((candle.high - minPrice) / priceRange) * mainChartHeight +
                10;
              const yLow =
                mainChartHeight -
                ((candle.low - minPrice) / priceRange) * mainChartHeight +
                10;
              const yOpen =
                mainChartHeight -
                ((candle.open - minPrice) / priceRange) * mainChartHeight +
                10;
              const yClose =
                mainChartHeight -
                ((candle.close - minPrice) / priceRange) * mainChartHeight +
                10;

              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

              return (
                <g key={`candle-${i}`}>
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={candleColor}
                    strokeWidth="1.2"
                  />
                  {/* Body */}
                  <rect
                    x={x - 4}
                    y={bodyTop}
                    width="8"
                    height={bodyHeight}
                    fill={candleColor}
                    rx="1"
                  />
                </g>
              );
            })}

          {/* Render Moving Average 20 Curve */}
          {indicators.ma20 && ma20Points.length > 1 && (
            <path
              d={`M ${ma20Points.map((p) => `${p.x},${p.y}`).join(' L ')}`}
              fill="none"
              stroke="#ff9800"
              strokeWidth="1.8"
              strokeDasharray="4 2"
            />
          )}

          {/* Render RSI Curve & Overbought/Oversold thresholds */}
          {indicators.rsi && rsiPoints.length > 1 && (
            <g>
              {/* Overbought line 70 */}
              <line
                x1="30"
                y1={totalHeight - 20 - 0.7 * (rsiHeight - 20)}
                x2={chartWidth - 30}
                y2={totalHeight - 20 - 0.7 * (rsiHeight - 20)}
                stroke="#f23645"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              {/* Oversold line 30 */}
              <line
                x1="30"
                y1={totalHeight - 20 - 0.3 * (rsiHeight - 20)}
                x2={chartWidth - 30}
                y2={totalHeight - 20 - 0.3 * (rsiHeight - 20)}
                stroke="#089981"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              {/* RSI Polyline */}
              <path
                d={`M ${rsiPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`}
                fill="none"
                stroke="#ab47bc"
                strokeWidth="1.5"
              />
              <text
                x="35"
                y={totalHeight - rsiHeight + 12}
                fill="#ab47bc"
                fontSize="9"
                fontFamily="monospace"
              >
                RSI (14) {rsiPoints[rsiPoints.length - 1]?.val.toFixed(1)}
              </text>
            </g>
          )}

          {/* Current Price Horizontal Guideline */}
          {(() => {
            const currentY =
              mainChartHeight -
              ((selectedAsset.price - minPrice) / priceRange) * mainChartHeight +
              10;
            const badgeColor = isUp ? '#089981' : '#f23645';
            return (
              <g>
                <line
                  x1="0"
                  y1={currentY}
                  x2={chartWidth}
                  y2={currentY}
                  stroke={badgeColor}
                  strokeWidth="1"
                  strokeDasharray="4 3"
                />
                <rect
                  x={chartWidth - 75}
                  y={currentY - 10}
                  width="70"
                  height="20"
                  fill={badgeColor}
                  rx="3"
                />
                <text
                  x={chartWidth - 40}
                  y={currentY + 4}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  ${selectedAsset.price.toFixed(2)}
                </text>
              </g>
            );
          })()}

          {/* Interactive Crosshair & Cursor HUD */}
          {crosshairPos && (
            <g>
              {/* Vertical line */}
              <line
                x1={crosshairPos.x}
                y1="0"
                x2={crosshairPos.x}
                y2={totalHeight}
                stroke="#787b86"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Horizontal line */}
              <line
                x1="0"
                y1={crosshairPos.y}
                x2={chartWidth}
                y2={crosshairPos.y}
                stroke="#787b86"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={crosshairPos.x}
                cy={crosshairPos.y}
                r="3.5"
                fill="#2962ff"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Legend Overlay at bottom */}
        <div className="absolute bottom-2 left-4 flex items-center gap-4 text-[10px] text-[#787b86]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#089981]" /> Bullish / Gain
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f23645]" /> Bearish / Decline
          </span>
          {indicators.ma20 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-[#ff9800]" /> MA(20)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
