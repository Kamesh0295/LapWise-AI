import React from 'react';

const SpecificationTable = ({ laptop }) => {
  if (!laptop) return null;

  const isGaming = /rtx|gtx|gaming/i.test(`${laptop.gpu || ''} ${laptop.title || ''}`);
  const isApple = laptop.brand === 'Apple';

  const specsGrid = [
    { category: 'Processor & Graphics', items: [
      { label: 'Processor (CPU)', value: laptop.processor || 'Intel Core i5' },
      { label: 'CPU Architecture', value: isApple ? 'Apple Silicon ARM' : 'x86_64 High-Efficiency Architecture' },
      { label: 'Graphics Processor (GPU)', value: laptop.gpu || 'Integrated Graphics' },
      { label: 'GPU Memory Type', value: /rtx 40/i.test(laptop.gpu) ? 'GDDR6 Dedicated VRAM' : (isApple ? 'Unified System VRAM' : 'Shared System Memory') }
    ]},
    { category: 'Memory & Storage', items: [
      { label: 'RAM Capacity', value: `${laptop.ram || 16}GB` },
      { label: 'RAM Memory Type', value: isApple ? 'Unified Memory' : (laptop.ram >= 16 ? 'DDR5 5200MHz' : 'DDR4 3200MHz') },
      { label: 'Storage Drive', value: laptop.storage || '512GB NVMe SSD' },
      { label: 'Storage Drive Interface', value: 'PCIe Gen4 NVMe M.2 SSD' }
    ]},
    { category: 'Display & Visuals', items: [
      { label: 'Display Size', value: `${laptop.displaySize || laptop.screenSize || 15.6}-inch` },
      { label: 'Panel Type', value: laptop.display || 'FHD IPS Anti-Glare Display' },
      { label: 'Refresh Rate', value: `${laptop.refreshRate || 60} Hz` },
      { label: 'Peak Brightness', value: `${laptop.brightness || 300} nits` },
      { label: 'Color Gamut', value: isApple || /oled/i.test(laptop.display) ? '100% DCI-P3 Wide Color' : '100% sRGB Color Coverage' }
    ]},
    { category: 'Chassis & Battery', items: [
      { label: 'Weight', value: `${laptop.weight || 1.8} kg` },
      { label: 'Operating System', value: laptop.operatingSystem || (isApple ? 'macOS' : 'Windows 11 Home') },
      { label: 'Battery Capacity', value: isApple ? '70 Wh Lithium Polymer' : (isGaming ? '90 Wh Fast-Charge' : '56 Wh Integrated') },
      { label: 'Battery Backup', value: isApple ? 'Up to 18 Hours' : (isGaming ? 'Up to 6 Hours' : 'Up to 10 Hours') },
      { label: 'Keyboard', value: isGaming ? 'RGB Backlit Gaming Keyboard' : 'Ergonomic Backlit Keyboard' }
    ]},
    { category: 'Connectivity & Audio', items: [
      { label: 'Wireless Networking', value: 'Wi-Fi 6E (802.11ax) + Bluetooth 5.3' },
      { label: 'I/O Ports', value: isApple ? 'Thunderbolt 4 / USB 4, MagSafe 3, Headphone Jack' : 'USB 3.2 Type-C, USB 3.2 Type-A, HDMI 2.1, 3.5mm Combo Jack' },
      { label: 'Webcam', value: '1080p FHD Camera with Privacy Shutter' },
      { label: 'Audio & Speakers', value: 'Stereo Speakers tuned with Dolby Atmos Audio' },
      { label: 'Manufacturer Warranty', value: laptop.warranty || '1 Year Onsite Manufacturer Warranty' },
      { label: 'Release Year', value: laptop.launchYear || 2024 }
    ]}
  ];

  return (
    <div className="p-6 sm:p-8 bg-white dark:bg-darkCard rounded-3xl border border-gray-200 dark:border-darkBorder shadow-sm space-y-6">
      <div>
        <h2 className="font-outfit text-xl font-bold">Full Technical Specifications</h2>
        <p className="text-xs text-gray-400 mt-0.5">Comprehensive hardware architecture, memory capabilities, display optics, and connectivity details.</p>
      </div>

      <div className="space-y-6">
        {specsGrid.map((sec, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="font-outfit text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-wider bg-primary-50/50 dark:bg-primary-950/30 px-3 py-1.5 rounded-lg inline-block">
              {sec.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sec.items.map((item, iIdx) => (
                <div key={iIdx} className="p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl flex items-center justify-between text-xs border border-gray-100 dark:border-gray-800/50">
                  <span className="text-gray-400 font-medium">{item.label}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpecificationTable;
