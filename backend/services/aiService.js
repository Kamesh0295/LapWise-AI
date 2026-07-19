const { GoogleGenerativeAI } = require('@google/generative-ai');
const Laptop = require('../models/Laptop');

/**
 * Normalizes user search query to parse basic search constraints
 */
const extractSearchConstraints = (userQuery) => {
  const queryLower = userQuery.toLowerCase();
  const filter = {};

  // 1. Extract brand
  const brands = ['asus', 'hp', 'dell', 'lenovo', 'apple', 'msi', 'acer', 'samsung', 'lg', 'honor', 'huawei'];
  const matchedBrands = [];
  for (const b of brands) {
    if (queryLower.includes(b)) {
      matchedBrands.push(new RegExp(`^${b}$`, 'i'));
    }
  }
  if (matchedBrands.length > 0) {
    filter.brand = { $in: matchedBrands };
  }

  // 2. Extract budget limits (e.g. under 80000, below 50k, 1 lakh)
  // Match "under X", "below X", "budget X", "under Xk", "below Xk"
  const kMatch = queryLower.match(/(?:under|below|budget|max|maximum|around|within)\s*(?:rs\.?|inr)?\s*(\d+)\s*k\b/i);
  if (kMatch) {
    const kVal = parseInt(kMatch[1], 10) * 1000;
    filter.price = { $lte: kVal };
  } else {
    const lakhMatch = queryLower.match(/(?:under|below|budget|max|maximum|around|within)\s*(\d+(?:\.\d+)?)\s*(?:lakh|l)?\b/i);
    if (lakhMatch && (queryLower.includes('lakh') || queryLower.includes(' lakh') || lakhMatch[0].includes('l'))) {
      const lakhVal = parseFloat(lakhMatch[1]) * 100000;
      filter.price = { $lte: lakhVal };
    } else {
      // Find any numbers > 10000
      const numMatches = queryLower.match(/\b\d{5,6}\b/g);
      if (numMatches) {
        const prices = numMatches.map(Number);
        // If there's an "under" or "below", assume max price
        if (/(?:under|below|less than|max|maximum|budget|within)/i.test(queryLower)) {
          filter.price = { $lte: Math.max(...prices) };
        } else {
          // Default to setting it as a range limit if single
          filter.price = { $lte: prices[0] };
        }
      }
    }
  }

  // 3. Extract Purpose keywords
  const purposeList = [];
  if (/(?:gaming|game|graphics|gta|steam|rtx)/i.test(queryLower)) purposeList.push('Gaming');
  if (/(?:coding|programming|developer|software|compile|vscode|python|java)/i.test(queryLower)) purposeList.push('Programming');
  if (/(?:student|college|school|study|learn)/i.test(queryLower)) purposeList.push('Student');
  if (/(?:business|office|work|word|excel|finance)/i.test(queryLower)) purposeList.push('Office');
  if (/(?:editing|video|render|design|adobe|premiere|photoshop)/i.test(queryLower)) purposeList.push('Video Editing');
  if (/(?:ai|ml|machine learning|deep learning|neural|tensorflow|pytorch)/i.test(queryLower)) purposeList.push('AI / ML');
  
  if (purposeList.length > 0) {
    filter.purpose = { $in: purposeList };
  }

  return filter;
};

/**
 * Perform natural language laptop recommendation using Gemini AI
 * 1. Fetch matching laptops from MongoDB first.
 * 2. Send candidates to Gemini AI to generate recommendation explanations.
 * 
 * @param {string} userQuery - The natural language request from user
 * @returns {Promise<object>} Recommended laptops list with AI explanations
 */
