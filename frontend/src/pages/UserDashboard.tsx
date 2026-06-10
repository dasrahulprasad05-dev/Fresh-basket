import React, { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Compass, Calendar, CheckCircle, RefreshCw, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { joinOrderTracking, subscribeToOrderStatus } from '../services/socket';
import { API_BASE_URL } from '../config';

export const UserDashboard: React.FC = () => {
  const { token, user } = useApp();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Live order tracking detail
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<any | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>('');

  const fetchDashboardData = () => {
    if (!token) return;
    setLoading(true);

    // Fetch historical orders
    fetch(`${API_BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) {
          setOrders(data.orders);
          // Set first order as tracking target by default if exists
          if (data.orders.length > 0) {
            handleSelectTracking(data.orders[0]);
          }
        }
      })
      .catch((err) => console.error(err));

    // Fetch subscription details
    fetch(`${API_BASE_URL}/api/orders/subscription`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.subscriptions) {
          setSubscriptions(data.subscriptions);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchDashboardData();
  }, [token]);

  // Set up WebSocket tracking listener when selecting an order to track
  const handleSelectTracking = (order: any) => {
    setSelectedTrackingOrder(order);
    setLiveStatus(order.status);
    
    // 1. Send join socket room message
    joinOrderTracking(order.id);
  };

  // Subscribe to live order status socket events
  useEffect(() => {
    const unsubscribe = subscribeToOrderStatus((data) => {
      // Check if this matches our currently tracked order
      if (selectedTrackingOrder && data.orderId === selectedTrackingOrder.id) {
        setLiveStatus(data.status);

        // Update local orders list state as well
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === data.orderId ? { ...o, status: data.status } : o
          )
        );
      }
    });

    return () => unsubscribe();
  }, [selectedTrackingOrder]);

  const handleCancelSubscription = (subId: number) => {
    if (!token) return;
    if (!confirm('Are you sure you want to cancel this subscription plan?')) return;

    fetch(`${API_BASE_URL}/api/orders/subscription/${subId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Reload dashboard
        fetchDashboardData();
      })
      .catch((err) => console.error(err));
  };

  const handleSubscribe = (type: string) => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/orders/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type }),
    })
      .then((res) => res.json())
      .then((data) => {
        fetchDashboardData();
      })
      .catch((err) => console.error(err));
  };

  const orderStages = ['PLACED', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const getStageIndex = (status: string) => orderStages.indexOf(status);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Dashboard header */}
      <div className="text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Customer Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Manage subscriptions, orders, and view live cold-chain tracking.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Orders & Subscriptions */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Active Subscriptions Box */}
          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-6">
            <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-gray-800 pb-3">
              <Calendar className="w-5 h-5 text-emerald-400" /> Active Nutrition Subscriptions
            </h3>

            {subscriptions.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  No active subscriptions found. Subscribe to a recurring box to save 15% on organic items.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Smart Fruit Box</h4>
                      <p className="text-xs text-gray-500 mt-1">₹1,999/week • 5kg custom items</p>
                    </div>
                    <button
                      onClick={() => handleSubscribe('WEEKLY_BOX')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      Subscribe Weekly <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">Healthy Family Pack</h4>
                      <p className="text-xs text-gray-500 mt-1">₹6,499/month • 20kg items</p>
                    </div>
                    <button
                      onClick={() => handleSubscribe('MONTHLY_FAMILY')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                    >
                      Subscribe Monthly <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-gray-850 bg-[#0b0f19] flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        {sub.status === 'ACTIVE' ? 'Active Subscription' : 'Cancelled Plan'}
                      </span>
                      <h4 className="font-bold text-white text-sm">
                        {sub.type === 'WEEKLY_BOX' ? 'Smart Fruit Box' : 'Healthy Family Pack'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Next Delivery Drop: {new Date(sub.nextDelivery).toLocaleDateString()}
                      </p>
                    </div>

                    {sub.status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleCancelSubscription(sub.id)}
                        className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 py-1.5 px-3 rounded-lg cursor-pointer"
                      >
                        Cancel Box
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-500 bg-gray-900 border border-gray-850 py-1 px-3.5 rounded-lg">
                        Inactive
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders History list */}
          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-4">
            <h3 className="font-bold text-white text-lg flex items-center gap-2 border-b border-gray-800 pb-3">
              <Package className="w-5 h-5 text-emerald-400" /> Order History
            </h3>

            {orders.length === 0 ? (
              <p className="text-sm text-gray-400">You haven't placed any fruit orders yet.</p>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => handleSelectTracking(ord)}
                    className={`p-4 rounded-xl border transition-all flex justify-between items-center cursor-pointer ${
                      selectedTrackingOrder?.id === ord.id
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : 'border-gray-850 bg-[#0b0f19] hover:border-gray-850 hover:bg-gray-900/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-xs text-gray-500 font-semibold">ORDER ID: #{ord.id}</span>
                      <h4 className="font-bold text-white text-sm">
                        Placed on {new Date(ord.createdAt).toLocaleDateString()}
                      </h4>
                      <p className="text-xs text-gray-400">Total: ₹{ord.total.toFixed(2)}</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                        }`}
                      >
                        {ord.status}
                      </span>
                      <p className="text-[10px] text-emerald-400 font-semibold underline block">Track Live</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Live tracking pipeline map/tracker */}
        <div className="lg:col-span-5">
          {selectedTrackingOrder ? (
            <div className="p-6 rounded-2xl glass border border-emerald-500/15 text-left space-y-8 sticky top-28 shadow-xl shadow-emerald-500/2">
              <div className="border-b border-gray-800 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white text-base">Live Cold-Chain Tracking</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Order ID: #{selectedTrackingOrder.id}</p>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Socket
                </span>
              </div>

              {/* Progress visual tracker */}
              <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-800">
                {orderStages.map((stage, idx) => {
                  const currentIdx = getStageIndex(liveStatus);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={stage} className="relative flex items-center gap-4">
                      {/* Node circle */}
                      <span
                        className={`absolute -left-[27px] w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500 text-[#0b0f19] shadow-lg shadow-emerald-500/20'
                            : 'bg-[#0b0f19] border-gray-800 text-gray-500'
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle className="w-3.5 h-3.5 fill-[#0b0f19] stroke-2" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-700"></span>
                        )}
                      </span>

                      {/* Content details */}
                      <div className="text-left space-y-0.5">
                        <h4
                          className={`text-sm font-bold tracking-tight transition-colors ${
                            isCurrent
                              ? 'text-emerald-400'
                              : isDone
                              ? 'text-white'
                              : 'text-gray-500'
                          }`}
                        >
                          {stage === 'PLACED'
                            ? 'Order Placed'
                            : stage === 'PACKED'
                            ? 'Fresh Packed'
                            : stage === 'OUT_FOR_DELIVERY'
                            ? 'Out for Delivery'
                            : 'Safely Delivered'}
                        </h4>
                        <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                          {stage === 'PLACED' && 'AI matching complete. Sourcing fruits from Napa Valley fields.'}
                          {stage === 'PACKED' && 'Certified residue check passed. Loaded into cold transport box.'}
                          {stage === 'OUT_FOR_DELIVERY' && 'Courier driving cold-chain van equipped with GPS tracking.'}
                          {stage === 'DELIVERED' && 'Delivered to shipping address. Enjoy your fresh fruits!'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery map card */}
              <div className="bg-[#0b0f19] border border-gray-850 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs text-gray-400 font-bold uppercase">Transit Logistics</h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-gray-300">
                  <span className="text-white font-semibold">Address:</span> {selectedTrackingOrder.address}
                </p>
                <p className="text-[10px] text-gray-500">
                  Secure packaging integrity verified. RFID cold sensor: <span className="text-emerald-400 font-bold">4.2°C (Optimal)</span>
                </p>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-2xl glass border border-gray-800 text-center space-y-4">
              <Compass className="w-12 h-12 text-emerald-500 mx-auto animate-pulse" />
              <h3 className="font-bold text-white text-base">Select Order to Track</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Click on any of your order history blocks to inspect live status telemetry updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;
