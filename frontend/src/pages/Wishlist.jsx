import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MdDelete, 
  MdLaunch, 
  MdCompareArrows,
  MdHelpOutline,
  MdCheck
} from 'react-icons/md';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { isInCompareList, addToCompare, removeFromCompare } = useCompare();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Guard: Redirect guests
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/wishlist');
    }
  }, [isAuthenticated, navigate]);

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 mb-6">
          <MdHelpOutline size={40} />
        </div>
        <h3 className="font-outfit text-xl font-bold">Your wishlist is empty</h3>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          You haven't saved any laptops to your wishlist yet. Keep browsing our catalog and click the heart icon on any card to save it.
        </p>
        <Link to="/search" className="mt-6 px-6 py-2.5 bg-primary-500 text-white font-bold rounded-lg shadow">
          Browse Laptops
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      <div>
        <h1 className="font-outfit text-3xl font-extrabold">My Wishlist</h1>
        <p className="text-xs text-gray-400 mt-1">Laptops you saved for later. We'll alert you via email if their price drops.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map(laptop => (
          <div 
            key={laptop._id}
            className="bg-white dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] px-2 py-0.5 bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 font-bold rounded-full capitalize">{laptop.brand}</span>
                  <h3 className="font-outfit font-bold text-base mt-2 leading-tight text-gray-900 dark:text-white">{laptop.brand} {laptop.model}</h3>
                </div>
                <button 
                  onClick={() => removeFromWishlist(laptop._id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove from wishlist"
                >
                  <MdDelete size={20} />
                </button>
              </div>

              <span className="font-outfit text-lg font-extrabold text-green-600 block mt-2">₹{laptop.price.toLocaleString('en-IN')}</span>
              
              <div className="mt-4 space-y-1.5 text-xs text-gray-500 dark:text-gray-400 border-t border-b border-gray-50 dark:border-gray-800/50 py-3">
                <p><strong className="text-gray-400">CPU:</strong> {laptop.processor}</p>
                <p><strong className="text-gray-400">GPU:</strong> {laptop.gpu}</p>
                <p><strong className="text-gray-400">RAM:</strong> {laptop.ram}GB Memory</p>
                <p><strong className="text-gray-400">Weight:</strong> {laptop.weight} kg</p>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Link 
                to={`/laptops/${laptop._id}`}
                className="w-full py-2 border border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
              >
                <span>Details</span>
                <MdLaunch />
              </Link>
              <button 
                onClick={() => handleCompareToggle(laptop)}
                className={`w-full py-2 border text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-colors ${
                  isInCompareList(laptop._id)
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400'
                }`}
              >
                {isInCompareList(laptop._id) ? <MdCheck size={18} /> : <MdCompareArrows size={18} />}
                <span>{isInCompareList(laptop._id) ? 'Compare' : 'Compare'}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Wishlist;
