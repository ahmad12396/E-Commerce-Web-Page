import { useState, useEffect } from "react"; 
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/cartcontext";
import { tokenUtils, authFetch } from "../utils/auth";

const Navbar = () => {
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation(); // Hook to detect current URL
    
    const [isLoggedIn, setIsLoggedIn] = useState(tokenUtils.isAuthenticated());
    const [userProfile, setUserProfile] = useState(null);

    // --- LOGIC: HIDE NAVBAR ON ADMIN PAGES ---
    // This prevents the customer nav from overlapping the Admin Dashboard Sidebar
    const isAdminPath = location.pathname.startsWith("/admin");
    if (isAdminPath) return null;

    useEffect(() => {
        const checkAuth = tokenUtils.isAuthenticated();
        setIsLoggedIn(checkAuth);

        if (checkAuth) {
            // Fetch profile data using the authFetch utility (which handles JWT)
            authFetch(`${import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000"}/api/profile/`)
                .then(res => res.ok ? res.json() : null)
                .then(data => data && setUserProfile(data))
                .catch(err => console.error("Navbar profile fetch failed", err));
        } else {
            setUserProfile(null);
        }
    }, [location.pathname]); // Re-run when user moves between pages

    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    const handleLogout = () => {
        tokenUtils.removeTokens();
        setIsLoggedIn(false); 
        setUserProfile(null);
        navigate("/login");
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-100 fixed w-full z-50 top-0 left-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    
                    {/* LEFT: BRAND LOGO */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">
                            SHOP.pk
                        </Link>
                    </div>

                    {/* RIGHT: NAVIGATION LINKS */}
                    <div className="flex items-center space-x-5">
                        <Link 
                            to="/" 
                            className="text-gray-500 hover:text-blue-600 font-semibold transition-colors hidden md:block"
                        >
                            Explore
                        </Link>

                        {/* CART ICON (Only for logged in users) */}
                        {isLoggedIn && (
                            <Link to="/cart" className="relative p-2 group">
                                <svg className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartItemCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                        {cartItemCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* AUTHENTICATION SECTION */}
                        <div className="flex items-center border-l pl-5 border-gray-100 space-x-4">
                            {isLoggedIn ? (
                                <div className="flex items-center space-x-4">
                                    {/* PROFILE MINI-LINK */}
                                    <Link to="/profile" className="flex items-center space-x-2 group">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs font-black text-gray-900 leading-none">
                                                {userProfile?.username || "Account"}
                                            </p>
                                            <p className="text-[10px] text-blue-600 font-bold">Settings</p>
                                        </div>
                                        <img 
                                            src={userProfile?.avatar || `https://ui-avatars.com/api/?name=${userProfile?.username || 'User'}&background=random`} 
                                            alt="User Profile" 
                                            className="w-9 h-9 rounded-full object-cover border-2 border-gray-50 group-hover:border-blue-200 transition-all shadow-sm"
                                        />
                                    </Link>

                                    {/* LOGOUT BUTTON */}
                                    <button 
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Logout"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link to="/login" className="text-gray-500 hover:text-blue-600 font-bold text-sm">
                                        Sign In
                                    </Link>
                                    <Link 
                                        to="/signup" 
                                        className="bg-[#111827] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg"
                                    >
                                        Join Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;