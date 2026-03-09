import { useState, useEffect } from "react"; 
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/cartcontext";
import { authFetch } from "../../utils/auth"; 

function CheckoutPage() {
    const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        payment_method: "COD",
    });
    
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        authFetch(`${DJANGO_BASE_URL}/api/profile/`)
            .then(res => res.json())
            .then(data => {
                setFormData(prev => ({
                    ...prev,
                    name: data.username || "", 
                    phone: data.phone_number || "",  
                    address: data.address || ""     
                }));
            })
            .catch(err => console.error("Profile fetch failed", err));
    }, [DJANGO_BASE_URL]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    // --- FIXED CALCULATION ---
    const totalOrderPrice = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.product_price) || 0;
        return acc + (price * item.quantity);
    }, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return setError("Your cart is empty!");

        const pkPhoneRegex = /^03\d{9}$/;
        if (!pkPhoneRegex.test(formData.phone)) {
            return setError("Enter a valid Pakistani number (e.g., 03XXXXXXXXX)");
        }
        
        setLoading(true);
        try {
            const response = await authFetch(`${DJANGO_BASE_URL}/api/order/create/`, {
                method: "POST",
                body: JSON.stringify({
                    ...formData,
                    items: cartItems.map(item => ({
                        product: item.product, // Assuming item.product is the ID
                        quantity: item.quantity
                    }))
                }),
            });

            if (response.ok) {
                clearCart(); 
                setIsSuccess(true); 
                setTimeout(() => navigate("/"), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Order processing failed.");
            }
        } catch (err) {
            setError("Connection failed. Check your network.");
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">✓</div>
                    <h2 className="text-4xl font-black text-gray-900 mb-2">Order Confirmed!</h2>
                    <p className="text-gray-500 mb-8">We've sent a confirmation email to your registered address.</p>
                    <div className="inline-block px-8 py-3 bg-gray-900 text-white rounded-full font-bold">Redirecting you...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] pt-28 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Finalize Purchase</h1>
                    <p className="text-gray-500 mt-2 font-medium">Complete your details to finish the order.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-7 space-y-8">
                        {/* Shipping Form Section */}
                        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-8">
                                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                <h3 className="text-xl font-bold">Shipping Information</h3>
                            </div>
                            
                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Recipient Name</label>
                                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Contact Number</label>
                                        <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Complete Address</label>
                                    <textarea required name="address" value={formData.address} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all outline-none h-32 resize-none" />
                                </div>
                            </div>
                        </section>

                        {/* Payment Method Section */}
                        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-8">
                                <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                <h3 className="text-xl font-bold">Payment Method</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.payment_method === 'COD' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100'}`}>
                                    <input type="radio" name="payment_method" value="COD" checked={formData.payment_method === 'COD'} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300" />
                                    <div className="ml-4">
                                        <p className="font-bold text-gray-900">Cash on Delivery</p>
                                        <p className="text-xs text-gray-500">Pay when you receive</p>
                                    </div>
                                </label>
                                <label className={`relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.payment_method === 'ONLINE' ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 opacity-50'}`}>
                                    <input type="radio" name="payment_method" value="ONLINE" checked={formData.payment_method === 'ONLINE'} onChange={handleChange} className="w-4 h-4 text-blue-600 border-gray-300" />
                                    <div className="ml-4">
                                        <p className="font-bold text-gray-900">Online Payment</p>
                                        <p className="text-xs text-gray-500">Credit Card / Wallet</p>
                                    </div>
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary Sidebar */}
                    <div className="lg:col-span-5">
                        <div className="bg-[#111827] text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl sticky top-28">
                            <h3 className="text-2xl font-black mb-8">Order Summary</h3>
                            
                            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-medium">
                                            {item.quantity}x <span className="text-white ml-1">{item.product_name}</span>
                                        </span>
                                        {/* Row total for each item */}
                                        <span className="font-bold">${(parseFloat(item.product_price) * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-800 pt-6 space-y-3">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span>${totalOrderPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-green-400 font-bold uppercase text-xs">Free</span>
                                </div>
                                <div className="flex justify-between text-xl font-black pt-4">
                                    <span>Total</span>
                                    <span className="text-blue-400">${totalOrderPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            {error && <div className="mt-6 text-red-400 text-xs font-bold bg-red-400/10 p-4 rounded-xl border border-red-400/20">{error}</div>}

                            <button 
                                onClick={handleSubmit}
                                disabled={loading || cartItems.length === 0}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl mt-8 transition-all active:scale-[0.98] disabled:bg-gray-700 disabled:text-gray-500"
                            >
                                {loading ? "Authorizing..." : "Place Order Now"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;