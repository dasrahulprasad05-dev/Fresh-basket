import prisma from '../config/db';

export async function getRecommendations(userId: number, currentProductIds: number[] = []): Promise<any[]> {
  // 1. Retrieve user's previous ordered product IDs
  const userOrders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
  });
  
  const historicalProductIds = new Set<number>();
  userOrders.forEach(order => {
    order.items.forEach(item => {
      historicalProductIds.add(item.productId);
    });
  });

  // Combine historical and current product IDs to see what the user is interested in
  const interestIds = Array.from(new Set([...currentProductIds, ...Array.from(historicalProductIds)]));

  // Get all products to compute suggestions
  const allProducts = await prisma.product.findMany({
    include: { farmer: true }
  });

  // Fallback: If no interests, just suggest featured products
  if (interestIds.length === 0) {
    return allProducts.filter(p => p.isFeatured).slice(0, 3);
  }

  // Pre-fetch detail of interest fruits
  const interestedFruits = allProducts.filter(p => interestIds.includes(p.id));
  const interestedNames = interestedFruits.map(p => p.name.toLowerCase());
  const interestedCategories = Array.from(new Set(interestedFruits.map(p => p.category)));

  const recommendations: any[] = [];

  // Rules-based engine (Recruiter highlight)
  // Check if they bought Apple and Banana, then suggest Kiwi or Dragon Fruit
  const hasApple = interestedNames.some(name => name.includes('apple'));
  const hasBanana = interestedNames.some(name => name.includes('banana'));
  const hasStrawberry = interestedNames.some(name => name.includes('strawberry'));

  if (hasApple && hasBanana) {
    // Suggest Kiwi & Dragon Fruit
    const kiwi = allProducts.find(p => p.name.toLowerCase().includes('kiwi'));
    const dragon = allProducts.find(p => p.name.toLowerCase().includes('dragon'));
    if (kiwi && !interestIds.includes(kiwi.id)) recommendations.push(kiwi);
    if (dragon && !interestIds.includes(dragon.id)) recommendations.push(dragon);
  }

  if (hasStrawberry) {
    // Suggest blueberries and bananas
    const blueberry = allProducts.find(p => p.name.toLowerCase().includes('blueberry'));
    const banana = allProducts.find(p => p.name.toLowerCase().includes('banana'));
    if (blueberry && !interestIds.includes(blueberry.id)) recommendations.push(blueberry);
    if (banana && !interestIds.includes(banana.id)) recommendations.push(banana);
  }

  // Content-based collaborative filtering fallback:
  // Find products that match their categories of interest and are not already purchased / in cart
  const categoryRecommendations = allProducts.filter(p => {
    return interestedCategories.includes(p.category) && 
           !interestIds.includes(p.id) &&
           !recommendations.some(r => r.id === p.id);
  });

  recommendations.push(...categoryRecommendations);

  // If we still need more recommendations, fill with featured fruits
  if (recommendations.length < 3) {
    const fillers = allProducts.filter(p => {
      return !interestIds.includes(p.id) && 
             !recommendations.some(r => r.id === p.id);
    });
    recommendations.push(...fillers);
  }

  // Return top 3 recommendations
  return recommendations.slice(0, 3);
}

// Calculate nutrition summaries for a set of selected fruits
export function calculateNutrition(fruits: { product: any; quantity: number }[]): {
  calories: number;
  protein: number;
  carbs: number;
  vitamins: string[];
} {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  const vitaminsSet = new Set<string>();

  fruits.forEach(({ product, quantity }) => {
    calories += (product.calories || 0) * quantity;
    protein += (product.protein || 0) * quantity;
    carbs += (product.carbs || 0) * quantity;
    if (product.vitamins) {
      product.vitamins.split(',').forEach((v: string) => {
        vitaminsSet.add(v.trim());
      });
    }
  });

  return {
    calories: Math.round(calories * 10) / 10,
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    vitamins: Array.from(vitaminsSet),
  };
}
