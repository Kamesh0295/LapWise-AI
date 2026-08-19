import React from 'react';
import { MdListAlt } from 'react-icons/md';

const SpecificationTable = ({ laptop }) => {
  if (!laptop) return null;

  const specs = [
    { label: 'Brand', value: laptop.brand || 'ASUS' },
    { label: 'Model', value: laptop.model || 'Vivobook 16' },
    { label: 'Processor (CPU)', value: laptop.processor || 'Intel Core i5' },
    { label: 'Graphics (GPU)', value: laptop.gpu || 'Intel Iris Xe Graphics' },
    { label: 'RAM Memory', value: laptop.ram ? `${laptop.ram}GB DDR4/DDR5` : '16GB' },
    { label: 'Storage Capacity', value: laptop.storage || '512GB NVMe SSD' },
    { label: 'Display Panel', value: laptop.display || '16" FHD+ (1920x1200) Display' },
    { label: 'Operating System', value: laptop.os || 'Windows 11 Home' },
    { label: 'Weight', value: laptop.weight ? `${laptop.weight} kg` : '1.8 kg' },
    { label: 'Battery Capacity', value: laptop.battery || '42Whr 3-cell Li-ion' }
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
      
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="p-2.5 bg-primary-500/10 text-primary-500 dark:text-primary-400 rounded-2xl">
          <MdListAlt size={24} />
        </div>
        <div>
          <h3 className="font-outfit font-bold text-base text-gray-900 dark:text-white">Full Hardware Specifications</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Detailed component breakdown verified by LapWise AI</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 font-bold uppercase tracking-wider">
              <th className="py-3 px-4 rounded-l-xl">Specification Parameter</th>
              <th className="py-3 px-4 rounded-r-xl">Details & Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {specs.map((s, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                <td className="py-3 px-4 font-bold text-gray-600 dark:text-gray-400 w-1/3">{s.label}</td>
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-gray-200">{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default SpecificationTable;
