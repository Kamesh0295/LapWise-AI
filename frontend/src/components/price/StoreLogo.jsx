import React from 'react';

const StoreLogo = ({ storeName, logoUrl, size = 'w-10 h-10' }) => {
  const nameLower = (storeName || '').toLowerCase();

  // 1. If explicit valid image logo exists, use it
  if (logoUrl && !logoUrl.includes('sample.jpg') && logoUrl.startsWith('http')) {
    return (
      <img 
        src={logoUrl} 
        alt={storeName} 
        className={`${size} object-contain rounded-xl bg-white p-1.5 border border-[#E5E7EB] dark:border-gray-800 shadow-2xs`}
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
        }}
      />
    );
  }

  // 2. Exact match letter avatars matching screenshot
  if (nameLower.includes('dotcom')) {
    return (
      <div className={`${size} flex items-center justify-center bg-[#1E88E5] text-white font-black rounded-xl text-base shadow-2xs`}>
        D
      </div>
    );
  }

  if (nameLower.includes('amazon')) {
    return (
      <div className={`${size} flex items-center justify-center bg-amber-500 text-white font-black rounded-xl text-base shadow-2xs`}>
        a
      </div>
    );
  }

  if (nameLower.includes('flipkart')) {
    return (
      <div className={`${size} flex items-center justify-center bg-yellow-400 text-blue-800 font-black rounded-xl text-base shadow-2xs`}>
        f
      </div>
    );
  }

  if (nameLower.includes('croma')) {
    return (
      <div className={`${size} flex items-center justify-center bg-teal-600 text-white font-black rounded-xl text-base shadow-2xs`}>
        C
      </div>
    );
  }

  if (nameLower.includes('reliance')) {
    return (
      <div className={`${size} flex items-center justify-center bg-red-600 text-white font-black rounded-xl text-base shadow-2xs`}>
        R
      </div>
    );
  }

  if (nameLower.includes('vijay')) {
    return (
      <div className={`${size} flex items-center justify-center bg-red-700 text-white font-black rounded-xl text-base shadow-2xs`}>
        V
      </div>
    );
  }

  // Default initial avatar
  const initial = storeName ? storeName.charAt(0).toUpperCase() : 'S';
  return (
    <div className={`${size} flex items-center justify-center bg-[#1E88E5] text-white font-black rounded-xl text-base shadow-2xs`}>
      {initial}
    </div>
  );
};

export default StoreLogo;
