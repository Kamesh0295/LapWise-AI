import React from 'react';

const PerformanceScores = ({ laptop }) => {
  if (!laptop) return null;

  const scores = laptop.specScores || {};
  const ram = laptop.ram || 16;
  const isRTX = /rtx/i.test(laptop.gpu || '');
  const isApple = laptop.brand === 'Apple';
  const price = laptop.price || 50000;

  // Calculate scores out of 100
  const overall = scores.cpu ? Math.round((scores.cpu + (scores.gpu || 50) + (scores.ram || 60)) / 3) : 82;
  const gaming = isRTX ? Math.min(98, 75 + (/rtx 4070|rtx 4080|rtx 4090/i.test(laptop.gpu) ? 20 : 10)) : (isApple ? 68 : 45);
  const programming = Math.min(99, 65 + Math.round((ram / 32) * 25));
  const videoEditing = Math.min(98, 55 + (isRTX ? 30 : 15));
  const aiMl = Math.min(99, 40 + (/rtx 40/i.test(laptop.gpu) ? 45 : (isRTX ? 30 : 10)));
  const battery = isApple ? 94 : (laptop.displaySize < 14.5 ? 82 : 62);
  const portability = laptop.weight <= 1.4 ? 92 : (laptop.weight <= 1.8 ? 78 : 58);
  const displayScore = laptop.refreshRate > 60 ? 88 : (/oled/i.test(laptop.display) ? 92 : 72);
  const valueForMoney = price < 60000 && ram >= 16 ? 92 : (price < 100000 ? 84 : 76);

  const metrics = [
    { label: 'Overall System Index', score: overall, color: 'bg-emerald-500' },
    { label: 'Gaming Performance', score: gaming, color: 'bg-indigo-500' },
    { label: 'Programming & Compilation', score: programming, color: 'bg-blue-500' },
    { label: 'Video Editing & Rendering', score: videoEditing, color: 'bg-purple-500' },
    { label: 'AI / ML Workloads', score: aiMl, color: 'bg-cyan-500' },
    { label: 'Battery Longevity', score: battery, color: 'bg-amber-500' },
    { label: 'Portability & Chassis Weight', score: portability, color: 'bg-teal-500' },
    { label: 'Display Optics & Color', score: displayScore, color: 'bg-rose-500' },
    { label: 'Value for Money Rating', score: valueForMoney, color: 'bg-emerald-600' }
  ];

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder shadow-sm space-y-6">
      <div>
        <h2 className="font-outfit text-xl font-bold">Performance Benchmark Profile</h2>
        <p className="text-xs text-gray-400 mt-0.5">Automated 1-100 rating scale calculated across key computing workloads.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{m.label}</span>
              <span className="font-outfit font-black text-gray-900 dark:text-white">{m.score}/100</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${m.color}`} 
                style={{ width: `${m.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceScores;
