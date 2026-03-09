import { useState, useEffect } from "react";
import AdminLayout from "../../components/adminlayout";

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    const DJANGO_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
    const token = localStorage.getItem("access_token");

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${DJANGO_URL}/api/admin/users/?search=${search}`, {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleToggleStaff = async (userId) => {
        try {
            const res = await fetch(`${DJANGO_URL}/api/admin/users/toggle-staff/${userId}/`, {
                method: "PATCH",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (res.ok) {
                fetchUsers();
            } else {
                const errorData = await res.json();
                alert(errorData.error || "Action failed");
            }
        } catch (err) {
            console.error("Toggle error:", err);
        }
    };

    if (loading) return (
        <AdminLayout>
            <div className="flex items-center justify-center h-64 font-black text-blue-600 animate-pulse uppercase tracking-widest text-xs">
                Syncing User Directory...
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            {/* HEADER & SEARCH */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Directory</h1>
                    <p className="text-gray-500 font-medium text-sm">Manage permissions and view account activity.</p>
                </div>
                
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Search by username or email..."
                        className="w-full px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* USERS TABLE */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5">User</th>
                                <th className="px-8 py-5">Joined Date</th>
                                <th className="px-8 py-5">Orders</th>
                                <th className="px-8 py-5">Role</th>
                                <th className="px-8 py-5">Account Status</th>
                                <th className="px-8 py-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-xs uppercase">
                                                {user.username.substring(0, 2)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{user.username}</span>
                                                <span className="text-[11px] text-gray-400 font-medium">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-gray-600 font-medium">
                                        {user.date_joined}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-gray-900">{user.order_count}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Orders</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            user.is_staff 
                                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                                        }`}>
                                            {user.is_staff ? "Staff / Admin" : "Customer"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="text-xs font-bold text-gray-700">{user.is_active ? 'Active' : 'Deactivated'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button 
                                            onClick={() => handleToggleStaff(user.id)}
                                            className={`text-[10px] font-black uppercase tracking-tighter transition-all hover:underline ${
                                                user.is_staff ? 'text-orange-600' : 'text-blue-600'
                                            }`}
                                        >
                                            {user.is_staff ? "Revoke Access" : "Make Staff"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

export default AdminUsers;