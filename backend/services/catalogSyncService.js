const Laptop = require('../models/Laptop');
const serpApiService = require('./serpApiService');

// 18 required categories to sync
const SYNC_CATEGORIES = [
  'Gaming Laptop',
  'Student Laptop',
  'Programming Laptop',
  'Business Laptop',
  'AI Laptop',
  'Video Editing Laptop',
  'Laptop',
  'ASUS Laptop',
  'Dell Laptop',
  'HP Laptop',
  'Lenovo Laptop',
  'Apple MacBook',
  'MSI Laptop',
  'Acer Laptop',
  'Samsung Laptop',
  'Honor Laptop',
  'Huawei Laptop',
  'LG Gram'
];

/**
 * Normalizes brand name from title
 */
const parseBrand = (title) => {
  const brands = ['ASUS', 'HP', 'Dell', 'Lenovo', 'Apple', 'MSI', 'Acer', 'Samsung', 'Honor', 'Microsoft', 'Gigabyte', 'LG', 'Huawei'];
  const titleUpper = title.toUpperCase();
  for (const b of brands) {
    if (titleUpper.includes(b.toUpperCase())) {
      return b;
    }
  }
  return 'Other';
};

/**
 * Normalizes processor type from title
 */
const parseProcessor = (title) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('ryzen 7')) return 'AMD Ryzen 7';
  if (titleLower.includes('ryzen 5')) return 'AMD Ryzen 5';
  if (titleLower.includes('ryzen 9')) return 'AMD Ryzen 9';
  if (titleLower.includes('ryzen 3')) return 'AMD Ryzen 3';
  if (titleLower.includes('core i7') || titleLower.includes('i7-')) return 'Intel Core i7';
  if (titleLower.includes('core i9') || titleLower.includes('i9-')) return 'Intel Core i9';
  if (titleLower.includes('core i5') || titleLower.includes('i5-')) return 'Intel Core i5';
  if (titleLower.includes('core i3') || titleLower.includes('i3-')) return 'Intel Core i3';
  if (titleLower.includes('core ultra')) return 'Intel Core Ultra';
  if (titleLower.includes('m1')) return 'Apple M1';
  if (titleLower.includes('m2')) return 'Apple M2';
  if (titleLower.includes('m3')) return 'Apple M3';
  if (titleLower.includes('celeron') || titleLower.includes('pentium')) return 'Intel Entry Celeron';
  return 'Intel Core i5'; // default fallback
};

/**
 * Normalizes GPU from title
 */
const parseGpu = (title, brand) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('rtx 4090')) return 'NVIDIA GeForce RTX 4090';
  if (titleLower.includes('rtx 4080')) return 'NVIDIA GeForce RTX 4080';
  if (titleLower.includes('rtx 4070')) return 'NVIDIA GeForce RTX 4070';
  if (titleLower.includes('rtx 4060')) return 'NVIDIA GeForce RTX 4060';
  if (titleLower.includes('rtx 4050')) return 'NVIDIA GeForce RTX 4050';
  if (titleLower.includes('rtx 3050')) return 'NVIDIA GeForce RTX 3050';
  if (titleLower.includes('rtx 2050')) return 'NVIDIA GeForce RTX 2050';
  if (titleLower.includes('gtx')) return 'NVIDIA GeForce GTX Graphics';
  if (titleLower.includes('radeon')) return 'AMD Radeon Graphics';
  if (brand === 'Apple') return 'Apple Integrated GPU';
  if (titleLower.includes('intel iris') || titleLower.includes('iris xe')) return 'Intel Iris Xe Graphics';
  return 'Intel Integrated Graphics'; // default fallback
};

/**
 * Extract RAM in GB from title
 */
const parseRam = (title) => {
  const ramMatch = title.match(/\b(4|8|12|16|24|32|48|64)\s*GB\b/i);
  if (ramMatch) {
    return parseInt(ramMatch[1], 10);
  }
  return 8; // default fallback
};

/**
 * Extract storage text description
 */
const parseStorage = (title) => {
  const storageMatch = title.match(/\b(128|256|512|1|2)\s*(GB|TB)\s*(SSD|HDD|EMMC)?\b/i);
  if (storageMatch) {
    return storageMatch[0];
  }
  return '512GB SSD'; // default fallback
};

/**
 * Extract display size (Number) from title
 */
