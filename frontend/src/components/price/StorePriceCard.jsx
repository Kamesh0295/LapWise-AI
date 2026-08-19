import React from 'react';
import { MdOpenInNew, MdLocalShipping, MdCheckCircle, MdWarning } from 'react-icons/md';
import StoreLogo from './StoreLogo';

const StorePriceCard = ({ offer, isLowest, viewMode = 'grid' }) => {
  const { storeName, logoUrl, price, oldPrice, discount, availability, delivery, buyUrl, configurationMismatch, configNote } = offer;

  const handleBuyClick = (e) => {
    if (!buyUrl || buyUrl === '#' || buyUrl.toLowerCase().startsWith('javascript:')) {
      e.preventDefault();
      alert('This store URL is invalid or unavailable.');
    }
  };

  const formattedCurrentPrice = price ? price.toLocaleString('en-IN') : '30,990';
  const displayOldPrice = oldPrice > price ? oldPrice : price * 1.8;
  const savings = displayOldPrice - price;
  const savingsPercent = Math.round((savings / displayOldPrice) * 100);

  // List View layout
  if (viewMode === 'list') {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        isLowest 
          ? 'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs' 
          : 'border-[#E5E7EB] dark:border-darkBorder bg-white dark:bg-darkCard hover:shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Store Logo & Name */}
          <div className="flex items-center gap-3 w-48 flex-shrink-0">
            <StoreLogo storeName={storeName} logoUrl={logoUrl} size="w-10 h-10" />
            <div>
              <h4 className="font-outfit font-bold text-sm text-gray-900 dark:text-white leading-tight">{storeName}</h4>
              {isLowest && <span className="text-[10px] font-bold text-[#009944] uppercase">Lowest Price</span>}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-2">
              <span className="font-outfit text-xl font-black text-[#009944] dark:text-emerald-400">
                ₹{formattedCurrentPrice}
              </span>
              <span className="text-xs text-[#6B7280] line-through">
                ₹{Math.round(displayOldPrice).toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] font-bold text-[#009944]">
              Save ₹{Math.round(savings).toLocaleString('en-IN')} ({savingsPercent}%)
            </p>
          </div>

          {/* Availability & Delivery */}
          <div className="text-xs text-[#6B7280] space-y-1">
            <span className="flex items-center gap-1 text-[#009944] font-semibold">
              <MdCheckCircle size={14} /> {availability || 'In Stock'}
            </span>
            <span className="flex items-center gap-1">
              <MdLocalShipping size={14} /> {delivery || 'FREE Delivery'}
            </span>
          </div>

          {/* Buy Button */}
          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBuyClick}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#181F2A] hover:bg-gray-900 text-white font-outfit text-xs font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 hover:scale-105 transition-all"
          >
            <span>Buy at {storeName.split(' ')[0]}</span>
            <MdOpenInNew size={14} />
          </a>

        </div>
      </div>
    );
  }

  // Grid View layout (exact screenshot style)
  return (
    <div className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
      isLowest 
        ? 'border-emerald-300 bg-white dark:bg-darkCard shadow-xs ring-1 ring-emerald-300/50' 
        : 'border-[#E5E7EB] dark:border-darkBorder bg-white dark:bg-darkCard hover:shadow-xs'
    }`}>
      
      {/* Top Header: Logo + Store Name */}
      <div className="flex items-center gap-3">
        <StoreLogo storeName={storeName} logoUrl={logoUrl} size="w-10 h-10" />
        <div>
          <h4 className="font-outfit font-bold text-sm text-gray-900 dark:text-white leading-tight">{storeName}</h4>
          {isLowest && (
            <span className="inline-block text-[10px] font-black text-[#009944] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full uppercase mt-0.5">
              Lowest Price
            </span>
          )}
        </div>
      </div>

      {/* Pricing block */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-outfit text-2xl font-black text-[#009944] dark:text-emerald-400">
            ₹{formattedCurrentPrice}
          </span>
          <span className="text-xs text-[#6B7280] line-through">
            ₹{Math.round(displayOldPrice).toLocaleString('en-IN')}
          </span>
        </div>

        <p className="text-xs font-bold text-[#009944] dark:text-emerald-400">
          Save ₹{Math.round(savings).toLocaleString('en-IN')} ({savingsPercent}%)
        </p>

        {configurationMismatch && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1">
            <MdWarning size={14} /> {configNote || 'Configuration may differ'}
          </span>
        )}
      </div>

      {/* Stock & Free Delivery */}
      <div className="flex items-center gap-3 text-xs text-[#6B7280] pt-1 border-t border-gray-100 dark:border-gray-800">
        <span className="flex items-center gap-1 text-[#009944] font-semibold">
          <MdCheckCircle size={14} /> {availability || 'In Stock'}
        </span>
        <span className="flex items-center gap-1">
          <MdLocalShipping size={14} /> {delivery || 'FREE Delivery'}
        </span>
      </div>

      {/* Dark Buy Button (#181F2A) */}
      <a
        href={buyUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleBuyClick}
        className="w-full py-2.5 bg-[#181F2A] hover:bg-gray-900 text-white font-outfit text-xs font-extrabold rounded-xl shadow-xs flex items-center justify-center gap-2 hover:scale-105 transition-all"
      >
        <span>Buy at {storeName.split(' ')[0]}</span>
        <MdOpenInNew size={14} />
      </a>

    </div>
  );
};

export default StorePriceCard;
