import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MarketAsset, Timeframe, ChartType, PriceAlert, AssetCategory } from '../types/market';
import { INITIAL_ASSETS } from '../data/marketData';

export type ScreenType =
  | 'overview'
  | 'stocks'
  | 'crypto'
  | 'forex'
  | 'indices'
  | 'futures'
  | 'bonds'
  | 'heatmap'
  | 'screener';

export type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'JPY';

interface ChartIndicators {
  volume: boolean;
  ma20: boolean;
  rsi: boolean;
}

interface AlertNotification {
  id: string;
  symbol: string;
  message: string;
  timestamp: number;
}

interface MarketContextType {
  assets: MarketAsset[];
  selectedSymbol: string;
  selectedAsset: MarketAsset;
  activeScreen: ScreenType;
  setActiveScreen: (screen: ScreenType) => void;
  selectSymbol: (symbol: string) => void;
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  indicators: ChartIndicators;
  toggleIndicator: (key: keyof ChartIndicators) => void;
  watchlist: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  isWatchlistOpen: boolean;
  setIsWatchlistOpen: (open: boolean) => void;
  toggleWatchlist: () => void;
  alerts: PriceAlert[];
  addAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  removeAlert: (id: string) => void;
  activeNotifications: AlertNotification[];
  dismissNotification: (id: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currency: CurrencyType;
  setCurrency: (c: CurrencyType) => void;
  formatPrice: (price: number, decimals?: number) => string;
  isLiveTicking: boolean;
  toggleLiveTicking: () => void;
  detailSymbol: string | null;
  openDetail: (symbol: string) => void;
  closeDetail: () => void;
  getAssetsByCategory: (category: AssetCategory) => MarketAsset[];
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const [activeScreen, setActiveScreen] = useState<ScreenType>('overview');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [indicators, setIndicators] = useState<ChartIndicators>({
    volume: true,
    ma20: true,
    rsi: false,
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tv_watchlist');
      return saved ? JSON.parse(saved) : ['SPX', 'NVDA', 'AAPL', 'BTCUSD', 'XAUUSD', 'TSLA', 'EURUSD'];
    } catch {
      return ['SPX', 'NVDA', 'AAPL', 'BTCUSD', 'XAUUSD', 'TSLA', 'EURUSD'];
    }
  });

  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'alert-sample-1',
      symbol: 'BTCUSD',
      targetPrice: 90000,
      condition: 'above',
      createdAt: Date.now() - 3600000,
    },
    {
      id: 'alert-sample-2',
      symbol: 'NVDA',
      targetPrice: 150,
      condition: 'above',
      createdAt: Date.now() - 7200000,
    },
  ]);
  const [activeNotifications, setActiveNotifications] = useState<AlertNotification[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currency, setCurrency] = useState<CurrencyType>('USD');
  const [isLiveTicking, setIsLiveTicking] = useState(true);
  const [detailSymbol, setDetailSymbol] = useState<string | null>(null);

  // Sync theme with document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  // Persist watchlist
  useEffect(() => {
    try {
      localStorage.setItem('tv_watchlist', JSON.stringify(watchlist));
    } catch {
      // ignore
    }
  }, [watchlist]);

  // Global keyboard shortcuts (Ctrl+K, Cmd+K, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setDetailSymbol(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live simulation tick engine
  useEffect(() => {
    if (!isLiveTicking) return;

    const interval = setInterval(() => {
      setAssets((prevAssets) => {
        // Pick 2-4 random assets to tick
        const tickCount = Math.floor(Math.random() * 3) + 2;
        const indicesToTick = new Set<number>();
        while (indicesToTick.size < tickCount) {
          indicesToTick.add(Math.floor(Math.random() * prevAssets.length));
        }

        return prevAssets.map((asset, idx) => {
          if (!indicesToTick.has(idx)) {
            return asset.lastTickDir ? { ...asset, lastTickDir: null } : asset;
          }

          // Generate subtle price fluctuation
          const deltaPct = (Math.random() - 0.49) * 0.0035; // ~0.05% to 0.35%
          const deltaPrice = asset.price * deltaPct;
          const newPrice = Math.max(0.0001, Number((asset.price + deltaPrice).toFixed(asset.price < 10 ? 4 : 2)));
          const direction = deltaPrice >= 0 ? 'up' : 'down';
          const newChange = Number((asset.change + deltaPrice).toFixed(asset.price < 10 ? 4 : 2));
          const newChangePercent = Number(((newChange / (asset.price - asset.change)) * 100).toFixed(2));
          const newHigh = Math.max(asset.high24h, newPrice);
          const newLow = Math.min(asset.low24h, newPrice);

          // Update latest candle point
          const updated1D = [...asset.candles1D];
          if (updated1D.length > 0) {
            const lastCandle = { ...updated1D[updated1D.length - 1] };
            lastCandle.close = newPrice;
            lastCandle.high = Math.max(lastCandle.high, newPrice);
            lastCandle.low = Math.min(lastCandle.low, newPrice);
            lastCandle.volume += Math.floor(Math.random() * 50);
            updated1D[updated1D.length - 1] = lastCandle;
          }

          // Check price alerts
          alerts.forEach((alert) => {
            if (alert.symbol === asset.symbol && !alert.triggered) {
              if (
                (alert.condition === 'above' && newPrice >= alert.targetPrice) ||
                (alert.condition === 'below' && newPrice <= alert.targetPrice)
              ) {
                alert.triggered = true;
                setActiveNotifications((n) => [
                  {
                    id: `alert-${Date.now()}-${Math.random()}`,
                    symbol: asset.symbol,
                    message: `${asset.symbol} crossed ${alert.condition} $${alert.targetPrice} (Now: $${newPrice.toLocaleString()})`,
                    timestamp: Date.now(),
                  },
                  ...n,
                ]);
              }
            }
          });

          return {
            ...asset,
            price: newPrice,
            change: newChange,
            changePercent: newChangePercent,
            high24h: newHigh,
            low24h: newLow,
            candles1D: updated1D,
            sparkline: updated1D.map((c) => c.close),
            lastTickDir: direction,
          };
        });
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isLiveTicking, alerts]);

  const selectedAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];

  const selectSymbol = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, []);

  const openDetail = useCallback((symbol: string) => {
    setDetailSymbol(symbol);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailSymbol(null);
  }, []);

  const toggleIndicator = useCallback((key: keyof ChartIndicators) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => (prev.includes(symbol) ? prev : [...prev, symbol]));
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
  }, []);

  const isInWatchlist = useCallback(
    (symbol: string) => watchlist.includes(symbol),
    [watchlist]
  );

  const toggleWatchlist = useCallback(() => {
    setIsWatchlistOpen((prev) => !prev);
  }, []);

  const addAlert = useCallback(
    (symbol: string, targetPrice: number, condition: 'above' | 'below') => {
      const newAlert: PriceAlert = {
        id: `alert-${Date.now()}`,
        symbol,
        targetPrice,
        condition,
        createdAt: Date.now(),
      };
      setAlerts((prev) => [newAlert, ...prev]);
    },
    []
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setActiveNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleLiveTicking = useCallback(() => {
    setIsLiveTicking((prev) => !prev);
  }, []);

  const formatPrice = useCallback(
    (price: number, decimals?: number) => {
      let multiplier = 1;
      let symbolPrefix = '$';

      if (currency === 'EUR') {
        multiplier = 0.93;
        symbolPrefix = '€';
      } else if (currency === 'GBP') {
        multiplier = 0.77;
        symbolPrefix = '£';
      } else if (currency === 'JPY') {
        multiplier = 153.5;
        symbolPrefix = '¥';
      }

      const converted = price * multiplier;
      const dec =
        decimals !== undefined
          ? decimals
          : price < 1
          ? 4
          : price < 10
          ? 3
          : currency === 'JPY'
          ? 0
          : 2;

      return `${symbolPrefix}${converted.toLocaleString(undefined, {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      })}`;
    },
    [currency]
  );

  const getAssetsByCategory = useCallback(
    (category: AssetCategory) => {
      return assets.filter((a) => a.category === category);
    },
    [assets]
  );

  return (
    <MarketContext.Provider
      value={{
        assets,
        selectedSymbol,
        selectedAsset,
        activeScreen,
        setActiveScreen,
        selectSymbol,
        timeframe,
        setTimeframe,
        chartType,
        setChartType,
        indicators,
        toggleIndicator,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        isWatchlistOpen,
        setIsWatchlistOpen,
        toggleWatchlist,
        alerts,
        addAlert,
        removeAlert,
        activeNotifications,
        dismissNotification,
        isSearchOpen,
        setIsSearchOpen,
        theme,
        toggleTheme,
        currency,
        setCurrency,
        formatPrice,
        isLiveTicking,
        toggleLiveTicking,
        detailSymbol,
        openDetail,
        closeDetail,
        getAssetsByCategory,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = (): MarketContextType => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
