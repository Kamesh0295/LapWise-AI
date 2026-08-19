import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MdTrendingDown, MdTrendingUp, MdInfoOutline, MdHistory } from 'react-icons/md';

const PriceHistoryChart = ({ trendData }) => {
  const [timeRange, setTimeRange] = useState('30d');

  const {
    currentPrice = 30990,
    previousPrice = 35000,
    lowestRecordedPrice = 30990,
    highestRecordedPrice = 208988,
    averagePrice = 42000,
    priceChange = -4010,
    priceChangePercent = -11.5,
    lastChecked = new Date(),
    hasEnoughData = false
  } = trendData || {};

  // Mock historical data points for demonstration if real MongoDB history is developing
  const mockHistoryData = [
    { date: '1 Aug', price: 35000 },
    { date: '5 Aug', price: 34500 },
    { date: '10 Aug', price: 33990 },
    { date: '14 Aug', price: 32490 },
    { date: '19 Aug', price: 30990 }
  ];

  const chartData = (trendData && trendData.history && trendData.history.length >= 2) 
    ? trendData.history.map(item => ({
        date: new Date(item.recordedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: item.price
      }))
    : mockHistoryData;

  const isPriceDrop = priceChange <= 0;

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
      
      {/* Header & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-500/10 text-primary-500 dark:text-primary-400 rounded-xl">
            <MdHistory size={20} />
          </div>
          <div>
            <h3 className="font-outfit font-bold text-base text-gray-900 dark:text-white">Price History Analysis</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track price movements across verified stores</p>
          </div>
        </div>

        {/* Time Range Filter Pills */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold">
          {['7d', '30d', '90d', '6m', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg uppercase transition-all ${
                timeRange === range
                  ? 'bg-primary-500 text-white font-bold shadow-2xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 dark:text-gray-400 block">Lowest Recorded</span>
          <span className="font-outfit font-black text-green-600 dark:text-green-400 text-sm mt-0.5 block">
            ₹{lowestRecordedPrice.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 dark:text-gray-400 block">Highest Recorded</span>
          <span className="font-outfit font-black text-red-500 dark:text-red-400 text-sm mt-0.5 block">
            ₹{highestRecordedPrice.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 dark:text-gray-400 block">Average Market Price</span>
          <span className="font-outfit font-bold text-gray-900 dark:text-white text-sm mt-0.5 block">
            ₹{averagePrice.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800">
          <span className="text-gray-500 dark:text-gray-400 block">Recent Price Movement</span>
          <span className={`font-outfit font-extrabold text-xs mt-0.5 flex items-center gap-1 ${isPriceDrop ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
            {isPriceDrop ? <MdTrendingDown size={16} /> : <MdTrendingUp size={16} />}
            <span>{Math.abs(priceChangePercent)}% ({isPriceDrop ? 'Drop' : 'Increase'})</span>
          </span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="primaryPriceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
            <YAxis 
              stroke="#9ca3af" 
              fontSize={11} 
              tickLine={false} 
              tickFormatter={(v) => `₹${v / 1000}k`}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#111827', 
                borderColor: '#374151', 
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#0ea5e9" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#primaryPriceGrad)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default PriceHistoryChart;
