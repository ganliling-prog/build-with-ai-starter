import React, { useState } from 'react';
import { INITIAL_NEWS } from '../data/newsData';
import { useMarket } from '../context/MarketContext';
import { Newspaper, ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MarketNewsFeed: React.FC = () => {
  const { selectSymbol, openDetail } = useMarket();
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Stocks', 'Crypto', 'Forex', 'Bonds', 'Futures'];

  const filteredNews =
    filterCategory === 'All'
      ? INITIAL_NEWS
      : INITIAL_NEWS.filter((n) => n.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2a2e39] pb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[#2962ff]" />
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Market News &amp; Editorial Analysis</h2>
            <p className="text-xs text-[#787b86]">Real-time wire stories, macro analysis, and earnings catalysts</p>
          </div>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* News list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((news) => {
          const sentimentIcon =
            news.sentiment === 'Bullish' ? (
              <TrendingUp className="w-3 h-3 text-[#089981]" />
            ) : news.sentiment === 'Bearish' ? (
              <TrendingDown className="w-3 h-3 text-[#f23645]" />
            ) : (
              <Minus className="w-3 h-3 text-[#ff9800]" />
            );

          return (
            <div
              key={news.id}
              className="p-3.5 bg-[#181c27] hover:bg-[#222634] border border-[#2a2e39]/60 rounded-lg transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Meta header */}
                <div className="flex items-center justify-between text-[11px] text-[#787b86] mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{news.source}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {news.timeAgo}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {sentimentIcon}
                    <span
                      className={`font-semibold ${
                        news.sentiment === 'Bullish'
                          ? 'text-[#089981]'
                          : news.sentiment === 'Bearish'
                          ? 'text-[#f23645]'
                          : 'text-[#ff9800]'
                      }`}
                    >
                      {news.sentiment}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-[#f0f3fa] group-hover:text-[#2962ff] transition-colors leading-snug line-clamp-2 mb-2">
                  {news.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-[#9598a1] line-clamp-2 leading-relaxed mb-3">
                  {news.summary}
                </p>
              </div>

              {/* Related symbol chips */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2a2e39]/50 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-[#787b86]">Tickers:</span>
                  {news.relatedSymbols.map((sym) => (
                    <button
                      key={sym}
                      onClick={() => selectSymbol(sym)}
                      className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#131722] hover:bg-[#2962ff] text-[#d1d4dc] hover:text-white rounded border border-[#2a2e39] transition-colors cursor-pointer"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-[#787b86]">{news.readTime}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
