import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function SignupPage() {
    const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password_confirm: ""
    });
    
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const response = await fetch(`${DJANGO_BASE_URL}/api/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                navigate("/login", { state: { message: "Account created! Please log in." } });
            } else {
                setErrors(data);
            }
        } catch (err) {
            setErrors({ non_field_errors: "Server connection failed." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 flex justify-center items-center">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-[#111827] mb-2">Create Account</h2>
                        <p className="text-gray-500">Join us to start shopping</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <input 
                                required name="username" placeholder="Username" 
                                value={formData.username} onChange={handleChange}
                                className={`w-full p-4 bg-gray-50 border ${errors.username ? 'border-red-400' : 'border-gray-100'} rounded-2xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all`} 
                            />
                            {errors.username && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.username[0]}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <input 
                                required type="email" name="email" placeholder="Email Address" 
                                value={formData.email} onChange={handleChange}
                                className={`w-full p-4 bg-gray-50 border ${errors.email ? 'border-red-400' : 'border-gray-100'} rounded-2xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all`} 
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.email[0]}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <input 
                                required type="password" name="password" placeholder="Password (min. 8 chars)" 
                                value={formData.password} onChange={handleChange}
                                className={`w-full p-4 bg-gray-50 border ${errors.password ? 'border-red-400' : 'border-gray-100'} rounded-2xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all`} 
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.password[0]}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <input 
                                required type="password" name="password_confirm" placeholder="Confirm Password" 
                                value={formData.password_confirm} onChange={handleChange}
                                className={`w-full p-4 bg-gray-50 border ${errors.password_confirm ? 'border-red-400' : 'border-gray-100'} rounded-2xl text-gray-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all`} 
                            />
                            {errors.password_confirm && <p className="text-red-500 text-xs mt-1 ml-2 font-medium">{errors.password_confirm[0]}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#111827] text-white font-extrabold py-5 rounded-[1.5rem] mt-4 hover:bg-[#1f2937] transition-all shadow-xl active:scale-[0.97] disabled:bg-gray-200"
                        >
                            {loading ? "Creating Account..." : "Register Now"}
                        </button>
                    </form>

                    <div className="mt-8 text-center border-t border-gray-50 pt-6">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="text-blue-600 font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;