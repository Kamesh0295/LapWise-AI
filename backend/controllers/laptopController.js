const Laptop = require('../models/Laptop');
const PriceHistory = require('../models/PriceHistory');
const Wishlist = require('../models/Wishlist');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Review = require('../models/Review');
const uploadService = require('../services/uploadService');
const emailService = require('../services/emailService');
const { NotFoundError, BadRequestError } = require('../utils/AppError');
const { formatResponse } = require('../utils/helpers');

const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

/**
 * Add a new laptop (Admin only)
 */
const addLaptop = async (req, res, next) => {
  try {
    const specScores = JSON.parse(req.body.specScores || '{}');
    const purpose = JSON.parse(req.body.purpose || '[]');
    const ports = JSON.parse(req.body.ports || '[]');
    const features = JSON.parse(req.body.features || '[]');

    const laptopData = {
      ...req.body,
      specScores,
      purpose,
      ports,
      features
    };

    // Handle image uploads
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadService.uploadToCloudinary(file.path, 'laptops');
        imageUrls.push(uploadResult.url);
      }
    }
    laptopData.images = imageUrls;

    const laptop = await Laptop.create(laptopData);

    // Seed initial Price History
    await PriceHistory.create({
      laptop: laptop._id,
      price: laptop.price
    });

    res.status(201).json(formatResponse('Laptop added successfully', laptop));
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing laptop (Admin only)
 */
const updateLaptop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const laptop = await Laptop.findById(id);

    if (!laptop) {
      return next(new NotFoundError('Laptop not found.'));
    }

    const oldPrice = laptop.price;
    const bodyData = { ...req.body };

    // Parse JSON strings if they are sent in form-data
    if (bodyData.specScores && typeof bodyData.specScores === 'string') {
      bodyData.specScores = JSON.parse(bodyData.specScores);
    }
    if (bodyData.purpose && typeof bodyData.purpose === 'string') {
      bodyData.purpose = JSON.parse(bodyData.purpose);
    }
    if (bodyData.ports && typeof bodyData.ports === 'string') {
      bodyData.ports = JSON.parse(bodyData.ports);
    }
    if (bodyData.features && typeof bodyData.features === 'string') {
      bodyData.features = JSON.parse(bodyData.features);
    }

    // Handle new image uploads if provided
    if (req.files && req.files.length > 0) {
      const newUrls = [];
      for (const file of req.files) {
        const uploadResult = await uploadService.uploadToCloudinary(file.path, 'laptops');
        newUrls.push(uploadResult.url);
      }
      // Append new image URLs
      bodyData.images = [...(laptop.images || []), ...newUrls];
    }

    const updatedLaptop = await Laptop.findByIdAndUpdate(id, bodyData, {
      new: true,
      runValidators: true
    });

    // Check if price changed to record PriceHistory and alert users on price drops
    if (bodyData.price && Number(bodyData.price) !== oldPrice) {
      const newPrice = Number(bodyData.price);
      
      // Log price history
      await PriceHistory.create({
        laptop: updatedLaptop._id,
        price: newPrice
      });

      // Price Drop Trigger Alert
      if (newPrice < oldPrice) {
        // Find all users who wishlisted this laptop
        const wishlistsWithLaptop = await Wishlist.find({ laptops: updatedLaptop._id }).populate('user');
        
        for (const wishlist of wishlistsWithLaptop) {
          const user = wishlist.user;
          if (user) {
            // 1. Create a notification
            await Notification.create({
              user: user._id,
              title: `Price Drop Alert: ${updatedLaptop.brand} ${updatedLaptop.model}`,
              message: `The price of ${updatedLaptop.brand} ${updatedLaptop.model} has dropped from ₹${oldPrice.toLocaleString('en-IN')} to ₹${newPrice.toLocaleString('en-IN')}!`,
              type: 'price_drop',
              data: {
                laptopId: updatedLaptop._id,
                oldPrice,
                newPrice
              }
            });

            // 2. Send email notification (async)
            emailService.sendPriceDropEmail(user, updatedLaptop, oldPrice, newPrice)
              .catch(err => console.error(`Error sending price drop email to ${user.email}:`, err.message));
          }
        }
      }
    }

    res.status(200).json(formatResponse('Laptop updated successfully', updatedLaptop));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a laptop (Admin only)
 */
