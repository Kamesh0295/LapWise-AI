import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import { MdMarkEmailRead, MdErrorOutline, MdEmail, MdSend } from 'react-icons/md';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Resend state
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('');
  const [resendError, setResendError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setErrorMsg('No verification token found in URL link.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setSuccessMsg(response.message || 'Email verified successfully! You can now log in.');
      } catch (err) {
        setErrorMsg(err.message || 'Verification token is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendStatus('');
    setResendError('');
    setResendLoading(true);

    try {
      const res = await authService.resendVerification(resendEmail);
      setResendStatus(res.message || 'Verification email sent successfully! Check your inbox.');
    } catch (err) {
      setResendError(err.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-darkBg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl shadow-xl p-8 sm:p-10 text-center">
        
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Verifying your email address...</p>
          </div>
        ) : successMsg ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <MdMarkEmailRead size={36} />
            </div>
            <h2 className="font-outfit text-2xl font-extrabold text-gray-900 dark:text-white">Email Verified!</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{successMsg}</p>
            <Link
              to="/login"
              className="inline-block w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              Proceed to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <MdErrorOutline size={36} />
            </div>
            <h2 className="font-outfit text-2xl font-extrabold text-gray-900 dark:text-white">Verification Failed</h2>
            <p className="text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/40">
              {errorMsg}
            </p>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-left">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">Request a New Verification Link</h3>

              {resendStatus && (
                <p className="text-xs text-green-600 bg-green-50 dark:bg-green-950/20 p-2.5 rounded-lg mb-3">
                  {resendStatus}
                </p>
              )}
              {resendError && (
                <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg mb-3">
                  {resendError}
                </p>
              )}

              <form onSubmit={handleResend} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <MdEmail className="absolute left-3 top-3.5 text-gray-400" size={16} />
                </div>
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {resendLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <MdSend size={15} />
                      <span>Resend Link</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-2">
              <Link to="/login" className="text-xs font-bold text-primary-500 hover:underline">
                Return to Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
