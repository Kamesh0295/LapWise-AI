import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/common/UserAvatar';
import { MdSettings, MdLock, MdCheckCircle } from 'react-icons/md';
import authService from '../services/authService';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Change password form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword({ oldPassword, newPassword });
      setSuccessMsg('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-outfit text-3xl font-extrabold flex items-center gap-2">
          <MdSettings className="text-primary-500" />
          <span>Account Settings</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">Manage your profile details and change your security credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card: Account details */}
        <div className="bg-white dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder rounded-3xl p-6 shadow-sm h-fit space-y-6">
          <div className="flex flex-col items-center text-center">
            <UserAvatar user={user} size="w-20 h-20" />
            <h3 className="font-outfit font-bold mt-4 text-base">{user?.name}</h3>
            <span className="text-[10px] px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full font-bold uppercase tracking-wider mt-1">{user?.role}</span>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-850/50 text-xs">
            <div>
              <span className="text-gray-400 block">Email Address</span>
              <span className="font-semibold">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Verified Status</span>
              <span className={`font-semibold flex items-center gap-1 mt-0.5 ${user?.isVerified || user?.googleId ? 'text-green-500' : 'text-yellow-500'}`}>
                <MdCheckCircle />
                <span>{user?.isVerified || user?.googleId ? 'Verified Account' : 'Pending Verification'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Change Password Form */}
        <div className="md:col-span-2 bg-white dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-outfit text-lg font-bold">Update Password</h3>

          {/* Success banner */}
          {successMsg && (
            <div className="p-4 text-xs text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/50">
              {successMsg}
            </div>
          )}

          {/* Error banner */}
          {errorMsg && (
            <div className="p-4 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/50">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Old password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Current Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                />
                <MdLock className="absolute left-3 top-3.5 text-gray-400" size={17} />
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                />
                <MdLock className="absolute left-3 top-3.5 text-gray-400" size={17} />
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                />
                <MdLock className="absolute left-3 top-3.5 text-gray-400" size={17} />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow transition-all disabled:opacity-40"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
