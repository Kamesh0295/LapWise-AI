import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdLaptop, MdLaunch } from 'react-icons/md';
import laptopService from '../../services/laptopService';

const SimilarLaptops = ({ laptopId }) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (laptopId) {
      laptopService.getSimilarLaptops(laptopId)
        .then(res => setSimilar(res.data || []))
        .catch(() => setSimilar([]))
        .finally(() => setLoading(false));
    }
  }, [laptopId]);

  if (loading || similar.length === 0) return null;

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-2">
        <MdLaptop className="text-primary-500" size={24} />
        <div>
          <h2 className="font-outfit text-xl font-bold">Similar Laptop Recommendations</h2>
          <p className="text-xs text-gray-400">Comparable models sharing similar hardware specs, price tier, and performance target.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similar.map(item => (
          <div 
            key={item._id} 
            className="p-5 bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
          >
            <div>
              <div className="h-36 flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-900 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
                <img 
                  src={item.thumbnail || (item.images && item.images[0])} 
                  alt={item.model} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <span className="text-[10px] font-extrabold uppercase text-primary-600 bg-primary-50 dark:bg-primary-950 px-2 py-0.5 rounded-md">
                {item.brand}
              </span>
              <h4 className="font-outfit font-bold text-sm text-gray-900 dark:text-white mt-1.5 line-clamp-1">
                {item.brand} {item.model}
              </h4>
              <span className="font-outfit text-base font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                ₹{item.price?.toLocaleString('en-IN')}
              </span>
              <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                {item.processor} • {item.ram}GB RAM • {item.storage}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Link 
                to={`/laptop/${item._id}/prices`} 
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-outfit text-xs font-extrabold rounded-xl shadow-xs text-center flex items-center justify-center gap-1 transition-all"
              >
                <span>Check Prices</span>
                <MdLaunch size={14} />
              </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarLaptops;
