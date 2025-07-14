// src/context/CartContext.jsx
import { createContext, useReducer, useContext, useEffect } from "react";

const CartContext = createContext();

const initialCartState = {
  items: [],
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE_CART":
      return {
        ...state,
        items: action.payload,
      };
    case "ADD_ITEM":
      const existingItem = state.items.find(
        (item) => item.product === action.payload.product
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.product === action.payload.product
              ? { ...item, qty: item.qty + action.payload.qty }
              : item
          ),
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload],
        };
      }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.product === action.payload.product
            ? { ...item, qty: action.payload.qty }
            : item
        ),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.product !== action.payload),
      };
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Initialize cart from localStorage on component mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            dispatch({ type: "INITIALIZE_CART", payload: parsedCart });
          } else {
            // Handle invalid cart format
            localStorage.removeItem("cart");
          }
        }
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        localStorage.removeItem("cart");
      }
    };

    loadCart();
  }, []);

  // Calculate total price safely
  const totalPrice = state.items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.items) {
      localStorage.setItem("cart", JSON.stringify(state.items));
    }
  }, [state.items]);

  const addToCart = (item) => {
    if (!item || !item.product || !item.name) {
      console.error("Invalid item data:", item);
      return;
    }
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const updateQuantity = (productId, qty) => {
    if (!productId || qty < 1) {
      console.error("Invalid update data:", { productId, qty });
      return;
    }
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { product: productId, qty },
    });
  };

  const removeFromCart = (productId) => {
    if (!productId) {
      console.error("Invalid product ID for removal");
      return;
    }
    dispatch({ type: "REMOVE_ITEM", payload: productId });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  // Helper method to check if cart has items
  const hasItems = state.items.length > 0;

  return (
    <CartContext.Provider
      value={{
        cart: state.items,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        hasItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
