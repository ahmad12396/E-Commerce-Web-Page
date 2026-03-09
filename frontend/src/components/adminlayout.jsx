import { Link, useNavigate, useLocation } from "react-router-dom";

function AdminLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/admin/login");
    };

    const navLinks = [
        { path: "/admin/dashboard", label: "Dashboard" },
        { path: "/admin/products", label: "Manage Products" },
        { path: "/admin/orders", label: "Orders" },
        { path: "/admin/users", label: "Customers" },
    ];

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            {/* SIDEBAR */}
            <aside className="w-64 bg-[#0f172a] text-white hidden md:flex flex-col p-6 sticky top-0 h-screen">
                <h2 className="text-xl font-black tracking-tighter mb-10 text-blue-400">STORE PANEL</h2>
                <nav className="space-y-2 flex-grow">
                    {navLinks.map((link) => (
                        <Link 
                            key={link.path}
                            to={link.path} 
                            className={`block px-4 py-3 rounded-xl font-bold transition-all ${
                                location.pathname === link.path ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'hover:bg-white/10'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <button onClick={handleLogout} className="mt-auto px-4 py-3 text-red-400 font-bold hover:bg-red-500/10 rounded-xl text-left">
                    Logout
                </button>
            </aside>
            <main className="flex-1 p-8">{children}</main>
        </div>
    );
}
export default AdminLayout;