import React from 'react';
import { MdSpeed, MdMemory, MdDeveloperMode, MdSportsEsports, MdBatteryChargingFull } from 'react-icons/md';

const PerformanceScores = ({ laptop }) => {
  if (!laptop) return null;

  const scores = laptop.specScores || {
    cpu: 85,
    gpu: 78,
    ram: 88,
    cooling: 80,
    display: 82,
    battery: 75
  };

  const scoreItems = [
    { label: 'CPU Compile Speed', score: scores.cpu || 85, icon: <MdDeveloperMode size={18} />, color: 'bg-primary-500' },
    { label: 'Graphics & Gaming', score: scores.gpu || 78, icon: <MdSportsEsports size={18} />, color: 'bg-indigo-500' },
    { label: 'RAM Multitasking', score: scores.ram || 88, icon: <MdMemory size={18} />, color: 'bg-primary-500' },
    { label: 'Battery Longevity', score: scores.battery || 75, icon: <MdBatteryChargingFull size={18} />, color: 'bg-amber-500' }
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
      
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="p-2.5 bg-primary-500/10 text-primary-500 dark:text-primary-400 rounded-2xl">
          <MdSpeed size={24} />
        </div>
        <div>
          <h3 className="font-outfit font-bold text-base text-gray-900 dark:text-white">Performance Benchmark Profile</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Component score ratings evaluated for development and gaming workloads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scoreItems.map((item, idx) => (
          <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200">
              <span className="flex items-center gap-2">
                <span className="text-primary-500">{item.icon}</span>
                <span>{item.label}</span>
              </span>
              <span className="font-outfit font-black text-primary-600 dark:text-primary-400">{item.score}/100</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full ${item.color} transition-all duration-500 rounded-full`} 
                style={{ width: `${item.score}%` }} 
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PerformanceScores;
