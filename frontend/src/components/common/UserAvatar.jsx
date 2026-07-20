import React, { useState, useEffect } from 'react';

/**
 * UserAvatar Component
 * Displays user profile image in a circular avatar frame.
 * Fallbacks to initials or default avatar icon if image fails to load or is not provided.
 */
const UserAvatar = ({ 
  user, 
  src, 
  name, 
  size = 'w-8 h-8 sm:w-10 sm:h-10', 
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);

  const imageSrc = src || user?.profileImage;
  const userName = name || user?.name || user?.email || '';

  // Reset image error status when image source changes
  useEffect(() => {
    setImageError(false);
  }, [imageSrc]);

  const getInitials = (str) => {
    if (!str) return '';
    const parts = str.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(userName);
  const showFallback = !imageSrc || imageError;

  return (
    <div 
      className={`relative ${size} rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800 transition-all hover:ring-2 hover:ring-blue-500 shrink-0 ${className}`}
    >
      {!showFallback ? (
        <img
          src={imageSrc}
          alt={userName ? `${userName}'s profile avatar` : 'User profile avatar'}
          className="w-full h-full object-cover rounded-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold select-none">
          {initials ? (
            <span className="text-xs sm:text-sm tracking-wider uppercase font-bold">
              {initials}
            </span>
          ) : (
            <svg 
              className="w-1/2 h-1/2 text-white fill-current" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
