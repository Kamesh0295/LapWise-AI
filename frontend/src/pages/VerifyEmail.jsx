import React from 'react';
import { Link } from 'react-router-dom';
import { MdMarkEmailRead } from 'react-icons/md';

const VerifyEmail = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-darkBg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl shadow-xl p-8 sm:p-10 text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <MdMarkEmailRead size={36} />
        </div>
        <h2 className="font-outfit text-2xl font-extrabold text-gray-900 dark:text-white">Email Verification Not Required</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          LapWise AI accounts are verified instantly upon registration or Google Sign-In. No OTP is required.
        </p>
        <Link
          to="/login"
          className="inline-block w-full py-3 bg-[#181F2A] hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Proceed to Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
