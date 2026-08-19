import React, { useState } from 'react';
import { MdStar, MdAccessTime, MdNotificationsActive, MdCompareArrows, MdFavorite, MdFavoriteBorder, MdCheck } from 'react-icons/md';
import LowestPriceBadge from './LowestPriceBadge';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';

const ProductOverview = ({ laptop, summary, onOpenAlertModal }) => {
  const [selectedImage, setSelectedImage] = useState(
    laptop.thumbnail || (laptop.images && laptop.images[0]) || ''
  );
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompareList, addToCompare, removeFromCompare } = useCompare();

  const lowestPrice = summary?.lowestPrice || laptop.price;
  const highestPrice = summary?.highestPrice || laptop.price;
  const priceDifference = summary?.priceDifference || 0;
  const lastChecked = summary?.trend?.lastChecked || laptop.lastUpdated;

  const images = laptop.images && laptop.images.length > 0 ? laptop.images : [laptop.thumbnail];

  const wishlisted = isWishlisted(laptop._id);
  const inCompare = isInCompareList(laptop._id);

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder shadow-sm space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 flex flex-col items-center gap-4">
          <div className="w-full h-64 sm:h-72 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <img 
              src={selectedImage || 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg'} 
              alt={laptop.model}
              className="max-h-full max-w-full object-contain transition-all duration-300"
            />
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-14 p-1 rounded-xl border object-contain bg-white dark:bg-gray-800 transition-all ${
                    selectedImage === img 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Key Summary & Price Callout */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300 font-extrabold text-xs rounded-full uppercase tracking-wider">
              {laptop.brand} {laptop.series ? `• ${laptop.series}` : ''}
            </span>
            <LowestPriceBadge type="lowest" />
            <LowestPriceBadge type="best-deal" />
          </div>

          <h1 className="font-outfit text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
            {laptop.title || `${laptop.brand} ${laptop.model}`}
          </h1>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center text-yellow-500 font-bold">
              <MdStar size={16} />
              <span className="ml-1 text-gray-800 dark:text-gray-200">{laptop.rating || 4.2}</span>
              <span className="text-gray-400 ml-1">({laptop.reviewCount || laptop.numReviews || 24} reviews)</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1 text-gray-400">
              <MdAccessTime size={14} />
              <span>Updated {lastChecked ? new Date(lastChecked).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'recently'}</span>
            </div>
          </div>

          {/* Pricing Highlight Box */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 block">Current Lowest Price</span>
              <span className="font-outfit text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{lowestPrice.toLocaleString('en-IN')}
              </span>
            </div>

            {priceDifference > 0 && (
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Highest Available: ₹{highestPrice.toLocaleString('en-IN')}</span>
                <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                  Save up to ₹{priceDifference.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Action Row Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAlertModal}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-outfit text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 hover:scale-105 transition-all"
            >
              <MdNotificationsActive size={16} />
              <span>Set Price Alert</span>
            </button>

            <button
              onClick={() => (wishlisted ? removeFromWishlist(laptop._id) : addToWishlist(laptop._id))}
              className={`px-4 py-2.5 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                wishlisted
                  ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-950/30'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {wishlisted ? <MdFavorite size={18} /> : <MdFavoriteBorder size={18} />}
              <span>{wishlisted ? 'Saved to Wishlist' : 'Wishlist'}</span>
            </button>

            <button
              onClick={() => (inCompare ? removeFromCompare(laptop._id) : addToCompare(laptop))}
              className={`px-4 py-2.5 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                inCompare
                  ? 'border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {inCompare ? <MdCheck size={18} /> : <MdCompareArrows size={18} />}
              <span>{inCompare ? 'Added to Compare' : 'Compare'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductOverview;
