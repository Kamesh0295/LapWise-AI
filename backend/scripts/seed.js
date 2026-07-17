require('dotenv').config();
const mongoose = require('mongoose');
const Laptop = require('../models/Laptop');
const connectDB = require('../config/db');

const sampleLaptops = [
  {
    brand: "ASUS",
    series: "ROG Strix",
    model: "ROG Strix G16",
    launchYear: 2023,
    brightness: 350,
    warranty: "2 Years ASUS Global Warranty",
    price: 114990,
    processor: "Intel Core i7-13650HX",
    gpu: "NVIDIA GeForce RTX 4060 8GB",
    ram: 16,
    storage: "1TB NVMe SSD",
    display: "16-inch WUXGA 165Hz IPS",
    battery: "90Wh Battery",
    weight: 2.5,
    screenSize: 16,
    refreshRate: 165,
    operatingSystem: "Windows 11 Home",
    ports: ["1x Thunderbolt 4", "1x USB 3.2 Gen 2 Type-C", "2x USB 3.2 Gen 1 Type-A", "1x HDMI 2.1", "1x RJ45 LAN"],
    features: ["ROG Intelligent Cooling", "MUX Switch", "Aura Sync RGB Keyboard"],
    purpose: ["Gaming", "Programming", "AI / ML"],
    description: "High-performance gaming laptop with 13th Gen Intel Core processor, RTX 4060 graphics, and advanced cooling system suitable for hardcore gaming, heavy compilation, and machine learning models.",
    specScores: {
      cpu: 90,
      gpu: 88,
      cooling: 92,
      ram: 85,
      display: 80,
      battery: 60,
      keyboard: 82,
      weight: 40,
      speakers: 75,
      storage: 85
    },
    storeLinks: [
      {
        storeName: "Amazon",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
        price: 114990,
        discount: 10,
        availability: "In Stock",
        buyUrl: "https://www.amazon.in"
      },
      {
        storeName: "Flipkart",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Flipkart_logo.svg",
        price: 113500,
        discount: 12,
        availability: "In Stock",
        buyUrl: "https://www.flipkart.com"
      },
      {
        storeName: "ASUS Official",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Asus_Logo.svg",
        price: 116000,
        discount: 5,
        availability: "In Stock",
        buyUrl: "https://www.asus.com"
      }
    ],
    priceHistory: [
      { price: 125000, recordedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
      { price: 119990, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { price: 114990, recordedAt: new Date() }
    ]
  },
  {
    brand: "Apple",
    series: "MacBook Air",
    model: "MacBook Air M3",
    launchYear: 2024,
    brightness: 500,
    warranty: "1 Year Apple Care Warranty",
    price: 114900,
    processor: "Apple M3 Chip (8-core CPU)",
    gpu: "10-core Unified GPU",
    ram: 16,
    storage: "512GB Unified SSD",
    display: "13.6-inch Liquid Retina Display",
    battery: "Up to 18 Hours Battery Life",
    weight: 1.24,
    screenSize: 13.6,
    refreshRate: 60,
    operatingSystem: "macOS Sonoma",
    ports: ["2x Thunderbolt / USB 4 ports", "MagSafe 3 Charging Port", "3.5mm Headphone Jack"],
    features: ["Fanless Silent Design", "True Tone Display", "Touch ID Security"],
    purpose: ["Programming", "Student", "Office", "Entertainment"],
    description: "Thinnest and lightest laptop from Apple powered by M3 chip. Outstanding battery life and complete silence during compile tasks, ideal for developers and students on the go.",
    specScores: {
      cpu: 85,
      gpu: 75,
      cooling: 70,
      ram: 85,
      display: 92,
      battery: 98,
      keyboard: 88,
      weight: 98,
      speakers: 90,
      storage: 80
    },
    storeLinks: [
      {
        storeName: "Apple Store",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
        price: 114900,
        discount: 0,
        availability: "In Stock",
        buyUrl: "https://www.apple.com"
      },
      {
        storeName: "Amazon",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
        price: 112000,
        discount: 3,
        availability: "In Stock",
        buyUrl: "https://www.amazon.in"
      }
    ],
    priceHistory: [
      { price: 114900, recordedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
      { price: 114900, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { price: 114900, recordedAt: new Date() }
    ]
  },
  {
    brand: "Lenovo",
    series: "Legion Slim",
    model: "Legion Slim 5",
    launchYear: 2023,
    brightness: 300,
    warranty: "1 Year Premium Care Warranty",
    price: 95490,
    processor: "AMD Ryzen 7 7840HS",
    gpu: "NVIDIA GeForce RTX 4050 6GB",
    ram: 16,
    storage: "512GB PCIe Gen 4 SSD",
    display: "16-inch WQXGA 144Hz IPS",
    battery: "80Wh Battery",
    weight: 2.4,
    screenSize: 16,
    refreshRate: 144,
    operatingSystem: "Windows 11 Home",
    ports: ["2x USB-C 3.2 Gen 2", "2x USB-A 3.2 Gen 2", "1x HDMI 2.1", "1x Card Reader"],
    features: ["Legion ColdFront 5.0", "Lenovo AI Engine+", "4-Zone RGB Keyboard"],
    purpose: ["Gaming", "Programming", "Student"],
    description: "Versatile Ryzen-powered gaming notebook providing incredible efficiency, dedicated graphics power, and solid thermal control.",
    specScores: {
      cpu: 88,
      gpu: 78,
      cooling: 85,
      ram: 85,
      display: 82,
      battery: 70,
      keyboard: 85,
      weight: 45,
      speakers: 72,
      storage: 75
    },
    storeLinks: [
      {
        storeName: "Amazon",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
        price: 95490,
        discount: 8,
        availability: "In Stock",
        buyUrl: "https://www.amazon.in"
      },
      {
        storeName: "Lenovo Official",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo.svg",
        price: 97990,
        discount: 5,
        availability: "In Stock",
        buyUrl: "https://www.lenovo.com"
      }
    ],
    priceHistory: [
      { price: 99990, recordedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
      { price: 96990, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { price: 95490, recordedAt: new Date() }
    ]
  },
  {
    brand: "HP",
    series: "Pavilion Plus",
    model: "Pavilion Plus 14",
    launchYear: 2024,
    brightness: 400,
    warranty: "1 Year HP Onsite Warranty",
    price: 76990,
    processor: "Intel Core i5-1340P",
    gpu: "Intel Iris Xe Graphics",
    ram: 16,
    storage: "1TB PCIe NVMe SSD",
    display: "14-inch 2.8K OLED 90Hz Display",
    battery: "51Wh Battery",
    weight: 1.4,
    screenSize: 14,
    refreshRate: 90,
    operatingSystem: "Windows 11 Home",
    ports: ["2x USB-C", "2x USB-A", "1x HDMI 2.1", "Headphone Jack"],
    features: ["OLED Display Panel", "Flicker-free", "HP Wide Vision 5MP Camera"],
    purpose: ["Entertainment", "Office", "Programming", "Student"],
    description: "Ultra-crisp OLED laptop matching premium media viewing and basic coding project creation, offering robust processing speeds in a sleek metal build.",
    specScores: {
      cpu: 75,
      gpu: 50,
      cooling: 72,
      ram: 85,
      display: 96,
      battery: 72,
      keyboard: 80,
      weight: 88,
      speakers: 85,
      storage: 90
    },
    storeLinks: [
      {
        storeName: "HP Official",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
        price: 76990,
        discount: 10,
        availability: "In Stock",
        buyUrl: "https://www.hp.com"
      },
      {
        storeName: "Reliance Digital",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Reliance_Digital_logo.png",
        price: 75990,
        discount: 11,
        availability: "In Stock",
        buyUrl: "https://www.reliancedigital.in"
      }
    ],
    priceHistory: [
      { price: 79990, recordedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
      { price: 78500, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { price: 76990, recordedAt: new Date() }
    ]
  },
  {
    brand: "Dell",
    series: "Inspiron",
    model: "Inspiron 15 3520",
    launchYear: 2023,
    brightness: 250,
    warranty: "1 Year Dell Premium Support",
    price: 42990,
    processor: "Intel Core i3-1215U",
    gpu: "Intel UHD Graphics",
    ram: 8,
    storage: "512GB SSD",
    display: "15.6-inch FHD 120Hz",
    battery: "41Wh Battery",
    weight: 1.65,
    screenSize: 15.6,
    refreshRate: 120,
    operatingSystem: "Windows 11 Home",
    ports: ["1x USB 3.2 Gen 1 Type-C", "1x USB 3.2 Gen 1", "1x USB 2.0", "1x HDMI 1.4"],
    features: ["ExpressCharge Support", "Dell ComfortView Display"],
    purpose: ["General", "Student", "Office"],
    description: "Affordable every-day computing system optimized for text processing, web browsing, and simple educational tasks.",
    specScores: {
      cpu: 55,
      gpu: 30,
      cooling: 60,
      ram: 60,
      display: 68,
      battery: 65,
      keyboard: 78,
      weight: 80,
      speakers: 68,
      storage: 70
    },
    storeLinks: [
      {
        storeName: "Amazon",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
        price: 42990,
        discount: 15,
        availability: "In Stock",
        buyUrl: "https://www.amazon.in"
      },
      {
        storeName: "Dell Official",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/82/Dell_Logo.svg",
        price: 43500,
        discount: 14,
        availability: "In Stock",
        buyUrl: "https://www.dell.com"
      }
    ],
    priceHistory: [
      { price: 45000, recordedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
      { price: 43900, recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { price: 42990, recordedAt: new Date() }
    ]
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing laptops...');
    await Laptop.deleteMany();

    console.log(`Seeding ${sampleLaptops.length} upgraded sample laptops...`);
    await Laptop.insertMany(sampleLaptops);

    console.log('Database successfully seeded with e-commerce pricing tables! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
