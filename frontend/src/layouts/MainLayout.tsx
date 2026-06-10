import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { ShoppingBag, Heart, User, LogOut, ShieldAlert, Sparkles, Sprout } from 'lucide-react';
import { subscribeToInventory } from '../services/socket';
import { API_BASE_URL } from '../config';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, cart, wishlist } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [stockAlert, setStockAlert] = useState<{ name: string; stock: number } | null>(null);

  // Subscribe to real-time inventory updates for Low Stock Alert Banner
  useEffect(() => {
    const unsubscribe = subscribeToInventory((data) => {
      // If stock drops below 15, we show a global toast/banner
      if (data.stock <= 15) {
        // Fetch details of product
        fetch(`${API_BASE_URL}/api/products/${data.productId}`)
          .then((res) => res.json())
          .then((json) => {
            if (json.product) {
              setStockAlert({ name: json.product.name, stock: data.stock });
              // Clear alert after 6 seconds
              setTimeout(() => {
                setStockAlert(null);
              }, 6000);
            }
          })
          .catch((err) => console.error(err));
      }
    });

    return () => unsubscribe();
  }, []);

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      {/* Real-time stock low alert banner */}
      {stockAlert && (
        <div className="bg-gradient-to-r from-amber-600 to-red-600 py-3 px-4 text-center text-sm font-semibold flex items-center justify-center gap-2 animate-bounce fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full shadow-2xl border border-amber-400 glass max-w-sm w-full mx-4">
          <ShieldAlert className="w-5 h-5 text-amber-200 animate-pulse" />
          <span>Hurry! Only <span className="underline font-extrabold text-white">{stockAlert.stock}</span> left of <span className="text-white font-bold">{stockAlert.name}</span>!</span>
          <button onClick={() => setStockAlert(null)} className="ml-auto text-white hover:text-gray-200 cursor-pointer">×</button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:rotate-12 transition-transform duration-300">
              <Sprout className="w-6 h-6 text-[#0b0f19] font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                FreshBasket <span className="text-gradient font-black">AI</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase -mt-1 flex items-center gap-0.5">
                Smart Sourced <Sparkles className="w-2.5 h-2.5" />
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link
              to="/"
              className={`hover:text-emerald-400 transition-colors ${
                location.pathname === '/' ? 'text-emerald-400 font-bold border-b-2 border-emerald-500 pb-1' : 'text-gray-300'
              }`}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className={`hover:text-emerald-400 transition-colors ${
                location.pathname === '/shop' ? 'text-emerald-400 font-bold border-b-2 border-emerald-500 pb-1' : 'text-gray-300'
              }`}
            >
              Shop Fruits
            </Link>
            <Link
              to="/dashboard"
              className={`hover:text-emerald-400 transition-colors ${
                location.pathname === '/dashboard' ? 'text-emerald-400 font-bold border-b-2 border-emerald-500 pb-1' : 'text-gray-300'
              }`}
            >
              My Subscriptions
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500 hover:text-[#0b0f19] transition-all flex items-center gap-1.5"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Link to="/shop" className="relative p-2 text-gray-400 hover:text-emerald-400 transition-colors">
              <Heart className="w-6 h-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative p-2 text-gray-400 hover:text-emerald-400 transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3 border-l border-gray-800 pl-4">
                <div className="hidden lg:block text-right">
                  <div className="text-xs text-gray-400 font-medium">Hello,</div>
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-[#0b0f19] font-bold px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/10 active:scale-95 transition-all"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-950/40 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-[#0b0f19]" />
            </div>
            <span className="text-lg font-bold text-white">
              FreshBasket <span className="text-gradient font-black">AI</span>
            </span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 FreshBasket AI Inc. Smart Sourced Organic Farmer-To-Customer Platform.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/shop" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link to="/shop" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
            <Link to="/shop" className="hover:text-emerald-400 transition-colors">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default MainLayout;
