import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MdArrowBack, 
  MdNotificationsActive, 
  MdFilterList, 
  MdRefresh, 
  MdVerified, 
  MdStorefront,
  MdHelpOutline
} from 'react-icons/md';
import priceService from '../services/priceService';
import StorePriceCard from '../components/price/StorePriceCard';
import PriceSummary from '../components/price/PriceSummary';
import PriceHistoryChart from '../components/price/PriceHistoryChart';
import PriceAlertModal from '../components/price/PriceAlertModal';
import LowestPriceBadge from '../components/price/LowestPriceBadge';

const PriceComparison = () => {
  const { laptopId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sorting & Filtering State
  const [sortBy, setSortBy] = useState('price_asc');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const fetchComparisonData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await priceService.getLaptopPrices(laptopId);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch price comparison data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (laptopId) {
      fetchComparisonData();
    }
  }, [laptopId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-gray-500 animate-pulse">Comparing prices across Amazon, Flipkart, Croma & Official Stores...</p>
      </div>
    );
  }

  if (error || !data || !data.laptop) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <MdHelpOutline size={32} />
        </div>
        <h3 className="font-outfit text-xl font-bold">Price Data Unavailable</h3>
        <p className="text-xs text-gray-400 leading-relaxed">{error || 'Could not find price comparison data for this laptop.'}</p>
        <Link to="/search" className="inline-block px-6 py-2.5 bg-primary-500 text-white font-bold text-xs rounded-xl shadow">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const { laptop, storeLinks = [], summary } = data;

  // Apply filtering & sorting to store offers
  let processedOffers = [...storeLinks];

  if (verifiedOnly) {
    processedOffers = processedOffers.filter(s => s.verified);
  }

  processedOffers.sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'verified') return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
    return 0;
  });

  const lowestPrice = summary?.lowestPrice || laptop.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      
      {/* Top Navigation & Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link 
          to={`/laptops/${laptop._id}`} 
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
        >
          <MdArrowBack size={18} />
          <span>Back to Laptop Specifications</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchComparisonData}
            className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Refresh prices"
          >
            <MdRefresh size={16} />
            <span className="hidden sm:inline">Refresh Prices</span>
          </button>

          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 hover:scale-105 transition-all"
          >
            <MdNotificationsActive size={16} />
            <span>Set Price Alert</span>
          </button>
        </div>
      </div>

      {/* Laptop Overview Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        <div className="md:col-span-1 flex justify-center">
          <img 
            src={laptop.thumbnail || (laptop.images && laptop.images[0])} 
            alt={laptop.title}
            className="max-h-44 object-contain rounded-2xl p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs"
          />
        </div>

        <div className="md:col-span-3 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 font-extrabold text-xs rounded-full uppercase tracking-wider">
              {laptop.brand}
            </span>
            <LowestPriceBadge type="lowest" />
          </div>

          <h1 className="font-outfit text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
            {laptop.title || `${laptop.brand} ${laptop.model}`}
          </h1>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <span>Processor: <strong className="text-gray-800 dark:text-gray-200">{laptop.processor}</strong></span>
            <span>•</span>
            <span>RAM: <strong className="text-gray-800 dark:text-gray-200">{laptop.ram}GB</strong></span>
            <span>•</span>
            <span>Storage: <strong className="text-gray-800 dark:text-gray-200">{laptop.storage}</strong></span>
          </div>

          <div className="pt-2 flex items-baseline gap-3">
            <span className="font-outfit text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{lowestPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-400">Current Lowest Market Price</span>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <PriceSummary summary={summary} />

      {/* Store Comparison Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <h2 className="font-outfit text-xl font-bold">Compare Stores & Retail Prices</h2>
            <p className="text-xs text-gray-400 mt-0.5">Showing verified retailer prices and marketplace offers for this laptop configuration.</p>
          </div>

          {/* Controls: Sorting & Filter Toggles */}
          <div className="flex items-center gap-3 flex-wrap">
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
          </div>
        </div>

        {/* Store Offers List */}
        {processedOffers.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder">
            <p className="text-xs text-gray-400">No store offers match your selected filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {processedOffers.map((offer, idx) => (
              <StorePriceCard 
                key={offer.storeName + idx} 
                offer={offer} 
                isLowest={offer.price === lowestPrice} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Price History Chart */}
      <PriceHistoryChart trendData={summary?.trend} />

      {/* Price Alert Modal */}
      <PriceAlertModal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)} 
        laptop={laptop} 
      />

    </div>
  );
};

export default PriceComparison;
