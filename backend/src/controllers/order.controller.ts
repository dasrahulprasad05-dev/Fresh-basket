import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { broadcastInventoryUpdate, sendOrderStatusUpdate } from '../sockets/socket';

export async function checkout(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { items, address, paymentMethod } = req.body;
    // items: { productId: number, quantity: number }[]

    if (!items || !items.length || !address || !paymentMethod) {
      return res.status(400).json({ error: 'Invalid checkout parameters.' });
    }

    // Run transaction
    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }

        // Deduct stock
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity },
        });

        total += product.price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });

        // Defer stock broadcast to after transaction success
      }

      // Create order
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
    return res.status(400).json({ error: error.message });
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
    const subId = parseInt(req.params.id);
    if (isNaN(subId)) {
      return res.status(400).json({ error: 'Invalid subscription ID.' });
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
    // Aggregations
    const totalOrders = await prisma.order.count();
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
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
