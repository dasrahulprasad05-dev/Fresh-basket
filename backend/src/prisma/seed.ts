import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.product.deleteMany();
  await prisma.farmer.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const adminPassword = bcrypt.hashSync('admin123', 10);
  const customerPassword = bcrypt.hashSync('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@freshbasket.com',
      password: adminPassword,
      name: 'Admin Manager',
      role: 'ADMIN',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@gmail.com',
      password: customerPassword,
      name: 'John Doe',
      role: 'CUSTOMER',
    },
  });

  console.log('Seeding farmers...');
  const farmerJohn = await prisma.farmer.create({
    data: {
      name: 'Farmer John',
      location: 'Napa Valley, CA',
      story: 'John has been growing organic apples and berries for over three decades using eco-friendly practices.',
      image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=400&q=80',
      lat: 38.2975,
      lng: -122.2869,
    },
  });

  const farmerMaria = await prisma.farmer.create({
    data: {
      name: 'Farmer Maria',
      location: 'Sunny Glades, FL',
      story: 'Maria specializes in citrus fruits and tropical varieties, utilizing natural rainwater irrigation.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      lat: 25.7617,
      lng: -80.1918,
    },
  });

  const farmerKen = await prisma.farmer.create({
    data: {
      name: 'Farmer Ken',
      location: 'Hood River, OR',
      story: 'Ken utilizes high-altitude mountain waters to grow crisp stone fruits and premium grapes.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      lat: 45.7082,
      lng: -121.5139,
    },
  });

  console.log('Seeding products...');
  const products = [
    {
      name: 'Organic Honeycrisp Apples',
      description: 'Exceptionally crisp and sweet organic apples freshly picked from Napa Valley orchards.',
      category: 'Stone Fruit',
      price: 4.99,
      stock: 45,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
      calories: 52,
      protein: 0.3,
      carbs: 14,
      vitamins: 'Vitamin C, Potassium, Vitamin K',
      season: 'Autumn',
      isFeatured: true,
      farmerId: farmerJohn.id,
    },
    {
      name: 'Premium Cavendish Bananas',
      description: 'Sweet and perfectly ripe yellow bananas, rich in potassium and energy.',
      category: 'Tropical',
      price: 2.29,
      stock: 80,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      calories: 89,
      protein: 1.1,
      carbs: 23,
      vitamins: 'Vitamin B6, Vitamin C, Potassium',
      season: 'All',
      isFeatured: true,
      farmerId: farmerMaria.id,
    },
    {
      name: 'Valencia Oranges',
      description: 'Juicy and sweet oranges perfect for freshly squeezed morning juice.',
      category: 'Citrus',
      price: 3.49,
      stock: 50,
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80',
      calories: 47,
      protein: 0.9,
      carbs: 12,
      vitamins: 'Vitamin C, Folate, Thiamin',
      season: 'Winter',
      isFeatured: true,
      farmerId: farmerMaria.id,
    },
    {
      name: 'Alphonso Mangoes',
      description: 'The king of fruits! Incredibly sweet, rich, and aromatic tropical mangoes.',
      category: 'Tropical',
      price: 6.99,
      stock: 15, // Low stock to demonstrate real-time notifications
      unit: 'kg',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
      calories: 60,
      protein: 0.8,
      carbs: 15,
      vitamins: 'Vitamin C, Vitamin A, Vitamin B6',
      season: 'Summer',
      isFeatured: true,
      farmerId: farmerMaria.id,
    },
    {
      name: 'Sweet Ruby Strawberries',
      description: 'Freshly harvested organic strawberries, ruby red and burst with flavor.',
      category: 'Berries',
      price: 5.99,
      stock: 60,
      unit: 'pack',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80',
      calories: 32,
      protein: 0.7,
      carbs: 7.7,
      vitamins: 'Vitamin C, Manganese, Folate',
      season: 'Spring',
      isFeatured: true,
      farmerId: farmerJohn.id,
    },
    {
      name: 'Zesty Kiwi Fruits',
      description: 'Tangy and vitamin-rich green kiwis with a refreshing tropical flavor profile.',
      category: 'Tropical',
      price: 4.49,
      stock: 30,
      unit: 'pack',
      image: 'https://images.unsplash.com/photo-1585059895524-72359e061381?auto=format&fit=crop&w=600&q=80',
      calories: 61,
      protein: 1.1,
      carbs: 15,
      vitamins: 'Vitamin C, Vitamin K, Vitamin E',
      season: 'Spring',
      isFeatured: false,
      farmerId: farmerJohn.id,
    },
    {
      name: 'Dragon Fruit (Pitaya)',
      description: 'Exotic pink dragon fruit with a mild sweet taste and crunchy seeds.',
      category: 'Tropical',
      price: 8.99,
      stock: 12, // Low stock to trigger warnings
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1527325678964-54921661f92e?auto=format&fit=crop&w=600&q=80',
      calories: 50,
      protein: 1.2,
      carbs: 11,
      vitamins: 'Vitamin C, Iron, Magnesium',
      season: 'Summer',
      isFeatured: false,
      farmerId: farmerMaria.id,
    },
    {
      name: 'Wild Blueberries',
      description: 'Rich, antioxidant-packed wild blueberries, perfect for bowls and snacks.',
      category: 'Berries',
      price: 6.49,
      stock: 25,
      unit: 'pack',
      image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80',
      calories: 57,
      protein: 0.7,
      carbs: 14,
      vitamins: 'Vitamin C, Vitamin K, Manganese',
      season: 'Summer',
      isFeatured: false,
      farmerId: farmerJohn.id,
    },
    {
      name: 'Organic Watermelon',
      description: 'Mega juicy, sweet and thirst-quenching watermelon from the hills of Hood River.',
      category: 'Melons',
      price: 7.99,
      stock: 8, // Low stock
      unit: 'piece',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
      calories: 30,
      protein: 0.6,
      carbs: 8,
      vitamins: 'Vitamin C, Vitamin A, Potassium',
      season: 'Summer',
      isFeatured: false,
      farmerId: farmerKen.id,
    },
  ];

  for (const prod of products) {
    const createdProduct = await prisma.product.create({
      data: prod,
    });

    // Seed some reviews
    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: createdProduct.id,
        rating: 5,
        comment: `Absolutely loved this! The ${createdProduct.name.toLowerCase()} was fresh, ripe and delicious.`,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
