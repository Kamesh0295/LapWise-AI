import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdEmail, MdLock, MdOutlineHowToReg } from 'react-icons/md';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const response = await register({ name, email, password });
      setSuccessMsg(response?.message || 'Registration successful! You can now log in directly.');
      // Auto-redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Try using another email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-darkBg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl shadow-xl p-8 sm:p-10">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="font-outfit text-3xl font-extrabold text-gray-900 dark:text-white">Create Account</h2>
          <p className="text-xs text-gray-400 mt-2">Create an account to save laptop selections, compare configurations, and get alerts.</p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 mb-6 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/50">
            {successMsg}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 mb-6 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-5">
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
                placeholder="Min 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
              />
              <MdLock className="absolute left-3 top-3.5 text-gray-400" size={17} />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-40"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MdOutlineHowToReg size={18} />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

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
