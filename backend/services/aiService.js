const { GoogleGenerativeAI } = require('@google/generative-ai');
const Laptop = require('../models/Laptop');

/**
 * Perform natural language laptop recommendation using Gemini AI
 * @param {string} userQuery - The natural language recommendation request from user
 * @returns {Promise<object>} Recommended laptops list with AI explanations
 */
const recommendLaptopsWithAI = async (userQuery) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your env variables.');
  }

  // 1. Fetch available laptops from database
  const laptops = await Laptop.find({}, {
    _id: 1,
    brand: 1,
    model: 1,
    price: 1,
    processor: 1,
    gpu: 1,
    ram: 1,
    storage: 1,
    display: 1,
    battery: 1,
    weight: 1,
    screenSize: 1,
    refreshRate: 1,
    description: 1
  });

  if (laptops.length === 0) {
    return {
      recommendations: [],
      generalExplanation: "No laptops found in the database. Please seed or add laptops first."
    };
  }

  // 2. Setup Gemini client
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseMimeType: "application/json" }
  });

  // 3. Format the context prompt
  const systemContext = `
    You are an expert system recommender for Laptops. Your goal is to match user requirements to the most appropriate laptops from the database.
    
    Here is the list of available laptops in JSON format:
    ${JSON.stringify(laptops, null, 2)}

    Based on the user's query, extract budget, purpose, preferred brand, CPU, GPU, RAM, storage, display, battery, weight, and special features.
    Recommend up to 3 laptops that best match their requirements.
    
    Your response must be a JSON object containing:
    1. "recommendations": An array of objects, where each object has:
       - "laptopId": The string ID (_id) of the laptop.
       - "matchScore": A percentage score (0-100) reflecting how well this laptop fits the query.
       - "explanation": A detailed, friendly explanation describing why this specific laptop fits their request.
       - "advantages": An array of 2-3 short strings highlighting key hardware advantages.
       - "disadvantages": An array of 1-2 short strings highlighting trade-offs or limits.
       - "bestFor": A short summary string of ideal usage (e.g. "Gaming and Adobe Premier rendering").
    2. "generalExplanation": A brief summary of the recommendations.

    Example response structure:
    {
      "recommendations": [
        {
          "laptopId": "651a2b3c4d5e6f7a8b9c0d1e",
          "matchScore": 95,
          "explanation": "This fits your ₹80,000 budget and is excellent for programming because of its 16GB RAM and fast Intel i7 processor.",
          "advantages": ["Fast Intel i7 Processor", "16GB RAM for multitasking", "Lightweight frame"],
          "disadvantages": ["Slightly shorter battery life"],
          "bestFor": "Java development and machine learning projects"
        }
      ],
      "generalExplanation": "I selected laptops that fit your developer needs while keeping you within budget."
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

    // 4. Fetch the full laptop records from database for the recommended IDs
    const enrichedRecommendations = await Promise.all(
      parsedData.recommendations.map(async (rec) => {
        try {
          const laptopDetails = await Laptop.findById(rec.laptopId);
          if (!laptopDetails) return null;
          return {
            laptop: laptopDetails,
            matchPercentage: rec.matchScore,
            explanation: rec.explanation,
            advantages: rec.advantages || [],
            disadvantages: rec.disadvantages || [],
            bestFor: rec.bestFor || "Everyday workloads"
          };
        } catch (e) {
          console.error(`Failed to fetch laptop details for ID ${rec.laptopId}:`, e.message);
          return null;
        }
      })
    );

    // Filter out null recommendations (if a laptop was deleted or ID mismatches)
    const validRecommendations = enrichedRecommendations.filter(item => item !== null);

    return {
      recommendations: validRecommendations,
      generalExplanation: parsedData.generalExplanation || "Here are your matching laptop options."
    };
  } catch (error) {
    console.error('Gemini AI Service Error:', error);
    throw new Error(`AI recommendation failed: ${error.message}`);
  }
};

module.exports = {
  recommendLaptopsWithAI
};
