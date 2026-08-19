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
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10 text-white">
          <MdSavings size={160} />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-100 bg-white/20 px-3 py-1 rounded-full">
            Best Deal Highlight
          </span>
          <h3 className="font-outfit text-3xl font-black mt-3">₹{lowestPrice?.toLocaleString('en-IN')}</h3>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            Lowest price available at <strong className="text-white underline">{bestStore?.storeName}</strong>
          </p>
        </div>

        {priceDifference > 0 && (
          <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
            <span className="text-xs text-emerald-100">You Save</span>
            <span className="font-outfit text-lg font-black text-white">
              ₹{priceDifference?.toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* 2. Price Alteration / Trend Indicator */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-gray-400">Price Trend</span>
          <div className="flex items-center gap-3 mt-2">
            {isPriceDrop ? (
              <div className="p-3 bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400 rounded-2xl">
                <MdTrendingDown size={28} />
              </div>
            ) : isPriceIncrease ? (
              <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-2xl">
                <MdTrendingUp size={28} />
              </div>
            ) : (
              <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-2xl">
                <MdSavings size={28} />
              </div>
            )}

            <div>
              {isPriceDrop ? (
                <div>
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 block">Price dropped ₹{Math.abs(priceChange).toLocaleString('en-IN')}</span>
                  <span className="text-[11px] text-gray-400">₹{previousPrice?.toLocaleString('en-IN')} → ₹{currentPrice?.toLocaleString('en-IN')} ({Math.abs(priceChangePercent)}% off)</span>
                </div>
              ) : isPriceIncrease ? (
                <div>
                  <span className="text-xs font-bold text-red-500 block">Price increased ₹{priceChange.toLocaleString('en-IN')}</span>
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

      {/* 3. Historical Range Stats Grid */}
      <div className="p-6 rounded-3xl bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder shadow-sm flex flex-col justify-between">
        <span className="text-xs font-bold text-gray-400">Recorded Price Range</span>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Lowest Ever</span>
            <span className="font-outfit text-base font-extrabold text-green-600 dark:text-green-400">
              ₹{lowestRecordedPrice?.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">Highest Ever</span>
            <span className="font-outfit text-base font-extrabold text-red-500">
              ₹{highestRecordedPrice?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
          <span className="text-gray-400 font-medium">Average Price:</span>
          <span className="font-outfit font-bold text-gray-800 dark:text-gray-200">
            ₹{averagePrice?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

    </div>
  );
};

export default PriceSummary;
