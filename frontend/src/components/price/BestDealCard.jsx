import React from 'react';
import { MdEmojiEvents, MdOpenInNew, MdSavings } from 'react-icons/md';

const BestDealCard = ({ summary }) => {
  if (!summary || !summary.bestStore) return null;

  const { lowestPrice, priceDifference, bestStore } = summary;

  return (
    <div className="p-6 bg-white dark:bg-darkCard rounded-3xl border-2 border-primary-500/40 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      
      <div className="space-y-2 z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 rounded-full font-black text-xs uppercase tracking-wider">
          <MdEmojiEvents size={16} className="text-amber-500" />
          <span>🏆 BEST DEAL</span>
        </div>

        <h3 className="font-outfit text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
          ₹{lowestPrice?.toLocaleString('en-IN')}
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Available at <strong className="text-gray-900 dark:text-white font-bold">{bestStore.storeName}</strong>
          {priceDifference > 0 && (
            <span className="block mt-1 text-emerald-600 dark:text-emerald-400 font-bold">
              You save ₹{priceDifference.toLocaleString('en-IN')} compared with the highest available market price.
            </span>
          )}
        </p>
      </div>

      <div className="z-10 w-full md:w-auto">
        <a
          href={bestStore.buyUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-outfit text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 hover:scale-105 transition-all"
        >
          <span>View Deal at {bestStore.storeName?.split(' ')[0]}</span>
          <MdOpenInNew size={16} />
        </a>
      </div>

    </div>
  );
};

export default BestDealCard;
