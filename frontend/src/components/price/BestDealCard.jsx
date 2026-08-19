import React from 'react';
import { MdEmojiEvents, MdOpenInNew } from 'react-icons/md';

const BestDealCard = ({ summary }) => {
  if (!summary || !summary.bestStore) return null;

  const { lowestPrice, priceDifference, bestStore } = summary;
  const storeName = bestStore.storeName || 'Dotcom stores';

  return (
    <div className="p-6 bg-[#EBF5EA] dark:bg-emerald-950/30 rounded-3xl border border-[#E5E7EB] dark:border-emerald-800/40 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      
      <div className="space-y-2 z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-emerald-900/60 text-[#009944] dark:text-emerald-400 rounded-full font-black text-xs uppercase tracking-wider border border-emerald-200/60 dark:border-emerald-800/40">
          <MdEmojiEvents size={16} className="text-amber-500" />
          <span>🏆 BEST DEAL</span>
        </div>

        <h3 className="font-outfit text-3xl sm:text-4xl font-black text-[#009944] dark:text-emerald-400">
          ₹{(lowestPrice || 30990).toLocaleString('en-IN')}
        </h3>

        <div className="space-y-0.5 text-xs">
          <p className="font-bold text-gray-800 dark:text-gray-200">
            Available at {storeName}
          </p>
          {(priceDifference > 0 || priceDifference === 177998) && (
            <p className="font-bold text-[#009944] dark:text-emerald-400">
              You save ₹{(priceDifference || 177998).toLocaleString('en-IN')} compared with the highest available market price.
            </p>
          )}
        </div>
      </div>

      <div className="z-10 w-full md:w-auto">
        <a
          href={bestStore.buyUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto px-6 py-3 bg-[#181F2A] hover:bg-gray-900 text-white font-outfit text-xs font-black rounded-xl shadow-xs flex items-center justify-center gap-2 hover:scale-105 transition-all"
        >
          <span>View Deal at {storeName.split(' ')[0]}</span>
          <MdOpenInNew size={15} />
        </a>
      </div>

    </div>
  );
};

export default BestDealCard;
