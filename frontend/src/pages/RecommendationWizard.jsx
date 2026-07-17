import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdArrowBack, 
  MdArrowForward, 
  MdCheckCircle,
  MdLaptop,
  MdCode,
  MdGamepad,
  MdLocalMovies,
  MdAttachMoney,
  MdDomain,
  MdPhonelinkRing,
  MdBatteryChargingFull,
  MdKeyboard,
  MdAspectRatio,
  MdHd
} from 'react-icons/md';

const RecommendationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [purposes, setPurposes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(80000);
  const [preferredBrands, setPreferredBrands] = useState([]);
  const [answers, setAnswers] = useState({
    portabilityCritical: false,
    batteryIsCritical: false,
    keyboardIsCritical: false,
    displayIsCritical: false,
  });

  const navigate = useNavigate();

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleToggleAnswer = (key) => {
    setAnswers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePurposeSelect = (id) => {
    setPurposes(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleBrandSelect = (id) => {
    if (id === '') {
      setPreferredBrands([]);
      return;
    }
    setPreferredBrands(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSubmit = () => {
    // Navigate and pass state parameters to results page (comma-separated lists of purposes & brands)
    navigate('/results', {
      state: {
        purpose: purposes.join(','),
        maxPrice,
        preferredBrand: preferredBrands.join(','),
        answers
      }
    });
  };

  // Check if current step is valid to allow moving forward
  const isStepValid = () => {
    if (currentStep === 1 && purposes.length === 0) return false;
    return true;
  };

  const progressPercentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  // Animation variants
  const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-darkBg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white dark:bg-darkCard border border-gray-200/50 dark:border-darkBorder rounded-3xl shadow-xl overflow-hidden p-8 sm:p-10 relative">
        
        {/* Top Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Back and Step Indicator row */}
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-6">
          {currentStep > 1 ? (
            <button 
              onClick={handleBack} 
              className="flex items-center gap-1 hover:text-primary-500 font-semibold transition-colors"
            >
              <MdArrowBack />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}
          <span className="font-bold">Step {currentStep} of {totalSteps}</span>
        </div>

        {/* Animated Form steps container */}
        <div className="min-h-[300px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {/* Step 1: Laptop Purpose */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center sm:text-left">
                    <h2 className="font-outfit text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                      <MdLaptop className="text-primary-500" />
                      <span>Primary Usage</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">What will you use your laptop for? Select up to 2 options.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: 'Gaming', label: 'Gaming', desc: 'Playing graphics-heavy games', icon: <MdGamepad size={20} /> },
                      { id: 'Programming', label: 'Programming & Dev', desc: 'Software compilation & databases', icon: <MdCode size={20} /> },
                      { id: 'Entertainment', label: 'Entertainment', desc: 'Streaming movies & media design', icon: <MdLocalMovies size={20} /> },
                      { id: 'General', label: 'General Office Use', desc: 'Emails, documents & casual browsing', icon: <MdLaptop size={20} /> },
                    ].map(option => {
                      const isSelected = purposes.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => handlePurposeSelect(option.id)}
                          className={`flex items-start gap-4 p-4 text-left rounded-2xl border transition-all ${
                            isSelected 
                              ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10 ring-1 ring-primary-500' 
                              : 'border-gray-200 dark:border-darkBorder hover:border-gray-300 dark:hover:border-gray-700'
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            {option.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{option.label}</h4>
                            <p className="text-[10px] text-gray-400 mt-1">{option.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Budget Slider */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center sm:text-left">
                    <h2 className="font-outfit text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                      <MdAttachMoney className="text-primary-500" />
                      <span>Specify Budget</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">What is the maximum amount you are willing to spend?</p>
                  </div>
                  <div className="space-y-6 pt-4">
                    <div className="text-center">
                      <span className="font-outfit text-4xl font-extrabold text-primary-500">
                        ₹{maxPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="30000" 
                      max="250000" 
                      step="5000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 font-medium">
                      <span>₹30,000</span>
                      <span>₹1,40,000</span>
                      <span>₹2,50,000+</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Preferred Brand */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center sm:text-left">
                    <h2 className="font-outfit text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                      <MdDomain className="text-primary-500" />
                      <span>Preferred Brand</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Is there a specific brand you lean towards? Select up to 3 options.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: '', name: 'No Preference' },
                      { id: 'Apple', name: 'Apple MacBook' },
                      { id: 'ASUS', name: 'ASUS ROG/Zenbook' },
                      { id: 'HP', name: 'HP Pavilion/Envy' },
                      { id: 'Lenovo', name: 'Lenovo Legion/IdeaPad' },
                      { id: 'Dell', name: 'Dell Inspiron/XPS' },
                    ].map(brand => {
                      const isSelected = brand.id === '' 
                        ? preferredBrands.length === 0 
                        : preferredBrands.includes(brand.id);
                      return (
                        <button
                          key={brand.id}
                          onClick={() => handleBrandSelect(brand.id)}
                          className={`p-4 rounded-xl border text-sm font-semibold transition-all text-center ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10 text-primary-500'
                              : 'border-gray-200 dark:border-darkBorder hover:border-gray-300 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {brand.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Portability & Weight */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center sm:text-left">
                    <h2 className="font-outfit text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                      <MdPhonelinkRing className="text-primary-500" />
                      <span>Portability</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Do you travel a lot with your laptop? (Weight constraints)</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { key: 'portabilityCritical', label: 'Yes, weight is highly critical', desc: 'Recommend lightweight laptops (under 1.5kg)' },
                      { key: 'portabilityStandard', label: 'No, portability is secondary', desc: 'Heavier machines with larger screens are fine' }
                    ].map(opt => {
                      const isSelected = opt.key === 'portabilityCritical' ? answers.portabilityCritical : !answers.portabilityCritical;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => setAnswers(prev => ({ ...prev, portabilityCritical: opt.key === 'portabilityCritical' }))}
                          className={`w-full flex items-start gap-4 p-4 text-left rounded-2xl border transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10'
                              : 'border-gray-200 dark:border-darkBorder hover:border-gray-300 dark:hover:border-gray-700'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isSelected ? <MdCheckCircle className="text-primary-500" size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-darkBorder" />}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">{opt.label}</span>
                            <p className="text-[10px] text-gray-400 mt-1">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Battery Longevity */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center sm:text-left">
                    <h2 className="font-outfit text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                      <MdBatteryChargingFull className="text-primary-500" />
                      <span>Battery Needs</span>
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Do you work long hours away from power outlets?</p>
                  </div>
                  <div className="space-y-4">
                    {[
                      { key: 'batteryCritical', label: 'Yes, battery life is vital', desc: 'Focus on processors with longer battery scores' },
                      { key: 'batteryStandard', label: 'No, I usually work plugged in', desc: 'High-power processors with moderate battery life are fine' }
                    ].map(opt => {
                      const isSelected = opt.key === 'batteryCritical' ? answers.batteryIsCritical : !answers.batteryIsCritical;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => setAnswers(prev => ({ ...prev, batteryIsCritical: opt.key === 'batteryCritical' }))}
                          className={`w-full flex items-start gap-4 p-4 text-left rounded-2xl border transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10'
                              : 'border-gray-200 dark:border-darkBorder hover:border-gray-300 dark:hover:border-gray-700'
                          }`}
                        >
                          <div className="mt-0.5">
                            {isSelected ? <MdCheckCircle className="text-primary-500" size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-darkBorder" />}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">{opt.label}</span>
                            <p className="text-[10px] text-gray-400 mt-1">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 6: Extras Toggle Options */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="text-center sm:text-left">
                    <h2 className="font-outfit text-2xl font-bold text-gray-900 dark:text-white">
                      Extra Features
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Select any additional priorities that matter to you.</p>
                  </div>
                  <div className="space-y-4">
                    <div 
                      onClick={() => handleToggleAnswer('keyboardIsCritical')}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        answers.keyboardIsCritical 
                          ? 'border-primary-500 bg-primary-50/5 dark:bg-primary-950/5 text-primary-500' 
                          : 'border-gray-200 dark:border-darkBorder hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MdKeyboard size={22} className={answers.keyboardIsCritical ? 'text-primary-500' : 'text-gray-400'} />
                        <span className="text-xs font-semibold">Premium tactile keyboard</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={answers.keyboardIsCritical} 
                        onChange={() => {}}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 pointer-events-none"
                      />
                    </div>

                    <div 
                      onClick={() => handleToggleAnswer('displayIsCritical')}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        answers.displayIsCritical 
                          ? 'border-primary-500 bg-primary-50/5 dark:bg-primary-950/5 text-primary-500' 
                          : 'border-gray-200 dark:border-darkBorder hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MdHd size={22} className={answers.displayIsCritical ? 'text-primary-500' : 'text-gray-400'} />
                        <span className="text-xs font-semibold">Color-accurate premium display (OLED/Hi-Res)</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={answers.displayIsCritical} 
                        onChange={() => {}}
                        className="rounded border-gray-300 text-primary-500 focus:ring-primary-500 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls footer */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-5 py-2 text-xs font-bold rounded-lg border border-gray-200 dark:border-darkBorder transition-all ${
                currentStep === 1 
                  ? 'opacity-40 cursor-not-allowed' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`px-6 py-2.5 text-xs font-bold text-white rounded-lg flex items-center gap-2 shadow-md transition-all ${
                !isStepValid()
                  ? 'bg-gray-300 cursor-not-allowed dark:bg-gray-800 text-gray-500'
                  : 'bg-primary-500 hover:bg-primary-600 hover:scale-105 active:scale-95'
              }`}
            >
              <span>{currentStep === totalSteps ? 'Get Recommendations' : 'Continue'}</span>
              <MdArrowForward />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RecommendationWizard;
