import { useState, useEffect } from "react";
import AdminLayout from "../../components/adminlayout";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const DJANGO_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${DJANGO_URL}/api/admin/orders/all/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (res.ok) {
          const finalData = Array.isArray(data) ? data : (data.results || []);
          setOrders(finalData);
        }
      } catch (err) {
        console.error("The request failed completely:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
    else setLoading(false);
  }, [token, DJANGO_URL]);

  const getStatusStyle = (status) => {
    const styles = {
      Pending: "bg-orange-100 text-orange-700 border-orange-200",
      Shipped: "bg-purple-100 text-purple-700 border-purple-200",
      Delivered: "bg-green-100 text-green-700 border-green-200",
    };
    return styles[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64 font-black text-blue-600 animate-pulse text-xs uppercase">
        Loading Orders...
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900">Order Management</h1>
        <p className="text-gray-500 font-medium text-sm">Real-time store transactions.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Products Bought</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6 text-xs font-black text-gray-400">#ORD-{order.id}</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{order.customer}</span>
                        {/* If your serializer doesn't send email yet, this will just be blank */}
                        <span className="text-[11px] text-gray-400 font-medium">{order.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-600 font-medium">{order.date}</td>
                    
                    {/* UPDATED ITEMS COLUMN */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">
                                x{item.quantity}
                              </span>
                              <span className="text-xs font-bold text-gray-700">{item.product_name}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">No items found</span>
                        )}
                      </div>
                    </td>

                    <td className="px-8 py-6 font-black text-gray-900 text-base">
                     ${order.total_price ? Number(order.total_price).toFixed(2) : "0.00"}
                    </td>
                    
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-bold uppercase text-xs">
                    No orders found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOrders;