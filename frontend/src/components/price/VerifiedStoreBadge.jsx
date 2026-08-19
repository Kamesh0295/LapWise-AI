import React from 'react';
import { MdVerified, MdOutlineStorefront } from 'react-icons/md';

const VerifiedStoreBadge = ({ verified, storeName }) => {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800/40 shadow-2xs">
        <MdVerified className="text-green-600 dark:text-green-400 text-xs" />
        Verified Store
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
      <MdOutlineStorefront className="text-gray-400 text-xs" />
      Marketplace / Other Seller
    </span>
  );
};

export default VerifiedStoreBadge;
