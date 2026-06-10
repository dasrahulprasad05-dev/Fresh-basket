import { Router } from 'express';
import { fetchRecommendations, calculateNutritionFacts } from '../controllers/recommendation.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Allow optional authentication (guest vs logged-in recommendations)
router.get('/', (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    authenticateToken(req, res, next);
  } else {
    next();
  }
}, fetchRecommendations);

router.post('/nutrition', calculateNutritionFacts);

export default router;
