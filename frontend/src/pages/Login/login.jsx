import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { tokenUtils } from "../../utils/auth";

function LoginPage() {
    const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get the page the user was trying to reach from PrivateRouter state
    const from = location.state?.from?.pathname || "/";

    const [formData, setFormData] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await fetch(`${DJANGO_BASE_URL}/api/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                tokenUtils.setTokens(data.access, data.refresh);
                navigate(from, { replace: true });
            } else {
                setError(data.detail || "Invalid username or password");
            }
        } catch (err) {
            setError("Connection failed. Check your server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 flex justify-center items-center">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 md:p-12">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-[#111827] mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Login to manage your orders</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-sm font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <input 
                                required 
                                name="username" 
                                placeholder="Username" 
                                value={formData.username} 
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder-gray-400 transition-all" 
                            />
                            <input 
                                required 
                                type="password"
                                name="password" 
                                placeholder="Password" 
                                value={formData.password} 
                                onChange={handleChange}
                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 placeholder-gray-400 transition-all" 
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#111827] text-white font-extrabold py-5 rounded-[1.5rem] mt-4 hover:bg-[#1f2937] transition-all shadow-xl active:scale-[0.97] disabled:bg-gray-200"
                        >
                            {loading ? "Authenticating..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-blue-600 font-bold hover:underline">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;