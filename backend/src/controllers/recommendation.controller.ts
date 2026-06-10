import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getRecommendations, calculateNutrition } from '../services/recommendation.service';
import prisma from '../config/db';

export async function fetchRecommendations(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user ? req.user.id : 0; // 0 means guest user / fallback
    const { productIds } = req.query; // productIds currently in cart or viewed, comma-separated e.g. "1,2"

    let currentProductIds: number[] = [];
    if (typeof productIds === 'string') {
      currentProductIds = productIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    }

    const recommendations = await getRecommendations(userId, currentProductIds);
    return res.json({ recommendations });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function calculateNutritionFacts(req: AuthenticatedRequest, res: Response) {
  try {
    const { items } = req.body; // Array of { productId: number, quantity: number }
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required.' });
    }

    const aggregatedItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (product) {
        aggregatedItems.push({ product, quantity: item.quantity });
      }
    }

    const nutrition = calculateNutrition(aggregatedItems);
    return res.json({ nutrition });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
