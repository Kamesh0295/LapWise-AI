import React, { useState } from 'react';
import { MdFilterList, MdVerified, MdViewList, MdViewModule, MdLocationOn, MdSearch, MdChevronRight, MdChevronLeft } from 'react-icons/md';
import StorePriceCard from './StorePriceCard';

const StoreComparison = ({ storeLinks = [], lowestPrice = 0 }) => {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('price_asc');
  const [locationFilter, setLocationFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Sample default store links matching prompt mock if storeLinks is limited
  const defaultMockStores = [
    { storeName: 'Dotcom stores', logoUrl: '', price: 30990, oldPrice: 208988, discount: 85, availability: 'In Stock', delivery: 'FREE Delivery', buyUrl: 'https://dotcomstores.com', verified: true, storeCategory: 'retailer' },
    { storeName: 'Amazon India', logoUrl: '', price: 38990, oldPrice: 204990, discount: 81, availability: 'In Stock', delivery: 'FREE Delivery', buyUrl: 'https://amazon.in', verified: true, storeCategory: 'retailer' },
    { storeName: 'Flipkart', logoUrl: '', price: 39999, oldPrice: 209999, discount: 81, availability: 'In Stock', delivery: 'FREE Delivery', buyUrl: 'https://flipkart.com', verified: true, storeCategory: 'retailer' },
    { storeName: 'Croma', logoUrl: '', price: 41990, oldPrice: 214990, discount: 81, availability: 'In Stock', delivery: 'FREE Delivery', buyUrl: 'https://croma.com', verified: true, storeCategory: 'retailer' },
    { storeName: 'Reliance Digital', logoUrl: '', price: 45990, oldPrice: 215990, discount: 79, availability: 'In Stock', delivery: 'FREE Delivery', buyUrl: 'https://reliancedigital.in', verified: true, storeCategory: 'retailer' }
  ];

  const activeLinks = (storeLinks && storeLinks.length > 0) ? storeLinks : defaultMockStores;

  let processed = [...activeLinks];

  if (verifiedOnly) {
    processed = processed.filter(s => s.verified);
  }

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    processed = processed.filter(s => s.storeName.toLowerCase().includes(q));
  }

  processed.sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'verified') return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
    return 0;
  });

  const effectiveLowest = lowestPrice || (processed.length > 0 ? Math.min(...processed.map(p => p.price)) : 30990);

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="font-outfit text-xl font-bold text-gray-900 dark:text-white">Live Price Comparison</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">Real-time prices from multiple stores</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Toggle Buttons */}
          <div className="flex items-center gap-1 bg-[#F9FAFB] dark:bg-gray-800 p-1 rounded-xl border border-[#E5E7EB] dark:border-gray-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-blue-50 dark:bg-blue-950 text-[#1E88E5] font-bold shadow-2xs' 
                  : 'text-[#6B7280] hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <MdViewModule size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-blue-50 dark:bg-blue-950 text-[#1E88E5] font-bold shadow-2xs' 
                  : 'text-[#6B7280] hover:text-gray-900'
              }`}
              title="List View"
            >
              <MdViewList size={20} />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#F9FAFB] dark:bg-gray-800 px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-bold text-[#1E88E5] focus:outline-none cursor-pointer"
            >
              <option value="price_asc">Lowest Price First</option>
              <option value="price_desc">Highest Price First</option>
              <option value="verified">Verified Stores First</option>
            </select>
          </div>

          {/* Nearby Stores Dropdown */}
          <div className="flex items-center gap-1 bg-[#F9FAFB] dark:bg-gray-800 px-3 py-2 rounded-xl border border-[#E5E7EB] dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <MdLocationOn className="text-[#1E88E5]" size={16} />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-transparent font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">Nearby Stores</option>
              <option value="online">Online Delivery</option>
              <option value="local">Local Pickup</option>
            </select>
          </div>

          {/* Search Input & Button (#1E88E5) */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store..."
                className="w-32 sm:w-40 px-3 py-2 bg-[#F9FAFB] dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
              />
            </div>

            <button
              onClick={() => {}}
              className="px-4 py-2 bg-[#1E88E5] hover:bg-blue-600 text-white font-outfit text-xs font-semibold rounded-[12px] shadow-2xs transition-all hover:scale-105"
              style={{ padding: '10px 18px' }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Cards List / Grid Rendering */}
      {processed.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-darkCard rounded-3xl border border-[#E5E7EB] dark:border-darkBorder">
          <p className="text-xs text-[#6B7280]">No store offers match your search criteria.</p>
        </div>
      ) : (
        <div className="relative">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {processed.map((offer, idx) => (
                <StorePriceCard 
                  key={idx} 
                  offer={offer} 
                  isLowest={offer.price === effectiveLowest} 
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {processed.map((offer, idx) => (
                <StorePriceCard 
                  key={idx} 
                  offer={offer} 
                  isLowest={offer.price === effectiveLowest} 
                  viewMode="list"
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default StoreComparison;
