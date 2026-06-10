import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateStock, getFarmers, addReview } from '../controllers/product.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', getProducts);
router.get('/farmers', getFarmers);
router.get('/:id', getProductById);
router.post('/:id/review', authenticateToken, addReview);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, createProduct);
router.put('/:id/stock', authenticateToken, requireAdmin, updateStock);

export default router;
