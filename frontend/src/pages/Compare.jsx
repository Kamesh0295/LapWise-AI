import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MdDelete, 
  MdLaunch, 
  MdFavorite, 
  MdFavoriteBorder,
  MdHelpOutline
} from 'react-icons/md';
import { useCompare } from '../context/CompareContext';
import { useWishlist } from '../context/WishlistContext';

const Compare = () => {
  const { compareList, removeFromCompare, clearCompareList } = useCompare();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();

  if (compareList.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 mb-6">
          <MdHelpOutline size={40} />
        </div>
        <h3 className="font-outfit text-xl font-bold">Comparison board is empty</h3>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Select laptops from the browse page or recommendation matches to compare specs side-by-side. You can select up to 4 laptops.
        </p>
        <Link to="/search" className="mt-6 px-6 py-2.5 bg-primary-500 text-white font-bold rounded-lg shadow">
          Browse Laptops
        </Link>
      </div>
    );
  }

  // 1. Calculate the best specs to highlight them in the comparison table
  const prices = compareList.map(item => item?.price || 0);
  const minPrice = Math.min(...prices.filter(p => p > 0)) || 0;

  const ramValues = compareList.map(item => item?.ram || 0);
  const maxRam = Math.max(...ramValues) || 0;

  const weights = compareList.map(item => item?.weight || 0);
  const minWeight = Math.min(...weights.filter(w => w > 0)) || 0;

  const cpuScores = compareList.map(item => item?.specScores?.cpu || 0);
  const maxCpu = Math.max(...cpuScores) || 0;

  const gpuScores = compareList.map(item => item?.specScores?.gpu || 0);
  const maxGpu = Math.max(...gpuScores) || 0;

  const batteryScores = compareList.map(item => item?.specScores?.battery || 0);
  const maxBattery = Math.max(...batteryScores) || 0;

  const brightnessValues = compareList.map(item => item?.brightness || 300);
  const maxBrightness = Math.max(...brightnessValues) || 300;

  const refreshRateValues = compareList.map(item => item?.refreshRate || 60);
  const maxRefreshRate = Math.max(...refreshRateValues) || 60;

  const ratingValues = compareList.map(item => item?.rating || 0);
  const maxRating = Math.max(...ratingValues) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      {/* Title & Actions bar */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="font-outfit text-3xl font-extrabold">Compare Systems</h1>
          <p className="text-xs text-gray-400 mt-1">Side-by-side specifications evaluation. Highlights indicating optimal specs are marked in green.</p>
        </div>
        <button 
          onClick={clearCompareList}
          className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold rounded-lg transition-colors"
        >
          Clear Board
        </button>
      </div>

      {/* Comparison Grid View */}
      <div className="overflow-x-auto rounded-3xl border border-gray-200/50 dark:border-darkBorder shadow-sm bg-white dark:bg-darkCard">
        <table className="w-full border-collapse text-left text-xs min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-darkBorder bg-gray-50/50 dark:bg-gray-800/10">
              <th className="p-4 sm:p-5 font-bold w-48 text-gray-400">Spec Metric</th>
              {compareList.map(laptop => (
                <th key={laptop._id} className="p-4 sm:p-5 font-bold relative min-w-[180px]">
                  <button 
                    onClick={() => removeFromCompare(laptop._id)}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 rounded"
                    title="Remove from compare"
                  >
                    <MdDelete size={18} />
                  </button>
                  <div className="pt-2">
                    <span className="text-[10px] px-2 py-0.5 bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 font-bold rounded-full capitalize">{laptop.brand}</span>
                    <h4 className="font-outfit text-sm font-bold text-gray-900 dark:text-white mt-2 leading-tight">{laptop.model}</h4>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {/* Price */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Price</td>
              {compareList.map(laptop => {
                const isBest = laptop.price === minPrice;
                return (
                  <td key={laptop._id} className={`p-4 sm:p-5 font-outfit text-sm font-extrabold ${isBest ? 'text-green-600 dark:text-green-400 bg-green-500/5' : ''}`}>
                    ₹{laptop.price.toLocaleString('en-IN')}
                    {isBest && <span className="block text-[9px] font-bold text-green-600 dark:text-green-400 mt-0.5">Cheapest</span>}
                  </td>
                );
              })}
            </tr>

            {/* Processor */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Processor</td>
              {compareList.map(laptop => (
                <td key={laptop._id} className="p-4 sm:p-5 font-semibold text-gray-700 dark:text-gray-300">{laptop.processor}</td>
              ))}
            </tr>

            {/* Graphics GPU */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Graphics GPU</td>
              {compareList.map(laptop => (
                <td key={laptop._id} className="p-4 sm:p-5 font-semibold text-gray-700 dark:text-gray-300">{laptop.gpu}</td>
              ))}
            </tr>

            {/* RAM */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">RAM Capacity</td>
              {compareList.map(laptop => {
                const isBest = laptop.ram === maxRam;
                return (
                  <td key={laptop._id} className={`p-4 sm:p-5 font-semibold ${isBest ? 'text-green-600 dark:text-green-400 bg-green-500/5' : ''}`}>
                    {laptop.ram} GB
                    {isBest && <span className="block text-[9px] font-bold text-green-600 dark:text-green-400 mt-0.5">Highest</span>}
                  </td>
                );
              })}
            </tr>

            {/* Storage */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Storage Type</td>
              {compareList.map(laptop => (
                <td key={laptop._id} className="p-4 sm:p-5 font-semibold text-gray-700 dark:text-gray-300">{laptop.storage}</td>
              ))}
            </tr>

            {/* Display */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Display Panel</td>
              {compareList.map(laptop => (
                <td key={laptop._id} className="p-4 sm:p-5 font-semibold text-gray-700 dark:text-gray-300">{laptop.display}</td>
              ))}
            </tr>

            {/* Brightness */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Display Brightness</td>
              {compareList.map(laptop => {
                const val = laptop.brightness || 300;
                const isBest = val === maxBrightness;
                return (
                  <td key={laptop._id} className={`p-4 sm:p-5 font-semibold ${isBest ? 'text-green-600 dark:text-green-400 bg-green-500/5' : ''}`}>
                    {val} nits
                    {isBest && <span className="block text-[9px] font-bold text-green-600 dark:text-green-400 mt-0.5">Brightest</span>}
                  </td>
                );
              })}
            </tr>

            {/* Refresh Rate */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Refresh Rate</td>
              {compareList.map(laptop => {
                const val = laptop.refreshRate || 60;
                const isBest = val === maxRefreshRate;
                return (
                  <td key={laptop._id} className={`p-4 sm:p-5 font-semibold ${isBest ? 'text-green-600 dark:text-green-400 bg-green-500/5 font-bold' : ''}`}>
                    {val} Hz
                  </td>
                );
              })}
            </tr>

            {/* Weight */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Weight</td>
              {compareList.map(laptop => {
                const isBest = laptop.weight === minWeight;
                return (
                  <td key={laptop._id} className={`p-4 sm:p-5 font-semibold ${isBest ? 'text-green-600 dark:text-green-400 bg-green-500/5' : ''}`}>
                    {laptop.weight} kg
                    {isBest && <span className="block text-[9px] font-bold text-green-600 dark:text-green-400 mt-0.5">Lightest</span>}
                  </td>
                );
              })}
            </tr>

            {/* Ports */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">I/O Ports</td>
              {compareList.map(laptop => (
                <td key={laptop._id} className="p-4 sm:p-5 text-[10px] leading-tight text-gray-650 dark:text-gray-300 font-semibold max-w-[180px]">
                  {laptop.ports && laptop.ports.length > 0 ? laptop.ports.join(', ') : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Warranty */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Warranty Period</td>
              {compareList.map(laptop => (
                <td key={laptop._id} className="p-4 sm:p-5 text-[10px] text-gray-655 dark:text-gray-350 font-semibold">
                  {laptop.warranty || '1 Year Manufacturer Warranty'}
                </td>
              ))}
            </tr>

            {/* CPU Spec Score */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">CPU Power Rating</td>
              {compareList.map(laptop => {
                const val = laptop.specScores?.cpu || 0;
                const isBest = val === maxCpu && val > 0;
                return (
                  <td key={laptop._id} className={`p-4 sm:p-5 ${isBest ? 'text-green-600 dark:text-green-400 bg-green-500/5 font-bold' : ''}`}>
                    {val} / 100
                  </td>
                );
              })}
            </tr>

            {/* GPU Spec Score */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">GPU Power Rating</td>
              {compareList.map(laptop => {
                const val = laptop.specScores?.gpu || 0;
                const isBest = val === maxGpu && val > 0;
                return (
                  <td key={laptop._id} className={`p-4 sm:p-5 ${isBest ? 'text-green-600 dark:text-green-400 bg-green-500/5 font-bold' : ''}`}>
                    {val} / 100
                  </td>
                );
              })}
            </tr>

            {/* Battery Score */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Battery Rating</td>
              {compareList.map(laptop => {
                const val = laptop.specScores?.battery || 0;
                const isBest = val === maxBattery && val > 0;
                return (
                  <td key={laptop._id} className={`p-4 sm:p-5 ${isBest ? 'text-green-600 dark:text-green-400 bg-green-500/5 font-bold' : ''}`}>
                    {val} / 100
                  </td>
                );
              })}
            </tr>

            {/* Ratings */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">User Rating</td>
              {compareList.map(laptop => {
                const val = laptop.rating || 0;
                const isBest = val === maxRating && val > 0;
                return (
                  <td key={laptop._id} className={`p-4 sm:p-5 font-bold text-yellow-500 ${isBest ? 'bg-yellow-500/5' : ''}`}>
                    {val} ★
                  </td>
                );
              })}
            </tr>

            {/* Actions list */}
            <tr>
              <td className="p-4 sm:p-5 font-bold text-gray-400 bg-gray-50/10 dark:bg-gray-800/5">Actions</td>
              {compareList.map(laptop => (
                <td key={laptop._id} className="p-4 sm:p-5">
                  <div className="flex gap-2">
                    <Link 
                      to={`/laptops/${laptop._id}`}
                      className="p-2 border border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-primary-500 transition-colors"
                      title="Inspect details"
                    >
                      <MdLaunch size={18} />
                    </Link>
                    <button 
                      onClick={() => isWishlisted(laptop._id) ? removeFromWishlist(laptop._id) : addToWishlist(laptop)}
                      className={`p-2 border rounded-lg transition-colors ${
                        isWishlisted(laptop._id)
                          ? 'border-red-500 text-red-500 bg-red-500/10'
                          : 'border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-400'
                      }`}
                    >
                      {isWishlisted(laptop._id) ? <MdFavorite size={18} /> : <MdFavoriteBorder size={18} />}
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Compare;
