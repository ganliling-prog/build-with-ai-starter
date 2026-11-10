import React from 'react';
import { MarketProvider, useMarket, ScreenType } from './context/MarketContext';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { InteractiveChart } from './components/InteractiveChart';
import { MarketMoversTable } from './components/MarketMoversTable';
import { HeatmapView } from './components/HeatmapView';
import { ScreenerView } from './components/ScreenerView';
import { ForexMatrix } from './components/ForexMatrix';
import { MarketNewsFeed } from './components/MarketNewsFeed';
import { WatchlistSidebar } from './components/WatchlistSidebar';
import { SearchModal } from './components/SearchModal';
import { AssetDetailModal } from './components/AssetDetailModal';
import { SymbolLogo } from './components/SymbolLogo';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Flame,
  BarChart3,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    assets,
    selectSymbol,
    selectedSymbol,
    formatPrice,
    openDetail,
  } = useMarket();

  // Key hero spotlight cards
  const spotlightSymbols = ['SPX', 'NDX', 'BTCUSD', 'XAUUSD', 'USOIL', 'US10Y'];
  const spotlightAssets = spotlightSymbols
    .map((s) => assets.find((a) => a.symbol === s))
    .filter(Boolean) as typeof assets;

  return (
    <div className="min-h-screen bg-[#131722] text-[#d1d4dc] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <Header />

      {/* Marquee Ticker Tape */}
      <TickerTape />

      {/* Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Hero Banner for Overview */}
        {activeScreen === 'overview' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Global Markets Overview
                </h1>
                <p className="text-xs sm:text-sm text-[#787b86]">
                  Track real-time equities, digital assets, currencies, commodities, and macro yields
                </p>
              </div>

              {/* Market Status Pill */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e222d] border border-[#2a2e39] rounded-lg text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" />
                  <span className="font-semibold text-white">US Markets Open</span>
                  <span className="text-[#787b86]">· Regular Trading</span>
                </div>
              </div>
            </div>

            {/* Quick Hero Benchmark Spotlight Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {spotlightAssets.map((asset) => {
                const isUp = asset.change >= 0;
                const isSelected = selectedSymbol === asset.symbol;
                const tickFlashClass =
                  asset.lastTickDir === 'up'
                    ? 'animate-flash-up'
                    : asset.lastTickDir === 'down'
                    ? 'animate-flash-down'
                    : '';

                return (
                  <div
                    key={asset.symbol}
                    onClick={() => selectSymbol(asset.symbol)}
                    className={`p-3 bg-[#1e222d] border rounded-lg cursor-pointer transition-all hover:scale-[1.01] hover:border-[#2962ff]/50 shadow-xs ${tickFlashClass} ${
                      isSelected
                        ? 'border-[#2962ff] bg-[#2962ff]/5'
                        : 'border-[#2a2e39]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <SymbolLogo src={asset.logo} symbol={asset.symbol} size="xs" />
                        <span className="font-bold text-xs text-white">{asset.symbol}</span>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold flex items-center ${
                          isUp ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="font-mono font-extrabold text-sm text-white tabular-nums">
                      {asset.category === 'bonds'
                        ? `${asset.price.toFixed(3)}%`
                        : formatPrice(asset.price)}
                    </div>

                    <div className="text-[10px] text-[#787b86] truncate mt-0.5">
                      {asset.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Screen Routing */}
        {activeScreen === 'overview' && (
          <div className="space-y-6">
            {/* Interactive Centerpiece Chart */}
            <InteractiveChart />

            {/* Trending & Movers Table */}
            <MarketMoversTable initialCategory="all" />

            {/* Heatmap Preview Section */}
            <HeatmapView />

            {/* News and Insights */}
            <MarketNewsFeed />
          </div>
        )}

        {activeScreen === 'stocks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">Stock Market &amp; Equities</h1>
                <p className="text-xs text-[#787b86]">
                  US and international equity quotes, sector leaders, and market valuations
                </p>
              </div>
            </div>
            <InteractiveChart />
            <MarketMoversTable initialCategory="stocks" />
            <MarketNewsFeed />
          </div>
        )}

        {activeScreen === 'crypto' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-white">Cryptocurrency Markets</h1>
                <p className="text-xs text-[#787b86]">
                  Top crypto coins, DeFi tokens, and decentralized exchange liquidity
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono bg-[#1e222d] border border-[#2a2e39] px-4 py-2 rounded-lg">
                <div>
                  <span className="text-[#787b86] block text-[10px]">Total Market Cap</span>
                  <span className="font-bold text-white">$3.14 Trillion</span>
                </div>
                <div className="border-l border-[#2a2e39] pl-4">
                  <span className="text-[#787b86] block text-[10px]">BTC Dominance</span>
                  <span className="font-bold text-[#089981]">58.4%</span>
                </div>
              </div>
            </div>
            <InteractiveChart />
            <MarketMoversTable initialCategory="crypto" />
            <HeatmapView />
          </div>
        )}

        {activeScreen === 'forex' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Currencies &amp; Foreign Exchange</h1>
              <p className="text-xs text-[#787b86]">
                Global exchange rates, currency strength metrics, and cross rates
              </p>
            </div>
            <InteractiveChart />
            <ForexMatrix />
            <MarketMoversTable initialCategory="forex" />
          </div>
        )}

        {activeScreen === 'indices' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Global World Indices</h1>
              <p className="text-xs text-[#787b86]">
                S&amp;P 500, Nasdaq 100, Dow 30, Nikkei 225, FTSE 100, and European benchmarks
              </p>
            </div>
            <InteractiveChart />
            <MarketMoversTable initialCategory="indices" />
          </div>
        )}

        {activeScreen === 'futures' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Futures &amp; Commodities</h1>
              <p className="text-xs text-[#787b86]">
                Energy, precious metals, agriculture, and index futures contracts
              </p>
            </div>
            <InteractiveChart />
            <MarketMoversTable initialCategory="futures" />
          </div>
        )}

        {activeScreen === 'bonds' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Bonds &amp; Sovereign Yields</h1>
              <p className="text-xs text-[#787b86]">
                Government debt yields, term structures, and central bank interest rate benchmarks
              </p>
            </div>
            <InteractiveChart />
            <MarketMoversTable initialCategory="bonds" />
          </div>
        )}

        {activeScreen === 'heatmap' && (
          <div className="space-y-6">
            <HeatmapView />
          </div>
        )}

        {activeScreen === 'screener' && (
          <div className="space-y-6">
            <ScreenerView />
          </div>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <WatchlistSidebar />
      <SearchModal />
      <AssetDetailModal />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#2a2e39] bg-[#181c27] text-xs text-[#787b86] py-8 px-4 lg:px-8">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#2962ff] flex items-center justify-center text-white text-[10px] font-bold">
              TV
            </div>
            <span className="font-bold text-white">TradingView Markets</span>
            <span>· Global Financial Intelligence</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>Quotes simulated for demonstration</span>
            <span>·</span>
            <span>Real-time WebSocket protocol</span>
            <span>·</span>
            <span>Terms &amp; Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MainContent />
    </MarketProvider>
  );
}
