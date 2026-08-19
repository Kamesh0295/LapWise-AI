import React, { useState } from 'react';
import { MdClose, MdNotificationsActive, MdCheckCircle } from 'react-icons/md';
import priceService from '../../services/priceService';
import { useAuth } from '../../context/AuthContext';

const PriceAlertModal = ({ isOpen, onClose, laptop }) => {
  const { isAuthenticated } = useAuth();
  const [targetPrice, setTargetPrice] = useState(
    laptop ? Math.round(laptop.price * 0.9) : ''
  );
  const [store, setStore] = useState('Any Store');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !laptop) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please sign in to set price drop alerts.');
      return;
    }

    if (!targetPrice || Number(targetPrice) <= 0) {
      setError('Please enter a valid target price.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await priceService.createPriceAlert({
        laptopId: laptop._id,
        targetPrice: Number(targetPrice),
        store
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create price alert.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-darkCard w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-darkBorder relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MdClose size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 rounded-2xl">
            <MdNotificationsActive size={24} />
          </div>
          <div>
            <h3 className="font-outfit text-lg font-bold">Set Price Alert</h3>
            <p className="text-xs text-gray-400">Receive live alerts when the price drops below your target.</p>
          </div>
        </div>

        {/* Laptop Info Summary */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl mb-5 flex items-center gap-3">
          <img 
            src={laptop.thumbnail || (laptop.images && laptop.images[0])} 
            alt={laptop.model}
            className="w-12 h-12 object-contain rounded-lg bg-white p-1 border"
          />
          <div>
            <p className="font-bold text-xs line-clamp-1">{laptop.brand} {laptop.model}</p>
            <p className="text-xs text-emerald-600 font-extrabold">Current Price: ₹{laptop.price?.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center text-green-600 dark:text-green-400 space-y-2">
            <MdCheckCircle size={48} className="mx-auto" />
            <h4 className="font-outfit text-base font-bold">Price Alert Activated!</h4>
            <p className="text-xs text-gray-400">We will notify you via dashboard & email as soon as the price drops below ₹{Number(targetPrice).toLocaleString('en-IN')}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                Target Desired Price (₹)
              </label>
              <input
                type="number"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 70000"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl font-outfit text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Suggested 10% discount: ₹{Math.round(laptop.price * 0.9).toLocaleString('en-IN')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                Preferred Retail Store
              </label>
              <select
                value={store}
                onChange={(e) => setStore(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-darkBg border border-gray-200 dark:border-darkBorder rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Any Store">Any Verified Store</option>
                <option value="Amazon India">Amazon India</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Croma">Croma</option>
                <option value="Reliance Digital">Reliance Digital</option>
                <option value="Vijay Sales">Vijay Sales</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-outfit text-xs font-extrabold rounded-xl shadow-md transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Setting Alert...' : 'Activate Price Alert'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default PriceAlertModal;
