export type AssetCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'bonds';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface CandlePoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  sector?: string;
  exchange: string;
  logo: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  openPrice: number;
  volume: string;
  volumeNum: number;
  marketCap: string;
  marketCapNum: number;
  peRatio?: number;
  technicalRating: TechnicalRating;
  sparkline: number[];
  candles1D: CandlePoint[];
  candles1W: CandlePoint[];
  candles1M: CandlePoint[];
  candles1Y: CandlePoint[];
  description?: string;
  country?: string;
  dividendYield?: string;
  beta?: number;
  week52High?: number;
  week52Low?: number;
  lastTickDir?: 'up' | 'down' | null;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  category: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  readTime: string;
  relatedSymbols: string[];
  imageUrl: string;
  summary: string;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: number;
  notes?: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered?: boolean;
}

export type Timeframe = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | 'ALL';
export type ChartType = 'area' | 'candlestick' | 'line' | 'bars';
