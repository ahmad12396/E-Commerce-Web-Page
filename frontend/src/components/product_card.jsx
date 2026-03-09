import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const DJANGO_BASE_URL =
    import.meta.env.VITE_DJANGO_BASE_URL  || "http://127.0.0.1:8000";
  return (
    <Link
      to={`/products/${product.id}`}
      className="text-blue-500 hover:underline mb-4 inline-block"
    >
      <img
        src={`${DJANGO_BASE_URL}${product.image}`}
        alt={product.name}
        className="h-48 w-full object-cover group-hover:brightness-95 transition-all duration-300"
      />
      <h2 className="text-lg font-semibold text-gray-800 font-medium px-4">
        {product.name}
      </h2>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 px-4">
        {product.price}
      </p>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2 px-4">
        {product.description}
      </p>
    </Link>
  );
}
export default ProductCard;
