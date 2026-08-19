/**
 * Verified Stores Registry Configuration for LapWise AI
 * Maps approved retailer and manufacturer domains to ensure security and trust.
 */
const VERIFIED_STORES = {
  amazon: {
    name: 'Amazon India',
    domains: ['amazon.in', 'www.amazon.in'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    verified: true,
    country: 'IN',
    priority: 1
  },
  flipkart: {
    name: 'Flipkart',
    domains: ['flipkart.com', 'www.flipkart.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg',
    verified: true,
    country: 'IN',
    priority: 2
  },
  croma: {
    name: 'Croma',
    domains: ['croma.com', 'www.croma.com'],
    logo: 'https://res.cloudinary.com/demo/image/upload/v1672531100/croma_logo.png',
    verified: true,
    country: 'IN',
    priority: 3
  },
  relianceDigital: {
    name: 'Reliance Digital',
    domains: ['reliancedigital.in', 'www.reliancedigital.in'],
    logo: 'https://res.cloudinary.com/demo/image/upload/v1672531100/reliancedigital_logo.png',
    verified: true,
    country: 'IN',
    priority: 4
  },
  vijaySales: {
    name: 'Vijay Sales',
    domains: ['vijaysales.com', 'www.vijaysales.com'],
    logo: 'https://res.cloudinary.com/demo/image/upload/v1672531100/vijaysales_logo.png',
    verified: true,
    country: 'IN',
    priority: 5
  },
  asus: {
    name: 'ASUS Official Store',
    domains: ['asus.com', 'www.asus.com', 'asus.in', 'www.asus.in', 'estore.asus.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg',
    verified: true,
    country: 'IN',
    priority: 6
  },
  dell: {
    name: 'Dell Official Store',
    domains: ['dell.com', 'www.dell.com', 'dell.co.in', 'www.dell.co.in'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg',
    verified: true,
    country: 'IN',
    priority: 7
  },
  hp: {
    name: 'HP Official Store',
    domains: ['hp.com', 'www.hp.com', 'store.hp.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg',
    verified: true,
    country: 'IN',
    priority: 8
  },
  lenovo: {
    name: 'Lenovo Official Store',
    domains: ['lenovo.com', 'www.lenovo.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg',
    verified: true,
    country: 'IN',
    priority: 9
  },
  acer: {
    name: 'Acer Official Store',
    domains: ['acer.com', 'www.acer.com', 'store.acer.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Acer_Logo.svg',
    verified: true,
    country: 'IN',
    priority: 10
  },
  msi: {
    name: 'MSI Official Store',
    domains: ['msi.com', 'www.msi.com', 'store.msi.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/MSI_Logo.svg',
    verified: true,
    country: 'IN',
    priority: 11
  },
  apple: {
    name: 'Apple Store India',
    domains: ['apple.com', 'www.apple.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    verified: true,
    country: 'IN',
    priority: 12
  },
  samsung: {
    name: 'Samsung Official Store',
    domains: ['samsung.com', 'www.samsung.com'],
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    verified: true,
    country: 'IN',
    priority: 13
  }
};

/**
 * Validates external URL and checks if hostname belongs to a verified store
 * 
 * @param {string} rawUrl 
 * @returns {object} { isValid, hostname, verified, storeKey, storeName, logo, sanitizedUrl }
 */
const verifyStoreDomain = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      hostname: '',
      verified: false,
      storeKey: 'unknown',
      storeName: 'Marketplace / Other Seller',
      logo: '',
      sanitizedUrl: '#'
    };
  }

  const trimmed = rawUrl.trim();

  // Prevent dangerous protocols (e.g. javascript:, data:, file:)
  if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
    return {
      isValid: false,
      hostname: '',
      verified: false,
      storeKey: 'blocked',
      storeName: 'Blocked Malicious Link',
      logo: '',
      sanitizedUrl: '#'
    };
  }

  try {
    let urlObj;
    if (!/^https?:\/\//i.test(trimmed)) {
      urlObj = new URL(`https://${trimmed}`);
    } else {
      urlObj = new URL(trimmed);
    }

    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return {
        isValid: false,
        hostname: '',
        verified: false,
        storeKey: 'invalid',
        storeName: 'Invalid Protocol',
        logo: '',
        sanitizedUrl: '#'
      };
    }

    const hostname = urlObj.hostname.toLowerCase();
    const sanitizedUrl = urlObj.href;

    // Match hostname against verified stores
    for (const [key, storeInfo] of Object.entries(VERIFIED_STORES)) {
      const match = storeInfo.domains.some(domain => 
        hostname === domain || hostname.endsWith(`.${domain}`)
      );
      if (match) {
        return {
          isValid: true,
          hostname,
          verified: true,
          storeKey: key,
          storeName: storeInfo.name,
          logo: storeInfo.logo,
          sanitizedUrl
        };
      }
    }

    // If URL is valid HTTP/HTTPS but not in our verified registry
    return {
      isValid: true,
      hostname,
      verified: false,
      storeKey: 'marketplace',
      storeName: 'Marketplace / Other Seller',
      logo: '',
      sanitizedUrl
    };

  } catch (err) {
    return {
      isValid: false,
      hostname: '',
      verified: false,
      storeKey: 'invalid',
      storeName: 'Invalid URL Format',
      logo: '',
      sanitizedUrl: '#'
    };
  }
};

module.exports = {
  VERIFIED_STORES,
  verifyStoreDomain
};
