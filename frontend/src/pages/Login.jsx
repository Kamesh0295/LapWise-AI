import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdEmail, MdLock, MdOutlineLogin } from 'react-icons/md';
import GoogleSignInButton from '../components/common/GoogleSignInButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/';

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate(redirectPath);
    } catch (err) {
      setErrorMsg(err.message || err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (idToken) => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle(idToken);
      navigate(redirectPath);
    } catch (err) {
      setErrorMsg(err.message || err.response?.data?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-darkBg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl shadow-xl p-8 sm:p-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-outfit text-3xl font-extrabold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-xs text-gray-400 mt-2">Sign in to search laptops, compare prices, and manage your wishlist.</p>
        </div>

        {/* Error alert banner */}
        {errorMsg && (
          <div className="p-4 mb-6 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
              <MdEmail className="absolute left-3 top-3.5 text-gray-400" size={17} />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold text-primary-500 hover:text-primary-600">Forgot Password?</Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
              <MdLock className="absolute left-3 top-3.5 text-gray-400" size={17} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#181F2A] hover:bg-gray-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MdOutlineLogin size={18} />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        {/* Separator Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800" /></div>
          <div className="relative flex justify-center text-xs font-medium"><span className="bg-white dark:bg-darkCard px-3 text-gray-400">OR</span></div>
        </div>

        {/* Google Identity Services Button */}
        <GoogleSignInButton 
          onGoogleSuccess={handleGoogleSuccess} 
          onError={(err) => setErrorMsg(err)} 
          text="continue_with"
        />

        {/* Signup Link */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-primary-500 hover:text-primary-600">Register</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
