import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Trash2, ShoppingBag, Plus, Minus, Tag, Calculator, Sparkles } from 'lucide-react';

export const Cart: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useApp();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [nutrition, setNutrition] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    vitamins: string[];
  } | null>(null);

  // Recalculate nutrition summary whenever cart items change
  useEffect(() => {
    if (cart.length === 0) {
      setNutrition(null);
      return;
    }

    // Call backend endpoint to aggregate nutrition mathematics
    const bodyItems = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    fetch('http://localhost:5000/api/recommendations/nutrition', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: bodyItems }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.nutrition) {
          setNutrition(data.nutrition);
        }
      })
      .catch((err) => console.error(err));
  }, [cart]);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    const success = applyCoupon(couponCode);
    if (success) {
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code. Try FRESH20 or HEALTHY10.');
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = coupon ? (subtotal * coupon.discount) / 100 : 0;
  const shipping = subtotal > 30 || subtotal === 0 ? 0 : 4.99;
  const total = subtotal - discountAmount + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-16 glass border border-gray-800 rounded-3xl mt-12">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-gray-400 text-sm">Fill your basket with organic goodness and trace their origin.</p>
        <Link
          to="/shop"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Shopping Basket</h1>
        <p className="text-gray-400 text-sm mt-1">Review your seasonal fruit selections and checkout safely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => (
            <div
              key={item.product.id}
              className="glass border border-gray-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-left"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-20 h-20 rounded-xl object-cover"
              />

              <div className="flex-1 space-y-1 w-full text-center sm:text-left">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{item.product.category}</span>
                <h3 className="font-bold text-white text-base leading-tight line-clamp-1">{item.product.name}</h3>
                <p className="text-xs text-gray-500">${item.product.price} / {item.product.unit}</p>
              </div>

              {/* Quantity incrementor */}
              <div className="flex items-center gap-3 bg-[#0b0f19] border border-gray-850 px-3 py-1.5 rounded-xl">
                <button
                  onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-white w-6 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Price calculation */}
              <div className="text-center sm:text-right min-w-[70px] w-full sm:w-auto">
                <span className="font-bold text-white text-lg">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>

              <button
                onClick={() => removeFromCart(item.product.id)}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                title="Remove Item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          {/* Dynamic aggregate nutrition calculator (Wow factor) */}
          {nutrition && (
            <div className="p-6 rounded-2xl glass border border-emerald-500/20 text-left space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Basket Combined Nutrition Analysis</h3>
                <span className="ml-auto text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Computed
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-850">
                  <div className="text-2xl font-black text-white">{nutrition.calories}</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Calories (kcal)</div>
                </div>
                <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-850">
                  <div className="text-2xl font-black text-emerald-400">{nutrition.protein}g</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Protein</div>
                </div>
                <div className="bg-[#0b0f19] p-4 rounded-xl border border-gray-850">
                  <div className="text-2xl font-black text-sky-400">{nutrition.carbs}g</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">Carbohydrates</div>
                </div>
              </div>

              {nutrition.vitamins.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Accumulated Vitamins & Minerals:</h4>
                  <div className="flex flex-wrap gap-2">
                    {nutrition.vitamins.map((vit, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-lg border border-emerald-500/20 font-medium"
                      >
                        ✓ {vit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Code Panel */}
          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-400" /> Apply Discount Coupon
            </h3>

            {coupon ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400">COUPON: {coupon.code}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5">{coupon.discount}% Discount Applied</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. FRESH20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-[#0b0f19] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-4 rounded-xl border border-gray-700 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-400 font-semibold">{couponError}</p>}
                <p className="text-[10px] text-gray-500 leading-tight">
                  💡 Hint: Enter <span className="text-white font-bold">FRESH20</span> for 20% off or <span className="text-white font-bold">HEALTHY10</span> for 10% off.
                </p>
              </form>
            )}
          </div>

          {/* Totals panel */}
          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-4">
            <h3 className="font-bold text-white text-base border-b border-gray-800 pb-3">Checkout Summary</h3>

            <div className="space-y-2.5 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon ({coupon.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-white font-medium">
                  {shipping === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[10px] text-gray-500 text-right leading-tight">
                  Add <span className="text-white font-bold">${(30 - subtotal).toFixed(2)}</span> more to unlock free shipping!
                </p>
              )}
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-gray-800">
              <span className="font-bold text-white text-base">Total Cost</span>
              <span className="font-extrabold text-emerald-400 text-2xl">${total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-bold py-4 rounded-xl text-center flex justify-center items-center gap-2 active:scale-95 transition-all text-base cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Cart;
