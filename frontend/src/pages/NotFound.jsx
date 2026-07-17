import React from 'react';
import { Link } from 'react-router-dom';
import { MdHelpOutline } from 'react-icons/md';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="p-5 bg-primary-50 dark:bg-primary-950/20 text-primary-500 rounded-full mb-6">
        <MdHelpOutline size={50} className="animate-bounce" />
      </div>
      <h1 className="font-outfit text-5xl font-black text-gray-900 dark:text-white tracking-tight">404</h1>
      <h2 className="font-outfit text-xl font-bold text-gray-800 dark:text-gray-200 mt-4">Page Not Found</h2>
      <p className="text-xs text-gray-400 mt-2 max-w-sm leading-relaxed">
        The link you followed might be broken, or the page has been removed. Use the link below to get back on track.
      </p>
      <Link 
        to="/"
        className="mt-8 px-6 py-3 bg-gradient-to-r from-primary-500 to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
