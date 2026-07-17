import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-darkCard border-t border-gray-200 dark:border-darkBorder transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand/About column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="https://img.icons8.com/fluency/48/laptop.png" alt="Laptop Rec Logo" className="w-6 h-6" />
              <span className="font-outfit text-xl font-bold bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
                TechMatch
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Simplifying the computer buying process. Our advanced weighted scoring recommendation wizard and Gemini AI parser help you locate the exact setup tailored to your career and hobbies.
            </p>
          </div>

          {/* Quick categories link column */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Categories
            </h3>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li><Link to="/search?purpose=Gaming" className="hover:text-primary-500 transition-colors">Gaming Systems</Link></li>
              <li><Link to="/search?purpose=Programming" className="hover:text-primary-500 transition-colors">Coding Notebooks</Link></li>
              <li><Link to="/search?purpose=Entertainment" className="hover:text-primary-500 transition-colors">Media & Entertainment</Link></li>
              <li><Link to="/search?purpose=General" className="hover:text-primary-500 transition-colors">General Everyday Use</Link></li>
            </ul>
          </div>

          {/* Core tools shortcuts */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Features
            </h3>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li><Link to="/wizard" className="hover:text-primary-500 transition-colors">Choose Help Wizard</Link></li>
              <li><Link to="/compare" className="hover:text-primary-500 transition-colors">Laptop Side-by-Side Compare</Link></li>
              <li><Link to="/search" className="hover:text-primary-500 transition-colors">Search & Filter Catalog</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary-500 transition-colors">Personal Search History</Link></li>
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Subscribe to receive updates on laptops price drop alerts, releases, and special deals.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-darkBg focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button 
                type="submit" 
                className="px-4 py-2 text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-lg shadow-sm"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright segment */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-darkBorder flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 dark:text-gray-500 gap-4">
          <span>&copy; {new Date().getFullYear()} TechMatch Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-primary-500">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary-500">Terms of Use</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