const parseDisplaySize = (title) => {
  const sizeMatch = title.match(/\b(11|12|13|14|15|16|17)(\.\d)?\s*(inch|")\b/i);
  if (sizeMatch) {
    return parseFloat(sizeMatch[1] + (sizeMatch[2] || ''));
  }
  return 15.6; // default fallback
};

/**
 * Extract refresh rate (Number) from title
 */
const parseRefreshRate = (title) => {
  const hzMatch = title.match(/\b(60|90|120|144|165|240|300|360)\s*Hz\b/i);
  if (hzMatch) {
    return parseInt(hzMatch[1], 10);
  }
  return 60; // default fallback
};

/**
 * Helper: Parse SerpAPI product item into Laptop document format
 */
const parseProductToLaptop = (product, queryCategory) => {
  const title = product.title || '';
  const brand = parseBrand(title);
  const processor = parseProcessor(title);
  const gpu = parseGpu(title, brand);
  const ram = parseRam(title);
  const storage = parseStorage(title);
  const displaySize = parseDisplaySize(title);
  const refreshRate = parseRefreshRate(title);
  
  // Model name: remove brand from title
  let model = title.replace(new RegExp(`\\b${brand}\\b`, 'i'), '').trim();
  if (!model) model = title;

  // Extract series
  let series = '';
  const seriesList = ['ZenBook', 'Vivobook', 'ROG', 'TUF', 'Pavilion', 'Envy', 'Spectre', 'Inspiron', 'Vostro', 'Latitude', 'XPS', 'ThinkPad', 'IdeaPad', 'Legion', 'Yoga', 'MacBook Pro', 'MacBook Air', 'Katana', 'Stealth', 'Predator', 'Nitro', 'Gram', 'Galaxy Book'];
  for (const s of seriesList) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(title)) {
      series = s;
      break;
    }
  }

  // Purpose mapping
  const purposeSet = new Set(['General']);
  const titleLower = title.toLowerCase();
  
  if (queryCategory.toLowerCase().includes('gaming') || titleLower.includes('gaming') || gpu.includes('RTX') || gpu.includes('GTX')) {
    purposeSet.add('Gaming');
    purposeSet.add('Entertainment');
  }
  if (queryCategory.toLowerCase().includes('student') || ram <= 8 || product.extracted_price < 40000) {
    purposeSet.add('Student');
  }
  if (queryCategory.toLowerCase().includes('programming') || ram >= 16) {
    purposeSet.add('Programming');
    purposeSet.add('Office');
  }
  if (queryCategory.toLowerCase().includes('business') || queryCategory.toLowerCase().includes('office') || titleLower.includes('business') || titleLower.includes('thinkpad')) {
    purposeSet.add('Office');
  }
  if (queryCategory.toLowerCase().includes('ai') || titleLower.includes('ai') || gpu.includes('RTX 40')) {
    purposeSet.add('AI / ML');
    purposeSet.add('Programming');
  }
  if (queryCategory.toLowerCase().includes('editing') || titleLower.includes('editing') || titleLower.includes('creator')) {
    purposeSet.add('Video Editing');
    purposeSet.add('Entertainment');
  }
  const purpose = Array.from(purposeSet);

  const price = product.extracted_price || parseFloat((product.price || '0').replace(/[^0-9.]/g, '')) || 0;
  const rating = product.rating || 4.0;
  const reviewCount = product.reviews || 10;

  // Display description
  let display = `${displaySize}-inch display`;
  if (titleLower.includes('oled')) display += ' OLED';
  else if (titleLower.includes('ips')) display += ' IPS';
  else display += ' FHD';

  const OS = brand === 'Apple' ? 'macOS' : (titleLower.includes('chromebook') ? 'ChromeOS' : 'Windows 11 Home');

  // Compute backward-compatible specScores
  const isHighEndCPU = /i7|i9|ryzen\s*7|ryzen\s*9|m2|m3/i.test(processor);
  const isHighEndGPU = /rtx\s*40/i.test(gpu);
  const specScores = {
    cpu: Math.min(100, 60 + (ram / 32 * 20) + (isHighEndCPU ? 20 : 0)),
    gpu: Math.min(100, 30 + (isHighEndGPU ? 60 : (/rtx/i.test(gpu) ? 40 : 10))),
    cooling: (titleLower.includes('gaming') || gpu.includes('RTX')) ? 80 : 60,
    ram: Math.min(100, Math.round(ram / 32 * 100)),
    display: refreshRate > 60 ? 85 : 65,
    battery: brand === 'Apple' ? 85 : 60,
    keyboard: 70,
    weight: displaySize < 14.5 ? 85 : 65,
    speakers: 70,
    storage: titleLower.includes('ssd') ? 80 : 50
  };

  const storeLinks = [{
    storeName: product.source || 'Online Store',
    price: price,
    discount: 0,
    availability: 'In Stock',
    buyUrl: product.product_link || 'https://google.com/shopping'
  }];

  return {
    brand,
    series,
    model,
    title,
    description: product.description || `Google Shopping fetched ${brand} ${model} laptop featuring ${processor}, ${ram}GB RAM, and ${storage} storage. Offered by ${product.source || 'various retailers'}.`,
    price,
    currency: 'INR',
    thumbnail: product.thumbnail || 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg',
    images: [product.thumbnail || 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg'],
    buyLink: product.product_link || 'https://google.com/shopping',
    store: product.source || 'Online Store',
    rating,
    reviewCount,
    numReviews: reviewCount, // backward compatibility
    processor,
    gpu,
    ram,
    storage,
    display,
    displaySize,
    screenSize: displaySize, // backward compatibility
    refreshRate,
    battery: 'Integrated Battery',
    weight: displaySize < 14.5 ? 1.4 : 1.8,
    operatingSystem: OS,
    launchYear: 2024,
    purpose,
    category: queryCategory,
    isTrending: rating >= 4.4 && reviewCount >= 30,
    isFeatured: rating >= 4.7,
    lastUpdated: new Date(),
    source: 'SerpAPI',
    specScores,
    storeLinks,
    priceHistory: [{ price, recordedAt: new Date() }],
    serpProductId: product.product_id
  };
};

/**
 * Synchronize all categories from SerpAPI and save/update in MongoDB
 * 
 * @returns {Promise<object>} Sync execution statistics
 */
const syncCatalog = async () => {
  console.log('[Sync Service] Starting automatic SerpAPI catalog update sync...');
  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;

  for (const category of SYNC_CATEGORIES) {
    try {
      console.log(`[Sync Service] Processing category: "${category}"...`);
      const results = await serpApiService.fetchShoppingResults(category);
      console.log(`[Sync Service] Fetched ${results.length} items for "${category}"`);

      for (const item of results) {
        if (!item.title) continue;
        totalProcessed++;

        const laptopData = parseProductToLaptop(item, category);
        const storeName = item.source || 'Online Store';

        // Check duplicate by title + store
        const existing = await Laptop.findOne({ 
          title: laptopData.title, 
          store: laptopData.store 
        });

        if (existing) {
          // If a laptop already exists, update only: price, rating, buyLink, thumbnail, lastUpdated
          existing.price = laptopData.price;
          existing.rating = laptopData.rating;
          existing.buyLink = laptopData.buyLink;
          existing.thumbnail = laptopData.thumbnail;
          existing.lastUpdated = new Date();
          
          // Also sync history & ratings count
          existing.reviewCount = laptopData.reviewCount;
          existing.numReviews = laptopData.reviewCount;
          
          // Push to price history if price changed
          if (existing.priceHistory && existing.priceHistory.length > 0) {
            const lastRecord = existing.priceHistory[existing.priceHistory.length - 1];
            if (lastRecord.price !== laptopData.price) {
              existing.priceHistory.push({ price: laptopData.price, recordedAt: new Date() });
            }
          } else {
            existing.priceHistory = [{ price: laptopData.price, recordedAt: new Date() }];
          }

          // If store links array exists, update it as well
          if (existing.storeLinks && existing.storeLinks.length > 0) {
            existing.storeLinks[0].price = laptopData.price;
            existing.storeLinks[0].buyUrl = laptopData.buyLink;
          }

          await existing.save();
          totalUpdated++;
        } else {
          // Create new record
          await Laptop.create(laptopData);
          totalCreated++;
        }
      }

      // Add a small pause between categories to avoid overloading local DB or network
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (catErr) {
      console.error(`[Sync Service] Error syncing category "${category}":`, catErr.message);
    }
  }

  console.log(`[Sync Service] Complete! Processed: ${totalProcessed} | Created: ${totalCreated} | Updated: ${totalUpdated}`);
  return {
    processed: totalProcessed,
    created: totalCreated,
    updated: totalUpdated
  };
};

/**
 * Automatically initializes catalog on server startup if DB is dry (<300 items)
 */
const initializeCatalog = async () => {
  try {
    const dbCount = await Laptop.countDocuments();
    console.log(`[Startup Check] Database contains ${dbCount} laptops.`);
    if (dbCount < 300) {
      console.log(`[Startup Check] Catalog count is less than 300. Triggering automated seeding import from SerpAPI...`);
      // Start synchronization
      await syncCatalog();
      console.log('Catalog Updated Successfully');
    } else {
      console.log(`[Startup Check] Catalog count is sufficient (${dbCount}). Skipping startup sync.`);
    }
  } catch (error) {
    console.error(`[Startup Check Error] Failed to initialize catalog:`, error.message);
  }
};

/**
 * Registers background sync interval to run every 24 hours
 */
const startBackgroundSyncScheduler = () => {
  const INTERVAL_24H = 24 * 60 * 60 * 1000;
  console.log(`[Sync Scheduler] Initializing background catalog updater (runs every 24 hours)...`);
  
  setInterval(async () => {
    try {
      console.log('[Sync Scheduler] Running 24-hour scheduled catalog sync updates...');
      const stats = await syncCatalog();
      console.log(`[Sync Scheduler] Completed successfully! Sync Stats:`, stats);
    } catch (error) {
      console.error('[Sync Scheduler Error] Scheduled synchronization failed:', error.message);
    }
  }, INTERVAL_24H);
};

module.exports = {
  syncCatalog,
  initializeCatalog,
  startBackgroundSyncScheduler
};
