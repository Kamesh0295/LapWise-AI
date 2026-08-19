import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  MdCompareArrows, 
  MdFavorite, 
  MdFavoriteBorder, 
  MdLaunch, 
  MdArrowBack,
  MdCheck,
  MdHelpOutline
} from 'react-icons/md';
import recommendService from '../services/recommendService';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';

const RecommendationResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompareList, addToCompare, removeFromCompare } = useCompare();

  // Redirect to wizard if no parameters are set in history
  if (!state) {
    React.useEffect(() => {
      navigate('/wizard');
    }, [navigate]);
    return null;
  }

  const { purpose, maxPrice, preferredBrand, answers } = state;

  // React Query fetch
  const { data: recommendationsRes, isLoading, error } = useQuery({
    queryKey: ['wizardRecommendations', purpose, maxPrice, preferredBrand, answers],
    queryFn: () => recommendService.getWizardRecommendations({
      purpose,
      maxPrice,
      preferredBrand,
      answers
    })
  });

  const recommendations = recommendationsRes?.data || [];

  const handleWishlistToggle = async (laptopId) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/wizard');
      return;
    }
    try {
      if (isWishlisted(laptopId)) {
        await removeFromWishlist(laptopId);
      } else {
        await addToWishlist(laptopId);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompareToggle = (laptop) => {
    try {
      if (isInCompareList(laptop._id)) {
        removeFromCompare(laptop._id);
      } else {
        addToCompare(laptop);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // 1. Loading Skeleton View
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-10">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        
        {/* Top card skeleton */}
        <div className="h-[400px] w-full bg-white dark:bg-darkCard rounded-3xl border border-gray-200/50 dark:border-darkBorder animate-pulse" />
        
        {/* Grid skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[250px] bg-white dark:bg-darkCard rounded-3xl border border-gray-200/50 dark:border-darkBorder animate-pulse" />
          <div className="h-[250px] bg-white dark:bg-darkCard rounded-3xl border border-gray-200/50 dark:border-darkBorder animate-pulse" />
        </div>
      </div>
    );
  }

  // 2. Error View
  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <h3 className="font-outfit text-2xl font-bold text-red-500">Failed to calculate recommendations</h3>
        <p className="text-gray-400 mt-2">{error.message}</p>
        <Link to="/wizard" className="mt-6 px-6 py-2.5 bg-primary-500 text-white font-bold rounded-lg shadow">
          Restart Wizard
        </Link>
      </div>
    );
  }

  // 3. Empty recommendations view
  if (recommendations.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 mb-6">
          <MdHelpOutline size={40} />
        </div>
        <h3 className="font-outfit text-xl font-bold">No matching laptops found</h3>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          We couldn't find any laptops in our catalog under ₹{maxPrice.toLocaleString('en-IN')}. Try restarting the wizard with a slightly higher budget or clearing the brand filter.
        </p>
        <Link to="/wizard" className="mt-6 px-6 py-2.5 bg-primary-500 text-white font-bold rounded-lg shadow">
          Restart Wizard
        </Link>
      </div>
    );
  }

  const bestMatch = recommendations[0];
  const otherMatches = recommendations.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      
      {/* Header back button */}
      <div>
        <button 
          onClick={() => navigate('/wizard')} 
          className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-primary-500 font-semibold transition-colors"
        >
          <MdArrowBack />
          <span>Restart Questionnaire</span>
        </button>
        <h1 className="font-outfit text-3xl font-extrabold text-gray-900 dark:text-white mt-4">
          Your Personal Matches
        </h1>
        <p className="text-xs text-gray-400">We scanned our catalog and identified these laptops as your best choices.</p>
      </div>

      {/* 1. Best Match Highlight Card (Rank 1) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white dark:bg-darkCard border-2 border-primary-500/80 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 px-6 py-2 bg-primary-500 text-white text-xs font-bold uppercase tracking-wider rounded-bl-2xl">
          Best Match
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Visual Percentage score */}
          <div className="flex flex-col items-center justify-center text-center p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
            <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-4 border-primary-500 bg-primary-500/5">
              <span className="font-outfit text-5xl font-black text-primary-500">{bestMatch.matchPercentage}%</span>
            </div>
            <h3 className="font-bold text-lg mt-6">{bestMatch.laptop.brand} {bestMatch.laptop.model}</h3>
            <span className="font-outfit text-2xl font-black text-green-600 mt-2">₹{bestMatch.laptop.price.toLocaleString('en-IN')}</span>
          </div>

          {/* Details & Specs */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Explanation</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5">{bestMatch.explanation}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-gray-100 dark:border-gray-800 py-4">
              <div>
                <span className="text-[10px] text-gray-400">Processor</span>
                <p className="text-xs font-semibold mt-0.5 truncate">{bestMatch.laptop.processor}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400">Graphics (GPU)</span>
                <p className="text-xs font-semibold mt-0.5 truncate">{bestMatch.laptop.gpu}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400">RAM / Memory</span>
                <p className="text-xs font-semibold mt-0.5 truncate">{bestMatch.laptop.ram}GB RAM</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400">Storage</span>
                <p className="text-xs font-semibold mt-0.5 truncate">{bestMatch.laptop.storage}</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400">Weight</span>
                <p className="text-xs font-semibold mt-0.5 truncate">{bestMatch.laptop.weight} kg</p>
              </div>
              <div>
                <span className="text-[10px] text-gray-400">Screen</span>
                <p className="text-xs font-semibold mt-0.5 truncate">{bestMatch.laptop.display}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link 
                to={`/prices/${bestMatch.laptop._id}`} 
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-outfit font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow"
              >
                <span>Check Prices</span>
                <MdLaunch />
              </Link>
              <Link 
                to={`/laptops/${bestMatch.laptop._id}`} 
                className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
              >
                <span>Full Details</span>
              </Link>
              <button 
                onClick={() => handleCompareToggle(bestMatch.laptop)}
                className={`px-5 py-2.5 border text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                  isInCompareList(bestMatch.laptop._id)
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {isInCompareList(bestMatch.laptop._id) ? <MdCheck /> : <MdCompareArrows size={18} />}
                <span>{isInCompareList(bestMatch.laptop._id) ? 'Added to Compare' : 'Add to Compare'}</span>
              </button>
              <button 
                onClick={() => handleWishlistToggle(bestMatch.laptop._id)}
                className={`p-2.5 border rounded-xl flex items-center justify-center transition-colors ${
                  isWishlisted(bestMatch.laptop._id)
                    ? 'border-red-500 text-red-500 bg-red-500/10'
                    : 'border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400'
                }`}
              >
                {isWishlisted(bestMatch.laptop._id) ? <MdFavorite size={20} /> : <MdFavoriteBorder size={20} />}
              </button>
            </div>
          </div>

        </div>
      </motion.div>

      {/* 2. Other Recommendations (Ranks 2-5) */}
      {otherMatches.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-outfit text-xl font-bold">Alternative Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherMatches.map((item, idx) => (
              <motion.div
                key={item.laptop._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-outfit text-lg font-bold">{item.laptop.brand} {item.laptop.model}</span>
                    <span className="px-2.5 py-1 bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 font-bold text-xs rounded-full">
                      {item.matchPercentage}% Match
                    </span>
                  </div>
                  <span className="font-outfit text-lg font-extrabold text-green-600 block mt-1">₹{item.laptop.price.toLocaleString('en-IN')}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">{item.explanation}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Link to={`/prices/${item.laptop._id}`} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-outfit text-xs font-extrabold rounded-lg flex items-center gap-1 shadow-sm">
                    <span>Check Prices</span>
                    <MdLaunch />
                  </Link>
                  <Link to={`/laptops/${item.laptop._id}`} className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400">
                    <span>Specs</span>
                  </Link>
                  <div className="ml-auto flex items-center gap-2">
                    <button 
                      onClick={() => handleCompareToggle(item.laptop)}
                      className={`p-2 border rounded-xl flex items-center justify-center transition-colors ${
                        isInCompareList(item.laptop._id)
                          ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                          : 'border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400'
                      }`}
                      title="Add to compare"
                    >
                      {isInCompareList(item.laptop._id) ? <MdCheck size={18} /> : <MdCompareArrows size={18} />}
                    </button>
                    <button 
                      onClick={() => handleWishlistToggle(item.laptop._id)}
                      className={`p-2 border rounded-xl flex items-center justify-center transition-colors ${
                        isWishlisted(item.laptop._id)
                          ? 'border-red-500 text-red-500 bg-red-500/10'
                          : 'border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400'
                      }`}
                      title="Add to wishlist"
                    >
                      {isWishlisted(item.laptop._id) ? <MdFavorite size={18} /> : <MdFavoriteBorder size={18} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default RecommendationResult;
