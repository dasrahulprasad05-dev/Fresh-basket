import { Router } from 'express';
import { fetchRecommendations, calculateNutritionFacts } from '../controllers/recommendation.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Allow optional authentication (guest vs logged-in recommendations)
router.get('/', optionalAuth, fetchRecommendations);

router.post('/nutrition', calculateNutritionFacts);

export default router;

