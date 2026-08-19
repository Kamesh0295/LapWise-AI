import React from 'react';
import { MdVerified, MdOutlineStorefront, MdShield } from 'react-icons/md';

const VerifiedStoreBadge = ({ verified, storeCategory, storeName }) => {
  if (verified && storeCategory === 'manufacturer') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 shadow-2xs">
        <MdShield className="text-blue-600 dark:text-blue-400 text-xs" />
        Official Manufacturer
      </span>
    );
  }

  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shadow-2xs">
        <MdVerified className="text-emerald-600 dark:text-emerald-400 text-xs" />
        Verified Retailer
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
      <MdOutlineStorefront className="text-gray-400 text-xs" />
      Marketplace Seller
    </span>
  );
};

export default VerifiedStoreBadge;
