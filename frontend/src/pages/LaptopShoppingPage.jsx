import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdArrowBack, MdRefresh, MdHelpOutline } from 'react-icons/md';
import priceService from '../services/priceService';
import ProductOverview from '../components/price/ProductOverview';
import SpecificationTable from '../components/price/SpecificationTable';
import PerformanceScores from '../components/price/PerformanceScores';
import AIExplanation from '../components/price/AIExplanation';
import StoreComparison from '../components/price/StoreComparison';
import PriceSummary from '../components/price/PriceSummary';
import BestDealCard from '../components/price/BestDealCard';
import PriceHistoryChart from '../components/price/PriceHistoryChart';
import PriceAlertModal from '../components/price/PriceAlertModal';
import SimilarLaptops from '../components/price/SimilarLaptops';
import AlternativeLaptops from '../components/price/AlternativeLaptops';

const LaptopShoppingPage = () => {
  const { id, laptopId } = useParams();
  const targetId = id || laptopId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const fetchShoppingData = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      const res = forceRefresh 
        ? await priceService.refreshPrices(targetId) 
        : await priceService.getLaptopPrices(targetId);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch laptop shopping and price comparison data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      fetchShoppingData();
    }
  }, [targetId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-gray-500 animate-pulse">
          Fetching live retailer offers from Amazon, Flipkart, Croma & Official Stores...
        </p>
      </div>
    );
  }

  if (error || !data || !data.laptop) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <MdHelpOutline size={32} />
        </div>
        <h3 className="font-outfit text-xl font-bold">Shopping Data Unavailable</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          {error || 'Could not find price comparison data for this laptop.'}
        </p>
        <Link to="/search" className="inline-block px-6 py-2.5 bg-primary-500 text-white font-bold text-xs rounded-xl shadow">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const { laptop, storeLinks = [], summary } = data;
  const lowestPrice = summary?.lowestPrice || laptop.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      
      {/* SECTION 12: PAGE HEADER & NAVIGATION */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <Link 
          to={`/laptops/${laptop._id}`} 
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
        >
          <MdArrowBack size={18} />
          <span>Back to Laptop Specifications</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchShoppingData(true)}
            className="px-3.5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Refresh prices"
          >
            <MdRefresh size={16} />
            <span className="hidden sm:inline">Refresh Prices</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: PRODUCT OVERVIEW */}
      <ProductOverview 
        laptop={laptop} 
        summary={summary} 
        onOpenAlertModal={() => setIsAlertModalOpen(true)} 
      />

      {/* SECTION 9: BEST DEAL HIGHLIGHT CARD */}
      <BestDealCard summary={summary} />

      {/* SECTION 8: PRICE SUMMARY ANALYTICS */}
      <PriceSummary summary={summary} />

      {/* SECTION 5 & 13 & 6 & 11: LIVE PRICE COMPARISON & STORE TABLE & VERIFIED BADGES */}
      <StoreComparison storeLinks={storeLinks} lowestPrice={lowestPrice} />

      {/* SECTION 4: WHY LAPWISE RECOMMENDS THIS LAPTOP (GEMINI AI) */}
      <AIExplanation laptop={laptop} />

      {/* SECTION 3: PERFORMANCE BENCHMARK SCORES */}
      <PerformanceScores laptop={laptop} />

      {/* SECTION 2: FULL TECHNICAL SPECIFICATIONS GRID */}
      <SpecificationTable laptop={laptop} />

      {/* SECTION 7: PRICE HISTORY CHART & EMPTY STATE */}
      <PriceHistoryChart trendData={summary?.trend} />

      {/* SECTION 14: SIMILAR LAPTOPS */}
      <SimilarLaptops laptopId={laptop._id} />

      {/* SECTION 15: CURATED ALTERNATIVE CHOICES */}
      <AlternativeLaptops laptopId={laptop._id} />

      {/* SECTION 10: PRICE ALERT MODAL */}
      <PriceAlertModal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)} 
        laptop={laptop} 
      />

    </div>
  );
};

export default LaptopShoppingPage;
