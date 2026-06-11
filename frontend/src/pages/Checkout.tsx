import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { ShieldCheck, MapPin, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { API_BASE_URL } from '../config';

export const Checkout: React.FC = () => {
  const { cart, coupon, clearCart, token } = useApp();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = coupon ? (subtotal * coupon.discount) / 100 : 0;
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 99;
  const total = subtotal - discountAmount + shipping;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Please sign in or register to complete your order.');
      return;
    }

    if (!address || !name || !city || !zipCode) {
      setError('Please complete all shipping address fields.');
      return;
    }

    setLoading(true);

    const checkoutItems = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const fullAddressString = `${name}, ${address}, ${city}, ${zipCode}`;

    fetch(`${API_BASE_URL}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: checkoutItems,
        address: fullAddressString,
        paymentMethod,
        couponCode: coupon?.code || null,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
        } else {
          // Success! Trigger beautiful confetti celebration
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
          });

          // Clear cart
          clearCart();
          
          // Redirect to User Dashboard order status tracking
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Checkout transaction failed. Please try again.');
        setLoading(false);
      });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-16 glass border border-gray-800 rounded-3xl mt-12">
        <h2 className="text-xl font-bold text-white">No Items for Checkout</h2>
        <p className="text-gray-400 text-sm">Add delicious organic fruits to your basket first.</p>
        <Link to="/shop" className="inline-block bg-emerald-500 text-[#0b0f19] font-bold px-6 py-2.5 rounded-xl">
          View Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Checkout Order</h1>
        <p className="text-gray-400 text-sm mt-1">Specify your shipping address and payment method to complete purchase.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm text-left max-w-4xl mx-auto">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error} {!token && <Link to="/auth" className="underline font-bold">Sign In here.</Link>}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto">
        {/* Shipping details form */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-5">
            <h3 className="font-bold text-white text-base flex items-center gap-1.5 border-b border-gray-800 pb-3">
              <MapPin className="w-5 h-5 text-emerald-400" /> Shipping Destination
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">Receiver Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl py-3 px-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="123 Orchard Ave"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl py-3 px-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase">City</label>
                <input
                  type="text"
                  required
                  placeholder="San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl py-3 px-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase">Zip / Postal Code</label>
                <input
                  type="text"
                  required
                  placeholder="94103"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-800 rounded-xl py-3 px-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-1.5 border-b border-gray-800 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-400" /> Payment Settings
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {['Card', 'PayPal', 'COD'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-[#0b0f19] border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  {method === 'Card' ? 'Credit Card' : method === 'PayPal' ? 'PayPal' : 'Cash On Delivery'}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Order Items review & submit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-5">
            <h3 className="font-bold text-white text-base border-b border-gray-800 pb-3">Order Summary</h3>

            {/* Item list */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-350 line-clamp-1">{item.product.name} (x{item.quantity})</span>
                  <span className="text-white font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2.5 text-xs text-gray-400 pt-4 border-t border-gray-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              {coupon && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({coupon.code})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-gray-800">
              <span className="font-bold text-white text-sm">Grand Total</span>
              <span className="font-extrabold text-emerald-400 text-xl">₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckoutSubmit}
              type="button"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-[#0b0f19] font-bold py-4 rounded-xl text-center flex justify-center items-center gap-2 active:scale-95 transition-all text-base cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Place Secure Order
                </>
              )}
            </button>

            <div className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Powered by SSL Secure Payment Gateway.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Checkout;
