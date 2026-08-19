import React from 'react';
import { MdPsychology, MdAutoAwesome, MdCheckCircleOutline } from 'react-icons/md';

const AIExplanation = ({ laptop }) => {
  if (!laptop) return null;

  const highlights = [
    `Powered by ${laptop.processor || 'Intel Core i5'} with high multicore compilation and multitasking performance.`,
    `Equipped with ${laptop.ram || 16}GB RAM and ${laptop.storage || '512GB SSD'} for fast application loading speeds.`,
    `Features ${laptop.display || '16" FHD Display'} suitable for productivity, programming, and entertainment.`,
    `Optimal build balance for daily portability and sustained battery efficiency.`
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-5">
      
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-500/10 text-primary-500 dark:text-primary-400 rounded-2xl">
            <MdPsychology size={24} />
          </div>
          <div>
            <h3 className="font-outfit font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <span>Why LapWise Recommends This Laptop</span>
              <MdAutoAwesome className="text-amber-500" size={16} />
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gemini AI evaluation and hardware specification analysis</p>
          </div>
        </div>
      </div>

      <div className="p-5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs">
          <MdCheckCircleOutline size={16} />
          <span>Core Hardware Match Evaluation</span>
        </div>

        <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
          {highlights.map((h, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-primary-500 font-bold mt-0.5">•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default AIExplanation;
