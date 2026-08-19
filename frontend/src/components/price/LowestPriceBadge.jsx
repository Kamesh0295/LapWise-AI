import React from 'react';
import { MdEmojiEvents, MdLocalOffer } from 'react-icons/md';

const LowestPriceBadge = ({ type = 'lowest' }) => {
  if (type === 'best-deal') {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
        <MdLocalOffer className="text-sm" />
        Best Deal
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-md animate-pulse">
      <MdEmojiEvents className="text-sm text-yellow-200" />
      🏆 Lowest Price
    </span>
  );
};

export default LowestPriceBadge;
