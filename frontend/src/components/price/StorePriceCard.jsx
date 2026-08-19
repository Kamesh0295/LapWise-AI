import React from 'react';
import { MdOpenInNew, MdLocalShipping, MdCheckCircle, MdWarning } from 'react-icons/md';
import StoreLogo from './StoreLogo';
import VerifiedStoreBadge from './VerifiedStoreBadge';
import LowestPriceBadge from './LowestPriceBadge';

const StorePriceCard = ({ offer, isLowest }) => {
  const { storeName, logoUrl, price, oldPrice, discount, availability, delivery, buyUrl, verified } = offer;

  const handleBuyClick = (e) => {
    // URL security check: prevent dangerous links
    if (!buyUrl || buyUrl === '#' || buyUrl.toLowerCase().startsWith('javascript:')) {
      e.preventDefault();
      alert('This store URL is invalid or unavailable.');
    }
  };

  return (
    <div className={`relative p-5 rounded-2xl border transition-all duration-300 ${
      isLowest 
        ? 'border-emerald-500 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent dark:from-emerald-950/20 shadow-lg ring-2 ring-emerald-500/20' 
        : 'border-gray-200 dark:border-darkBorder bg-white dark:bg-darkCard hover:shadow-md'
    }`}>

      {isLowest && (
        <div className="absolute -top-3 right-6">
          <LowestPriceBadge type="lowest" />
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Store info & verified status */}
        <div className="flex items-center gap-4">
          <StoreLogo storeName={storeName} logoUrl={logoUrl} size="w-12 h-12" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-outfit font-bold text-base text-gray-900 dark:text-white">{storeName}</h3>
              <VerifiedStoreBadge verified={verified} storeName={storeName} />
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <MdCheckCircle size={14} /> {availability}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MdLocalShipping size={14} /> {delivery}
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & Buy Action */}
        <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
          <div className="text-left md:text-right">
            <div className="flex items-baseline gap-2">
              <span className="font-outfit text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {oldPrice > price && (
                <span className="text-xs text-gray-400 line-through">
                  ₹{oldPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md mt-0.5">
                Save {discount}% OFF
              </span>
            )}
          </div>

          {/* Secure external URL link */}
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBuyClick}
            className={`px-5 py-2.5 rounded-xl font-outfit text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm ${
              isLowest
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:scale-105'
                : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105'
            }`}
          >
            <span>Buy at {storeName.split(' ')[0]}</span>
            <MdOpenInNew size={15} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default StorePriceCard;
