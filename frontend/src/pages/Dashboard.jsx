import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MdDashboard, 
  MdHistory, 
  MdVisibility, 
  MdKeyboardArrowDown, 
  MdLaunch,
  MdHelpOutline
} from 'react-icons/md';
import recommendService from '../services/recommendService';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeHistoryIdx, setActiveHistoryIdx] = useState(null);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Query: Fetch wizard recommendation runs history
  const { data: historyRes, isLoading: historyLoading } = useQuery({
    queryKey: ['recommendationHistory'],
    queryFn: () => recommendService.getRecommendationHistory()
  });

  const history = historyRes?.data || [];

  // Query: Fetch recently viewed laptops by getting current user details populated
  const { data: userProfileRes } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      // Endpoint to fetch current populated user details
      const res = await api.get('/auth/profile').catch(() => ({ data: { data: { recentlyViewed: [] } } }));
      return res.data?.data || { recentlyViewed: [] };
    },
    enabled: isAuthenticated
  });

  const recentlyViewed = userProfileRes?.recentlyViewed || [];

  const toggleHistory = (index) => {
    setActiveHistoryIdx(activeHistoryIdx === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      <div>
        <h1 className="font-outfit text-3xl font-extrabold flex items-center gap-2">
          <MdDashboard className="text-primary-500" />
          <span>User Dashboard</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">Review your recent calculations, profile logs, and recently viewed models.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (2/3 width): Recommendation History logs */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-outfit text-lg font-bold flex items-center gap-2">
            <MdHistory className="text-primary-500" />
            <span>Wizard Runs History</span>
          </h3>

          {historyLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-white dark:bg-darkCard rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 dark:border-darkBorder rounded-3xl text-gray-400 text-xs">
              You haven't run the recommendation wizard yet. 
              <Link to="/wizard" className="text-primary-500 font-bold block mt-2 hover:underline">Start Wizard Now</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((run, idx) => {
                const isOpen = activeHistoryIdx === idx;
                return (
                  <div 
                    key={run._id}
                    className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-2xl overflow-hidden shadow-sm"
                  >
                    {/* Collapsible header */}
                    <button
                      onClick={() => toggleHistory(idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-xs hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 rounded-full font-bold">
                          {run.purpose}
                        </span>
                        <span className="text-gray-400 text-[10px]">{new Date(run.createdAt).toLocaleString()}</span>
                      </div>
                      <MdKeyboardArrowDown 
                        size={20} 
                        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-primary-500' : ''}`} 
                      />
                    </button>

                    {/* Collapsible body */}
                    {isOpen && (
                      <div className="p-5 pt-0 text-xs border-t border-gray-100 dark:border-gray-800/50 space-y-4">
                        {/* Selected answers info */}
                        <div className="bg-gray-50 dark:bg-gray-800/20 p-3.5 rounded-xl text-gray-400 leading-relaxed">
                          <strong>Criteria Specs:</strong> {
                            Object.entries(run.answers || {})
                              .map(([k, v]) => `${k}: ${v === true ? 'Yes' : v === false ? 'No' : v}`)
                              .join(', ')
                          }
                        </div>

                        {/* Top recommendations returned in this run */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Returned Matches</span>
                          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {run.recommendations.map((rec, rIdx) => (
                              <div key={rIdx} className="py-2.5 flex items-center justify-between gap-4">
                                <div>
                                  <span className="font-bold text-xs">{rec.laptop?.brand} {rec.laptop?.model}</span>
                                  <p className="text-[10px] text-gray-400 mt-1">{rec.explanation}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-green-500 text-xs">{rec.matchPercentage}% Match</span>
                                  {rec.laptop && (
                                    <Link to={`/laptops/${rec.laptop._id}`} className="text-gray-400 hover:text-primary-500">
                                      <MdLaunch size={16} />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1/3 width): Recently viewed */}
        <div className="space-y-6">
          <h3 className="font-outfit text-lg font-bold flex items-center gap-2">
            <MdVisibility className="text-primary-500" />
            <span>Recently Viewed</span>
          </h3>

          {recentlyViewed.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-200 dark:border-darkBorder rounded-3xl text-gray-400 text-xs">
              No viewed history logs yet.
            </div>
          ) : (
            <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl p-5 divide-y divide-gray-100 dark:divide-gray-800/50 shadow-sm">
              {recentlyViewed.map(laptop => (
                <div key={laptop._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white truncate block max-w-[150px]">{laptop.brand} {laptop.model}</span>
                    <span className="text-green-600 font-semibold block mt-0.5">₹{laptop.price?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link 
                      to={`/prices/${laptop._id}`}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-outfit text-[11px] font-extrabold rounded-md shadow-2xs"
                      title="Check Prices"
                    >
                      Check Prices
                    </Link>
                    <Link 
                      to={`/laptops/${laptop._id}`}
                      className="p-1.5 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400 hover:text-primary-500 transition-colors"
                      title="Details"
                    >
                      <MdLaunch size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
