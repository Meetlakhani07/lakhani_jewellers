import { createContext, useContext, useState, useEffect } from "react";
import { wishlistService } from "../services/api";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await wishlistService.getWishlist();
      setWishlistItems(data.items || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load your wishlist");
    } finally {
      setLoading(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (productId) => {
    if (!user) {
      toast.info("Please login to add items to your wishlist");
      return false;
    }

    try {
      setLoading(true);
      const { data } = await wishlistService.addToWishlist(productId);
      setWishlistItems(data.items);
      toast.success("Item added to wishlist");
      return true;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to add item to wishlist";

      if (!errorMsg.includes("already in wishlist")) {
        toast.error(errorMsg);
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data } = await wishlistService.removeFromWishlist(productId);
      setWishlistItems(data.items);
      toast.success("Item removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item from wishlist");
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await wishlistService.clearWishlist();
      setWishlistItems([]);
      toast.success("Wishlist cleared");
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast.error("Failed to clear wishlist");
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product._id === productId);
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext;
