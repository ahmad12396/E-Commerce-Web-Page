import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const DJANGO_BASE_URL =
    import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

  // Check if product.image is already a full URL
  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : `${DJANGO_BASE_URL}${product.image}`;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 mb-4 inline-block w-full"
    >
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-48 w-full object-cover group-hover:scale-105 transition-all duration-500"
          // Fallback if image fails to load
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/400x300?text=No+Image+Found";
          }}
        />
      </div>
      
      <div className="py-4">
        <h2 className="text-lg font-semibold text-gray-800 px-4 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h2>
        <p className="text-blue-600 font-bold px-4 mt-1">
          $ {product.price}
        </p>
        {product.description && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2 px-4 italic">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  );
}

export default ProductCard;