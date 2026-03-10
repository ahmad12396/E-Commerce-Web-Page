import { useEffect, useState, useRef } from "react";
import ProductCard from "../../components/product_card";

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisualSearch, setIsVisualSearch] = useState(false);
  
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null); // Ref to scroll to results
  const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (isVisualSearch && searchQuery === "") return;
    const delayDebounceFn = setTimeout(() => fetchProducts(), 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    const fetchUrl = searchQuery 
      ? `${DJANGO_BASE_URL}/api/products/?search=${encodeURIComponent(searchQuery)}`
      : `${DJANGO_BASE_URL}/api/products/`;

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Connection to server failed");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setIsVisualSearch(false);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleImageSearch = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("search_image", file); 

    try {
      const response = await fetch(`${DJANGO_BASE_URL}/api/search/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Image processing failed");
      }

      const matchedProducts = await response.json();
      setProducts(matchedProducts);
      setIsVisualSearch(true);
      setSearchQuery("");
      setLoading(false);
      
      // Auto-scroll to results after a short delay
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setIsVisualSearch(false);
    setError(null);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            {!isVisualSearch ? "Explore Catalog" : products.length > 0 ? "Exact Match Found" : "Item Not Found"}
          </h1>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full mb-8"></div>
          
          {/* Search Bar Container */}
          <div className="max-w-xl mx-auto relative flex items-center bg-white rounded-2xl border-2 border-gray-100 shadow-lg focus-within:border-blue-500 transition-all px-4 py-1">
            <input
              type="text"
              placeholder="Search or upload image..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 outline-none text-gray-700 font-medium"
              disabled={isVisualSearch} 
            />
            <div className="flex items-center border-l-2 border-gray-100 pl-4 ml-2">
              <button 
                onClick={() => fileInputRef.current.click()}
                className={`p-2 rounded-xl transition-all ${isVisualSearch ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600'}`}
                title="Strict Visual Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSearch} />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 max-w-md mx-auto animate-bounce">
              ⚠️ <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div ref={resultsRef} className="scroll-mt-32">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading Skeleton
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-white rounded-3xl animate-pulse shadow-sm border border-gray-100"></div>
              ))
            ) : products.length > 0 ? (
              products.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
              // No Results Found State
              <div className="col-span-full py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 text-center shadow-inner">
                <span className="text-6xl block mb-4">🔍</span>
                <h2 className="text-2xl font-bold text-gray-800">No Exact Matches</h2>
                <p className="text-gray-500 mt-2">We couldn't find this specific product in our inventory.</p>
                <button onClick={handleReset} className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                  Return to Store
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsList;