import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdCompareArrows, MdLaunch, MdAutoAwesome } from 'react-icons/md';
import laptopService from '../../services/laptopService';

const AlternativeLaptops = ({ laptopId }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (laptopId) {
      laptopService.getAlternativeLaptops(laptopId)
        .then(res => setAlternatives(res.data || []))
        .catch(() => setAlternatives([]))
        .finally(() => setLoading(false));
    }
  }, [laptopId]);

  if (loading || alternatives.length === 0) return null;

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center gap-2">
        <MdAutoAwesome className="text-amber-500" size={24} />
        <div>
          <h2 className="font-outfit text-xl font-bold">Curated Alternative Choices</h2>
          <p className="text-xs text-gray-400">Smart alternatives categorized by specific priorities (Cheaper, Gaming Boost, Battery, Display).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {alternatives.map((item, idx) => {
          const l = item.laptop;
          if (!l) return null;
          return (
            <div 
              key={idx} 
              className="p-5 bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">{item.category}</span>
                </div>

                <div className="h-32 flex items-center justify-center p-2 bg-gray-50 dark:bg-gray-900 rounded-2xl mb-3">
                  <img 
                    src={l.thumbnail || (l.images && l.images[0])} 
                    alt={l.model} 
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <h4 className="font-outfit font-bold text-sm text-gray-900 dark:text-white line-clamp-1">
                  {l.brand} {l.model}
                </h4>

                <span className="font-outfit text-base font-black text-emerald-600 dark:text-emerald-400 block mt-1">
                  ₹{l.price?.toLocaleString('en-IN')}
                </span>

                <p className="text-[11px] text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                  {l.processor} • {l.gpu} • {l.ram}GB RAM
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <Link 
                  to={`/laptop/${l._id}/prices`} 
                  className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-outfit text-xs font-extrabold rounded-xl shadow-xs text-center flex items-center justify-center gap-1 transition-all"
                >
                  <span>Check Prices</span>
                  <MdLaunch size={14} />
                </Link>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlternativeLaptops;
