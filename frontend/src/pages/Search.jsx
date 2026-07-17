import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  SlidersHorizontal, 
  Heart, 
  Scale, 
  Star, 
  Check, 
  TrendingUp, 
  ShoppingBag,
  Info,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import laptopService from '../services/laptopService';
import searchService from '../services/searchService';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';

// Beautiful inline carousel for empty state picks
const ProductCarousel = ({ title, products, handleWishlistToggle, handleCompareToggle, isWishlisted, isInCompareList }) => {
  if (!products || products.length === 0) return null;
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-2">
        <h3 className="font-outfit font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-500" />
          {title}
        </h3>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        {products.map(laptop => (
          <div 
            key={laptop._id}
            className="flex-shrink-0 w-72 bg-white dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
          >
            <div>
              <div className="aspect-[4/3] w-full bg-gray-50 dark:bg-gray-800/10 rounded-2xl flex items-center justify-center p-3 overflow-hidden relative">
                <img 
                  src={laptop.images?.[0] || 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg'} 
                  alt={laptop.model}
                  className="max-h-full object-contain"
                  loading="lazy"
                />
                <button 
                  onClick={() => handleWishlistToggle(laptop)}
                  className={`absolute top-2.5 right-2.5 p-2 rounded-full bg-white dark:bg-darkCard shadow border transition-colors ${
                    isWishlisted(laptop._id)
                      ? 'text-red-500 border-red-500/10 bg-red-500/15'
                      : 'text-gray-400 border-gray-100 dark:border-darkBorder'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={isWishlisted(laptop._id) ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] px-2 py-0.5 bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 font-bold rounded-full capitalize">{laptop.brand}</span>
                  <div className="flex items-center text-yellow-500 text-[10px] font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-0.5">{laptop.rating || 0}</span>
                  </div>
                </div>
                <h3 className="font-outfit font-bold text-xs mt-2 truncate text-gray-900 dark:text-white" title={`${laptop.brand} ${laptop.model}`}>
                  {laptop.brand} {laptop.model}
                </h3>
                <div className="text-[10px] text-gray-400 truncate mt-1">
                  Store: {laptop.storeLinks?.[0]?.storeName || 'Online Store'}
                </div>
                <span className="font-outfit text-sm font-extrabold text-green-600 block mt-1">₹{laptop.price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/50">
              <a 
                href={laptop.storeLinks?.[0]?.buyUrl || "https://google.com/shopping"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-grow py-1.5 text-center bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1"
              >
                <ShoppingBag className="w-3 h-3" />
                Buy Now
              </a>
              <Link 
                to={`/laptops/${laptop._id}`}
                className="py-1.5 px-3 bg-primary-500 hover:bg-primary-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors text-center"
              >
                Details
              </Link>
              <button 
                onClick={() => handleCompareToggle(laptop)}
                className={`px-2 border rounded-lg transition-colors ${
                  isInCompareList(laptop._id)
                    ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-gray-200 dark:border-darkBorder text-gray-400'
                }`}
                title="Add to compare"
              >
                {isInCompareList(laptop._id) ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl p-5 space-y-4 animate-pulse">
    <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
  </div>
);

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const { isInCompareList, addToCompare, removeFromCompare } = useCompare();

  // Search input state
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [displayedLaptops, setDisplayedLaptops] = useState([]);

  const loaderRef = useRef(null);

  // Sync search input state with searchParams change
  useEffect(() => {
    setSearchInput(searchParams.get('search') || '');
  }, [searchParams]);

  // Autocomplete live suggestion helper
  useEffect(() => {
    if (searchInput.trim().length > 1) {
      searchService.getAutocomplete(searchInput)
        .then(res => setAutocompleteSuggestions(res.data || []))
        .catch(() => setAutocompleteSuggestions([]));
    } else {
      setAutocompleteSuggestions([]);
    }
  }, [searchInput]);

  // Load Popular trending tags
  const { data: popularQueriesRes } = useQuery({
    queryKey: ['popularSearches'],
    queryFn: () => searchService.getPopularSearches()
  });
  const popularQueries = popularQueriesRes?.data || [];

  // Parse filters from search parameters
  const page = parseInt(searchParams.get('page') || '1', 10);
  const brand = searchParams.get('brand') || '';
  const purpose = searchParams.get('purpose') || '';
  const ram = searchParams.get('ram') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sort = searchParams.get('sort') || '';
  const search = searchParams.get('search') || '';
  const launchYear = searchParams.get('launchYear') || '';
  const storage = searchParams.get('storage') || '';
  const gpu = searchParams.get('gpu') || '';
  const processor = searchParams.get('processor') || '';
  const display = searchParams.get('display') || '';
  const refreshRate = searchParams.get('refreshRate') || '';
  const operatingSystem = searchParams.get('operatingSystem') || '';
  const battery = searchParams.get('battery') || '';

  // Main React Query fetch resolver
  const { data: laptopsDataRes, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'laptopsCatalog', page, brand, purpose, ram, minPrice, maxPrice, sort, 
      search, launchYear, storage, gpu, processor, display, refreshRate, operatingSystem, battery
    ],
    queryFn: () => {
      const params = {
        page,
        limit: 12,
        brand,
        purpose,
        ram,
        minPrice,
        maxPrice,
        sort,
        launchYear,
        storage,
        gpu,
        processor,
        display,
        refreshRate,
        operatingSystem,
        battery
      };

      if (search) {
        return laptopService.searchCatalog({ q: search, ...params });
      } else if (
        brand || purpose || ram || minPrice || maxPrice || launchYear || storage || 
        gpu || processor || display || refreshRate || operatingSystem || battery
      ) {
        return laptopService.filterCatalog(params);
      } else {
        // Base Catalog loads 40 laptops initial caching page
        return laptopService.getCatalog({ ...params, limit: 40 });
      }
    }
  });

  const laptops = laptopsDataRes?.data?.laptops || [];
  const pagination = laptopsDataRes?.data?.pagination || { currentPage: 1, totalPages: 1 };

  // Append new laptops on infinite scroll / pagination page updates
  useEffect(() => {
    if (laptops) {
      if (page === 1) {
        setDisplayedLaptops(laptops);
      } else {
        setDisplayedLaptops(prev => {
          const ids = new Set(prev.map(l => l._id));
          const union = laptops.filter(l => !ids.has(l._id));
          return [...prev, ...union];
        });
      }
    }
  }, [laptops, page]);

  // Load recommendations sections if catalogue is empty
  const { data: fallbackLaptopsRes } = useQuery({
    queryKey: ['fallbackLaptops'],
    queryFn: () => laptopService.getCatalog({ page: 1, limit: 80 }),
    enabled: !isLoading && displayedLaptops.length === 0
  });

  const fallbackLaptops = fallbackLaptopsRes?.data?.laptops || [];

  // Categorize for sections inside empty state view
  const sections = {
    trending: fallbackLaptops.filter(l => l.rating >= 4.0).sort((a, b) => b.rating - a.rating).slice(0, 10),
    latest: [...fallbackLaptops].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
    budget: fallbackLaptops.filter(l => l.price < 50000).slice(0, 10),
    gaming: fallbackLaptops.filter(l => l.purpose?.includes('Gaming')).slice(0, 10),
    programming: fallbackLaptops.filter(l => l.purpose?.includes('Programming')).slice(0, 10),
    student: fallbackLaptops.filter(l => l.purpose?.includes('Student')).slice(0, 10),
    business: fallbackLaptops.filter(l => l.purpose?.includes('Office') || l.purpose?.includes('General')).slice(0, 10),
    aiml: fallbackLaptops.filter(l => l.purpose?.includes('AI / ML')).slice(0, 10),
    editorsChoice: fallbackLaptops.filter(l => l.rating >= 4.5).slice(0, 10)
  };

  // Intersection Observer for Automatic Infinite Scroll
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && page < pagination.totalPages) {
        const nextPage = page + 1;
        updateParams({ page: nextPage.toString() }, false);
      }
    }, { threshold: 0.8 });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loaderRef, page, pagination.totalPages]);

  // Update query parameters in URL
  const updateParams = (newParams, resetPage = true) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { 
      ...current, 
      ...newParams, 
      page: resetPage ? '1' : (newParams.page || current.page || '1') 
    };

    // Remove empty parameters
    Object.keys(merged).forEach(key => {
      if (!merged[key]) delete merged[key];
    });

    setSearchParams(merged);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    updateParams({ search: searchInput });
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (val) => {
    setSearchInput(val);
    updateParams({ search: val });
    setShowSuggestions(false);
  };

  const toggleFilterParam = (key, value) => {
    const currentVal = searchParams.get(key) || '';
    const activeValues = currentVal ? currentVal.split(',') : [];
    let updated;
    if (activeValues.includes(value.toString())) {
      updated = activeValues.filter(v => v !== value.toString());
    } else {
      updated = [...activeValues, value.toString()];
    }
    updateParams({ [key]: updated.join(',') });
  };

  const handleWishlistToggle = async (laptop) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/search');
      return;
    }
    try {
      if (isWishlisted(laptop._id)) {
        await removeFromWishlist(laptop._id);
      } else {
        await addToWishlist(laptop);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompareToggle = (laptop) => {
    try {
      if (isInCompareList(laptop._id)) {
        removeFromCompare(laptop._id);
      } else {
        addToCompare(laptop);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      
      {/* 1. Header with Search Inputs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary-500" />
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight">Browse Catalog</h1>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Powered by live Google Shopping SerpAPI search integration & smart caching.
        </p>
        
        <div className="relative max-w-2xl animate-fade-in" onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search laptops (e.g. Asus, RTX 4060, MacBook, OLED, Ryzen 7)..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkCard focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-xs shadow-sm"
              />
              <SearchIcon className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all active:scale-95"
            >
              Search
            </button>
          </form>

          {/* Autocomplete suggestions dropdown */}
          {showSuggestions && autocompleteSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl shadow-xl overflow-hidden z-30 divide-y divide-gray-50 dark:divide-gray-800/50">
              {autocompleteSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/20 text-xs font-semibold flex items-center gap-2"
                >
                  <SearchIcon className="text-gray-400 w-4 h-4" />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular Searches Trending Tags */}
        {popularQueries.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-gray-400 flex items-center gap-0.5">
              <TrendingUp className="text-primary-500 w-4 h-4" />
              <span>Popular searches:</span>
            </span>
            {popularQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(item)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold rounded-full capitalize"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Quick Categories filter buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none text-xs border-b border-gray-100 dark:border-gray-800/60 pt-2">
          {[
            { label: "All Laptops", params: { purpose: "", sort: "", minPrice: "", maxPrice: "", search: "" } },
            { label: "Trending Now", params: { sort: "rating_desc" } },
            { label: "Gaming Beasts", params: { purpose: "Gaming" } },
            { label: "Developer Picks", params: { purpose: "Programming" } },
            { label: "Student Budget", params: { purpose: "Student", maxPrice: "45000" } },
            { label: "AI / ML Workstations", params: { purpose: "AI / ML" } },
            { label: "Premium OLED Displays", params: { display: "OLED" } }
          ].map((cat, idx) => {
            const isActive = Object.entries(cat.params).every(([key, val]) => searchParams.get(key) === val || (!searchParams.get(key) && !val));
            return (
              <button
                key={idx}
                onClick={() => updateParams(cat.params)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all border ${
                  isActive 
                    ? "bg-primary-500 text-white border-primary-500 shadow-sm" 
                    : "bg-white dark:bg-darkCard text-gray-500 dark:text-gray-400 border-gray-200 dark:border-darkBorder hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main content area: Filter Sidebar + Catalog grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Advanced Specification Filters */}
        <aside className="space-y-6 lg:border-r border-gray-200/50 dark:border-gray-800/40 lg:pr-6 h-fit bg-gray-50/50 dark:bg-darkCard/20 p-4 lg:p-0 rounded-2xl">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <SlidersHorizontal className="text-primary-500 w-4.5 h-4.5" />
            <h3 className="font-outfit font-bold text-sm">Specification Filters</h3>
          </div>

          <div className="space-y-4">
            {/* 1. Purpose Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Use Case / Purpose</label>
              <select
                value={purpose}
                onChange={(e) => updateParams({ purpose: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkCard focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">All Use Cases</option>
                <option value="Gaming">Gaming</option>
                <option value="Programming">Programming</option>
                <option value="Student">Student</option>
                <option value="Office">Office / Business</option>
                <option value="AI / ML">AI / ML</option>
                <option value="Entertainment">Entertainment</option>
                <option value="General">General</option>
              </select>
            </div>

            {/* 2. Sorting options */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Sort Order</label>
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="w-full p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkCard focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Default (Newest)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating_desc">Average Rating</option>
              </select>
            </div>

            {/* 3. Budget Range */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Budget Range (₹)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParams({ minPrice: e.target.value })}
                  className="w-full p-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkCard focus:outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParams({ maxPrice: e.target.value })}
                  className="w-full p-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkCard focus:outline-none"
                />
              </div>
            </div>

            {/* Collapsible details for specs */}
            <div className="space-y-3 pt-2">
              {/* Brand multi-select */}
              <details className="group space-y-2 border-b border-gray-100 dark:border-gray-800/60 pb-3" open>
                <summary className="flex justify-between items-center cursor-pointer list-none font-outfit font-bold text-xs text-gray-700 dark:text-gray-200">
                  <span>Brands</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-gray-400" />
                </summary>
                <div className="pt-2 space-y-1.5 text-xs">
                  {['ASUS', 'HP', 'Dell', 'Lenovo', 'Apple', 'MSI', 'Acer', 'Samsung', 'Honor'].map(b => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brand.split(',').includes(b)}
                        onChange={() => toggleFilterParam('brand', b)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{b}</span>
                    </label>
                  ))}
                </div>
              </details>

              {/* Processor choices */}
              <details className="group space-y-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                <summary className="flex justify-between items-center cursor-pointer list-none font-outfit font-bold text-xs text-gray-700 dark:text-gray-200">
                  <span>Processor Type</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-gray-400" />
                </summary>
                <div className="pt-2 space-y-1.5 text-xs">
                  {['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Intel Core Ultra', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M1', 'Apple M2', 'Apple M3'].map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={processor.split(',').includes(p)}
                        onChange={() => toggleFilterParam('processor', p)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{p}</span>
                    </label>
                  ))}
                </div>
              </details>

              {/* RAM choices */}
              <details className="group space-y-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                <summary className="flex justify-between items-center cursor-pointer list-none font-outfit font-bold text-xs text-gray-700 dark:text-gray-200">
                  <span>RAM Memory</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-gray-400" />
                </summary>
                <div className="pt-2 space-y-1.5 text-xs">
                  {[4, 8, 12, 16, 32, 64].map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ram.split(',').includes(r.toString())}
                        onChange={() => toggleFilterParam('ram', r)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{r} GB</span>
                    </label>
                  ))}
                </div>
              </details>

              {/* Storage options */}
              <details className="group space-y-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                <summary className="flex justify-between items-center cursor-pointer list-none font-outfit font-bold text-xs text-gray-700 dark:text-gray-200">
                  <span>Storage Capacity</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-gray-400" />
                </summary>
                <div className="pt-2 space-y-1.5 text-xs">
                  {['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'].map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={storage.split(',').includes(s)}
                        onChange={() => toggleFilterParam('storage', s)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{s}</span>
                    </label>
                  ))}
                </div>
              </details>

              {/* GPU options */}
              <details className="group space-y-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                <summary className="flex justify-between items-center cursor-pointer list-none font-outfit font-bold text-xs text-gray-700 dark:text-gray-200">
                  <span>Graphics (GPU)</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-gray-400" />
                </summary>
                <div className="pt-2 space-y-1.5 text-xs">
                  {['RTX 4060', 'RTX 4050', 'RTX 3050', 'Radeon', 'Iris Xe'].map(g => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={gpu.split(',').includes(g)}
                        onChange={() => toggleFilterParam('gpu', g)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{g}</span>
                    </label>
                  ))}
                </div>
              </details>

              {/* Display & Screen panel */}
              <details className="group space-y-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                <summary className="flex justify-between items-center cursor-pointer list-none font-outfit font-bold text-xs text-gray-700 dark:text-gray-200">
                  <span>Display Type</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-gray-400" />
                </summary>
                <div className="pt-2 space-y-1.5 text-xs">
                  {['OLED', 'IPS', 'Retina'].map(d => (
                    <label key={d} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={display.split(',').includes(d)}
                        onChange={() => toggleFilterParam('display', d)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{d}</span>
                    </label>
                  ))}
                </div>
              </details>

              {/* Refresh Rate panel */}
              <details className="group space-y-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                <summary className="flex justify-between items-center cursor-pointer list-none font-outfit font-bold text-xs text-gray-700 dark:text-gray-200">
                  <span>Refresh Rate</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-gray-400" />
                </summary>
                <div className="pt-2 space-y-1.5 text-xs">
                  {[60, 120, 144, 165].map(r => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={refreshRate.split(',').includes(r.toString())}
                        onChange={() => toggleFilterParam('refreshRate', r)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{r} Hz</span>
                    </label>
                  ))}
                </div>
              </details>

              {/* Operating System */}
              <details className="group space-y-2 border-b border-gray-100 dark:border-gray-800/60 pb-3">
                <summary className="flex justify-between items-center cursor-pointer list-none font-outfit font-bold text-xs text-gray-700 dark:text-gray-200">
                  <span>Operating System</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-gray-400" />
                </summary>
                <div className="pt-2 space-y-1.5 text-xs">
                  {['Windows', 'macOS', 'ChromeOS'].map(o => (
                    <label key={o} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={operatingSystem.split(',').includes(o)}
                        onChange={() => toggleFilterParam('operatingSystem', o)}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 w-3.5 h-3.5"
                      />
                      <span className="font-semibold text-gray-600 dark:text-gray-300">{o}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {/* Reset Filters button */}
          <button
            onClick={() => setSearchParams({})}
            className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-gray-600 dark:text-gray-300"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All Filters
          </button>
        </aside>

        {/* Right Side: Laptop Catalogue Grid */}
        <div className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16 border border-red-100 bg-red-50/20 dark:bg-red-950/10 dark:border-red-900 rounded-3xl p-6 max-w-md mx-auto space-y-4">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
              <h3 className="font-outfit font-extrabold text-sm text-red-700 dark:text-red-400">Failed to load catalog</h3>
              <p className="text-xs text-red-600 dark:text-red-500">There was an issue fetching laptops from the search service.</p>
              <button 
                onClick={() => refetch()} 
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Retry
              </button>
            </div>
          ) : displayedLaptops.length === 0 ? (
            /* EMPTY STATE VIEW with Recommendations carousels */
            <div className="space-y-12 animate-fade-in">
              <div className="text-center py-12 border border-dashed border-gray-200 dark:border-darkBorder rounded-3xl text-gray-400 space-y-3">
                <Info className="w-8 h-8 mx-auto text-gray-300" />
                <h4 className="font-outfit font-bold text-xs text-gray-600 dark:text-gray-300">No matching laptops found</h4>
                <p className="text-[10px] text-gray-400 max-w-xs mx-auto">Try clearing search parameters or refining specification filters. Meanwhile, check these picks below!</p>
              </div>

              {/* Show Sections dynamically based on fallback query data */}
              <div className="space-y-6 pt-4">
                <ProductCarousel 
                  title="Editor's Choice Laptops" 
                  products={sections.editorsChoice} 
                  handleWishlistToggle={handleWishlistToggle}
                  handleCompareToggle={handleCompareToggle}
                  isWishlisted={isWishlisted}
                  isInCompareList={isInCompareList}
                />
                
                <ProductCarousel 
                  title="Trending Laptops" 
                  products={sections.trending} 
                  handleWishlistToggle={handleWishlistToggle}
                  handleCompareToggle={handleCompareToggle}
                  isWishlisted={isWishlisted}
                  isInCompareList={isInCompareList}
                />

                <ProductCarousel 
                  title="Budget Hot Picks" 
                  products={sections.budget} 
                  handleWishlistToggle={handleWishlistToggle}
                  handleCompareToggle={handleCompareToggle}
                  isWishlisted={isWishlisted}
                  isInCompareList={isInCompareList}
                />

                <ProductCarousel 
                  title="Gaming Workstations" 
                  products={sections.gaming} 
                  handleWishlistToggle={handleWishlistToggle}
                  handleCompareToggle={handleCompareToggle}
                  isWishlisted={isWishlisted}
                  isInCompareList={isInCompareList}
                />

                <ProductCarousel 
                  title="Developer Recommendations" 
                  products={sections.programming} 
                  handleWishlistToggle={handleWishlistToggle}
                  handleCompareToggle={handleCompareToggle}
                  isWishlisted={isWishlisted}
                  isInCompareList={isInCompareList}
                />

                <ProductCarousel 
                  title="Student & Casual Picks" 
                  products={sections.student} 
                  handleWishlistToggle={handleWishlistToggle}
                  handleCompareToggle={handleCompareToggle}
                  isWishlisted={isWishlisted}
                  isInCompareList={isInCompareList}
                />

                <ProductCarousel 
                  title="Business & Office Laptops" 
                  products={sections.business} 
                  handleWishlistToggle={handleWishlistToggle}
                  handleCompareToggle={handleCompareToggle}
                  isWishlisted={isWishlisted}
                  isInCompareList={isInCompareList}
                />

                <ProductCarousel 
                  title="AI / ML Powerhouses" 
                  products={sections.aiml} 
                  handleWishlistToggle={handleWishlistToggle}
                  handleCompareToggle={handleCompareToggle}
                  isWishlisted={isWishlisted}
                  isInCompareList={isInCompareList}
                />

                <ProductCarousel 
                  title="Latest Releases" 
                  products={sections.latest} 
                  handleWishlistToggle={handleWishlistToggle}
                  handleCompareToggle={handleCompareToggle}
                  isWishlisted={isWishlisted}
                  isInCompareList={isInCompareList}
                />
              </div>
            </div>
          ) : (
            /* RESULTS CATALOG GRID */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedLaptops.map(laptop => (
                  <div 
                    key={laptop._id}
                    className="bg-white dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
                  >
                    <div>
                      {/* Product image with lazy load */}
                      <div className="aspect-[4/3] w-full bg-gray-50 dark:bg-gray-800/10 rounded-2xl flex items-center justify-center p-3 overflow-hidden relative">
                        <img 
                          src={laptop.images?.[0] || 'https://res.cloudinary.com/demo/image/upload/v1672531100/sample.jpg'} 
                          alt={laptop.model}
                          className="max-h-full object-contain"
                          loading="lazy"
                        />
                        <button 
                          onClick={() => handleWishlistToggle(laptop)}
                          className={`absolute top-2.5 right-2.5 p-2 rounded-full bg-white dark:bg-darkCard shadow border transition-colors ${
                            isWishlisted(laptop._id)
                              ? 'text-red-500 border-red-500/10 bg-red-500/15'
                              : 'text-gray-400 border-gray-100 dark:border-darkBorder'
                          }`}
                        >
                          <Heart className="w-4 h-4" fill={isWishlisted(laptop._id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] px-2 py-0.5 bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 font-bold rounded-full capitalize">
                            {laptop.brand}
                          </span>
                          <div className="flex items-center text-yellow-500 text-[10px] font-semibold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="ml-0.5">{laptop.rating || 0}</span>
                          </div>
                        </div>

                        <h3 className="font-outfit font-bold text-xs truncate text-gray-900 dark:text-white" title={`${laptop.brand} ${laptop.model}`}>
                          {laptop.brand} {laptop.model}
                        </h3>

                        {/* Store Info */}
                        <div className="text-[10px] text-gray-400 font-medium truncate">
                          Merchant: <span className="text-gray-500 dark:text-gray-300 font-semibold">{laptop.storeLinks?.[0]?.storeName || 'Online Store'}</span>
                        </div>

                        {/* Price */}
                        <span className="font-outfit text-sm font-extrabold text-green-600 block">
                          ₹{laptop.price.toLocaleString('en-IN')}
                        </span>

                        {/* Short spec description */}
                        <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed" title={laptop.description}>
                          {laptop.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/50">
                      {/* Buy Now Button */}
                      <a 
                        href={laptop.storeLinks?.[0]?.buyUrl || "https://google.com/shopping"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-grow py-1.5 text-center bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Buy Now
                      </a>

                      {/* View Details Button */}
                      <Link 
                        to={`/laptops/${laptop._id}`}
                        className="py-1.5 px-3 bg-primary-500 hover:bg-primary-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition-colors text-center flex items-center justify-center"
                      >
                        Details
                      </Link>

                      {/* Compare Button */}
                      <button 
                        onClick={() => handleCompareToggle(laptop)}
                        className={`px-2 border rounded-lg transition-colors flex items-center justify-center ${
                          isInCompareList(laptop._id)
                            ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                            : 'border-gray-200 dark:border-darkBorder text-gray-400'
                        }`}
                        title="Add to compare"
                      >
                        {isInCompareList(laptop._id) ? <Check className="w-4 h-4" /> : <Scale className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Infinite Scroll loading element with manual load fallback */}
              {page < pagination.totalPages && (
                <div ref={loaderRef} className="flex flex-col items-center justify-center pt-8 gap-2">
                  <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <button
                    onClick={() => updateParams({ page: (page + 1).toString() }, false)}
                    className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Load More Laptops
                  </button>
                </div>
              )}

              {/* Standard Page numbers helper information */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800 text-xs">
                  <span className="text-gray-400 font-medium">Displayed {displayedLaptops.length} items of {pagination.totalItems || displayedLaptops.length}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateParams({ page: (page - 1).toString() }, false)}
                      disabled={page === 1}
                      className="px-3 py-1.5 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 font-bold rounded-lg text-primary-500">Page {page} of {pagination.totalPages}</span>
                    <button
                      onClick={() => updateParams({ page: (page + 1).toString() }, false)}
                      disabled={page === pagination.totalPages}
                      className="px-3 py-1.5 border rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>

    </div>
  );
};

export default Search;
