const Laptop = require('../models/Laptop');
const serpApiService = require('./serpApiService');
const { extractLaptopPrice } = require('../utils/helpers');

/**
 * Maps purpose parameter to simplified query terms for SerpAPI
 */
const mapPurposeToQuery = (purpose) => {
  if (!purpose) return 'laptop';
  
  // Clean comma-separated values to find first non-empty purpose
  const primaryPurpose = purpose.split(',')[0].trim().toLowerCase();
  
  switch (primaryPurpose) {
    case 'gaming':
      return 'gaming laptop';
    case 'student':
      return 'student laptop';
    case 'programming':
    case 'developer':
      return 'programming laptop';
    case 'business':
    case 'office':
      return 'business laptop';
    case 'ai/ml':
    case 'ai':
    case 'ml':
      return 'AI laptop';
    case 'premium oled':
    case 'oled':
      return 'OLED laptop';
    default:
      return `${primaryPurpose} laptop`;
  }
};

/**
 * Set of 20 realistic fallback dummy laptops in case DB is empty and API fails
 */
const getDummyLaptops = () => {
  const brands = ['ASUS', 'Dell', 'HP', 'Lenovo', 'Apple', 'Acer', 'MSI', 'Samsung', 'LG'];
  const processors = ['Intel Core i5', 'Intel Core i7', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2', 'Apple M3'];
  const gpus = ['NVIDIA GeForce RTX 4060', 'NVIDIA GeForce RTX 4050', 'Intel Iris Xe Graphics', 'AMD Radeon Graphics', 'Apple Integrated GPU'];
  
  const dummies = [];
  for (let i = 1; i <= 20; i++) {
    const brand = brands[i % brands.length];
    const processor = processors[i % processors.length];
    const gpu = gpus[i % gpus.length];
    const isGaming = gpu.includes('RTX');
    const isMac = brand === 'Apple';
    const ram = i % 3 === 0 ? 32 : (i % 2 === 0 ? 16 : 8);
    const storage = ram === 32 ? '1TB SSD' : '512GB SSD';
    const price = 40000 + (i * 4500);
    const displaySize = i % 4 === 0 ? 14.0 : 15.6;
    const display = `${displaySize}-inch ${i % 5 === 0 ? 'OLED' : 'IPS FHD'}`;
    const OS = isMac ? 'macOS' : 'Windows 11 Home';
    const rating = parseFloat((4.0 + (i % 10) * 0.1).toFixed(1));
    const reviews = 15 + (i * 8);

    const model = `${brand} Laptop Edition ${i}`;
    const purpose = ['General'];
    if (isGaming) purpose.push('Gaming');
    if (ram >= 16) purpose.push('Programming');
    if (price < 50000) purpose.push('Student');

    dummies.push({
      _id: `dummy_laptop_id_${i}`,
      brand,
      series: 'Standard',
      model,
      title: `${brand} ${model} (${processor}, ${ram}GB, ${storage})`,
      description: `Premium high-performance laptop by ${brand} featuring ${processor}, ${gpu}, ${ram}GB RAM, and ${storage} storage. Fits all day multitasking.`,
      price,
      currency: 'INR',
      thumbnail: 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg',
      images: ['https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg'],
      buyLink: 'https://google.com/shopping',
      store: 'Online Marketplace',
      rating,
      reviewCount: reviews,
      numReviews: reviews,
      processor,
      gpu,
      ram,
      storage,
      display,
      displaySize,
      screenSize: displaySize,
      refreshRate: isGaming ? 144 : 60,
      battery: 'Integrated Battery',
      weight: displaySize < 14.5 ? 1.4 : 1.8,
      operatingSystem: OS,
      launchYear: 2024,
      purpose,
      category: isGaming ? 'Gaming Laptop' : 'General Laptop',
      isTrending: rating >= 4.4,
      isFeatured: rating >= 4.7,
      lastUpdated: new Date(),
      source: 'Dummy Fallback',
      specScores: { cpu: 70, gpu: 60, cooling: 65, ram: 70, display: 70, battery: 75, keyboard: 70, weight: 70, speakers: 70, storage: 70 }
    });
  }
  return dummies;
};

/**
 * Helper to normalize and save fetched SerpAPI items to MongoDB cache
 */
const saveSerpToMongoCache = async (products, queryCategory) => {
  const savedList = [];
  for (const item of products) {
    if (!item.title) continue;
    
    // Normalization parsing logic
    const title = item.title;
    
    // Brand
    const brands = ['ASUS', 'HP', 'Dell', 'Lenovo', 'Apple', 'MSI', 'Acer', 'Samsung', 'Honor', 'Microsoft', 'Gigabyte', 'LG', 'Huawei'];
    let brand = 'Other';
    for (const b of brands) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(title)) {
        brand = b;
        break;
      }
    }

    // Processor
    const titleLower = title.toLowerCase();
    let processor = 'Intel Core i5';
    if (titleLower.includes('ryzen 7')) processor = 'AMD Ryzen 7';
    else if (titleLower.includes('ryzen 5')) processor = 'AMD Ryzen 5';
    else if (titleLower.includes('ryzen 9')) processor = 'AMD Ryzen 9';
    else if (titleLower.includes('ryzen 3')) processor = 'AMD Ryzen 3';
    else if (titleLower.includes('core i7') || titleLower.includes('i7-')) processor = 'Intel Core i7';
    else if (titleLower.includes('core i9') || titleLower.includes('i9-')) processor = 'Intel Core i9';
    else if (titleLower.includes('core i5') || titleLower.includes('i5-')) processor = 'Intel Core i5';
    else if (titleLower.includes('core i3') || titleLower.includes('i3-')) processor = 'Intel Core i3';
    else if (titleLower.includes('core ultra')) processor = 'Intel Core Ultra';
    else if (titleLower.includes('m1')) processor = 'Apple M1';
    else if (titleLower.includes('m2')) processor = 'Apple M2';
    else if (titleLower.includes('m3')) processor = 'Apple M3';

    // GPU
    let gpu = 'Intel Integrated Graphics';
    if (titleLower.includes('rtx 4090')) gpu = 'NVIDIA GeForce RTX 4090';
    else if (titleLower.includes('rtx 4080')) gpu = 'NVIDIA GeForce RTX 4080';
    else if (titleLower.includes('rtx 4070')) gpu = 'NVIDIA GeForce RTX 4070';
    else if (titleLower.includes('rtx 4060')) gpu = 'NVIDIA GeForce RTX 4060';
    else if (titleLower.includes('rtx 4050')) gpu = 'NVIDIA GeForce RTX 4050';
    else if (titleLower.includes('rtx 3050')) gpu = 'NVIDIA GeForce RTX 3050';
    else if (titleLower.includes('rtx 2050')) gpu = 'NVIDIA GeForce RTX 2050';
    else if (titleLower.includes('gtx')) gpu = 'NVIDIA GeForce GTX Graphics';
    else if (titleLower.includes('radeon')) gpu = 'AMD Radeon Graphics';
    else if (brand === 'Apple') gpu = 'Apple Integrated GPU';
    else if (titleLower.includes('intel iris') || titleLower.includes('iris xe')) gpu = 'Intel Iris Xe Graphics';

    // RAM
    let ram = 8;
    const ramMatch = title.match(/\b(4|8|12|16|24|32|48|64)\s*GB\b/i);
    if (ramMatch) ram = parseInt(ramMatch[1], 10);

    // Storage
    let storage = '512GB SSD';
    const storageMatch = title.match(/\b(128|256|512|1|2)\s*(GB|TB)\s*(SSD|HDD|EMMC)?\b/i);
    if (storageMatch) storage = storageMatch[0];

    // Display
    const sizeMatch = title.match(/\b(11|12|13|14|15|16|17)(\.\d)?\s*(inch|")\b/i);
    const displaySize = sizeMatch ? parseFloat(sizeMatch[1] + (sizeMatch[2] || '')) : 15.6;
    let display = `${displaySize}-inch display`;
    if (titleLower.includes('oled')) display += ' OLED';
    else if (titleLower.includes('ips')) display += ' IPS';
    else display += ' FHD';

    const refreshRate = title.match(/\b(90|120|144|165|240)\s*Hz\b/i) ? parseInt(title.match(/\b(90|120|144|165|240)\s*Hz\b/i)[1], 10) : 60;
    const OS = brand === 'Apple' ? 'macOS' : (titleLower.includes('chromebook') ? 'ChromeOS' : 'Windows 11 Home');
    
    const price = extractLaptopPrice(item);
    const rating = item.rating || 4.0;
    const reviewCount = item.reviews || 10;

    // Purpose
    const purposeSet = new Set(['General']);
    if (queryCategory.toLowerCase().includes('gaming') || titleLower.includes('gaming') || gpu.includes('RTX')) {
      purposeSet.add('Gaming');
      purposeSet.add('Entertainment');
    }
    if (queryCategory.toLowerCase().includes('student') || ram <= 8 || price < 40000) {
      purposeSet.add('Student');
    }
    if (queryCategory.toLowerCase().includes('programming') || ram >= 16) {
      purposeSet.add('Programming');
      purposeSet.add('Office');
    }
    if (queryCategory.toLowerCase().includes('business') || queryCategory.toLowerCase().includes('office') || titleLower.includes('business')) {
      purposeSet.add('Office');
    }
    if (queryCategory.toLowerCase().includes('ai') || titleLower.includes('ai') || gpu.includes('RTX 40')) {
      purposeSet.add('AI / ML');
      purposeSet.add('Programming');
    }
    const purpose = Array.from(purposeSet);

    const specScores = {
      cpu: Math.min(100, 60 + (ram / 32 * 20)),
      gpu: gpu.includes('RTX') ? 85 : 55,
      cooling: gpu.includes('RTX') ? 80 : 60,
      ram: Math.min(100, Math.round(ram / 32 * 100)),
      display: refreshRate > 60 ? 85 : 65,
      battery: brand === 'Apple' ? 85 : 60,
      keyboard: 70,
      weight: displaySize < 14.5 ? 85 : 65,
      speakers: 70,
      storage: titleLower.includes('ssd') ? 80 : 50
    };

    const laptopData = {
      brand,
      series: 'Standard',
      model: title.replace(new RegExp(`\\b${brand}\\b`, 'i'), '').trim(),
      title,
      description: item.description || `Google Shopping fetched ${brand} laptop featuring ${processor}, ${ram}GB RAM, and ${storage} storage.`,
      price,
      currency: 'INR',
      thumbnail: item.thumbnail || 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg',
      images: [item.thumbnail || 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg'],
      buyLink: item.product_link || 'https://google.com/shopping',
      store: item.source || 'Online Store',
      rating,
      reviewCount,
      numReviews: reviewCount,
      processor,
      gpu,
      ram,
      storage,
      display,
      displaySize,
      screenSize: displaySize,
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
      storeLinks: [{ storeName: item.source || 'Online Store', price, discount: 0, buyUrl: item.product_link || 'https://google.com/shopping' }],
      priceHistory: [{ price, recordedAt: new Date() }],
      serpProductId: item.product_id
    };

    try {
      const saved = await Laptop.findOneAndUpdate(
        { title: laptopData.title, store: laptopData.store },
        { $set: laptopData },
        { new: true, upsert: true }
      );
      savedList.push(saved);
    } catch (saveErr) {
      console.error(`[catalogService] Error upserting cached product:`, saveErr.message);
    }
  }
  return savedList;
};

/**
 * Fallback Search execution stages Level 1 to Level 4
 */
const runFallbackFetch = async (brand, purpose, maxPrice) => {
  const budget = Number(maxPrice) || Infinity;
  const mappedPurpose = mapPurposeToQuery(purpose);
  const brandQuery = brand ? brand.trim() : '';

  console.log(`[catalogService] Initiating multi-level fallback fetch pipeline. Brand: "${brandQuery}", Purpose: "${purpose}" (Mapped: "${mappedPurpose}"), Budget: ${budget}`);

  // --- LEVEL 1: Purpose + Brand + Budget ---
  console.log('[catalogService] Fallback Level 1: Searching for Brand + Purpose + Budget...');
  let queryObj = {};
  if (purpose) queryObj.purpose = { $in: purpose.split(',').map(p => p.trim()) };
  if (brandQuery) queryObj.brand = { $regex: new RegExp(`^${escapeRegex(brandQuery)}$`, 'i') };
  if (budget !== Infinity) queryObj.price = { $lte: budget };

  let count = await Laptop.countDocuments(queryObj);
  if (count > 0) {
    console.log(`[catalogService] Fallback Level 1: MongoDB Cache Hit (${count} results)`);
    return await Laptop.find(queryObj);
  }

  // Cache miss: Query SerpAPI with Brand + Purpose
  if (brandQuery) {
    const serpQuery = `${brandQuery} ${mappedPurpose}`;
    const results = await serpApiService.fetchShoppingResults(serpQuery);
    if (results && results.length > 0) {
      await saveSerpToMongoCache(results, purpose || 'Laptop');
      let updatedCount = await Laptop.countDocuments(queryObj);
      if (updatedCount > 0) {
        console.log(`[catalogService] Fallback Level 1: Saved and returning ${updatedCount} items from SerpAPI`);
        return await Laptop.find(queryObj);
      }
    }
  }

  // --- LEVEL 2: Purpose + Budget ---
  console.log('[catalogService] Fallback Level 2: Searching for Purpose + Budget...');
  queryObj = {};
  if (purpose) queryObj.purpose = { $in: purpose.split(',').map(p => p.trim()) };
  if (budget !== Infinity) queryObj.price = { $lte: budget };

  count = await Laptop.countDocuments(queryObj);
  if (count > 0) {
    console.log(`[catalogService] Fallback Level 2: MongoDB Cache Hit (${count} results)`);
    return await Laptop.find(queryObj);
  }

  // Cache miss: Query SerpAPI with Purpose
  const serpQueryL2 = budget !== Infinity ? `${mappedPurpose} under ${budget}` : mappedPurpose;
  const resultsL2 = await serpApiService.fetchShoppingResults(serpQueryL2);
  if (resultsL2 && resultsL2.length > 0) {
    await saveSerpToMongoCache(resultsL2, purpose || 'Laptop');
    let updatedCount = await Laptop.countDocuments(queryObj);
    if (updatedCount > 0) {
      console.log(`[catalogService] Fallback Level 2: Saved and returning ${updatedCount} items from SerpAPI`);
      return await Laptop.find(queryObj);
    }
  }

  // --- LEVEL 3: Purpose ---
  console.log('[catalogService] Fallback Level 3: Searching for Purpose...');
  queryObj = {};
  if (purpose) {
    queryObj.purpose = { $in: purpose.split(',').map(p => p.trim()) };
  } else {
    queryObj.purpose = 'General';
  }

  count = await Laptop.countDocuments(queryObj);
  if (count > 0) {
    console.log(`[catalogService] Fallback Level 3: MongoDB Cache Hit (${count} results)`);
    return await Laptop.find(queryObj);
  }

  // Cache miss: Query SerpAPI for raw Purpose
  const resultsL3 = await serpApiService.fetchShoppingResults(mappedPurpose);
  if (resultsL3 && resultsL3.length > 0) {
    await saveSerpToMongoCache(resultsL3, purpose || 'Laptop');
    let updatedCount = await Laptop.countDocuments(queryObj);
    if (updatedCount > 0) {
      console.log(`[catalogService] Fallback Level 3: Saved and returning ${updatedCount} items from SerpAPI`);
      return await Laptop.find(queryObj);
    }
  }

  // Purpose Failure check: If searching Programming/Developer Laptop yields 0, try synonyms
  if (mappedPurpose === 'programming laptop') {
    console.log('[catalogService] Fallback Level 3 Synonym check: Searching for "Developer Laptop" or "Coding Laptop"...');
    for (const syn of ['developer laptop', 'coding laptop']) {
      const synResults = await serpApiService.fetchShoppingResults(syn);
      if (synResults && synResults.length > 0) {
        await saveSerpToMongoCache(synResults, 'Programming');
        let updatedCount = await Laptop.countDocuments({ purpose: 'Programming' });
        if (updatedCount > 0) {
          return await Laptop.find({ purpose: 'Programming' });
        }
      }
    }
  }

  // --- LEVEL 4: General Laptop ---
  console.log('[catalogService] Fallback Level 4: Searching for General Laptop...');
  count = await Laptop.countDocuments();
  if (count > 0) {
    console.log(`[catalogService] Fallback Level 4: Returning all MongoDB laptops (${count})`);
    return await Laptop.find({});
  }

  // Cache miss: Query SerpAPI for general 'laptop'
  const resultsL4 = await serpApiService.fetchShoppingResults('laptop');
  if (resultsL4 && resultsL4.length > 0) {
    await saveSerpToMongoCache(resultsL4, 'General');
    return await Laptop.find({});
  }

  // Absolute fallback: Return dummy laptops
  console.warn('[catalogService] Absolute fallback: MongoDB is empty and SerpAPI queries failed. Returning dummy laptops list.');
  return getDummyLaptops();
};

/**
 * Filter candidates in-memory, handling stage relaxation constraints
 */
const filterLaptopsInMemory = (laptops, filters) => {
  let filtered = [...laptops];

  // 1. Purpose Filter
  if (filters.purpose) {
    const purposes = filters.purpose.split(',').map(p => p.trim().toLowerCase());
    const matched = filtered.filter(l => 
      l.purpose.some(p => purposes.includes(p.toLowerCase()))
    );
    if (matched.length > 0) {
      filtered = matched;
    }
  }

  // 2. Brand filter with failure handling
  if (filters.brand) {
    const brands = filters.brand.split(',').map(b => b.trim().toLowerCase());
    const matched = filtered.filter(l => brands.includes(l.brand.toLowerCase()));
    if (matched.length > 0) {
      filtered = matched;
    } else {
      // WHEN BRAND FAILS: ASUS Gaming Laptop returns zero, search Gaming Laptop, then filter ASUS if available (if not, return Gaming Laptops)
      console.log(`[Filter memory] Brand filter "${filters.brand}" yielded 0 matches. Dropping Brand filter fallback.`);
    }
  }

  // 3. Budget filter with failure handling
  if (filters.minPrice || filters.maxPrice) {
    const min = Number(filters.minPrice) || 0;
    const max = Number(filters.maxPrice) || Infinity;
    const matched = filtered.filter(l => l.price >= min && l.price <= max);
    if (matched.length > 0) {
      filtered = matched;
    } else {
      // WHEN BUDGET FAILS: If Gaming under ₹45000 returns zero, automatically search Gaming Laptop, Sort by lowest price, Return cheapest gaming laptops.
      console.log(`[Filter memory] Budget limit "${min} - ${max}" yielded 0 matches. Dropping budget constraint and sorting by price ascending.`);
      filtered.sort((a, b) => a.price - b.price);
    }
  }

  // 4. Display filter with failure handling
  if (filters.display) {
    const displays = filters.display.split(',').map(d => d.trim().toLowerCase());
    const matched = filtered.filter(l => 
      displays.some(d => l.display.toLowerCase().includes(d))
    );
    if (matched.length > 0) {
      filtered = matched;
    } else {
      // WHEN DISPLAY FILTER FAILS: If OLED laptops are unavailable, show normal IPS laptops
      console.log(`[Filter memory] Display filter "${filters.display}" yielded 0 matches. Dropping display specification constraint.`);
    }
  }

  // 5. RAM Filter
  if (filters.ram) {
    const ramValues = filters.ram.split(',').map(Number);
    const matched = filtered.filter(l => ramValues.includes(l.ram));
    if (matched.length > 0) filtered = matched;
  }

  // 6. Storage Filter
  if (filters.storage) {
    const storageValues = filters.storage.split(',').map(s => s.trim().toLowerCase());
    const matched = filtered.filter(l => 
      storageValues.some(s => l.storage.toLowerCase().includes(s))
    );
    if (matched.length > 0) filtered = matched;
  }

  // 7. Processor Filter
  if (filters.processor) {
    const processors = filters.processor.split(',').map(p => p.trim().toLowerCase());
    const matched = filtered.filter(l => 
      processors.some(p => l.processor.toLowerCase().includes(p))
    );
    if (matched.length > 0) filtered = matched;
  }

  // 8. GPU Filter
  if (filters.gpu) {
    const gpus = filters.gpu.split(',').map(g => g.trim().toLowerCase());
    const matched = filtered.filter(l => 
      gpus.some(g => l.gpu.toLowerCase().includes(g))
    );
    if (matched.length > 0) filtered = matched;
  }

  // 9. Battery Filter
  if (filters.battery) {
    const batteries = filters.battery.split(',').map(b => b.trim().toLowerCase());
    const matched = filtered.filter(l => 
      batteries.some(b => l.battery.toLowerCase().includes(b))
    );
    if (matched.length > 0) filtered = matched;
  }

  // 10. Rating Filter
  if (filters.rating) {
    const minRating = Number(filters.rating);
    const matched = filtered.filter(l => l.rating >= minRating);
    if (matched.length > 0) filtered = matched;
  }

  // 11. OS Filter
  if (filters.operatingSystem) {
    const osList = filters.operatingSystem.split(',').map(o => o.trim().toLowerCase());
    const matched = filtered.filter(l => 
      osList.some(o => l.operatingSystem.toLowerCase().includes(o))
    );
    if (matched.length > 0) filtered = matched;
  }

  // 12. Weight Filter
  if (filters.weight) {
    const weightTypes = filters.weight.split(',').map(w => w.trim().toLowerCase());
    const matched = filtered.filter(l => {
      if (weightTypes.includes('light') && l.weight < 1.5) return true;
      if (weightTypes.includes('medium') && l.weight >= 1.5 && l.weight <= 2.0) return true;
      if (weightTypes.includes('heavy') && l.weight > 2.0) return true;
      return false;
    });
    if (matched.length > 0) filtered = matched;
  }

  // 13. Trending Filter
  if (filters.trending === 'true') {
    const matched = filtered.filter(l => l.isTrending || l.rating >= 4.4);
    if (matched.length > 0) filtered = matched;
  }

  return filtered;
};

/**
 * Pads the returned result array to always contain at least 20 laptops
 */
const padLaptopsToAtLeast20 = async (laptops) => {
  if (laptops.length >= 20) return laptops;

  console.log(`[catalogService] Padding list of size ${laptops.length} to at least 20 elements...`);
  
  const existingIds = new Set(laptops.map(l => l._id ? l._id.toString() : ''));
  const padSize = 20 - laptops.length;

  // Query MongoDB to find other available laptops for padding
  const extraLaptops = await Laptop.find({
    _id: { $nin: Array.from(existingIds).filter(id => id && id.length === 24) }
  }).limit(padSize);

  let merged = [...laptops, ...extraLaptops];

  // If merged list is still under 20, inject dummy laptops to pad to 20
  if (merged.length < 20) {
    const dummyList = getDummyLaptops();
    for (const dummy of dummyList) {
      if (merged.length >= 20) break;
      if (!merged.some(l => l.model === dummy.model || l.title === dummy.title)) {
        merged.push(dummy);
      }
    }
  }

  return merged;
};

const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

module.exports = {
  runFallbackFetch,
  filterLaptopsInMemory,
  padLaptopsToAtLeast20,
  getDummyLaptops
};
