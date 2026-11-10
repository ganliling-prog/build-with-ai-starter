import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import { AssetCategory, TechnicalRating } from '../types/market';
import { SymbolLogo } from './SymbolLogo';
import {
  SlidersHorizontal,
  Download,
  RotateCcw,
  ArrowUpDown,
  Search,
  ExternalLink,
  Bookmark,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

export const ScreenerView: React.FC = () => {
  const {
    assets,
    selectSymbol,
    openDetail,
    formatPrice,
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
  } = useMarket();

  const [category, setCategory] = useState<AssetCategory | 'all'>('all');
  const [sector, setSector] = useState<string>('all');
  const [rating, setRating] = useState<TechnicalRating | 'all'>('all');
  const [minCap, setMinCap] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'price' | 'changePercent' | 'marketCapNum' | 'volumeNum'>('marketCapNum');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Extract unique sectors
  const availableSectors = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => {
      if (a.sector) set.add(a.sector);
    });
    return Array.from(set);
  }, [assets]);

  // Filtered & sorted list
  const filtered = useMemo(() => {
    let list = assets.filter((a) => {
      if (category !== 'all' && a.category !== category) return false;
      if (sector !== 'all' && a.sector !== sector) return false;
      if (rating !== 'all' && a.technicalRating !== rating) return false;
      if (minCap > 0 && a.marketCapNum < minCap) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !a.symbol.toLowerCase().includes(q) &&
          !a.name.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });

    list.sort((a, b) => {
      const valA = a[sortField] || 0;
      const valB = b[sortField] || 0;
      return sortOrder === 'desc' ? (valB as number) - (valA as number) : (valA as number) - (valB as number);
    });

    return list;
  }, [assets, category, sector, rating, minCap, search, sortField, sortOrder]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const resetFilters = () => {
    setCategory('all');
    setSector('all');
    setRating('all');
    setMinCap(0);
    setSearch('');
  };

  const handleExportCSV = () => {
    const headers = ['Symbol', 'Name', 'Category', 'Price', 'ChangePercent', 'TechnicalRating', 'Volume', 'MarketCap'];
    const rows = filtered.map((a) => [
      a.symbol,
      `"${a.name}"`,
      a.category,
      a.price,
      a.changePercent,
      a.technicalRating,
      `"${a.volume}"`,
      `"${a.marketCap}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradingview_screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Screener Filter Card */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2a2e39] pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#2962ff]" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Market Screener</h2>
              <p className="text-xs text-[#787b86]">Filter multi-asset securities by fundamentals and technical metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#787b86] hover:text-white bg-[#131722] hover:bg-[#2a2e39] border border-[#2a2e39] rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2962ff] hover:bg-[#1e53e5] rounded-md transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Selectors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div>
            <label className="block text-[#787b86] font-semibold mb-1">Search Asset</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ticker or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#131722] border border-[#2a2e39] rounded-md px-3 py-1.5 pl-8 text-white text-xs outline-none focus:border-[#2962ff]"
              />
              <Search className="w-3.5 h-3.5 text-[#787b86] absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Market Category */}
          <div>
            <label className="block text-[#787b86] font-semibold mb-1">Market Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded-md px-3 py-1.5 text-white text-xs outline-none focus:border-[#2962ff] cursor-pointer"
            >
              <option value="all">All Markets</option>
              <option value="stocks">Stocks</option>
              <option value="crypto">Crypto</option>
              <option value="forex">Forex</option>
              <option value="indices">Indices</option>
              <option value="futures">Futures / Commodities</option>
              <option value="bonds">Bonds</option>
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-[#787b86] font-semibold mb-1">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded-md px-3 py-1.5 text-white text-xs outline-none focus:border-[#2962ff] cursor-pointer"
            >
              <option value="all">All Sectors</option>
              {availableSectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Technical Rating */}
          <div>
            <label className="block text-[#787b86] font-semibold mb-1">Technical Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value as any)}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded-md px-3 py-1.5 text-white text-xs outline-none focus:border-[#2962ff] cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="Strong Buy">Strong Buy</option>
              <option value="Buy">Buy</option>
              <option value="Neutral">Neutral</option>
              <option value="Sell">Sell</option>
            </select>
          </div>

          {/* Market Cap */}
          <div>
            <label className="block text-[#787b86] font-semibold mb-1">Min Market Cap</label>
            <select
              value={minCap}
              onChange={(e) => setMinCap(Number(e.target.value))}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded-md px-3 py-1.5 text-white text-xs outline-none focus:border-[#2962ff] cursor-pointer"
            >
              <option value={0}>Any Size</option>
              <option value={10000000000}>$10B+ Large</option>
              <option value={100000000000}>$100B+ Mega</option>
              <option value={1000000000000}>$1T+ Trillion</option>
            </select>
          </div>
        </div>
      </div>

      {/* Screener Results Table */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] bg-[#181c27] text-[11px] font-semibold text-[#787b86] uppercase tracking-wider">
                <th className="py-2.5 px-4">Symbol / Name</th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    Price <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('changePercent')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    Change (%) <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">Technical Rating</th>
                <th
                  onClick={() => handleSort('volumeNum')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white hidden sm:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    Volume <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('marketCapNum')}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-white hidden md:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    Market Cap <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right hidden lg:table-cell">Sector</th>
                <th className="py-2.5 px-3 text-center w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/50 text-[#d1d4dc]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#787b86]">
                    No securities match the selected filter parameters.
                  </td>
                </tr>
              ) : (
                filtered.map((asset) => {
                  const isUp = asset.change >= 0;
                  const isFavorite = watchlist.includes(asset.symbol);

                  return (
                    <tr
                      key={asset.symbol}
                      onClick={() => selectSymbol(asset.symbol)}
                      className="hover:bg-[#222634] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <SymbolLogo src={asset.logo} symbol={asset.symbol} size="sm" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                                {asset.symbol}
                              </span>
                              <span className="text-[10px] text-[#787b86] uppercase px-1 py-0.2 bg-[#131722] rounded">
                                {asset.exchange}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#787b86] truncate max-w-[150px] sm:max-w-[220px]">
                              {asset.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-white tabular-nums">
                        {asset.category === 'bonds'
                          ? `${asset.price.toFixed(3)}%`
                          : formatPrice(asset.price)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold tabular-nums">
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] ${
                            isUp
                              ? 'text-[#089981] bg-[#089981]/15'
                              : 'text-[#f23645] bg-[#f23645]/15'
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

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            asset.technicalRating.includes('Buy')
                              ? 'text-[#089981] bg-[#089981]/10 border-[#089981]/30'
                              : asset.technicalRating.includes('Sell')
                              ? 'text-[#f23645] bg-[#f23645]/10 border-[#f23645]/30'
                              : 'text-[#ff9800] bg-[#ff9800]/10 border-[#ff9800]/30'
                          }`}
                        >
                          {asset.technicalRating}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-[#9598a1] tabular-nums hidden sm:table-cell">
                        {asset.volume}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-[#9598a1] tabular-nums hidden md:table-cell">
                        {asset.marketCap}
                      </td>

                      <td className="py-3 px-3 text-right text-[#787b86] hidden lg:table-cell">
                        {asset.sector || asset.category}
                      </td>

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
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => openDetail(asset.symbol)}
                            className="p-1 rounded text-[#787b86] hover:text-[#2962ff] hover:bg-[#2a2e39] transition-colors cursor-pointer"
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
      </div>
    </div>
  );
};
