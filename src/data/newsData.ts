import { NewsItem } from '../types/market';

export const INITIAL_NEWS: NewsItem[] = [
  {
    id: 'news-1',
    title: 'S&P 500 pushes towards record levels as mega-cap tech earnings power equity sentiment',
    source: 'TradingView News',
    timeAgo: '18m ago',
    category: 'Stocks',
    sentiment: 'Bullish',
    readTime: '3 min read',
    relatedSymbols: ['SPX', 'NVDA', 'AAPL', 'MSFT'],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    summary: 'Wall Street benchmarks advanced on solid volume today as enterprise demand for next-generation AI hardware, resilient quarterly margins, and dovish expectations across capital markets supported risk appetite.'
  },
  {
    id: 'news-2',
    title: 'Bitcoin approaches all-time highs following institutional ETF inflows and macro tailwinds',
    source: 'CoinDesk',
    timeAgo: '42m ago',
    category: 'Crypto',
    sentiment: 'Bullish',
    readTime: '4 min read',
    relatedSymbols: ['BTCUSD', 'ETHUSD', 'SOLUSD'],
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    summary: 'Net exchange inflows accelerated as sovereign wealth funds and treasury reserve allocators increased spot cryptocurrency balances, with total crypto market capitalization surpassing $3.1 trillion.'
  },
  {
    id: 'news-3',
    title: 'Federal Reserve rate pathway keeps 10-Year Treasury yield steady near 4.44%',
    source: 'Bloomberg',
    timeAgo: '1h ago',
    category: 'Bonds',
    sentiment: 'Neutral',
    readTime: '5 min read',
    relatedSymbols: ['US10Y', 'US02Y', 'EURUSD'],
    imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    summary: 'Bond traders are calibrating monetary policy probabilities ahead of central bank speeches and inflation data, with short-term curve spreads demonstrating continued normalization.'
  },
  {
    id: 'news-4',
    title: 'Crude oil softens as global supply balances outweigh localized inventory draws',
    source: 'Reuters',
    timeAgo: '2h ago',
    category: 'Futures',
    sentiment: 'Bearish',
    readTime: '3 min read',
    relatedSymbols: ['USOIL', 'XAUUSD'],
    imageUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=800&q=80',
    summary: 'WTI crude prices slipped below $69 a barrel on signs of resilient non-OPEC output and cautious manufacturing sentiment across European industrial sectors.'
  },
  {
    id: 'news-5',
    title: 'NVIDIA surges to fresh highs ahead of data center compute architecture rollout',
    source: 'MarketWatch',
    timeAgo: '3h ago',
    category: 'Stocks',
    sentiment: 'Bullish',
    readTime: '4 min read',
    relatedSymbols: ['NVDA', 'AMD', 'NDX'],
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    summary: 'Analysts lifted price targets on NVIDIA as hyperscale cloud providers signaled higher capex commitments for cluster training and real-time inference workloads.'
  },
  {
    id: 'news-6',
    title: 'European Central Bank signals readiness for further rate cuts amid cooling core inflation',
    source: 'Financial Times',
    timeAgo: '4h ago',
    category: 'Forex',
    sentiment: 'Neutral',
    readTime: '4 min read',
    relatedSymbols: ['EURUSD', 'DE10Y', 'FTSE'],
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80',
    summary: 'The Euro slipped against the greenback after officials reiterated their baseline intention to preserve economic growth and provide lending stability.'
  }
];
