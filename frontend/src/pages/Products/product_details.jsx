import { useParams, Link, useNavigate } from "react-router-dom"; 
import { useEffect, useState } from "react";
import { useCart } from "../../context/cartcontext";
import { authFetch, tokenUtils } from "../../utils/auth"; 

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart(); 
  const [showToast, setShowToast] = useState(false);

  const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    authFetch(`${DJANGO_BASE_URL}/api/products/${id}/`)
      .then((response) => {
        if (!response.ok) throw new Error("Product not found");
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [DJANGO_BASE_URL, id]);

 const HandleAddToCart = async () => {
  if (!tokenUtils.isAuthenticated()) {
    navigate("/login");
    return;
  }

  try {
    await addToCart(product);
    setShowToast(true);
    
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 3000);
    
    return () => clearTimeout(timer); 
  } catch (err) {
    console.error("Failed to add to cart:", err);
  }
};

  // if (loading) return (
  //   <div className="min-h-screen flex items-center justify-center">
  //     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  //   </div>
  // );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10">
      <p className="text-red-500 mb-4 font-bold text-xl">Error: {error.message}</p>
      <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Return to Shop</Link>
    </div>
  );

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 relative overflow-x-hidden">
      
      {/* --- TOPPER TAG NOTIFICATION --- */}
      <div 
        className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out transform ${
          showToast && !loading ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-[#111827] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-gray-700 whitespace-nowrap">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <p className="font-bold tracking-wide text-sm md:text-base">
            Success! <span className="text-blue-400">{product.name}</span> added to cart.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <Link to="/" className="text-gray-500 hover:text-blue-600 mb-8 inline-flex items-center transition-colors font-medium group">
          <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> Back to Shop
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-8 md:p-16">
            
            {/* Product Image Section */}
            <div className="bg-gray-50 rounded-[2rem] p-8 flex items-center justify-center border border-gray-50 relative group">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-[400px] w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">
                  Premium Collection
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-[#111827] mb-6 tracking-tight leading-tight">
                {product.name}
              </h1>
              
              <p className="text-gray-500 text-lg mb-8 leading-relaxed font-medium">
                {product.description}
              </p>
              
              <div className="flex items-center mb-10 gap-4">
                <span className="text-5xl font-black text-blue-600 tracking-tighter">
                  ${product.price}
                </span>
                <div className="flex flex-col">
                   <span className="text-gray-400 line-through text-sm font-bold">
                    ${(product.price * 1.2).toFixed(2)}
                  </span>
                  <span className="text-green-500 text-[10px] font-black uppercase">
                    Save 20%
                  </span>
                </div>
              </div>

              <button 
                onClick={HandleAddToCart} 
                className="w-full md:w-auto bg-[#111827] hover:bg-blue-600 text-white font-black py-5 px-12 rounded-2xl transition-all duration-300 shadow-xl shadow-blue-900/10 active:scale-95 text-center uppercase tracking-widest text-sm"
              >
                Add to Cart
              </button>

              {/* Trust Badges */}
              <div className="mt-10 pt-8 border-t border-gray-50 flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-600">✓</div>
                  In Stock
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-600">✓</div>
                  Free Delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;