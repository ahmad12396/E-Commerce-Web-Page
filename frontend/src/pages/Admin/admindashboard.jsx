import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/adminlayout"; // Adjust path as needed

function AdminDashboard() {
    const [data, setData] = useState({ 
        stats: [], 
        categories: [], 
        recent_orders: [] 
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem("access_token");
            if (!token) {
                navigate("/admin/login");
                return;
            }

            try {
                const response = await fetch(`${DJANGO_BASE_URL}/api/admin/stats/`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                } else if (response.status === 401 || response.status === 403) {
                    navigate("/admin/login");
                }
            } catch (error) {
                console.error("Dashboard Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate, DJANGO_BASE_URL]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <AdminLayout>
            {/* HEADER */}
            <header className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 font-medium">Welcome back, Admin.</p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs">AD</div>
                    <span className="text-sm font-bold text-gray-700">Management Mode</span>
                </div>
            </header>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {data.stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color || 'text-gray-900'}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RECENT ORDERS TABLE */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                        <Link to="/admin/orders" className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Order ID</th>
                                    <th className="px-8 py-4">Customer</th>
                                    <th className="px-8 py-4">Amount</th>
                                    <th className="px-8 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {data.recent_orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 font-bold">#ORD-{order.id}</td>
                                        <td className="px-8 py-5 text-gray-600 font-medium">{order.customer}</td>
                                        <td className="px-8 py-5 font-black text-gray-900">${order.total.toFixed(2)}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CATEGORY SUMMARY */}
                <div className="bg-[#0f172a] text-white rounded-[2.5rem] p-8 shadow-xl">
                    <h3 className="text-lg font-bold mb-6 text-blue-400">Inventory Mix</h3>
                    <div className="space-y-6">
                        {data.categories.map((cat, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                                    <span className="text-gray-400">{cat.name}</span>
                                    <span>{cat.p_count} Items</span>
                                </div>
                                <div className="w-full bg-white/10 h-1.5 rounded-full">
                                    <div 
                                        className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                                        style={{ width: `${Math.min((cat.p_count / 20) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminDashboard;