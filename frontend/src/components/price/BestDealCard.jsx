import React from 'react';
import { MdEmojiEvents, MdOpenInNew, MdSavings } from 'react-icons/md';

const BestDealCard = ({ summary }) => {
  if (!summary || !summary.bestStore) return null;

  const { lowestPrice, priceDifference, bestStore } = summary;

  return (
    <div className="p-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
        <MdSavings size={200} />
      </div>

      <div className="space-y-2 z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-gray-900 rounded-full font-black text-xs uppercase tracking-wider shadow-sm">
          <MdEmojiEvents size={16} />
          <span>🏆 BEST DEAL</span>
        </div>

        <h3 className="font-outfit text-3xl sm:text-4xl font-black">
          ₹{lowestPrice?.toLocaleString('en-IN')}
        </h3>

        <p className="text-xs text-emerald-100 font-medium">
          Available at <strong className="text-white underline">{bestStore.storeName}</strong>
          {priceDifference > 0 && (
            <span className="block mt-1 text-emerald-200">
              You save <strong className="text-white font-extrabold">₹{priceDifference.toLocaleString('en-IN')}</strong> compared with the highest current market offer.
            </span>
          )}
        </p>
      </div>

      <div className="z-10 w-full md:w-auto">
        <a
          href={bestStore.buyUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-outfit text-xs font-black rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all"
        >
          <span>Claim Best Deal at {bestStore.storeName?.split(' ')[0]}</span>
          <MdOpenInNew size={16} />
        </a>
      </div>

    </div>
  );
};

export default BestDealCard;
