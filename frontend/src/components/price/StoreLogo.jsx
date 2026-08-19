import React from 'react';
import { MdStorefront, MdVerified } from 'react-icons/md';

const StoreLogo = ({ storeName, logoUrl, size = 'w-8 h-8' }) => {
  const nameLower = (storeName || '').toLowerCase();

  // Known brand icons / colors if image fails
  if (logoUrl && !logoUrl.includes('sample.jpg')) {
    return (
      <img 
        src={logoUrl} 
        alt={storeName} 
        className={`${size} object-contain rounded-md bg-white p-1 border border-gray-100 dark:border-gray-800 shadow-sm`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
        }}
      />
    );
  }

  if (nameLower.includes('amazon')) {
    return (
      <div className={`${size} flex items-center justify-center bg-amber-50 text-amber-600 font-bold rounded-lg text-xs border border-amber-200`}>
        AMZ
      </div>
    );
  }

  if (nameLower.includes('flipkart')) {
    return (
      <div className={`${size} flex items-center justify-center bg-blue-50 text-blue-600 font-bold rounded-lg text-xs border border-blue-200`}>
        FK
      </div>
    );
  }

  if (nameLower.includes('croma')) {
    return (
      <div className={`${size} flex items-center justify-center bg-teal-50 text-teal-600 font-bold rounded-lg text-xs border border-teal-200`}>
        CRM
      </div>
    );
  }

  if (nameLower.includes('reliance')) {
    return (
      <div className={`${size} flex items-center justify-center bg-red-50 text-red-600 font-bold rounded-lg text-xs border border-red-200`}>
        RD
      </div>
    );
  }

  return (
    <div className={`${size} flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-lg text-xs`}>
      <MdStorefront size={18} />
    </div>
  );
};

export default StoreLogo;
