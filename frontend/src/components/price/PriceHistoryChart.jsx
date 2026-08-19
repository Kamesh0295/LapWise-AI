import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const PriceHistoryChart = ({ trendData }) => {
  const [timeframe, setTimeframe] = useState('30d');

  if (!trendData || !trendData.timeframes) {
    return (
      <div className="p-8 text-center bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder">
        <p className="text-xs text-gray-400">Price trend data loading...</p>
      </div>
    );
  }

  const chartData = trendData.timeframes[timeframe] || trendData.timeframes['30d'] || [];

  const formatYAxis = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-gray-900 text-white rounded-xl shadow-xl text-xs border border-gray-700">
          <p className="font-bold text-gray-400">{label}</p>
          <p className="font-outfit text-sm font-black text-emerald-400 mt-0.5">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
          {data.store && <p className="text-[10px] text-gray-400 mt-0.5">Store: {data.store}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder shadow-sm space-y-6">
      
      {/* Header & Range selector controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-outfit text-lg font-bold">Price Trend History</h3>
          <p className="text-xs text-gray-400 mt-0.5">Track historical price alterations across major retailers over time.</p>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {[
            { key: '7d', label: '7 Days' },
            { key: '30d', label: '30 Days' },
            { key: '90d', label: '90 Days' },
            { key: '6m', label: '6 Months' },
            { key: '1y', label: '1 Year' }
          ].map(tf => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === tf.key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart visualization container */}
      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#9ca3af' }} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tickFormatter={formatYAxis} 
              tick={{ fontSize: 11, fill: '#9ca3af' }} 
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#10b981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#priceGradient)" 
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default PriceHistoryChart;
