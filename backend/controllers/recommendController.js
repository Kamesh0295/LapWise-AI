const recommendService = require('../services/recommendService');
const aiService = require('../services/aiService');
const RecommendationHistory = require('../models/RecommendationHistory');
const { BadRequestError } = require('../utils/AppError');
const { formatResponse } = require('../utils/helpers');

/**
 * Handle Wizard questionnaire form submission to return top 5 laptops
 */
const getWizardRecommendations = async (req, res, next) => {
  try {
    const { purpose, maxPrice, preferredBrand, answers } = req.body;

    if (!purpose) {
      return next(new BadRequestError('The recommendation purpose (Gaming/Programming/Entertainment/General) is required.'));
    }

    const recommendations = await recommendService.getWizardRecommendations({
      purpose,
      maxPrice,
      preferredBrand,
      answers
    });

    // Save history if user is logged in (jwt passport verification passed)
    if (req.user) {
      // Map recommendations for saving
      const savedRecs = recommendations.map(rec => ({
        laptop: rec.laptop._id,
        matchPercentage: rec.matchPercentage,
        explanation: rec.explanation
      }));

      await RecommendationHistory.create({
        user: req.user._id,
        purpose,
        answers: {
          maxPrice,
          preferredBrand,
          ...answers
        },
        recommendations: savedRecs
      });
    }

    res.status(200).json(formatResponse('Wizard recommendations generated successfully', recommendations));
  } catch (error) {
    next(error);
  }
};

/**
 * Handle natural language laptop recommendation queries using Gemini AI
 */
const getAIRecommendations = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return next(new BadRequestError('Natural language query search string is required.'));
    }

    const aiResult = await aiService.recommendLaptopsWithAI(query);

    // Save recommendation query history if user is logged in
    if (req.user && aiResult.recommendations.length > 0) {
      const savedRecs = aiResult.recommendations.map(rec => ({
        laptop: rec.laptop._id,
        matchPercentage: rec.matchPercentage,
        explanation: rec.explanation
      }));

      await RecommendationHistory.create({
        user: req.user._id,
        purpose: 'General', // Default to General for AI-generated text queries
        answers: { naturalLanguageQuery: query },
        recommendations: savedRecs
      });
    }

    res.status(200).json(
      formatResponse('AI recommendations generated successfully', {
        recommendations: aiResult.recommendations,
        explanation: aiResult.generalExplanation
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get past recommendation runs for the logged-in user
 */
const getRecommendationHistory = async (req, res, next) => {
  try {
    const history = await RecommendationHistory.find({ user: req.user.id })
      .populate('recommendations.laptop')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json(formatResponse('Recommendation history retrieved successfully', history));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWizardRecommendations,
  getAIRecommendations,
  getRecommendationHistory
};
