import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Fruit3D from '../components/Fruit3D';
import { ArrowRight, ShoppingCart, Star, ShieldCheck, Heart, Truck, Sparkles, MapPin } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { API_BASE_URL } from '../config';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products?isFeatured=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setFeaturedProducts(data.products);
      })
      .catch((err) => {
        console.error('Error fetching featured products:', err);
      });
  }, []);

  const categories = [
    { name: 'Citrus', desc: 'Tangy oranges & lemons', image: '🍊' },
    { name: 'Berries', desc: 'Fresh strawberries & blueberries', image: '🍓' },
    { name: 'Tropical', desc: 'Sweet mangoes & bananas', image: '🥭' },
    { name: 'Melons', desc: 'Juicy watermelons & cantaloupes', image: '🍉' },
    { name: 'Stone Fruit', desc: 'Crisp apples & peaches', image: '🍎' },
  ];

  return (
    <div className="space-y-24 relative">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] rounded-3xl overflow-hidden flex items-center gradient-bg border border-gray-800">
        {/* Floating 3D Background */}
        <div className="absolute inset-0 z-0 opacity-80">
          <Fruit3D fruitType="all" />
        </div>

        {/* Hero Overlay and Copy */}
        <div className="relative z-10 max-w-3xl px-8 sm:px-12 py-16 space-y-6 md:space-y-8 text-left">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400 tracking-wider uppercase">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            Artificial Intelligence Powered Recommendations
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Next-Gen Organic <br />
            <span className="text-gradient">Fruit Delivery</span>
          </h1>

          <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
            FreshBasket AI matches your taste profile with local certified farmer harvests. Real-time inventory tracking, nutritional analysis, and farmer-to-customer verification maps.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/shop"
              className="bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-bold px-8 py-4 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all text-base cursor-pointer"
            >
              Shop Fresh Harvest
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/dashboard"
              className="bg-gray-900/60 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 glass transition-all text-base cursor-pointer"
            >
              Subscribe & Save
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Browse Categories</h2>
          <p className="text-gray-400">Hand-picked organic choices sorted by seasonal availability.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/shop?category=${cat.name}`}
              className="group p-6 rounded-2xl glass hover:bg-gray-800/80 transition-all border border-gray-800 text-center flex flex-col items-center gap-4 hover:-translate-y-2 cursor-pointer"
            >
              <div className="text-5xl group-hover:scale-125 transition-transform duration-300">{cat.image}</div>
              <div>
                <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Fruits */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">This Week's Specials</h2>
            <p className="text-gray-400">Sweetest picks and seasonal treasures direct from local farms.</p>
          </div>
          <Link to="/shop" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
            View Shop <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.slice(0, 4).map((prod) => (
            <div
              key={prod.id}
              className="group rounded-2xl glass overflow-hidden border border-gray-800 flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              {/* Product Image */}
              <div className="aspect-[4/3] w-full overflow-hidden relative bg-gray-900">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => toggleWishlist(prod)}
                  className="absolute top-3 right-3 p-2 bg-gray-900/60 rounded-full hover:bg-rose-600/80 text-white transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      wishlist.some((item) => item.id === prod.id) ? 'fill-rose-500 text-rose-500' : 'text-gray-300'
                    }`}
                  />
                </button>
                {prod.stock <= 15 && (
                  <span className="absolute bottom-3 left-3 bg-amber-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Only {prod.stock} Left!
                  </span>
                )}
              </div>

              {/* Product Meta */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{prod.category}</span>
                  <Link to={`/product/${prod.id}`} className="block">
                    <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {prod.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 line-clamp-2">{prod.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                  <div>
                    <span className="text-xl font-bold text-white">${prod.price}</span>
                    <span className="text-xs text-gray-500 ml-1">/ {prod.unit}</span>
                  </div>
                  <button
                    onClick={() => addToCart(prod)}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                    title="Add to Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl glass border border-gray-800 space-y-4 text-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-xl">100% Certified Organic</h3>
          <p className="text-sm text-gray-400">Every fruit is tested for chemical residue and pesticide-free purity.</p>
        </div>

        <div className="p-8 rounded-2xl glass border border-gray-800 space-y-4 text-center">
          <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center mx-auto border border-sky-500/20 text-sky-400">
            <Truck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-xl">Cold-Chain Delivery</h3>
          <p className="text-sm text-gray-400">We ship in humidity-controlled vans so your fruits arrive fresh and chilled.</p>
        </div>

        <div className="p-8 rounded-2xl glass border border-gray-800 space-y-4 text-center">
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto border border-amber-500/20 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-xl">AI-Driven Nutrition</h3>
          <p className="text-sm text-gray-400">Tailor your basket to fit your specific fitness target and vitamin deficiencies.</p>
        </div>
      </section>

      {/* Farmer Sourcing & Stories */}
      <section className="rounded-3xl glass border border-gray-800 p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 animate-bounce" /> Farmer-To-Customer Tracking
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Know Exactly Where Your Food Grows</h2>
            <p className="text-gray-300 leading-relaxed">
              We verify the origin of every harvest batch. Meet our farmers, read their soil preservation practices, and inspect the precise geolocation mapping from their field straight to your doorstep.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex gap-4">
                <img
                  src="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=80&q=80"
                  alt="Farmer John"
                  className="w-12 h-12 rounded-full object-cover border border-emerald-500"
                />
                <div>
                  <h4 className="font-bold text-white">Farmer John</h4>
                  <p className="text-xs text-emerald-400">Napa Valley, CA • Organic Apples & Berries</p>
                </div>
              </div>
              <div className="flex gap-4">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80"
                  alt="Farmer Maria"
                  className="w-12 h-12 rounded-full object-cover border border-emerald-500"
                />
                <div>
                  <h4 className="font-bold text-white">Farmer Maria</h4>
                  <p className="text-xs text-emerald-400">Sunny Glades, FL • Fresh Oranges & Mangoes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sourcing Visual */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 flex flex-col justify-center items-center text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400 animate-pulse">
              <Star className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Blockchain Farmer Ledger Active</h3>
              <p className="text-xs text-gray-500 mt-1">Select any product on the shop to inspect harvest dates and soil lab reports.</p>
            </div>
            <Link
              to="/shop"
              className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500 hover:text-[#0b0f19] transition-all cursor-pointer"
            >
              Explore Sourcing Ledger
            </Link>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Recurring Freshness Subscriptions</h2>
          <p className="text-gray-400">Never run out of fresh fruits. Zero obligation, pause or cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Weekly Box */}
          <div className="p-8 rounded-2xl glass border border-gray-800 flex flex-col justify-between relative hover:border-emerald-500/30 transition-colors">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Weekly Refill</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Smart Fruit Box</h3>
                </div>
                <span className="text-3xl font-extrabold text-white">$24.99 <span className="text-xs text-gray-500 font-medium">/ week</span></span>
              </div>
              <p className="text-sm text-gray-400">
                A custom box of 5kg fresh seasonal fruits selected by our AI based on your diet preferences.
              </p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2">✓ Seasonal variety customized for you</li>
                <li className="flex items-center gap-2">✓ Geolocation tracked delivery</li>
                <li className="flex items-center gap-2">✓ Double loyalty reward points</li>
              </ul>
            </div>
            <Link
              to="/dashboard"
              className="w-full mt-8 bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-bold py-3.5 rounded-xl text-center flex justify-center items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              Subscribe Weekly
            </Link>
          </div>

          {/* Monthly Box */}
          <div className="p-8 rounded-2xl glass border border-emerald-500/30 flex flex-col justify-between relative hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-500/5">
            <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-[#0b0f19] font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full border border-emerald-300 shadow-md">
              Best Value
            </span>
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">Monthly Box</span>
                  <h3 className="text-2xl font-bold text-white mt-1">Healthy Family Pack</h3>
                </div>
                <span className="text-3xl font-extrabold text-white">$79.99 <span className="text-xs text-gray-500 font-medium">/ month</span></span>
              </div>
              <p className="text-sm text-gray-400">
                A larger 20kg pack designed to support 3-4 family members for the entire month. Delivered in 4 weekly splits.
              </p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2">✓ 4 custom delivery drops per month</li>
                <li className="flex items-center gap-2">✓ Full customization control inside dashboard</li>
                <li className="flex items-center gap-2">✓ Free nutrition consultant session</li>
              </ul>
            </div>
            <Link
              to="/dashboard"
              className="w-full mt-8 bg-gradient-to-r from-emerald-400 to-teal-500 text-[#0b0f19] font-bold py-3.5 rounded-xl text-center flex justify-center items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              Subscribe Monthly
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
