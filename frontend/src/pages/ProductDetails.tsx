import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import Fruit3D from '../components/Fruit3D';
import { Star, ShieldAlert, Heart, ShoppingCart, Info, User, ChevronRight, Check } from 'lucide-react';
import { API_BASE_URL } from '../config';

export const ProductDetails: React.FC = () => {
  const { id } = useParams();
  const { addToCart, toggleWishlist, wishlist } = useApp();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [nutritionMultiplier, setNutritionMultiplier] = useState(1); // 1 = 1kg or unit
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Review fields
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Fetch product details
    fetch(`${API_BASE_URL}/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) setProduct(data.product);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching product details:', err);
        setLoading(false);
      });

    // Fetch AI Recommendations based on this item
    fetch(`${API_BASE_URL}/api/recommendations?productIds=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.recommendations) setRecommendations(data.recommendations);
      })
      .catch((err) => {
        console.error('Error fetching recommendations:', err);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="glass border border-gray-800 p-12 rounded-3xl text-center space-y-4 max-w-md mx-auto mt-12">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-gray-400 text-sm">We couldn't locate this harvest batch in our database.</p>
        <Link to="/shop" className="inline-block bg-emerald-500 text-[#0b0f19] font-bold px-6 py-2.5 rounded-xl">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Map product name to programmatic Three.js shape key
  let threeKey: 'apple' | 'orange' | 'banana' | 'kiwi' | 'dragon' | 'watermelon' = 'apple';
  const lowercaseName = product.name.toLowerCase();
  if (lowercaseName.includes('orange')) threeKey = 'orange';
  else if (lowercaseName.includes('banana')) threeKey = 'banana';
  else if (lowercaseName.includes('kiwi')) threeKey = 'kiwi';
  else if (lowercaseName.includes('dragon')) threeKey = 'dragon';
  else if (lowercaseName.includes('watermelon')) threeKey = 'watermelon';

  // Handle Review submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setSubmittingReview(true);

    const storedUser = localStorage.getItem('fb_user');
    const storedToken = localStorage.getItem('fb_token');
    if (!storedUser || !storedToken) {
      alert('Please sign in to leave a review.');
      setSubmittingReview(false);
      return;
    }

    const customerObj = JSON.parse(storedUser);

    fetch(`${API_BASE_URL}/api/products/${product.id}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${storedToken}`,
      },
      body: JSON.stringify({
        userId: customerObj.id,
        rating: ratingInput,
        comment: commentInput,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.review) {
          // Add new review locally
          setProduct((prev: any) => ({
            ...prev,
            reviews: [data.review, ...(prev?.reviews || [])],
          }));
          setCommentInput('');
          setRatingInput(5);
        }
        setSubmittingReview(false);
      })
      .catch((err) => {
        console.error(err);
        setSubmittingReview(false);
      });
  };

  return (
    <div className="space-y-16">
      {/* Product main block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: 3D Viewer & Image */}
        <div className="lg:col-span-5 space-y-6">
          <div className="aspect-square rounded-3xl overflow-hidden glass border border-gray-800 relative bg-gradient-to-b from-gray-950 to-gray-900 shadow-2xl flex flex-col justify-between">
            {/* Interactive 3D Canvas */}
            <div className="absolute inset-0 z-0">
              <Fruit3D fruitType={threeKey} interactive={true} />
            </div>

            <div className="relative z-10 p-5 flex justify-between items-start pointer-events-none">
              <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Drag to Rotate 3D Fruit
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className="p-2 bg-gray-900/60 rounded-full hover:bg-rose-600/80 text-white transition-colors cursor-pointer pointer-events-auto shadow-md"
              >
                <Heart
                  className={`w-5 h-5 ${
                    wishlist.some((item) => item.id === product.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-300'
                  }`}
                />
              </button>
            </div>

            <div className="relative z-10 p-5 text-center pointer-events-none">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Rendered via WebGL / Three.js</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 p-4 rounded-2xl glass border border-gray-800 flex items-center gap-3">
              <div className="text-3xl">🌿</div>
              <div className="text-left">
                <h4 className="text-xs text-gray-400 font-bold uppercase">Sourcing</h4>
                <p className="text-sm font-semibold text-white">100% Organic certified</p>
              </div>
            </div>
            <div className="flex-1 p-4 rounded-2xl glass border border-gray-800 flex items-center gap-3">
              <div className="text-3xl">📦</div>
              <div className="text-left">
                <h4 className="text-xs text-gray-400 font-bold uppercase">Packaging</h4>
                <p className="text-sm font-semibold text-white">Eco-friendly pulp box</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info & Nutrition scaling */}
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/15 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">{product.name}</h1>

            <div className="flex items-center gap-4">
              <div className="flex text-amber-400">
                <Star className="w-5 h-5 fill-amber-400" />
                <Star className="w-5 h-5 fill-amber-400" />
                <Star className="w-5 h-5 fill-amber-400" />
                <Star className="w-5 h-5 fill-amber-400" />
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <span className="text-sm text-gray-400">({product.reviews?.length || 1} verified customer review)</span>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-baseline gap-3 py-4 border-y border-gray-800">
            <span className="text-3xl font-extrabold text-white">${product.price}</span>
            <span className="text-sm text-gray-500">per {product.unit}</span>
            <span
              className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                product.stock === 0
                  ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                  : product.stock <= 15
                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 animate-pulse'
                  : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : `${product.stock} ${product.unit} left in stock`}
            </span>
          </div>

          {/* Interactive Nutrition Scaler Widget (Recruiter standout) */}
          <div className="p-6 rounded-2xl glass border border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                <Info className="w-5 h-5 text-emerald-400" /> Dynamic Nutrition Calculator
              </h3>
              <span className="text-xs text-gray-400 font-bold bg-[#0b0f19] px-2.5 py-1 rounded-full">
                For {nutritionMultiplier.toFixed(1)} {product.unit}
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={nutritionMultiplier}
                onChange={(e) => setNutritionMultiplier(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-ew-resize bg-gray-800 h-2 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                <span>0.5 {product.unit}</span>
                <span>2.5 {product.unit}</span>
                <span>5.0 {product.unit}</span>
              </div>
            </div>

            {/* Nutrition grid values */}
            <div className="grid grid-cols-3 gap-4 text-center pt-2">
              <div className="bg-[#0b0f19] p-3 rounded-xl border border-gray-800/60">
                <div className="text-xl font-extrabold text-white">
                  {Math.round(product.calories * nutritionMultiplier)}
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Calories</div>
              </div>
              <div className="bg-[#0b0f19] p-3 rounded-xl border border-gray-800/60">
                <div className="text-xl font-extrabold text-emerald-400">
                  {Math.round(product.protein * nutritionMultiplier * 10) / 10}g
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Protein</div>
              </div>
              <div className="bg-[#0b0f19] p-3 rounded-xl border border-gray-800/60">
                <div className="text-xl font-extrabold text-sky-400">
                  {Math.round(product.carbs * nutritionMultiplier * 10) / 10}g
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Carbs</div>
              </div>
            </div>

            <div className="text-xs text-gray-400 leading-relaxed pt-1 flex items-start gap-1">
              <span>★</span>
              <span>
                Vitamins present: <span className="text-white font-medium">{product.vitamins}</span>. Highly recommended for daily micronutrient intake.
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              disabled={product.stock === 0}
              onClick={() => addToCart(product, 1)}
              className={`flex-1 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all text-base cursor-pointer ${
                product.stock === 0
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] hover:shadow-lg hover:shadow-emerald-500/15'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Basket
            </button>
          </div>
        </div>
      </div>

      {/* Sourcing Section: meet the farmer */}
      {product.farmer && (
        <section className="rounded-2xl glass border border-gray-800 p-8 sm:p-10 text-left space-y-6">
          <div className="border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Farmer-to-Customer Sourcing Verification</h2>
            <p className="text-gray-400 text-sm mt-1">Inspected and traced by FreshBasket AI logistics ledgers.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <img
              src={product.farmer.image}
              alt={product.farmer.name}
              className="w-32 h-32 rounded-full object-cover border-2 border-emerald-500"
            />
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap justify-between items-baseline gap-2">
                <h3 className="text-xl font-bold text-white">{product.farmer.name}</h3>
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                  📍 {product.farmer.location}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">{product.farmer.story}</p>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-500 bg-[#0b0f19] p-3 rounded-xl border border-gray-850 w-fit">
                <div>LATITUDE: {product.farmer.lat}</div>
                <div>LONGITUDE: {product.farmer.lng}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* AI Recommendations Panel */}
      {recommendations.length > 0 && (
        <section className="space-y-6 text-left">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-1.5">
            🥗 AI Recommendations For You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="group rounded-2xl glass overflow-hidden border border-gray-850 p-4 flex gap-4 hover:border-gray-750 transition-all cursor-pointer"
                onClick={() => (window.location.href = `/product/${rec.id}`)}
              >
                <img src={rec.image} alt={rec.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="space-y-1 flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {rec.name}
                  </h4>
                  <p className="text-xs text-gray-500">${rec.price} / {rec.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews section */}
      <section className="space-y-6 text-left">
        <h2 className="text-2xl font-bold text-white tracking-tight">Customer Reviews ({product.reviews?.length || 0})</h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Review form */}
          <div className="lg:col-span-5 p-6 rounded-2xl glass border border-gray-800 space-y-4">
            <h3 className="font-bold text-white text-base">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase">Rating</label>
                <select
                  value={ratingInput}
                  onChange={(e) => setRatingInput(parseInt(e.target.value))}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl py-3 px-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Poor)</option>
                  <option value={1}>1 Star (Awful)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase">Your Comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your thoughts on the ripeness, taste, and packaging..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl py-3 px-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer text-sm"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>

          {/* Review list */}
          <div className="lg:col-span-7 space-y-4">
            {(!product.reviews || product.reviews.length === 0) ? (
              <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this fruit!</p>
            ) : (
              product.reviews.map((rev: any) => (
                <div key={rev.id} className="p-5 rounded-2xl glass border border-gray-800/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white text-sm flex items-center gap-1.5">
                      <User className="w-4 h-4 text-emerald-400" /> {rev.user?.name || 'Customer'}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
export default ProductDetails;