const recommendLaptopsWithAI = async (userQuery) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your env variables.');
  }

  console.log(`[AI Service] Processing user query: "${userQuery}"`);

  // Step 1: Query MongoDB to select candidates (Gemini must NOT fetch laptops)
  let candidateLaptops = [];

  // Try text search index first
  try {
    candidateLaptops = await Laptop.find(
      { $text: { $search: userQuery } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5);
  } catch (err) {
    console.warn('[AI Service] Text index search error:', err.message);
  }

  // If text index search returned no candidates, run heuristic parser and find in MongoDB
  if (candidateLaptops.length === 0) {
    const filters = extractSearchConstraints(userQuery);
    console.log('[AI Service] Heuristics parsed filters:', filters);

    candidateLaptops = await Laptop.find(filters)
      .sort({ rating: -1, reviewCount: -1 })
      .limit(5);
  }

  // If still no candidates found, fallback to general trending/featured laptops in MongoDB
  if (candidateLaptops.length === 0) {
    candidateLaptops = await Laptop.find({ 
      $or: [{ isTrending: true }, { isFeatured: true }] 
    })
      .sort({ rating: -1 })
      .limit(3);
  }

  // Final absolute fallback if DB is completely empty
  if (candidateLaptops.length === 0) {
    return {
      recommendations: [],
      generalExplanation: "No laptops found in the database. Please run catalog sync first."
    };
  }

  console.log(`[AI Service] Selected ${candidateLaptops.length} candidate laptops from MongoDB. Sending to Gemini for explanation...`);

  // Step 2: Call Gemini to generate explanations for the selected laptops
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" }
  });

  const systemContext = `
    You are an expert system recommender for Laptops. Your goal is to explain WHY specific laptops are recommended based on a user's natural language requirements.
    
    Here is the list of selected laptops from the database:
    ${JSON.stringify(candidateLaptops, null, 2)}

    Review the user's query and explain WHY each of the provided laptops fits (or partially fits) their requirements.
    DO NOT choose or return any laptops other than the ones listed above.
    
    Your response must be a JSON object containing:
    1. "recommendations": An array of objects, one for each laptop in the input candidates, where each object has:
       - "laptopId": The string ID (_id) of the laptop.
       - "matchScore": A percentage score (0-100) reflecting how well this laptop fits the query constraints.
       - "explanation": A detailed, friendly, and specific explanation describing WHY this laptop is recommended. Reference its specs (e.g. GPU, processor, RAM, display, cooling etc.) and how they fit the user request.
         Example explanation structure: "This laptop is recommended because it offers an Intel Core Ultra processor, RTX 4060 GPU, 16GB RAM, excellent cooling, and fits your gaming and programming requirements."
       - "advantages": An array of 2-3 short strings highlighting key hardware advantages.
       - "disadvantages": An array of 1-2 short strings highlighting trade-offs or limits.
       - "bestFor": A short summary string of ideal usage (e.g. "Graphics-heavy gaming and video rendering").
    2. "generalExplanation": A brief summary of the recommendations.

    Example response format:
    {
      "recommendations": [
        {
          "laptopId": "id_here",
          "matchScore": 95,
          "explanation": "This laptop is recommended because it offers an AMD Ryzen 7 processor, RTX 4060 GPU, 16GB RAM, and fits your budget and gaming requirements perfectly.",
          "advantages": ["RTX 4060 Dedicated GPU", "16GB DDR5 RAM", "144Hz high refresh rate display"],
          "disadvantages": ["Slightly heavier weight", "Average battery life under gaming workloads"],
          "bestFor": "Gaming and software development"
        }
      ],
      "generalExplanation": "I have evaluated the database results matching your requirements and explained why they are recommended."
    }
  `;

  const prompt = `${systemContext}\n\nUser Query: "${userQuery}"`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    if (!parsedData.recommendations || !Array.isArray(parsedData.recommendations)) {
      throw new Error('Invalid JSON structure returned from Gemini AI');
    }

    // Match explanations back to full MongoDB laptop objects
    const enrichedRecommendations = parsedData.recommendations.map(rec => {
      const laptopDetails = candidateLaptops.find(c => c._id.toString() === rec.laptopId);
      if (!laptopDetails) return null;
      return {
        laptop: laptopDetails,
        matchPercentage: rec.matchScore || 80,
        explanation: rec.explanation,
        advantages: rec.advantages || [],
        disadvantages: rec.disadvantages || [],
        bestFor: rec.bestFor || "General use"
      };
    }).filter(r => r !== null);

    return {
      recommendations: enrichedRecommendations,
      generalExplanation: parsedData.generalExplanation || "Here are evaluation explanations for the best matching laptops found in the database."
    };

  } catch (error) {
    console.error('Gemini AI Service Error:', error);
    // Dynamic fallback: if Gemini fails, generate standard explanation based on laptop specs to avoid crashing the user experience
    const fallbackRecs = candidateLaptops.map(laptop => ({
      laptop,
      matchPercentage: 85,
      explanation: `This laptop is recommended because it offers an ${laptop.processor} processor, ${laptop.gpu} GPU, ${laptop.ram}GB RAM, and fits your purpose requirements.`,
      advantages: [laptop.processor, `${laptop.ram}GB RAM`, laptop.storage],
      disadvantages: ['Fuzzy fallback matching used'],
      bestFor: laptop.purpose.join(' & ')
    }));

    return {
      recommendations: fallbackRecs,
      generalExplanation: "Database matches retrieved successfully. Evaluation generated using rule-based fallback due to AI service timeout."
    };
  }
};

module.exports = {
  recommendLaptopsWithAI
};