const deleteLaptop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const laptop = await Laptop.findById(id);

    if (!laptop) {
      return next(new NotFoundError('Laptop not found.'));
    }

    // Delete review records associated with this laptop
    await Review.deleteMany({ laptop: id });

    // Delete price histories
    await PriceHistory.deleteMany({ laptop: id });

    // Remove from wishlists
    await Wishlist.updateMany(
      { laptops: id },
      { $pull: { laptops: id } }
    );

    // Delete the laptop document
    await Laptop.findByIdAndDelete(id);

    res.status(200).json(formatResponse('Laptop and all associated records deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get single laptop details (Public)
 * If user is authenticated, add this laptop to their "recentlyViewed" history list
 */
const getLaptop = async (req, res, next) => {
  try {
    const { id } = req.params;
    const laptop = await Laptop.findById(id);

    if (!laptop) {
      return next(new NotFoundError('Laptop not found.'));
    }

    // Add to recently viewed if user is logged in
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        // Remove duplicate if it already exists in history
        user.recentlyViewed = user.recentlyViewed.filter(
          item => item.toString() !== id
        );
        // Prepend and cap at 10 items
        user.recentlyViewed.unshift(id);
        if (user.recentlyViewed.length > 10) {
          user.recentlyViewed.pop();
        }
        await user.save();
      }
    }

    res.status(200).json(formatResponse('Laptop details retrieved', laptop));
  } catch (error) {
    next(error);
  }
};

/**
 * Get all laptops with pagination, search, sorting, and filters (Public)
 */
