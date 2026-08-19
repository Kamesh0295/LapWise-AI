import React from 'react';
import { MdPsychology, MdThumbUp, MdThumbDown, MdCheckCircle, MdCancel } from 'react-icons/md';

const AIExplanation = ({ laptop }) => {
  if (!laptop) return null;

  const isGaming = /rtx|gtx|gaming/i.test(`${laptop.gpu || ''} ${laptop.title || ''}`);
  const isApple = laptop.brand === 'Apple';
  const ram = laptop.ram || 16;
  const price = laptop.price || 50000;

  const aiExplanationText = `LapWise AI recommends the ${laptop.brand} ${laptop.model} featuring ${laptop.processor}, ${ram}GB RAM, and ${laptop.storage || '512GB SSD'}. Its hardware profile delivers optimized compute efficiency for multitasking and specialized workloads.`;

  const bestFor = isGaming
    ? 'High FPS 1080p/1440p gaming, 3D rendering, and video editing.'
    : (isApple 
      ? 'All-day battery efficiency, Xcode development, 4K video editing, and executive workflows.'
      : 'Software engineering, daily productivity, data analysis, and student coursework.');

  const advantages = [
    `Powerful ${laptop.processor} processor for smooth multi-threaded compilation.`,
    isGaming ? `Dedicated ${laptop.gpu} for hardware ray tracing and DLSS graphics.` : `Crisp ${laptop.displaySize || 15.6}-inch display panel with high color fidelity.`,
    isApple ? 'Exceptional 18-hour battery longevity with quiet fanless thermals.' : `${ram}GB RAM capacity for effortless browser multitasking.`,
    'Fast NVMe PCIe SSD storage for rapid boot times.'
  ];

  const disadvantages = [
    isGaming ? 'Shorter battery runtime under heavy GPU rendering loads.' : 'Integrated graphics limit AAA gaming frame rates.',
    price > 90000 ? 'Higher price segment compared to budget options.' : 'Standard 60Hz refresh rate on base display model.'
  ];

  const whoShouldBuy = [
    isGaming ? 'Gamers, 3D animators & video creators' : (isApple ? 'Creative professionals, developers & mobile users' : 'Students, office professionals & software engineers'),
    'Users looking for reliable long-term performance',
    `Buyers seeking a ${laptop.brand} built laptop`
  ];

  const whoShouldAvoid = [
    isGaming ? 'Users needing 15+ hours of battery life' : 'Hardcore AAA gamers seeking 120+ FPS high-end graphics',
    'Ultra-budget buyers seeking entry-level systems below ₹30,000'
  ];

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder shadow-sm space-y-6">
      
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 rounded-2xl">
          <MdPsychology size={28} />
        </div>
        <div>
          <h2 className="font-outfit text-xl font-bold">Why LapWise Recommends This Laptop</h2>
          <p className="text-xs text-gray-400">AI-generated evaluation breakdown based on hardware configuration and market positioning.</p>
        </div>
      </div>

      <div className="p-4 bg-primary-50/40 dark:bg-primary-950/20 rounded-2xl border border-primary-100 dark:border-primary-900/40 text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
        {aiExplanationText}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Advantages */}
        <div className="p-5 bg-green-50/50 dark:bg-green-950/20 rounded-2xl border border-green-200/50 dark:border-green-800/40 space-y-3">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-xs">
            <MdThumbUp size={18} />
            <span>Advantages</span>
          </div>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
            {advantages.map((adv, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-500 font-bold mt-0.5">•</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disadvantages */}
        <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/50 dark:border-amber-800/40 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
            <MdThumbDown size={18} />
            <span>Disadvantages & Considerations</span>
          </div>
          <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
            {disadvantages.map((dis, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span>{dis}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Target Buyer Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl space-y-2 border border-gray-100 dark:border-gray-800">
          <span className="font-bold text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <MdCheckCircle className="text-emerald-500" size={16} /> Who Should Buy?
          </span>
          <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            {whoShouldBuy.map((w, idx) => (
              <li key={idx}>✓ {w}</li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl space-y-2 border border-gray-100 dark:border-gray-800">
          <span className="font-bold text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <MdCancel className="text-red-400" size={16} /> Who Should Avoid?
          </span>
          <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            {whoShouldAvoid.map((w, idx) => (
              <li key={idx}>✗ {w}</li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
};

export default AIExplanation;
