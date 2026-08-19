import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MdPsychology, 
  MdCompareArrows, 
  MdOutlinePriceCheck, 
  MdSpeed, 
  MdKeyboardArrowDown, 
  MdQuestionAnswer,
  MdLock,
  MdArrowForward
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const { isAuthenticated } = useAuth();

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const categories = [
    { name: 'Gaming Laptops', purpose: 'Gaming', icon: '🎮', desc: 'Maximized graphics, high refresh screens & robust thermals.' },
    { name: 'Programming Systems', purpose: 'Programming', icon: '💻', desc: 'Powerful multicore CPUs, high RAM & comfortable decks.' },
    { name: 'Media & Movies', purpose: 'Entertainment', icon: '🎬', desc: 'High-res OLED screens, rich audio, and long battery life.' },
    { name: 'General Everyday Use', purpose: 'General', icon: '🏠', desc: 'Sleek builds, daily productivity specs & great pricing.' },
  ];

  const features = [
    { title: 'Interactive Wizard', desc: 'Answer a few questions about your career, budget, and travel preferences to identify your best fit.', icon: <MdPsychology size={30} /> },
    { title: 'Gemini AI Assistant', desc: 'Describe your requirements in natural language (e.g. "I want a coding machine under 80k") and let AI choose.', icon: <MdSpeed size={30} /> },
    { title: 'Side-by-Side Comparison', desc: 'Add up to 4 models to compare details, highlighting superior specifications automatically.', icon: <MdCompareArrows size={30} /> },
    { title: 'Price Drop Notifications', desc: 'Add configurations to your wishlist to receive live database and email alerts when they drop in price.', icon: <MdOutlinePriceCheck size={30} /> },
  ];

  const faqs = [
    { q: 'How does the recommendation algorithm work?', a: 'Our wizard matching algorithm evaluates laptops against specific weights configured for the task (Gaming, Programming, Entertainment). It checks specs such as GPU capacity (40% weight for Gaming), compile strength (35% CPU weight for Developers), and display resolution before calculating a percentage match score.' },
    { q: 'What is the Gemini AI recommendation endpoint?', a: 'This is a natural language recommendation assistant. By typing a request in plain English, our backend fetches available laptops and uses Google Gemini AI to analyze specifications and budgets, returning recommended options along with structural descriptions.' },
    { q: 'Can I track historical laptop prices?', a: 'Yes! Admin updates automatically append price alterations to the database. If you wishlist a system and its price decreases, you will automatically receive an inline dashboard notification and an email alert.' },
    { q: 'How many laptops can I compare at once?', a: 'You can compare up to 4 laptops concurrently. Our comparison grid highlights superior specifications in green to make your choice quick and easy.' },
  ];

  const testimonials = [
    { name: 'Aarav Sharma', role: 'Full-Stack Developer', quote: 'Finding a laptop with a high compilation speed and a solid typing deck was tough. The programming wizard matched me with a MacBook Air M3, and it is perfect!' },
    { name: 'Riya Patel', role: 'E-Sports Content Creator', quote: 'The gaming recommendation algorithm matched me with the Asus ROG G16. The high refresh rates and RTX 4060 handle everything I throw at it.' }
  ];

  return (
    <div className="relative overflow-hidden bg-gray-50 dark:bg-darkBg transition-colors duration-300">
      
      {/* SaaS Hero Gradient Backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-100px] left-[10%] w-[350px] h-[350px] rounded-full bg-primary-400 blur-[120px]" />
        <div className="absolute top-[-50px] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500 blur-[130px]" />
      </div>

      {/* Guest Lock Banner */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-3 px-4 text-center text-xs font-semibold flex items-center justify-center gap-3 flex-wrap border-b border-blue-800/50 shadow-xs">
          <span className="flex items-center gap-1.5 text-blue-300">
            <MdLock size={15} />
            <span>Guests can explore the Home page. Log in or Register to search laptops, compare prices & get AI recommendations!</span>
          </span>
          <div className="flex items-center gap-2">
            <Link to="/login" className="px-3 py-1 bg-white text-blue-950 font-extrabold rounded-lg hover:bg-blue-50 transition-all text-[11px]">
              Sign In
            </Link>
            <Link to="/register" className="px-3 py-1 bg-[#1E88E5] text-white font-extrabold rounded-lg hover:bg-blue-600 transition-all text-[11px]">
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 text-xs font-bold bg-primary-100 text-primary-800 dark:bg-primary-950/50 dark:text-primary-300 rounded-full mb-6 uppercase tracking-wider">
            Smart Tech Shopping
          </span>
          <h1 className="font-outfit text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight max-w-4xl mx-auto">
            Find the Perfect Laptop <br/>
            <span className="bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
              In Just Minutes
            </span>
          </h1>
          <p className="mt-6 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate choice fatigue. Answer a few questions about your budget and work requirements to match with our database, or ask our integrated Gemini AI assistant directly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
            <Link 
              to="/wizard" 
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 rounded-xl shadow-lg hover:shadow-primary-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Find My Laptop</span>
              <MdArrowForward size={16} />
            </Link>
            <Link 
              to="/search" 
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-darkCard hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-darkBorder rounded-xl shadow-sm transition-all text-center"
            >
              Explore Laptops
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200/50 dark:border-gray-800/40">
        <div className="text-center mb-12">
          <h2 className="font-outfit text-3xl font-extrabold text-gray-900 dark:text-white">Shop by Use Case</h2>
          <p className="text-xs text-gray-500 mt-2">Filter and inspect specs tuned for different careers and lifestyles.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group p-6 bg-white dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder rounded-2xl shadow-sm hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500/50 transition-all cursor-pointer"
            >
              <Link to={`/search?purpose=${cat.purpose}`} className="block">
                <span className="text-4xl block mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{cat.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Overview */}
      <section className="bg-gray-100/50 dark:bg-darkCard/40 py-20 border-t border-b border-gray-200/50 dark:border-gray-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-outfit text-3xl font-extrabold text-gray-900 dark:text-white">Built for Smart Decisions</h2>
            <p className="text-xs text-gray-500 mt-2">Explore the features that make TechMatch the ultimate laptop recommendation system.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((feat) => (
              <div key={feat.title} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary-100 dark:bg-primary-950/60 text-primary-500 rounded-xl">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{feat.title}</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-outfit text-3xl font-extrabold text-gray-900 dark:text-white">Loved by Creators & Developers</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="p-8 bg-white dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder rounded-2xl shadow-sm relative">
              <span className="absolute top-4 right-6 text-6xl text-primary-100 dark:text-gray-800/20 font-serif leading-none">“</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed relative z-10">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div>
                  <h4 className="font-bold text-xs">{t.name}</h4>
                  <span className="text-[10px] text-gray-400">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 pb-24 sm:px-6 lg:px-8 border-t border-gray-200/50 dark:border-gray-800/40 pt-16">
        <div className="text-center mb-12">
          <h2 className="font-outfit text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <MdQuestionAnswer className="text-primary-500" />
            <span>Frequently Asked Questions</span>
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-darkCard border border-gray-200/60 dark:border-darkBorder rounded-2xl overflow-hidden shadow-xs">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left font-bold text-sm text-gray-900 dark:text-white flex items-center justify-between gap-4 focus:outline-none"
              >
                <span>{faq.q}</span>
                <MdKeyboardArrowDown className={`text-primary-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} size={22} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
