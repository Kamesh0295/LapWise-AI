import React from 'react';
import { MdTrendingDown, MdTrendingUp, MdSavings, MdAccessTime } from 'react-icons/md';

const PriceSummary = ({ summary }) => {
  if (!summary) return null;

  const { lowestPrice, highestPrice, priceDifference, bestStore, trend } = summary;
  const { currentPrice, previousPrice, lowestRecordedPrice, highestRecordedPrice, averagePrice, priceChange, priceChangePercent, lastChecked } = trend || {};

  const isPriceDrop = priceChange < 0;
  const isPriceIncrease = priceChange > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* 1. Best Deal Savings Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lowest Market Price</span>
          <h3 className="font-outfit text-3xl font-black text-gray-900 dark:text-white mt-2">₹{lowestPrice?.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Lowest offer at <strong className="text-gray-800 dark:text-gray-200">{bestStore?.storeName}</strong>
          </p>
        </div>

        {priceDifference > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Market Difference</span>
            <span className="font-outfit text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
              Save ₹{priceDifference?.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* 2. Price Alteration / Trend Indicator */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Price Drop Indicator</span>
          <div className="flex items-center gap-3 mt-3">
            {isPriceDrop ? (
              <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-xl">
                <MdTrendingDown size={24} />
              </div>
            ) : isPriceIncrease ? (
              <div className="p-2.5 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-xl">
                <MdTrendingUp size={24} />
              </div>
            ) : (
              <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-xl">
                <MdSavings size={24} />
              </div>
            )}

            <div>
              {isPriceDrop ? (
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                    ↓ ₹{Math.abs(priceChange).toLocaleString('en-IN')} Price Drop
                  </span>
                  <span className="text-[11px] text-gray-400">
                    ₹{previousPrice?.toLocaleString('en-IN')} → ₹{currentPrice?.toLocaleString('en-IN')} ({Math.abs(priceChangePercent)}% off)
                  </span>
                </div>
              ) : isPriceIncrease ? (
                <div>
                  <span className="text-xs font-bold text-red-500 block">↑ ₹{priceChange.toLocaleString('en-IN')} Price Increase</span>
                  <span className="text-[11px] text-gray-400">Up from ₹{previousPrice?.toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">Stable Market Price</span>
                  <span className="text-[11px] text-gray-400">No price alteration detected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <MdAccessTime size={14} /> Last checked:
          </span>
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            {lastChecked ? new Date(lastChecked).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
          </span>
        </div>
      </div>

      {/* 3. Historical Price Stats Grid */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-sm flex flex-col justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recorded Price Range</span>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Lowest Ever</span>
            <span className="font-outfit text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              ₹{lowestRecordedPrice?.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Highest Ever</span>
            <span className="font-outfit text-base font-extrabold text-gray-700 dark:text-gray-300">
              ₹{highestRecordedPrice?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Average Market Price:</span>
          <span className="font-outfit font-bold text-gray-800 dark:text-gray-200">
            ₹{averagePrice?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

    </div>
  );
};

export default PriceSummary;
