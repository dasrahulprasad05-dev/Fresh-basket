import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Search, SlidersHorizontal, Heart, ShoppingCart, RefreshCw, AlertTriangle } from 'lucide-react';
import { subscribeToInventory } from '../services/socket';
import { API_BASE_URL } from '../config';

export const Shop: React.FC = () => {
  const location = useLocation();
  const { addToCart, toggleWishlist, wishlist } = useApp();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');
  const [sortOption, setSortOption] = useState('');
  
  // Highlight helper: tracks which product ID was recently updated in real-time
  const [highlightedProductId, setHighlightedProductId] = useState<number | null>(null);

  // Parse category from URL query parameters (e.g. from Category click on Home)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [location]);

  // Fetch products function
  const fetchProducts = () => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/products?`;
    if (selectedCategory) url += `category=${selectedCategory}&`;
    if (selectedSeason) url += `season=${selectedSeason}&`;
    if (searchTerm) url += `search=${searchTerm}&`;
    if (sortOption) url += `sort=${sortOption}&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedSeason, sortOption]); // Fetch immediately when filters change

  // Subscribe to real-time inventory adjustments via Socket
  useEffect(() => {
    const unsubscribe = subscribeToInventory((data) => {
      // Find and update the product stock locally
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === data.productId ? { ...p, stock: data.stock } : p
        )
      );

      // Flash highlight on the item card to show real-time update
      setHighlightedProductId(data.productId);
      setTimeout(() => {
        setHighlightedProductId(null);
      }, 2000);
    });

    return () => unsubscribe();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSeason('');
    setSortOption('');
    // Re-fetch default
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      });
  };

  const categories = ['Citrus', 'Berries', 'Tropical', 'Melons', 'Stone Fruit'];
  const seasons = ['Summer', 'Autumn', 'Winter', 'Spring', 'All'];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-left space-y-2">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Shop Organic Fruits</h1>
        <p className="text-gray-400 text-sm">
          Real-time inventory synced via WebSockets. Try adjusting inventory in the Admin panel to watch stock counters update here instantly.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6 glass border border-gray-800 p-6 rounded-2xl h-fit">
          <div className="flex justify-between items-center pb-4 border-b border-gray-800">
            <h2 className="font-bold text-white flex items-center gap-2 text-lg">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" /> Filters
            </h2>
            <button
              onClick={handleResetFilters}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search fruits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <Search className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
            <button type="submit" className="hidden">Search</button>
          </form>

          {/* Categories Filter */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider">Category</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                  selectedCategory === '' ? 'bg-emerald-500/15 text-emerald-400 font-bold' : 'text-gray-400 hover:bg-gray-900/60'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                    selectedCategory === cat ? 'bg-emerald-500/15 text-emerald-400 font-bold' : 'text-gray-400 hover:bg-gray-900/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Seasons Filter */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider">Season</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSeason('')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  selectedSeason === ''
                    ? 'bg-emerald-500 text-[#0b0f19] border-emerald-500 font-bold'
                    : 'bg-[#0b0f19] text-gray-400 border-gray-800 hover:border-gray-700'
                }`}
              >
                All
              </button>
              {seasons.map((season, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSeason(season)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selectedSeason === season
                      ? 'bg-emerald-500 text-[#0b0f19] border-emerald-500 font-bold'
                      : 'bg-[#0b0f19] text-gray-400 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  {season}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting Option */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wider">Sort By</h3>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl py-3 px-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">Default sorting</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="stock_desc">Highest Stock</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
              <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
              <p className="text-gray-400 font-medium text-sm">Harvesting catalog data...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 glass border border-gray-800 rounded-2xl p-8">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
              <h3 className="text-xl font-bold text-white">No products found</h3>
              <p className="text-gray-400 text-sm max-w-sm text-center">
                Try resetting your filter parameters or search terms to find fresh fruits.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-bold px-6 py-2.5 rounded-xl cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => {
                const isHighlighted = highlightedProductId === prod.id;
                return (
                  <div
                    key={prod.id}
                    className={`group rounded-2xl glass overflow-hidden border transition-all duration-300 flex flex-col justify-between ${
                      isHighlighted
                        ? 'border-emerald-400 bg-emerald-500/5 shadow-2xl scale-[1.03]'
                        : 'border-gray-800 hover:-translate-y-1 hover:shadow-xl hover:border-gray-700/80'
                    }`}
                  >
                    {/* Visual Highlights */}
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
                            wishlist.some((item) => item.id === prod.id)
                              ? 'fill-rose-500 text-rose-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>

                      {/* Stock Badge with websocket indicator */}
                      <span
                        className={`absolute bottom-3 left-3 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                          prod.stock === 0
                            ? 'bg-red-600 text-white'
                            : prod.stock <= 15
                            ? 'bg-amber-600 text-white animate-pulse'
                            : 'bg-emerald-600/90 text-white'
                        }`}
                      >
                        {isHighlighted && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>}
                        {prod.stock === 0 ? 'Out of stock' : `Stock: ${prod.stock} ${prod.unit}`}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          {prod.category} • {prod.season} Season
                        </span>
                        <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {prod.name}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2">{prod.description}</p>
                      </div>

                      {/* Call to actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-800/80">
                        <div className="text-left">
                          <span className="text-xl font-bold text-white">₹{prod.price}</span>
                          <span className="text-xs text-gray-500 ml-1">/ {prod.unit}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => (window.location.href = `/product/${prod.id}`)}
                            className="bg-gray-800 hover:bg-gray-700 text-xs font-semibold px-3 py-2 rounded-xl text-gray-300 border border-gray-700 transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                          <button
                            disabled={prod.stock === 0}
                            onClick={() => addToCart(prod)}
                            className={`p-2.5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer ${
                              prod.stock === 0
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] hover:shadow-lg'
                            }`}
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Shop;
