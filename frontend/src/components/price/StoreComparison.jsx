import React, { useState } from 'react';
import { MdFilterList, MdVerified, MdViewList, MdViewModule } from 'react-icons/md';
import StorePriceCard from './StorePriceCard';
import StoreLogo from './StoreLogo';
import VerifiedStoreBadge from './VerifiedStoreBadge';

const StoreComparison = ({ storeLinks = [], lowestPrice = 0 }) => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [sortBy, setSortBy] = useState('price_asc');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  let processed = [...storeLinks];

  if (verifiedOnly) {
    processed = processed.filter(s => s.verified);
  }

  processed.sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'verified') return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
    return 0;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & View Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="font-outfit text-xl font-bold">Live Retailer Price Comparison</h2>
          <p className="text-xs text-gray-400 mt-0.5">Real-time offers across verified retailer platforms and authorized seller networks.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Verified Only Toggle */}
          <label className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold">
            <input 
              type="checkbox" 
              checked={verifiedOnly} 
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-emerald-500" 
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
              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                viewMode === 'cards' ? 'bg-white dark:bg-darkCard text-primary-600 shadow-xs' : 'text-gray-400'
              }`}
              title="Card View"
            >
              <MdViewModule size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-white dark:bg-darkCard text-primary-600 shadow-xs' : 'text-gray-400'
              }`}
              title="Table View"
            >
              <MdViewList size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {processed.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder">
          <p className="text-xs text-gray-400">No store offers match your selected filter criteria.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-4">
          {processed.map((offer, idx) => (
            <StorePriceCard 
              key={idx} 
              offer={offer} 
              isLowest={offer.price === lowestPrice} 
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-gray-200 dark:border-darkBorder bg-white dark:bg-darkCard shadow-sm">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-darkBorder bg-gray-50/50 dark:bg-gray-800/10 font-bold text-gray-400">
                <th className="p-4">Store Platform</th>
                <th className="p-4">Current Price</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Availability</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {processed.map((offer, idx) => {
                const isLowest = offer.price === lowestPrice;
                return (
                  <tr key={idx} className={isLowest ? 'bg-emerald-500/5' : ''}>
                    <td className="p-4 font-bold flex items-center gap-3">
                      <StoreLogo storeName={offer.storeName} logoUrl={offer.logoUrl} size="w-8 h-8" />
                      <span>{offer.storeName}</span>
                    </td>
                    <td className="p-4 font-outfit font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                      ₹{offer.price.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-semibold text-gray-500">
                      {offer.discount > 0 ? `${offer.discount}% OFF` : 'Standard'}
                    </td>
                    <td className="p-4 text-gray-500 font-medium">
                      {offer.availability}
                    </td>
                    <td className="p-4">
                      <VerifiedStoreBadge verified={offer.verified} storeName={offer.storeName} />
                    </td>
                    <td className="p-4 text-right">
                      <a
                        href={offer.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-outfit text-xs font-extrabold rounded-xl shadow-xs transition-all inline-block"
                      >
                        Buy at {offer.storeName.split(' ')[0]}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default StoreComparison;
