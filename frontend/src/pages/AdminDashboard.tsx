import React, { useEffect, useState } from 'react';
import { useApp } from '../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, TrendingUp, ShoppingBag, Users, AlertTriangle, RefreshCw, BarChart } from 'lucide-react';
import { API_BASE_URL } from '../config';

export const AdminDashboard: React.FC = () => {
  const { token, user } = useApp();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Products list for stock editor
  const [products, setProducts] = useState<any[]>([]);
  const [adjustingStockId, setAdjustingStockId] = useState<number | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);

  const fetchAdminData = () => {
    if (!token) return;
    setLoading(true);

    // Fetch dashboard aggregations
    fetch(`${API_BASE_URL}/api/orders/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert('Access denied: Admin only.');
          navigate('/');
        } else {
          setStats(data);
        }
      })
      .catch((err) => console.error(err));

    // Fetch full products list to edit stock
    fetch(`${API_BASE_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!token || user?.role !== 'ADMIN') {
      alert('Access restricted to administrators.');
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [token]);

  // Adjust order status via API
  const handleStatusChange = (orderId: number, newStatus: string) => {
    if (!token) return;

    fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          // Success, reload stats orders
          setStats((prev: any) => {
            if (!prev) return null;
            return {
              ...prev,
              orders: prev.orders.map((o: any) =>
                o.id === orderId ? { ...o, status: newStatus } : o
              ),
            };
          });
        }
      })
      .catch((err) => console.error(err));
  };

  // Adjust product stock via API (triggers Socket broadcast!)
  const handleStockUpdate = (productId: number) => {
    if (!token) return;

    fetch(`${API_BASE_URL}/api/products/${productId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stock: newStockVal }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          // Success, close form & update local state
          setAdjustingStockId(null);
          setProducts((prev) =>
            prev.map((p) => (p.id === productId ? { ...p, stock: newStockVal } : p))
          );
          // Refresh low stock count in stats
          fetch(`${API_BASE_URL}/api/orders/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((d) => {
              if (d.lowStockProducts) {
                setStats((prev: any) => ({
                  ...prev,
                  lowStockProducts: d.lowStockProducts,
                }));
              }
            });
        }
      })
      .catch((err) => console.error(err));
  };

  const openStockForm = (prod: any) => {
    setAdjustingStockId(prod.id);
    setNewStockVal(prod.stock);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Admin header */}
      <div className="text-left flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Management Panel</h1>
          <p className="text-gray-400 text-sm">Real-time control tower for stock adjustments and delivery triggers.</p>
        </div>
      </div>

      {/* Analytics widgets */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-2">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Revenues</span>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">₹{stats.totalSales.toFixed(2)}</div>
            <div className="text-[10px] text-gray-500">Gross checkouts processed</div>
          </div>

          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-2">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats.totalOrders}</div>
            <div className="text-[10px] text-gray-500">Cumulative sales drops</div>
          </div>

          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-2">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Active Customers</span>
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{stats.totalCustomers}</div>
            <div className="text-[10px] text-gray-500">Registered member profiles</div>
          </div>

          <div className="p-6 rounded-2xl glass border border-gray-800 text-left space-y-2">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-xs font-bold uppercase tracking-wider">Low Stock Warnings</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-500">{stats.lowStockProducts.length}</div>
            <div className="text-[10px] text-gray-500">Items below 15 units remaining</div>
          </div>
        </div>
      )}

      {/* Grid: Left: Stock Editor, Right: Order status dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Products Stock adjustments */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass border border-gray-800 text-left space-y-4">
          <h3 className="font-bold text-white text-lg border-b border-gray-800 pb-3 flex items-center gap-1.5">
            <BarChart className="w-5 h-5 text-emerald-400" /> Real-time Stock Manager
          </h3>
          <p className="text-xs text-gray-400 leading-normal">
            Adjusting counts here updates SQLite and broadcasts a websocket event. Keep the Shop page open in a side window to watch counters tick live.
          </p>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="p-3.5 rounded-xl border border-gray-850 bg-[#0b0f19] flex justify-between items-center gap-4"
              >
                <div className="flex gap-3 items-center">
                  <img src={prod.image} alt={prod.name} className="w-11 h-11 rounded-lg object-cover" />
                  <div>
                    <h4 className="font-bold text-white text-xs line-clamp-1">{prod.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">CURRENT STOCK: {prod.stock} {prod.unit}</p>
                  </div>
                </div>

                {adjustingStockId === prod.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={newStockVal}
                      onChange={(e) => setNewStockVal(parseInt(e.target.value) || 0)}
                      className="w-16 bg-gray-900 border border-gray-800 rounded-lg py-1 px-2 text-xs text-white text-center focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleStockUpdate(prod.id)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-bold text-[10px] py-1.5 px-2 rounded-lg cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setAdjustingStockId(null)}
                      className="text-gray-400 text-xs py-1 px-1.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openStockForm(prod)}
                    className="bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-semibold py-1.5 px-3 rounded-lg border border-gray-750 transition-colors cursor-pointer"
                  >
                    Adjust Stock
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Dispatch pipeline manager */}
        <div className="lg:col-span-6 p-6 rounded-2xl glass border border-gray-800 text-left space-y-4">
          <h3 className="font-bold text-white text-lg border-b border-gray-800 pb-3 flex items-center gap-1.5">
            🚚 Delivery Pipeline Dispatcher
          </h3>
          <p className="text-xs text-gray-400 leading-normal">
            Transition order stages. Moving a dropdown fires socket.io room rooms, animating customer tracking cards instantly.
          </p>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {(!stats || stats.orders.length === 0) ? (
              <p className="text-sm text-gray-500">No checkout orders registered in system yet.</p>
            ) : (
              stats.orders.map((ord: any) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-xl border border-gray-850 bg-[#0b0f19] flex justify-between items-center gap-4"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 font-bold">ORDER ID: #{ord.id}</span>
                    <h4 className="font-bold text-white text-xs">{ord.user?.name || 'Guest'}</h4>
                    <p className="text-[10px] text-emerald-400 font-semibold">₹{ord.total.toFixed(2)}</p>
                  </div>

                  <select
                    value={ord.status}
                    onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                    className="bg-gray-900 border border-gray-800 rounded-lg py-1.5 px-3 text-xs text-gray-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="PLACED">Placed</option>
                    <option value="PACKED">Packed</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default AdminDashboard;
