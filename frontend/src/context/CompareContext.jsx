import React, { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('compareList');
    if (saved) {
      try {
        setCompareList(JSON.parse(saved));
      } catch (err) {
        localStorage.removeItem('compareList');
      }
    }
  }, []);

  const addToCompare = (laptop) => {
    if (compareList.some(item => item._id === laptop._id)) {
      throw new Error('Laptop is already in the comparison list');
    }
    if (compareList.length >= 4) {
      throw new Error('You can compare a maximum of 4 laptops at a time');
    }

    const updated = [...compareList, laptop];
    setCompareList(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
  };

  const removeFromCompare = (laptopId) => {
    const updated = compareList.filter(item => item._id !== laptopId);
    setCompareList(updated);
    localStorage.setItem('compareList', JSON.stringify(updated));
  };

  const isInCompareList = (laptopId) => {
    return compareList.some(item => item._id === laptopId);
  };

  const clearCompareList = () => {
    setCompareList([]);
    localStorage.removeItem('compareList');
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompareList,
        clearCompareList,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used inside a CompareProvider');
  }
  return context;
};
