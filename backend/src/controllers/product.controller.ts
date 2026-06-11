import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { broadcastInventoryUpdate } from '../sockets/socket';
import { AuthenticatedRequest } from '../middleware/auth';

const createProductSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(1, 'Name cannot be empty'),
  price: z.number({ required_error: 'Price is required' }).positive('Price must be a positive number'),
  stock: z.number({ required_error: 'Stock is required' }).int().nonnegative('Stock must be a non-negative integer'),
  category: z.string({ required_error: 'Category is required' }).min(1, 'Category cannot be empty'),
});

export async function getProducts(req: Request, res: Response) {
  try {
    const { category, season, search, sort, isFeatured } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }
    if (season) {
      where.season = season as string;
    }
    if (isFeatured) {
      where.isFeatured = isFeatured === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    let orderBy: any = {};
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'stock_desc') {
      orderBy = { stock: 'desc' };
    } else {
      orderBy = { id: 'asc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        farmer: true,
      },
    });

    return res.json({ products });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farmer: true,
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    return res.json({ product });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const priceNum = req.body.price !== undefined && req.body.price !== '' ? Number(req.body.price) : undefined;
    const stockNum = req.body.stock !== undefined && req.body.stock !== '' ? Number(req.body.stock) : undefined;

    const validation = createProductSchema.safeParse({
      name: req.body.name,
      price: priceNum,
      stock: stockNum,
      category: req.body.category,
    });

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const {
      name,
      description,
      category,
      price,
      stock,
      unit,
      image,
      calories,
      protein,
      carbs,
      vitamins,
      season,
      isFeatured,
      farmerId,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        unit,
        image,
        calories: parseFloat(calories || 0),
        protein: parseFloat(protein || 0),
        carbs: parseFloat(carbs || 0),
        vitamins,
        season,
        isFeatured: isFeatured === true || isFeatured === 'true',
        farmerId: farmerId ? parseInt(farmerId) : null,
      },
      include: {
        farmer: true,
      },
    });

    return res.status(201).json({ product });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateStock(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { stock } = req.body;

    if (isNaN(id) || stock === undefined || isNaN(parseInt(stock))) {
      return res.status(400).json({ error: 'Invalid product ID or stock value.' });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { stock: parseInt(stock) },
    });

    // Broadcast inventory change in real-time
    broadcastInventoryUpdate(product.id, product.stock);

    return res.json({ message: 'Stock updated successfully.', product });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getFarmers(req: Request, res: Response) {
  try {
    const farmers = await prisma.farmer.findMany({
      include: {
        products: true,
      },
    });
    return res.json({ farmers });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function addReview(req: AuthenticatedRequest, res: Response) {
  try {
    const productId = parseInt(req.params.id);
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const { rating, comment } = req.body;

    if (isNaN(productId) || rating === undefined || !comment) {
      return res.status(400).json({ error: 'Product ID, rating and comment are required.' });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.id,
        rating: parseInt(rating),
        comment,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return res.status(201).json({ review });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
