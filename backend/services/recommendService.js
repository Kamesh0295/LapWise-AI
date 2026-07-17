const Laptop = require('../models/Laptop');

// Standard weight profile specifications from requirements
const WEIGHTS = {
  Gaming: {
    gpu: 0.40,
    cpu: 0.25,
    cooling: 0.15,
    ram: 0.10,
    display: 0.05,
    battery: 0.05,
  },
  Programming: {
    cpu: 0.35,
    ram: 0.25,
    battery: 0.20,
    keyboard: 0.10,
    weight: 0.05,
    display: 0.05,
  },
  Student: {
    battery: 0.30,
    weight: 0.20,
    cpu: 0.20,
    ram: 0.15,
    price: 0.15,
  },
  Office: {
    battery: 0.25,
    weight: 0.25,
    keyboard: 0.20,
    display: 0.15,
    price: 0.15,
  },
  Entertainment: {
    display: 0.40,
    speakers: 0.25,
    battery: 0.15,
    storage: 0.10,
    weight: 0.10,
  },
  'Video Editing': {
    cpu: 0.30,
    gpu: 0.30,
    display: 0.20,
    ram: 0.10,
    storage: 0.10,
  },
  'AI / ML': {
    gpu: 0.45,
    cpu: 0.20,
    ram: 0.20,
    storage: 0.15,
  },
  General: {
    cpu: 0.20,
    ram: 0.15,
    storage: 0.15,
    display: 0.15,
    battery: 0.15,
    weight: 0.10,
    keyboard: 0.10,
  }
};

/**
 * Generate custom recommendations using the wizard algorithm
 * @param {object} params - Recommendation wizard choices
 * @param {string} params.purpose - 'Gaming' | 'Programming' | 'Student' | 'Office' | 'Entertainment' | 'Video Editing' | 'AI / ML' | 'General'
 * @param {number} [params.maxPrice] - Optional maximum price limit
 * @param {string} [params.preferredBrand] - Optional preferred brand
 * @param {object} [params.answers] - Questionnaire answers to refine calculations
 * @returns {Promise<Array>} Ranked laptop list with match percentage & explanation
 */
