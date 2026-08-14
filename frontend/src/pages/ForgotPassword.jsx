import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import { MdEmail, MdSend, MdArrowBack } from 'react-icons/md';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setSuccessMsg(response.message || 'Password reset link sent to your email address.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-darkBg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl shadow-xl p-8 sm:p-10">
        
        <div className="text-center mb-8">
          <h2 className="font-outfit text-3xl font-extrabold text-gray-900 dark:text-white">Forgot Password</h2>
          <p className="text-xs text-gray-400 mt-2">Enter your email address and we'll send you a password reset link.</p>
        </div>

        {successMsg && (
          <div className="p-4 mb-6 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900/50">
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 mb-6 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Registered Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
              <MdEmail className="absolute left-3 top-3.5 text-gray-400" size={17} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MdSend size={16} />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary-500 transition-colors">
            <MdArrowBack size={15} />
            <span>Back to Login</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
