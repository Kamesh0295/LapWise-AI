/**
 * Verified Stores Registry Configuration for LapWise AI
 * Maps approved retailer and manufacturer domains to ensure security and trust.
 */
const VERIFIED_STORES = {
  amazon: {
    name: 'Amazon India',
    category: 'retailer',
    domains: ['amazon.in', 'www.amazon.in'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    verified: true,
    country: 'IN',
    priority: 1
  },
  flipkart: {
    name: 'Flipkart',
    category: 'retailer',
    domains: ['flipkart.com', 'www.flipkart.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg',
    verified: true,
    country: 'IN',
    priority: 2
  },
  croma: {
    name: 'Croma',
    category: 'retailer',
    domains: ['croma.com', 'www.croma.com'],
    logo: 'https://res.cloudinary.com/demo/image/upload/v1672531100/croma_logo.png',
    verified: true,
    country: 'IN',
    priority: 3
  },
  relianceDigital: {
    name: 'Reliance Digital',
    category: 'retailer',
    domains: ['reliancedigital.in', 'www.reliancedigital.in'],
    logo: 'https://res.cloudinary.com/demo/image/upload/v1672531100/reliancedigital_logo.png',
    verified: true,
    country: 'IN',
    priority: 4
  },
  vijaySales: {
    name: 'Vijay Sales',
    category: 'retailer',
    domains: ['vijaysales.com', 'www.vijaysales.com'],
    logo: 'https://res.cloudinary.com/demo/image/upload/v1672531100/vijaysales_logo.png',
    verified: true,
    country: 'IN',
    priority: 5
  },
  asus: {
    name: 'ASUS Official Store',
    category: 'manufacturer',
    domains: ['asus.com', 'www.asus.com', 'asus.in', 'www.asus.in', 'estore.asus.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg',
    verified: true,
    country: 'IN',
    priority: 6
  },
  dell: {
    name: 'Dell Official Store',
    category: 'manufacturer',
    domains: ['dell.com', 'www.dell.com', 'dell.co.in', 'www.dell.co.in'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg',
    verified: true,
    country: 'IN',
    priority: 7
  },
  hp: {
    name: 'HP Official Store',
    category: 'manufacturer',
    domains: ['hp.com', 'www.hp.com', 'store.hp.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg',
    verified: true,
    country: 'IN',
    priority: 8
  },
  lenovo: {
    name: 'Lenovo Official Store',
    category: 'manufacturer',
    domains: ['lenovo.com', 'www.lenovo.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg',
    verified: true,
    country: 'IN',
    priority: 9
  },
  acer: {
    name: 'Acer Official Store',
    category: 'manufacturer',
    domains: ['acer.com', 'www.acer.com', 'store.acer.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Acer_Logo.svg',
    verified: true,
    country: 'IN',
    priority: 10
  },
  msi: {
    name: 'MSI Official Store',
    category: 'manufacturer',
    domains: ['msi.com', 'www.msi.com', 'store.msi.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/MSI_Logo.svg',
    verified: true,
    country: 'IN',
    priority: 11
  },
  apple: {
    name: 'Apple Official Store',
    category: 'manufacturer',
    domains: ['apple.com', 'www.apple.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    verified: true,
    country: 'IN',
    priority: 12
  },
  samsung: {
    name: 'Samsung Official Store',
    category: 'manufacturer',
    domains: ['samsung.com', 'www.samsung.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    verified: true,
    country: 'IN',
    priority: 13
  }
};

/**
 * Extracts target destination URL if rawUrl is a SerpAPI / Google tracking redirect
 */
const unpackTrackingUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.includes('google.com') && parsed.searchParams.has('url')) {
      const extracted = parsed.searchParams.get('url');
      if (extracted) return extracted;
    }
  } catch (e) {
    // Ignore URL parse error
  }
  return rawUrl;
};

/**
 * Validates external URL and strictly verifies hostname against approved store list.
 * 
 * @param {string} rawUrl 
 * @param {string} fallbackSourceName
 * @returns {object} { isVerified, storeCategory, storeKey, storeName, domain, sanitizedUrl, logo }
 */
const isVerifiedStore = (rawUrl, fallbackSourceName = '') => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isVerified: false,
      storeCategory: 'marketplace',
      storeKey: 'unknown',
      storeName: fallbackSourceName || 'Marketplace / Other Seller',
      domain: '',
      sanitizedUrl: '#',
      logo: ''
    };
  }

  const unpackedUrl = unpackTrackingUrl(rawUrl.trim());

  // Prevent dangerous script protocols
  if (unpackedUrl.toLowerCase().startsWith('javascript:') || unpackedUrl.toLowerCase().startsWith('data:')) {
    return {
      isVerified: false,
      storeCategory: 'marketplace',
      storeKey: 'blocked',
      storeName: 'Blocked Link',
      domain: '',
      sanitizedUrl: '#',
      logo: ''
    };
  }

  try {
    let urlObj;
    if (!/^https?:\/\//i.test(unpackedUrl)) {
      urlObj = new URL(`https://${unpackedUrl}`);
    } else {
      urlObj = new URL(unpackedUrl);
    }

    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return {
        isVerified: false,
        storeCategory: 'marketplace',
        storeKey: 'invalid',
        storeName: 'Invalid Protocol',
        domain: '',
        sanitizedUrl: '#',
        logo: ''
      };
    }

    // Extract hostname, lowercase, strip www.
    let hostname = urlObj.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }

    const sanitizedUrl = urlObj.href;

    // Strict domain matching against VERIFIED_STORES whitelist
    for (const [key, storeInfo] of Object.entries(VERIFIED_STORES)) {
      const match = storeInfo.domains.some(domain => {
        let cleanDomain = domain.toLowerCase();
        if (cleanDomain.startsWith('www.')) cleanDomain = cleanDomain.substring(4);
        return hostname === cleanDomain || hostname.endsWith(`.${cleanDomain}`);
      });

      if (match) {
        return {
          isVerified: true,
          storeCategory: storeInfo.category, // 'retailer' | 'manufacturer'
          storeKey: key,
          storeName: storeInfo.name,
          domain: hostname,
          sanitizedUrl,
          logo: storeInfo.logo
        };
      }
    }

    // Valid URL but not in verified store whitelist -> Marketplace / Other Seller
    const cleanedSourceName = (fallbackSourceName || hostname)
      .replace(/https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0];

    return {
      isVerified: false,
      storeCategory: 'marketplace',
      storeKey: 'marketplace',
      storeName: cleanedSourceName || 'Marketplace / Other Seller',
      domain: hostname,
      sanitizedUrl,
      logo: ''
    };

  } catch (err) {
    return {
      isVerified: false,
      storeCategory: 'marketplace',
      storeKey: 'invalid',
      storeName: fallbackSourceName || 'Marketplace / Other Seller',
      domain: '',
      sanitizedUrl: '#',
      logo: ''
    };
  }
};

module.exports = {
  VERIFIED_STORES,
  isVerifiedStore,
  verifyStoreDomain: isVerifiedStore
};
