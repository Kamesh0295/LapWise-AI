import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/common/UserAvatar';
import { MdSettings, MdLock, MdCheckCircle, MdInfoOutline } from 'react-icons/md';
import authService from '../services/authService';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Change password form states
  const [currentPassword, setCurrentPassword] = useState('');
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
      setErrorMsg('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword({ 
        currentPassword, 
        oldPassword: currentPassword, 
        newPassword,
        confirmPassword 
      });
      setSuccessMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Current password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const isGoogleAccount = user?.authProvider === 'google' || (user?.googleId && !user?.hasLocalPassword);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="font-outfit text-3xl font-extrabold flex items-center gap-2">
          <MdSettings className="text-[#1E88E5]" />
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
            <span className="text-[10px] px-2.5 py-0.5 bg-blue-50 text-[#1E88E5] dark:bg-blue-950/40 rounded-full font-bold uppercase tracking-wider mt-1">
              {user?.authProvider === 'google' ? 'Google Account' : user?.role || 'User'}
            </span>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
            <div>
              <span className="text-gray-400 block">Email Address</span>
              <span className="font-semibold">{user?.email}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Account Provider</span>
              <span className="font-semibold capitalize">{user?.authProvider || 'Local'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Account Status</span>
              <span className="font-semibold text-green-500 flex items-center gap-1 mt-0.5">
                <MdCheckCircle />
                <span>Verified Account</span>
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

          {isGoogleAccount ? (
            <div className="p-5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <MdInfoOutline className="text-[#1E88E5] flex-shrink-0 mt-0.5" size={20} />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-gray-900 dark:text-white">Google Authenticated Account</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    You signed in with Google. Create a password first if you want to use email/password login.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
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
                    placeholder="Minimum 8 characters"
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
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs"
                  />
                  <MdLock className="absolute left-3 top-3.5 text-gray-400" size={17} />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#181F2A] hover:bg-gray-900 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-40"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};

export default Profile;
