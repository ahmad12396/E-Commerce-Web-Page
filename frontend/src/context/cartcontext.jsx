import { useState, createContext, useContext, useEffect, useMemo } from "react";
import { authFetch, tokenUtils } from "../utils/auth";

const cartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || "http://127.0.0.1:8000";

  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const price = item.product?.price || 0;
      return acc + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const fetchCart = async () => {
    if (!tokenUtils.isAuthenticated()) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch(`${DJANGO_BASE_URL}/api/cart/`);
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart_items || []);
      } else if (response.status === 401) {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product) => {
    if (!tokenUtils.isAuthenticated()) return;

    try {
      const response = await authFetch(`${DJANGO_BASE_URL}/api/cart/add/`, {
        method: "POST",
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      if (response.ok) {
        await fetchCart(); 
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await authFetch(`${DJANGO_BASE_URL}/api/cart/remove/`, {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    try {
      const response = await authFetch(`${DJANGO_BASE_URL}/api/cart/update/`, {
        method: "POST",
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <cartContext.Provider
      value={{
        cartItems,
        totalPrice,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        fetchCart, 
      }}
    >
      {children}
    </cartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(cartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};