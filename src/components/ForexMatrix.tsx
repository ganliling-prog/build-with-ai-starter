import React from 'react';
import { useMarket } from '../context/MarketContext';
import { SymbolLogo } from './SymbolLogo';
import { ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';

export const ForexMatrix: React.FC = () => {
  const { assets, selectSymbol } = useMarket();

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'CHF'];

  // Currency base exchange matrix rates relative to USD
  const baseRates: Record<string, number> = {
    USD: 1.0,
    EUR: 1.0718,
    GBP: 1.2942,
    JPY: 0.006515, // 1/153.48
    CAD: 0.7188,
    CHF: 1.139,
  };

  const flags: Record<string, string> = {
    USD: 'https://s3-symbol-logo.tradingview.com/country/US.svg',
    EUR: 'https://s3-symbol-logo.tradingview.com/country/EU.svg',
    GBP: 'https://s3-symbol-logo.tradingview.com/country/GB.svg',
    JPY: 'https://s3-symbol-logo.tradingview.com/country/JP.svg',
    CAD: 'https://s3-symbol-logo.tradingview.com/country/US.svg',
    CHF: 'https://s3-symbol-logo.tradingview.com/country/EU.svg',
  };

  return (
    <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-[#2a2e39] pb-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-[#2962ff]" />
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Forex Cross-Rates Matrix</h3>
            <p className="text-xs text-[#787b86]">Real-time exchange matrix between G10 reserve currencies</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#2a2e39] bg-[#181c27]">
              <th className="py-2.5 px-3 text-left font-bold text-[#787b86]">Base \ Quote</th>
              {currencies.map((curr) => (
                <th key={curr} className="py-2.5 px-3 font-bold text-white">
                  <div className="flex items-center justify-center gap-1.5">
                    <SymbolLogo src={flags[curr]} symbol={curr} size="xs" />
                    <span>{curr}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2e39]/50 font-mono">
            {currencies.map((base) => (
              <tr key={base} className="hover:bg-[#222634] transition-colors">
                <td className="py-2.5 px-3 text-left font-bold text-white flex items-center gap-1.5">
                  <SymbolLogo src={flags[base]} symbol={base} size="xs" />
                  <span>{base}</span>
                </td>
                {currencies.map((quote) => {
                  if (base === quote) {
                    return (
                      <td key={quote} className="py-2.5 px-3 text-[#787b86] font-semibold bg-[#131722]/40">
                        1.0000
                      </td>
                    );
                  }
                  const rate = baseRates[base] / baseRates[quote];
                  const isUp = base === 'USD' || (base === 'EUR' && quote === 'USD');

                  return (
                    <td
                      key={quote}
                      onClick={() => {
                        const pairSymbol = `${base}${quote}`;
                        const found = assets.find((a) => a.symbol === pairSymbol);
                        if (found) selectSymbol(found.symbol);
                      }}
                      className="py-2.5 px-3 font-semibold text-white cursor-pointer hover:bg-[#2962ff]/10"
                    >
                      <span className={rate > 1 ? 'text-[#089981]' : 'text-[#d1d4dc]'}>
                        {rate >= 10 ? rate.toFixed(2) : rate.toFixed(4)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
