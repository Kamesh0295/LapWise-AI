import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdEmail, MdLock, MdOutlineHowToReg } from 'react-icons/md';
import GoogleSignInButton from '../components/common/GoogleSignInButton';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/';

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password, confirmPassword });
      navigate(redirectPath);
    } catch (err) {
      setErrorMsg(err.message || err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h2 className="font-outfit text-3xl font-extrabold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-xs text-gray-400 mt-2">Join LapWise AI to find laptops, track price drops, and compare configurations.</p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 mb-6 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
              <MdPerson className="absolute left-3 top-3.5 text-gray-400" size={17} />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="janedoe@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
              <MdEmail className="absolute left-3 top-3.5 text-gray-400" size={17} />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
              <MdLock className="absolute left-3 top-3.5 text-gray-400" size={17} />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
              <MdLock className="absolute left-3 top-3.5 text-gray-400" size={17} />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#181F2A] hover:bg-gray-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MdOutlineHowToReg size={18} />
                <span>Create Account</span>
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
          text="signup_with"
        />

        {/* Back to signin redirection */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-primary-500 hover:text-primary-600">Sign In</Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
