import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { SymbolLogo } from './SymbolLogo';
import {
  X,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Bell,
  Bookmark,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const WatchlistSidebar: React.FC = () => {
  const {
    assets,
    watchlist,
    removeFromWatchlist,
    addToWatchlist,
    selectSymbol,
    selectedSymbol,
    openDetail,
    formatPrice,
    isWatchlistOpen,
    setIsWatchlistOpen,
    alerts,
    addAlert,
    removeAlert,
    activeNotifications,
    dismissNotification,
  } = useMarket();

  const [activeTab, setActiveTab] = useState<'watchlist' | 'alerts'>('watchlist');
  const [addInput, setAddInput] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Alert form state
  const [alertSymbol, setAlertSymbol] = useState(selectedSymbol);
  const [alertTarget, setAlertTarget] = useState(
    assets.find((a) => a.symbol === selectedSymbol)?.price.toFixed(2) || '100'
  );
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertAddedMessage, setAlertAddedMessage] = useState(false);

  if (!isWatchlistOpen) return null;

  const watchlistAssets = watchlist
    .map((sym) => assets.find((a) => a.symbol === sym))
    .filter(Boolean) as typeof assets;

  // Search filtered symbols to add
  const availableToAdd = assets.filter(
    (a) =>
      !watchlist.includes(a.symbol) &&
      (a.symbol.toLowerCase().includes(addInput.toLowerCase()) ||
        a.name.toLowerCase().includes(addInput.toLowerCase()))
  );

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(alertTarget);
    if (!isNaN(target) && target > 0) {
      addAlert(alertSymbol, target, alertCondition);
      setAlertAddedMessage(true);
      setTimeout(() => setAlertAddedMessage(false), 2000);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96 bg-[#181c27] border-l border-[#2a2e39] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#2a2e39] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#2962ff] text-white'
                : 'text-[#787b86] hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Alerts ({alerts.length})
          </button>
        </div>

        <button
          onClick={() => setIsWatchlistOpen(false)}
          className="p-1.5 text-[#787b86] hover:text-white hover:bg-[#2a2e39] rounded-md transition-colors cursor-pointer"
          title="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Triggered Notifications Banner */}
      {activeNotifications.length > 0 && (
        <div className="p-3 bg-[#089981]/15 border-b border-[#089981]/30 space-y-2">
          {activeNotifications.slice(0, 2).map((notif) => (
            <div
              key={notif.id}
              className="flex items-start justify-between gap-2 text-xs text-[#089981] font-semibold"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#089981]" />
                <span>{notif.message}</span>
              </div>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="text-[#787b86] hover:text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 1: Watchlist Content */}
      {activeTab === 'watchlist' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Quick Add Bar */}
          <div className="p-3 border-b border-[#2a2e39] bg-[#131722]/60 relative">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search symbol to add..."
                value={addInput}
                onChange={(e) => {
                  setAddInput(e.target.value);
                  setShowAddMenu(true);
                }}
                onFocus={() => setShowAddMenu(true)}
                className="flex-1 bg-[#181c27] border border-[#2a2e39] rounded px-2.5 py-1.5 text-xs text-white placeholder-[#787b86] outline-none focus:border-[#2962ff]"
              />
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="p-1.5 bg-[#2962ff] text-white rounded hover:bg-[#1e53e5] transition-colors cursor-pointer"
                title="Add symbol"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Auto-suggest dropdown */}
            {showAddMenu && addInput.trim().length > 0 && (
              <div className="absolute left-3 right-3 top-12 z-50 bg-[#1e222d] border border-[#2a2e39] rounded-md shadow-xl max-h-48 overflow-y-auto">
                {availableToAdd.length === 0 ? (
                  <div className="p-2 text-xs text-[#787b86] text-center">
                    No available symbols to add
                  </div>
                ) : (
                  availableToAdd.map((asset) => (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        addToWatchlist(asset.symbol);
                        setAddInput('');
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center justify-between p-2 hover:bg-[#2a2e39] text-xs text-left cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <SymbolLogo src={asset.logo} symbol={asset.symbol} size="xs" />
                        <span className="font-bold text-white">{asset.symbol}</span>
                        <span className="text-[11px] text-[#787b86] truncate max-w-[120px]">
                          {asset.name}
                        </span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-[#2962ff]" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Watchlist Symbol Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/50">
            {watchlistAssets.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#787b86]">
                Your watchlist is empty. Search and add symbols above.
              </div>
            ) : (
              watchlistAssets.map((asset) => {
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
                    className={`p-3 flex items-center justify-between group transition-colors cursor-pointer ${tickFlashClass} ${
                      isSelected ? 'bg-[#2962ff]/10' : 'hover:bg-[#222634]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <SymbolLogo src={asset.logo} symbol={asset.symbol} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs group-hover:text-[#2962ff] transition-colors">
                            {asset.symbol}
                          </span>
                          <span className="text-[9px] text-[#787b86] uppercase">
                            {asset.exchange}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#787b86] truncate max-w-[110px]">
                          {asset.name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-white tabular-nums">
                          {asset.category === 'bonds'
                            ? `${asset.price.toFixed(3)}%`
                            : formatPrice(asset.price)}
                        </div>
                        <div
                          className={`text-[10px] font-mono font-semibold flex items-center justify-end gap-0.5 tabular-nums ${
                            isUp ? 'text-[#089981]' : 'text-[#f23645]'
                          }`}
                        >
                          {isUp ? (
                            <TrendingUp className="w-2.5 h-2.5" />
                          ) : (
                            <TrendingDown className="w-2.5 h-2.5" />
                          )}
                          <span>
                            {isUp ? '+' : ''}
                            {asset.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(asset.symbol);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#787b86] hover:text-[#f23645] transition-opacity cursor-pointer"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Alerts Management */}
      {activeTab === 'alerts' && (
        <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
          {/* New Alert Form */}
          <form
            onSubmit={handleCreateAlert}
            className="p-3.5 bg-[#1e222d] border border-[#2a2e39] rounded-lg space-y-3"
          >
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Create New Price Alert
            </h4>

            <div>
              <label className="block text-[11px] text-[#787b86] font-semibold mb-1">
                Target Asset
              </label>
              <select
                value={alertSymbol}
                onChange={(e) => {
                  setAlertSymbol(e.target.value);
                  const a = assets.find((x) => x.symbol === e.target.value);
                  if (a) setAlertTarget(a.price.toString());
                }}
                className="w-full bg-[#131722] border border-[#2a2e39] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#2962ff]"
              >
                {assets.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} - {a.name} (${a.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[#787b86] font-semibold mb-1">
                  Condition
                </label>
                <select
                  value={alertCondition}
                  onChange={(e) => setAlertCondition(e.target.value as any)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#2962ff]"
                >
                  <option value="above">Crosses Above</option>
                  <option value="below">Crosses Below</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#787b86] font-semibold mb-1">
                  Target Price ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={alertTarget}
                  onChange={(e) => setAlertTarget(e.target.value)}
                  className="w-full bg-[#131722] border border-[#2a2e39] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#2962ff]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-[#2962ff] hover:bg-[#1e53e5] text-white font-semibold text-xs rounded transition-colors cursor-pointer"
            >
              Set Price Alert
            </button>

            {alertAddedMessage && (
              <div className="text-center text-[11px] font-semibold text-[#089981]">
                ✓ Alert configured successfully!
              </div>
            )}
          </form>

          {/* Active Alerts List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#787b86] uppercase tracking-wider">
              Configured Alerts ({alerts.length})
            </h4>

            {alerts.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#787b86]">
                No active price alerts set.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    alert.triggered
                      ? 'bg-[#089981]/10 border-[#089981]/30 text-white'
                      : 'bg-[#1e222d] border-[#2a2e39] text-[#d1d4dc]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="text-[#2962ff]">{alert.symbol}</span>
                      <span>{alert.condition === 'above' ? '≥' : '≤'}</span>
                      <span className="font-mono">${alert.targetPrice}</span>
                    </div>
                    <div className="text-[10px] text-[#787b86]">
                      {alert.triggered ? 'Triggered!' : 'Monitoring in real-time...'}
                    </div>
                  </div>

                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-1 text-[#787b86] hover:text-[#f23645] transition-colors"
                    title="Delete alert"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
