import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MdCompareArrows, 
  MdFavoriteBorder, 
  MdNotifications, 
  MdMenu, 
  MdClose, 
  MdLightMode, 
  MdDarkMode,
  MdSettings,
  MdDashboard,
  MdAdminPanelSettings,
  MdExitToApp,
  MdCheckCircle
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import notificationService from '../../services/notificationService';
import UserAvatar from './UserAvatar';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { wishlist } = useWishlist();
  const { compareList } = useCompare();

  const location = useLocation();
  const navigate = useNavigate();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Sync theme to document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Load notifications if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      notificationService.getNotifications()
        .then(res => setNotifications(res.data || []))
        .catch(err => console.warn('Failed to load notifications:', err.message));
    }
  }, [isAuthenticated]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleSignOut = () => {
    logout().then(() => {
      navigate('/login');
    });
  };

  const activeLinkClass = "text-primary-500 font-bold dark:text-primary-400";
  const standardLinkClass = "text-gray-600 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400 font-medium transition-colors duration-200";

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed inset-x-0 top-0 z-50 h-16 border-b border-gray-200/50 dark:border-gray-800/40 bg-white/70 dark:bg-darkBg/60 backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="https://img.icons8.com/fluency/48/laptop.png" alt="Laptop Rec Logo" className="w-8 h-8" />
          <span className="font-outfit text-2xl font-black bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
            TechMatch
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={location.pathname === '/' ? activeLinkClass : standardLinkClass}>Home</Link>
          {isAuthenticated && (
            <>
              <Link to="/wizard" className={location.pathname === '/wizard' || location.pathname === '/choose-help' ? activeLinkClass : standardLinkClass}>Choose Help</Link>
              <Link to="/search" className={location.pathname === '/search' || location.pathname === '/browse' ? activeLinkClass : standardLinkClass}>Browse Catalog</Link>
              <Link to="/compare" className={location.pathname === '/compare' ? activeLinkClass : standardLinkClass}>Compare</Link>
            </>
          )}
        </div>

        {/* Global Toolbar Menu Actions */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
          </button>

          {/* Comparison & Wishlist Badges (Authenticated users only) */}
          {isAuthenticated && (
            <>
              <Link to="/compare" className="relative p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400" title="Compare list">
                <MdCompareArrows size={24} />
                {compareList.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center bg-blue-500 text-white font-bold text-[10px] rounded-full border border-white dark:border-darkBg animate-pulse">
                    {compareList.length}
                  </span>
                )}
              </Link>

              <Link to="/wishlist" className="relative p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400" title="My Wishlist">
                <MdFavoriteBorder size={23} />
                {wishlist.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center bg-red-500 text-white font-bold text-[10px] rounded-full border border-white dark:border-darkBg">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* Notifications Dropdown Container */}
          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-500 hover:text-primary-500 dark:text-gray-400 dark:hover:text-primary-400"
                title="Notifications"
              >
                <MdNotifications size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center bg-yellow-500 text-white font-bold text-[10px] rounded-full border border-white dark:border-darkBg">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-darkBorder flex items-center justify-between">
                    <span className="font-semibold text-sm">Alerts Center</span>
                    {unreadCount > 0 && <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200 font-semibold rounded-full">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">No notifications available</div>
                    ) : (
                      notifications.map(item => (
                        <div key={item._id} className={`p-3 text-xs hover:bg-gray-50 dark:hover:bg-gray-800/20 cursor-pointer ${!item.read ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''}`}>
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-semibold">{item.title}</span>
                            {!item.read && (
                              <button onClick={(e) => handleMarkAsRead(item._id, e)} className="text-primary-500 hover:text-primary-700" title="Mark as read">
                                <MdCheckCircle size={15} />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">{item.message}</p>
                          <span className="text-[10px] text-gray-400 mt-2 block">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile dropdown */}
          {isAuthenticated ? (
            <div className="relative flex items-center" ref={profileRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center justify-center focus:outline-none rounded-full transition-all"
                aria-label="User profile menu"
              >
                <UserAvatar user={user} size="w-8 h-8 sm:w-10 sm:h-10" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-darkBorder flex items-center gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                    <UserAvatar user={user} size="w-9 h-9" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link to="/dashboard" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                      <MdDashboard size={17} />
                      <span>User Dashboard</span>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-semibold">
                        <MdAdminPanelSettings size={18} />
                        <span>Admin Console</span>
                      </Link>
                    )}
                    <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                      <MdSettings size={17} />
                      <span>Settings</span>
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-semibold text-left">
                      <MdExitToApp size={17} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg shadow-md transition-all hover:scale-105">
                Register
              </Link>
            </div>
          )}

        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 md:hidden">
          <button 
            onClick={toggleTheme}
            className="p-1 text-gray-500 dark:text-gray-400"
          >
            {theme === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-gray-500 dark:text-gray-400"
          >
            {mobileMenuOpen ? <MdClose size={26} /> : <MdMenu size={26} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white dark:bg-darkCard border-b border-gray-200 dark:border-darkBorder shadow-lg px-4 py-4 flex flex-col gap-4 animate-fade-in z-50">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-semibold">Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/wizard" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-semibold">Choose Help</Link>
              <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-semibold">Browse Catalog</Link>
              <Link to="/compare" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-semibold">Compare List ({compareList.length})</Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-semibold">My Wishlist ({wishlist.length})</Link>
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <UserAvatar user={user} size="w-9 h-9" />
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-semibold">Dashboard</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm font-semibold text-primary-500">Admin Console</Link>}
              <button onClick={handleSignOut} className="py-2 text-sm font-bold text-red-500 text-left">Sign Out</button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-2 text-center text-sm font-semibold border border-gray-200 dark:border-gray-800 rounded-lg">Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="py-2 text-center text-sm font-semibold text-white bg-primary-500 rounded-lg">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
