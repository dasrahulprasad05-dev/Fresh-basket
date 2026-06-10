import { Router } from 'express';
import {
  checkout,
  getCustomerOrders,
  updateOrderStatus,
  createSubscription,
  getCustomerSubscriptions,
  cancelSubscription,
  getAdminStats
} from '../controllers/order.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Customer routes
router.post('/checkout', authenticateToken, checkout);
router.get('/', authenticateToken, getCustomerOrders);
router.post('/subscription', authenticateToken, createSubscription);
router.get('/subscription', authenticateToken, getCustomerSubscriptions);
router.put('/subscription/:id/cancel', authenticateToken, cancelSubscription);

// Admin-only routes
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);
router.get('/admin/stats', authenticateToken, requireAdmin, getAdminStats);

export default router;