const getWizardRecommendations = async ({ purpose, maxPrice, preferredBrand, answers = {} }) => {
  // 1. Fetch laptops matching basic criteria
  const query = {};
  if (maxPrice) {
    query.price = { $lte: Number(maxPrice) };
  }
  if (preferredBrand) {
    const brandsList = preferredBrand.split(',').map(b => b.trim()).filter(b => b);
    if (brandsList.length > 0) {
      query.brand = { $in: brandsList.map(b => new RegExp(`^${b}$`, 'i')) };
    }
  }

  const laptops = await Laptop.find(query);
  if (laptops.length === 0) {
    return [];
  }

  // 2. Select baseline weights based on user purpose (support multiple comma-separated or array purposes)
  let activePurposes = [];
  if (Array.isArray(purpose)) {
    activePurposes = purpose;
  } else if (typeof purpose === 'string') {
    activePurposes = purpose.split(',').map(p => p.trim());
  }

  activePurposes = activePurposes.filter(p => WEIGHTS[p]);
  if (activePurposes.length === 0) {
    activePurposes = ['General'];
  }

  // Compute averaged weights across all selected purposes
  let profileWeights = {};
  const allSpecKeys = new Set(
    activePurposes.flatMap(p => Object.keys(WEIGHTS[p]))
  );

  allSpecKeys.forEach(specKey => {
    let totalWeight = 0;
    activePurposes.forEach(p => {
      totalWeight += WEIGHTS[p][specKey] || 0;
    });
    profileWeights[specKey] = totalWeight / activePurposes.length;
  });

  // 3. Optional refinement based on questionnaire answers
  if (answers.portabilityCritical && profileWeights.weight !== undefined) {
    const weightIncrease = 0.15;
    const oldWeight = profileWeights.weight;
    profileWeights.weight = Math.min(0.40, oldWeight + weightIncrease);
    
    const diff = profileWeights.weight - oldWeight;
    const activeKeys = Object.keys(profileWeights).filter(k => k !== 'weight');
    const totalOthers = activeKeys.reduce((sum, k) => sum + profileWeights[k], 0);
    
    if (totalOthers > 0) {
      activeKeys.forEach(k => {
        profileWeights[k] = profileWeights[k] - (diff * (profileWeights[k] / totalOthers));
      });
    }
  }

  if (answers.batteryIsCritical && profileWeights.battery !== undefined) {
    const batteryIncrease = 0.15;
    const oldBattery = profileWeights.battery;
    profileWeights.battery = Math.min(0.40, oldBattery + batteryIncrease);

    const diff = profileWeights.battery - oldBattery;
    const activeKeys = Object.keys(profileWeights).filter(k => k !== 'battery');
    const totalOthers = activeKeys.reduce((sum, k) => sum + profileWeights[k], 0);

    if (totalOthers > 0) {
      activeKeys.forEach(k => {
        profileWeights[k] = profileWeights[k] - (diff * (profileWeights[k] / totalOthers));
      });
    }
  }

  // 4. Calculate matching scores
  const results = laptops.map(laptop => {
    const scores = laptop.specScores;
    let matchScore = 0;

    // Sum weighted scores
    Object.entries(profileWeights).forEach(([specKey, weight]) => {
      let laptopSpecScore;
      if (specKey === 'price') {
        // Lower price = higher compatibility score. Scale relative to budget
        const maxBudget = maxPrice || 150000;
        laptopSpecScore = laptop.price <= 40000 
          ? 100 
          : Math.max(20, Math.round((1 - (laptop.price / maxBudget)) * 100));
      } else {
        laptopSpecScore = scores[specKey] || 50; // Fallback to 50 if score is not set
      }
      matchScore += laptopSpecScore * weight;
    });

    const matchPercentage = Math.round(matchScore);

    // 5. Generate tailored description explanation
    let explanationParts = [];
    if (activePurposes.includes('Gaming')) {
      explanationParts.push(`high graphics capabilities (GPU rating: ${scores.gpu}/100) for gaming`);
    }
    if (activePurposes.includes('Programming')) {
      explanationParts.push(`excellent compile power (CPU rating: ${scores.cpu}/100) for development`);
    }
    if (activePurposes.includes('Student')) {
      explanationParts.push(`long battery life (Battery rating: ${scores.battery}/100) and lightweight build (Weight rating: ${scores.weight}/100) for students`);
    }
    if (activePurposes.includes('Office')) {
      explanationParts.push(`reliable productivity (Keyboard: ${scores.keyboard}/100, Battery: ${scores.battery}/100) for office workflows`);
    }
    if (activePurposes.includes('Entertainment')) {
      explanationParts.push(`crisp display panels (Display rating: ${scores.display}/100) and premium sound output (Speakers rating: ${scores.speakers}/100) for entertainment`);
    }
    if (activePurposes.includes('Video Editing')) {
      explanationParts.push(`high CPU compiling (${scores.cpu}/100) and GPU rendering (${scores.gpu}/100) for heavy video editing`);
    }
    if (activePurposes.includes('AI / ML')) {
      explanationParts.push(`outstanding CUDA GPU processing (${scores.gpu}/100) and deep learning RAM memory (${scores.ram}/100) for AI/ML workflows`);
    }
    if (activePurposes.includes('General')) {
      explanationParts.push(`balanced everyday productivity specs`);
    }

    if (scores.battery > 80) {
      explanationParts.push('exceptional battery longevity');
    }
    if (scores.weight > 85) {
      explanationParts.push('extremely lightweight chassis for portability');
    }

    const explanation = `This laptop matches your needs at ${matchPercentage}%: ` + explanationParts.join(', and ') + '.';

    // Pros & Cons lists (Advantages / Disadvantages / Best For)
    const advantages = [];
    const disadvantages = [];
    
    if (scores.cpu >= 80) advantages.push('High-performance multi-threaded CPU');
    else if (scores.cpu < 50) disadvantages.push('Entry-level processor compile rates');

    if (scores.gpu >= 80) advantages.push('Dedicated gaming-grade graphics processor');
    else if (scores.gpu < 45) disadvantages.push('Integrated graphics limiting game rendering');

    if (scores.battery >= 80) advantages.push('All-day battery longevity charge life');
    else disadvantages.push('Shorter runtime under load');

    if (scores.weight >= 80) advantages.push('Extremely light, highly portable chassis');
    else disadvantages.push('Bulkier weight');

    if (scores.cooling >= 80) advantages.push('Excellent thermal performance cooling vents');
    else disadvantages.push('Prone to thermal throttling under stress');

    const bestFor = activePurposes.map(p => {
      if (p === 'Gaming') return 'Graphics-heavy gaming & streaming';
      if (p === 'Programming') return 'Software engineering & local hosting';
      if (p === 'Student') return 'Daily classes, notes & multitasking';
      if (p === 'Office') return 'Word processing, sheets & business meetings';
      if (p === 'Entertainment') return '4K media playback & high fidelity audio';
      if (p === 'Video Editing') return 'Adobe Suite, DaVinci Resolve rendering';
      if (p === 'AI / ML') return 'Neural network training & local models';
      return 'Everyday multitasking workloads';
    }).join(', ');

    return {
      laptop,
      matchPercentage,
      explanation,
      advantages: advantages.slice(0, 3),
      disadvantages: disadvantages.slice(0, 2),
      bestFor
    };
  });

  // 6. Sort by match percentage descending and return top 10
  return results
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 10);
};

module.exports = {
  getWizardRecommendations
};
