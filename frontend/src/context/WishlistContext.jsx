import React, { createContext, useContext, useState, useEffect } from 'react';
import wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Load wishlist when user authenticates
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isAuthenticated) {
        setLoading(true);
        try {
          const response = await wishlistService.getWishlist();
          setWishlist(response.data || []);
        } catch (err) {
          console.error('Failed to load wishlist:', err.message);
          setWishlist([]);
        } finally {
          setLoading(false);
        }
      } else {
        setWishlist([]);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  const addToWishlist = async (laptop) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to wishlist items');
    }
    
    // Optimistic UI updates (checks if already in state)
    const laptopId = typeof laptop === 'string' ? laptop : laptop._id;
    if (wishlist.some(item => item._id === laptopId)) return;

    try {
      await wishlistService.addToWishlist(laptopId);
      // Re-fetch to get complete populated details
      const response = await wishlistService.getWishlist();
      setWishlist(response.data || []);
    } catch (err) {
      console.error('Failed to add to wishlist:', err.message);
      throw err;
    }
  };

  const removeFromWishlist = async (laptopId) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to manage wishlist');
    }

    try {
      await wishlistService.removeFromWishlist(laptopId);
      setWishlist(prev => prev.filter(item => item._id !== laptopId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err.message);
      throw err;
    }
  };

  const isWishlisted = (laptopId) => {
    return wishlist.some(item => item._id === laptopId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        addToWishlist,
        removeFromWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside a WishlistProvider');
  }
  return context;
};
