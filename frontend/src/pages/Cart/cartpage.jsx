import { useCart } from "../../context/cartcontext";
import { Link } from "react-router-dom";

function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, loading} = useCart();
    const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

    const subtotal = cartItems.reduce((acc, item) => {
        const price = parseFloat(item.product_price) || 0;
        return acc + (price * item.quantity);
    }, 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center bg-white p-12 rounded-[3rem] shadow-xl max-w-md w-full border border-gray-100">
                    <div className="text-7xl mb-6 animate-bounce">🛒</div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Your cart is empty</h1>
                    <p className="text-gray-500 mb-10 font-medium">Looks like you haven't added any items yet. Start exploring our collection!</p>
                    <Link to="/" className="block w-full bg-[#111827] text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg">
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        
        <div className="min-h-screen bg-[#fcfcfc] pt-28 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Navigation breadcrumb */}
                <Link to="/" className="text-sm font-bold text-blue-600 hover:text-blue-700 mb-10 inline-flex items-center transition-colors">
                    <span className="mr-2 text-lg">←</span> Back to Shopping
                </Link>
                
                <h1 className="text-4xl font-black text-gray-900 mb-12 tracking-tight">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT COLUMN: ITEM LIST (8 Columns) */}
                    <div className="lg:col-span-8 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm flex items-center border border-gray-100 hover:shadow-md transition-shadow">
                                {/* Product Image */}
                                <div className="w-28 h-28 flex-shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 p-2">
                                    {item.image && (
                                        <img
                                            src={item.image.startsWith('http') ? item.image : `${DJANGO_BASE_URL}${item.image}`}
                                            alt={item.product_name}
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                </div>
                                
                                {/* Product Info */}
                                <div className="ml-6 flex-grow">
                                    <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{item.product_name}</h2>
                                    <p className="text-blue-600 font-bold mt-1">${parseFloat(item.product_price).toFixed(2)}</p>
                                    
                                    {/* Quantity Controls */}
                                    <div className="mt-4 flex items-center space-x-6">
                                        <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1">
                                            <button 
                                                onClick={() => updateQuantity(item.product, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all"
                                            >−</button>
                                            <span className="px-4 text-sm font-black text-gray-800">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition-all"
                                            >+</button>
                                        </div>
                                        
                                        <button
                                            onClick={() => removeFromCart(item.product)}
                                            className="text-xs font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Item Total Price */}
                                <div className="text-right hidden md:block">
                                    <p className="text-xl font-black text-gray-900">
                                        ${(parseFloat(item.product_price) * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        
                        <div className="pt-4 px-2">
                            <button 
                                onClick={clearCart}
                                className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                            >
                                Empty Cart
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: ORDER SUMMARY (4 Columns) */}
                    <div className="lg:col-span-4">
                        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100 sticky top-28">
                            <h2 className="text-2xl font-black text-gray-900 mb-8">Summary</h2>
                            
                            <div className="space-y-5 mb-8">
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 font-medium">
                                    <span>Shipping</span>
                                    <span className="text-green-500 font-black text-xs uppercase bg-green-50 px-3 py-1 rounded-full">Free</span>
                                </div>
                                
                                <div className="border-t border-dashed border-gray-200 pt-6 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Estimated Total</span>
                                    <span className="text-3xl font-black text-blue-600 tracking-tight">${subtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="block w-full bg-[#111827] text-white text-center font-black py-5 rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
                            >
                                Checkout Now
                            </Link>
                            
                            <div className="mt-8 space-y-4">
                                <div className="flex items-center space-x-3 text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payment</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default CartPage;