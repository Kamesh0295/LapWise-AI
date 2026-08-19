import React, { useState } from 'react';
import { MdFilterList, MdVerified, MdViewList, MdViewModule, MdShield, MdStorefront, MdInfoOutline } from 'react-icons/md';
import StorePriceCard from './StorePriceCard';
import StoreLogo from './StoreLogo';
import VerifiedStoreBadge from './VerifiedStoreBadge';

const StoreComparison = ({ storeLinks = [], lowestPrice = 0, summary }) => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [sortBy, setSortBy] = useState('price_asc');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Group into 3 categories using backend helper or client logic
  const retailers = storeLinks.filter(s => s.verified && s.storeCategory === 'retailer' && !s.configurationMismatch);
  const manufacturers = storeLinks.filter(s => s.verified && s.storeCategory === 'manufacturer' && !s.configurationMismatch);
  const marketplace = storeLinks.filter(s => !s.verified || s.storeCategory === 'marketplace' || s.configurationMismatch);

  const applySort = (list) => {
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'verified') return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      return 0;
    });
    return sorted;
  };

  const sortedRetailers = applySort(retailers);
  const sortedManufacturers = applySort(manufacturers);
  const sortedMarketplace = applySort(marketplace);

  const hasVerifiedOffers = sortedRetailers.length > 0 || sortedManufacturers.length > 0;

  return (
    <div className="space-y-8">
      
      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="font-outfit text-xl font-bold">Live Retailer & Store Comparison</h2>
          <p className="text-xs text-gray-400 mt-0.5">Categorized by verified retailers, official manufacturer stores, and marketplace sellers.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Verified Only Toggle */}
          <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold">
            <input 
              type="checkbox" 
              checked={verifiedOnly} 
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500" 
            />
            <MdVerified className="text-emerald-500" />
            <span>Verified Stores Only</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <MdFilterList size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price_asc">Lowest Price First</option>
              <option value="price_desc">Highest Price First</option>
              <option value="verified">Verified Stores First</option>
            </select>
          </div>

          {/* View Toggle Buttons */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-white dark:bg-darkCard text-blue-600 shadow-xs' : 'text-gray-400'
              }`}
              title="Card View"
            >
              <MdViewModule size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white dark:bg-darkCard text-blue-600 shadow-xs' : 'text-gray-400'
              }`}
              title="Table View"
            >
              <MdViewList size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: VERIFIED RETAILERS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MdVerified className="text-emerald-500" size={20} />
          <h3 className="font-outfit text-base font-bold text-gray-900 dark:text-white">Verified Retailers</h3>
          <span className="text-xs font-extrabold text-gray-400">({sortedRetailers.length})</span>
        </div>

        {sortedRetailers.length === 0 ? (
          <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-200/60 dark:border-gray-800 flex items-center gap-2.5 text-xs text-gray-400">
            <MdInfoOutline size={18} className="text-amber-500 flex-shrink-0" />
            <span>No verified retailer offers (Amazon, Flipkart, Croma) were returned for this exact laptop configuration.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRetailers.map((offer, idx) => (
              <StorePriceCard key={idx} offer={offer} isLowest={offer.price === lowestPrice} />
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: OFFICIAL MANUFACTURER STORES */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <MdShield className="text-blue-500" size={20} />
          <h3 className="font-outfit text-base font-bold text-gray-900 dark:text-white">Official Manufacturer Stores</h3>
          <span className="text-xs font-extrabold text-gray-400">({sortedManufacturers.length})</span>
        </div>

        {sortedManufacturers.length === 0 ? (
          <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-200/60 dark:border-gray-800 flex items-center gap-2.5 text-xs text-gray-400">
            <MdInfoOutline size={18} className="text-blue-400 flex-shrink-0" />
            <span>No official brand store links found for this configuration.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedManufacturers.map((offer, idx) => (
              <StorePriceCard key={idx} offer={offer} isLowest={offer.price === lowestPrice} />
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: MARKETPLACE / OTHER SELLERS */}
      {!verifiedOnly && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <MdStorefront className="text-gray-400" size={20} />
            <h3 className="font-outfit text-base font-bold text-gray-900 dark:text-white">Other Sellers & Marketplaces</h3>
            <span className="text-xs font-extrabold text-gray-400">({sortedMarketplace.length})</span>
          </div>

          {sortedMarketplace.length === 0 ? (
            <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-2xl border border-gray-200/60 dark:border-gray-800 text-xs text-gray-400">
              No additional marketplace seller offers found.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedMarketplace.map((offer, idx) => (
                <StorePriceCard key={idx} offer={offer} isLowest={offer.price === lowestPrice} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default StoreComparison;