const getAllLaptops = async (req, res, next) => {
  try {
    // 1. Filtering
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludeFields.forEach(el => delete queryObj[el]);

    const filterQuery = {};

    // Brands multi-select filter (comma-separated, e.g. brand=Dell,HP)
    if (req.query.brand) {
      const brands = req.query.brand.split(',');
      filterQuery.brand = { $in: brands.map(b => new RegExp(`^${b.trim()}$`, 'i')) };
    }

    // Price Range Filter
    if (req.query.minPrice || req.query.maxPrice) {
      filterQuery.price = {};
      if (req.query.minPrice) filterQuery.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filterQuery.price.$lte = Number(req.query.maxPrice);
    }

    // Purpose Filter (e.g. purpose=Gaming,Student)
    if (req.query.purpose) {
      const purposes = req.query.purpose.split(',').map(p => p.trim());
      filterQuery.purpose = { $in: purposes };
    }

    // Launch Year Filter (e.g. launchYear=2023,2024)
    if (req.query.launchYear) {
      const years = req.query.launchYear.split(',').map(Number);
      filterQuery.launchYear = { $in: years };
    }

    // Storage Filter (e.g. storage=512GB,1TB)
    if (req.query.storage) {
      const storageOptions = req.query.storage.split(',');
      filterQuery.storage = { $in: storageOptions.map(s => new RegExp(s.trim(), 'i')) };
    }

    // RAM Filter (e.g. ram=8,16)
    if (req.query.ram) {
      const ramValues = req.query.ram.split(',').map(Number);
      filterQuery.ram = { $in: ramValues };
    }

    // Text Search query
    if (req.query.search) {
      filterQuery.$text = { $search: req.query.search };
    }

    // General field filters (e.g. processor, operatingSystem)
    const stringFilters = ['processor', 'gpu', 'operatingSystem'];
    stringFilters.forEach(field => {
      if (req.query[field]) {
        filterQuery[field] = { $regex: req.query[field], $options: 'i' };
      }
    });

    let query = Laptop.find(filterQuery);

    // 2. Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort;
      switch (sortBy) {
        case 'price_asc':
          query = query.sort('price');
          break;
        case 'price_desc':
          query = query.sort('-price');
          break;
        case 'rating_desc':
          query = query.sort('-rating');
          break;
        case 'newest':
          query = query.sort('-createdAt');
          break;
        default:
          query = query.sort('-createdAt'); // Default sort by date added
      }
    } else {
      query = query.sort('-createdAt');
    }

    // 3. Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Run query
    const laptops = await query;

    // Get total count for page calculations
    const totalCount = await Laptop.countDocuments(filterQuery);

    res.status(200).json(
      formatResponse('Laptops fetched successfully', {
        laptops,
        pagination: {
          totalItems: totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          itemsPerPage: limit
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Fetch laptops from SerpAPI Google Shopping API
 */
const fetchLaptopsFromSerpAPI = async (searchQuery) => {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    console.warn("SERPAPI_API_KEY is not defined in env!");
    return [];
  }
  try {
    const url = `https://serpapi.com/search.json?engine=google_shopping&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&gl=in&hl=en`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.shopping_results || [];
  } catch (error) {
    console.error(`Error calling SerpAPI for query "${searchQuery}":`, error.message);
    return [];
  }
};

/**
 * Helper: Parse SerpAPI Shopping result to Mongoose Laptop schema structure
 */
const parseSerpProductToLaptop = (product) => {
  const title = product.title || '';
  const price = product.extracted_price || parseFloat((product.price || '0').replace(/[^0-9.]/g, '')) || 0;
  
  // Extract brand from title
  const brands = ['ASUS', 'HP', 'Dell', 'Lenovo', 'Apple', 'MSI', 'Acer', 'Samsung', 'Honor', 'Microsoft', 'Gigabyte', 'LG'];
  let brand = 'Other';
  for (const b of brands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(title)) {
      brand = b;
      break;
    }
  }

  // Model name: title without brand
  let model = title.replace(new RegExp(`\\b${brand}\\b`, 'i'), '').trim();
  if (!model) model = title;

  // Extract specs from title
  let ram = 16;
  const ramMatch = title.match(/\b(4|8|12|16|32|64)\s*GB\b/i);
  if (ramMatch) {
    ram = parseInt(ramMatch[1], 10);
  }

  let storage = '512GB SSD';
  const storageMatch = title.match(/\b(128|256|512|1|2)\s*(GB|TB)\s*(SSD|HDD|EMMC)?\b/i);
  if (storageMatch) {
    storage = storageMatch[0];
  }

  let processor = 'Intel Core i5';
  if (/ryzen\s*7/i.test(title)) processor = 'AMD Ryzen 7';
  else if (/ryzen\s*5/i.test(title)) processor = 'AMD Ryzen 5';
  else if (/ryzen\s*9/i.test(title)) processor = 'AMD Ryzen 9';
  else if (/ryzen\s*3/i.test(title)) processor = 'AMD Ryzen 3';
  else if (/core\s*i7/i.test(title)) processor = 'Intel Core i7';
  else if (/core\s*i9/i.test(title)) processor = 'Intel Core i9';
  else if (/core\s*i3/i.test(title)) processor = 'Intel Core i3';
  else if (/core\s*ultra/i.test(title)) processor = 'Intel Core Ultra';
  else if (/\bm1\b/i.test(title)) processor = 'Apple M1';
  else if (/\bm2\b/i.test(title)) processor = 'Apple M2';
  else if (/\bm3\b/i.test(title)) processor = 'Apple M3';

  let gpu = 'Integrated Intel Iris Xe Graphics';
  if (/rtx\s*4060/i.test(title)) gpu = 'NVIDIA GeForce RTX 4060';
  else if (/rtx\s*4050/i.test(title)) gpu = 'NVIDIA GeForce RTX 4050';
  else if (/rtx\s*4070/i.test(title)) gpu = 'NVIDIA GeForce RTX 4070';
  else if (/rtx\s*3050/i.test(title)) gpu = 'NVIDIA GeForce RTX 3050';
  else if (/rtx\s*4080/i.test(title)) gpu = 'NVIDIA GeForce RTX 4080';
  else if (/rtx\s*4090/i.test(title)) gpu = 'NVIDIA GeForce RTX 4090';
  else if (/gtx\s*1650/i.test(title)) gpu = 'NVIDIA GeForce GTX 1650';
  else if (/radeon/i.test(title)) gpu = 'AMD Radeon Graphics';
  else if (brand === 'Apple') gpu = 'Apple Integrated GPU';

  let screenSize = 15.6;
  const sizeMatch = title.match(/\b(13|14|15|16|17)(\.\d)?\s*(inch|")\b/i);
  if (sizeMatch) {
    screenSize = parseFloat(sizeMatch[1] + (sizeMatch[2] || ''));
  }
  let display = `${screenSize}-inch Display`;
  if (/oled/i.test(title)) display += ' OLED';
  else if (/ips/i.test(title)) display += ' IPS';

  let refreshRate = 60;
  const hzMatch = title.match(/\b(120|144|165|240|360)\s*Hz\b/i);
  if (hzMatch) {
    refreshRate = parseInt(hzMatch[1], 10);
  }

  let operatingSystem = 'Windows 11 Home';
  if (brand === 'Apple') operatingSystem = 'macOS';

  const purposeSet = new Set(['General']);
  if (/gaming/i.test(title) || /rtx/i.test(gpu)) {
    purposeSet.add('Gaming');
    purposeSet.add('Entertainment');
  }
  if (ram >= 16 && !purposeSet.has('Gaming')) {
    purposeSet.add('Programming');
    purposeSet.add('Office');
  }
  if (price < 45000) {
    purposeSet.add('Student');
  }
  if (/ai|ml|rtx\s*40/i.test(title)) {
    purposeSet.add('AI / ML');
    purposeSet.add('Programming');
  }
  const purpose = Array.from(purposeSet);

  const rating = product.rating || 4.0;
  const numReviews = product.reviews || 25;

  const isHighEndCPU = /i7|i9|ryzen\s*7|ryzen\s*9|m2|m3/i.test(processor);
  const isHighEndGPU = /rtx\s*40/i.test(gpu);
  
  const specScores = {
    cpu: Math.min(100, 60 + (ram / 32 * 20) + (isHighEndCPU ? 20 : 0)),
    gpu: Math.min(100, 30 + (isHighEndGPU ? 60 : (/rtx/i.test(gpu) ? 40 : 10))),
    cooling: (/gaming/i.test(title) || /rtx/i.test(gpu)) ? 80 : 60,
    ram: Math.min(100, Math.round(ram / 32 * 100)),
    display: refreshRate > 60 ? 85 : 65,
    battery: brand === 'Apple' ? 85 : 60,
    keyboard: 70,
    weight: screenSize < 14.5 ? 85 : 65,
    speakers: 70,
    storage: /ssd/i.test(storage) ? 80 : 50
  };

  const storeLinks = [{
    storeName: product.source || 'Online Store',
    price: price,
    discount: 0,
    availability: 'In Stock',
    buyUrl: product.product_link || 'https://google.com/shopping'
  }];

  return {
    serpProductId: product.product_id,
    brand,
    model,
    price,
    processor,
    gpu,
    ram,
    storage,
    display,
    battery: 'Integrated Battery',
    weight: screenSize < 14.5 ? 1.4 : 1.8,
    screenSize,
    refreshRate,
    operatingSystem,
    purpose,
    rating,
    numReviews,
    images: [product.thumbnail || 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg'],
    description: `Google Shopping fetched ${brand} ${model} laptop featuring ${processor}, ${ram}GB RAM, and ${storage} storage. Offered by ${product.source || 'various retailers'}.`,
    specScores,
    storeLinks,
    launchYear: 2024
  };
};

/**
 * Helper: Upsert parsed shopping items to avoid duplicates
 */
const upsertLaptops = async (shoppingResults) => {
  const savedLaptops = [];
  for (const item of shoppingResults) {
    if (!item.product_id) continue;
    const laptopData = parseSerpProductToLaptop(item);
    
    // Find by serpProductId, update or insert
    const updated = await Laptop.findOneAndUpdate(
      { serpProductId: item.product_id },
      { $set: laptopData },
      { new: true, upsert: true, runValidators: true }
    );
    savedLaptops.push(updated);
  }
  return savedLaptops;
};

/**
 * Controller: Retrieve general catalog laptops. Fetches from SerpAPI if DB is dry.
 */
const getCatalog = async (req, res, next) => {
  try {
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const dbCount = await Laptop.countDocuments();
    
    // Seed from SerpAPI if DB has fewer than 40 items
    if (dbCount < 40) {
      console.log('Seeding database catalog from SerpAPI search queries...');
      const initialQueries = ['Laptop', 'Gaming Laptop', 'Programming Laptop'];
      for (const query of initialQueries) {
        const results = await fetchLaptopsFromSerpAPI(query);
        if (results && results.length > 0) {
          await upsertLaptops(results);
        }
      }
    }

    const laptops = await Laptop.find()
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const totalCount = await Laptop.countDocuments();

    res.status(200).json(
      formatResponse('Catalog retrieved successfully', {
        laptops,
        pagination: {
          totalItems: totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          itemsPerPage: limit
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Search catalog, calls SerpAPI for live query then returns cache
 */
const searchCatalog = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return next(new BadRequestError('Search query parameter q is required'));
    }

    // Call SerpAPI Google Shopping
    const results = await fetchLaptopsFromSerpAPI(q);
    if (results && results.length > 0) {
      await upsertLaptops(results);
    }

    // Retrieve results from DB using fuzzy regex matching
    const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
    const laptops = await Laptop.find({
      $or: [
        { brand: searchRegex },
        { model: searchRegex },
        { processor: searchRegex },
        { gpu: searchRegex },
        { description: searchRegex }
      ]
    }).sort('-createdAt').limit(20);

    res.status(200).json(formatResponse('Search results retrieved', { laptops }));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Filter catalog, supports extensive advanced criteria
 */
const filterCatalog = async (req, res, next) => {
  try {
    const filterQuery = {};

    // 1. Brand
    if (req.query.brand) {
      const brands = req.query.brand.split(',').map(b => escapeRegex(b.trim()));
      filterQuery.brand = { $regex: `^(${brands.join('|')})$`, $options: 'i' };
    }

    // 2. Price
    if (req.query.minPrice || req.query.maxPrice) {
      filterQuery.price = {};
      if (req.query.minPrice) filterQuery.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filterQuery.price.$lte = Number(req.query.maxPrice);
    }

    // 3. RAM
    if (req.query.ram) {
      const ramValues = req.query.ram.split(',').map(Number);
      filterQuery.ram = { $in: ramValues };
    }

    // 4. Storage
    if (req.query.storage) {
      const storageOptions = req.query.storage.split(',').map(s => escapeRegex(s.trim()));
      filterQuery.storage = { $regex: storageOptions.join('|'), $options: 'i' };
    }

    // 5. GPU
    if (req.query.gpu) {
      const gpuOptions = req.query.gpu.split(',').map(g => escapeRegex(g.trim()));
      filterQuery.gpu = { $regex: gpuOptions.join('|'), $options: 'i' };
    }

    // 6. Processor
    if (req.query.processor) {
      const processorOptions = req.query.processor.split(',').map(p => escapeRegex(p.trim()));
      filterQuery.processor = { $regex: processorOptions.join('|'), $options: 'i' };
    }

    // 7. Display
    if (req.query.display) {
      const displayOptions = req.query.display.split(',').map(d => escapeRegex(d.trim()));
      filterQuery.display = { $regex: displayOptions.join('|'), $options: 'i' };
    }

    // 8. Purpose
    if (req.query.purpose) {
      const purposes = req.query.purpose.split(',').map(p => p.trim());
      filterQuery.purpose = { $in: purposes };
    }

    // 9. Refresh Rate
    if (req.query.refreshRate) {
      const rrValues = req.query.refreshRate.split(',').map(Number);
      filterQuery.refreshRate = { $in: rrValues };
    }

    // 10. Battery
    if (req.query.battery) {
      filterQuery.battery = { $regex: escapeRegex(req.query.battery), $options: 'i' };
    }

    // 11. Operating System
    if (req.query.operatingSystem) {
      const osOptions = req.query.operatingSystem.split(',').map(o => escapeRegex(o.trim()));
      filterQuery.operatingSystem = { $regex: osOptions.join('|'), $options: 'i' };
    }

    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const laptops = await Laptop.find(filterQuery)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const totalCount = await Laptop.countDocuments(filterQuery);

    res.status(200).json(
      formatResponse('Filtered catalog retrieved', {
        laptops,
        pagination: {
          totalItems: totalCount,
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          itemsPerPage: limit
        }
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addLaptop,
  updateLaptop,
  deleteLaptop,
  getLaptop,
  getAllLaptops,
  getCatalog,
  searchCatalog,
  filterCatalog
};
