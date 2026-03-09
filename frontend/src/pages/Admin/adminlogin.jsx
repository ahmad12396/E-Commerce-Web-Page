import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const [credentials, setCredentials] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    
    const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); 

        try {
            const response = await fetch(`${DJANGO_BASE_URL}/api/admin/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("access_token", data.access);
                localStorage.setItem("refresh_token", data.refresh); 
                navigate("/admin/dashboard");
            } else {
                setError(data.detail || "Access Denied: Admin privileges required.");
            }
        } catch (err) {
            setError("Server connection failed. Please check if Django is running.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
            <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
                    <p className="text-gray-500 mt-2 font-medium">Please sign in to continue</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-900"
                            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-gray-900"
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                            <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                        </div>
                    )}

                    <button className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95">
                        Enter Dashboard
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;