import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { broadcastInventoryUpdate, sendOrderStatusUpdate } from '../sockets/socket';

export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
  }
}

export async function checkout(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { items, address, paymentMethod, couponCode } = req.body;
    // items: { productId: number, quantity: number }[]

    if (!items || !items.length || !address || !paymentMethod) {
      return res.status(400).json({ error: 'Invalid checkout parameters.' });
    }

    // Validate coupon code server-side before database lock
    if (couponCode && couponCode !== 'FRESH20' && couponCode !== 'HEALTHY10') {
      return res.status(400).json({ error: 'Invalid coupon code.' });
    }

    // Run transaction
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new BusinessError(`Product with ID ${item.productId} not found.`);
        }

        if (product.stock < item.quantity) {
          throw new BusinessError(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity },
        });

        subtotal += product.price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (couponCode === 'FRESH20') {
        discountAmount = (subtotal * 20) / 100;
      } else if (couponCode === 'HEALTHY10') {
        discountAmount = (subtotal * 10) / 100;
      }

      // Calculate shipping
      const shipping = subtotal > 500 || subtotal === 0 ? 0 : 99;
      const total = subtotal - discountAmount + shipping;

      // Create order with secure total
      return tx.order.create({
        data: {
          userId: req.user!.id,
          total,
          address,
          paymentMethod,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });

    // Broadcast stock updates now that transaction committed successfully
    for (const item of order.items) {
      broadcastInventoryUpdate(item.productId, item.product.stock);
    }

    return res.status(201).json({ order });
  } catch (error: any) {
    if (error instanceof BusinessError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Checkout transaction failed. Please try again.' });
  }
}

export async function getCustomerOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ orders });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body; // PLACED, PACKED, OUT_FOR_DELIVERY, DELIVERED

    if (isNaN(orderId) || !status) {
      return res.status(400).json({ error: 'Invalid parameters.' });
    }

    const allowedStatuses = ['PLACED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status value.' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Emit live update to client room
    sendOrderStatusUpdate(order.id, order.status);

    return res.json({ message: 'Order status updated successfully.', order });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createSubscription(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { type } = req.body; // WEEKLY_BOX, MONTHLY_FAMILY
    if (!type || (type !== 'WEEKLY_BOX' && type !== 'MONTHLY_FAMILY')) {
      return res.status(400).json({ error: 'Invalid subscription type.' });
    }

    // Schedule next delivery in 7 days
    const nextDelivery = new Date();
    nextDelivery.setDate(nextDelivery.getDate() + 7);

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        type,
        status: 'ACTIVE',
        nextDelivery,
      },
    });

    return res.status(201).json({ subscription });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getCustomerSubscriptions(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ subscriptions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function cancelSubscription(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const subId = parseInt(req.params.id);
    if (isNaN(subId)) {
      return res.status(400).json({ error: 'Invalid subscription ID.' });
    }

    // Secure ownership check
    const sub = await prisma.subscription.findFirst({
      where: { id: subId, userId: req.user.id }
    });

    if (!sub) {
      return res.status(404).json({ error: 'Subscription not found.' });
    }

    const subscription = await prisma.subscription.update({
      where: { id: subId },
      data: { status: 'CANCELLED' },
    });

    return res.json({ message: 'Subscription cancelled.', subscription });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getAdminStats(req: AuthenticatedRequest, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const offset = page * 50;

    // Aggregations
    const totalOrders = await prisma.order.count();
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      skip: offset,
    });

    const sumSales = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });

    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });

    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 15 } },
    });

    const productsCount = await prisma.product.count();

    return res.json({
      totalSales: sumSales._sum.total || 0,
      totalOrders,
      totalCustomers,
      lowStockProducts,
      productsCount,
      orders,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
