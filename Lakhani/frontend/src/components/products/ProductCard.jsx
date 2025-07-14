import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { Plus, Minus, Heart, Settings, Star } from "lucide-react";
import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, wishlistItems } =
    useWishlist();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (product && product._id && wishlistItems && wishlistItems.length > 0) {
      const isInList = wishlistItems.some(
        (item) => item.product._id === product._id
      );
      setInWishlist(isInList);
    } else {
      setInWishlist(false);
    }
  }, [product, wishlistItems]);

  const handleAddToCart = () => {
    addToCart({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      qty: 1,
    });
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please login to add items to your wishlist");
      return;
    }

    if (inWishlist) {
      await removeFromWishlist(product._id);
      setInWishlist(false);
    } else {
      const success = await addToWishlist(product._id);
      if (success) {
        setInWishlist(true);
      }
    }
  };

  return (
    <div
      className="p-4 mb-8 rounded transition-all duration-300 hover:bg-gray-900 hover:shadow-xl group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative mb-2 overflow-hidden">
        {/* Wishlist icon on top right corner - always visible */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 ${
            inWishlist
              ? "bg-amber-600 text-white"
              : "bg-gray-800/70 text-white hover:bg-amber-600"
          }`}
        >
          <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
        </button>

        <Link to={`/product/${product._id}`} className="block">
          <img
            src={product.image}
            alt={product.name}
            className="w-full transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {product.secondaryImage && (
          <Link
            to={`/product/${product._id}`}
            className="absolute top-0 left-0 w-full transition-opacity duration-500"
            style={{
              opacity: isHovered ? 1 : 0,
              visibility: isHovered ? "visible" : "hidden",
            }}
          >
            <img
              src={product.secondaryImage}
              alt={product.name}
              className="w-full transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        )}

        {/* Quick view button */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transform transition-all duration-500 ease-in-out"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateY(0)" : "translateY(20px)",
            visibility: isHovered ? "visible" : "hidden",
          }}
        >
          <Link
            to={`/product/${product._id}`}
            className="bg-gray-800 text-white py-3 px-4 text-center block rounded hover:bg-amber-600 transition-colors duration-300 transform hover:-translate-y-1"
          >
            Quick View
          </Link>
        </div>
      </div>

      <div className="text-center relative">
        <div className="mb-2.5 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
          {product.categories &&
            product.categories.map((category, idx) => (
              <span key={idx}>
                <Link
                  to={`/products?category=${category}`}
                  className="text-gray-400 hover:text-amber-600 transition-colors duration-300"
                >
                  {category}
                  {idx < product.categories.length - 1 && ", "}
                </Link>
              </span>
            ))}
        </div>

        <h3 className="text-base font-bold capitalize relative pb-4 mb-3 before:content-[''] before:bg-gradient-to-r before:from-transparent before:via-gray-700 before:to-transparent before:h-px before:w-full before:absolute before:bottom-0 before:left-0 group-hover:text-amber-600 transition-colors duration-300">
          <Link
            to={`/product/${product._id}`}
            className="text-white group-hover:text-amber-600 transition-colors duration-300"
          >
            {product.name}
          </Link>
        </h3>

        <div className="transition-all duration-300 group-hover:transform group-hover:scale-105">
          {product.oldPrice && (
            <span className="text-gray-500 text-sm mr-1 line-through font-normal">
              GBP. {product.oldPrice.toFixed(2)}
            </span>
          )}
          <span className="text-base font-medium text-amber-600">
            GBP. {product.price.toFixed(2)}
          </span>
        </div>

        <div
          className="absolute top-full left-0 right-0 z-10 bg-gray-900 px-4 py-5 shadow-xl w-full transition-all duration-500 border-t border-amber-600/30"
          style={{
            opacity: isHovered ? 1 : 0,
            visibility: isHovered ? "visible" : "hidden",
            transform: isHovered ? "translateY(0)" : "translateY(-10px)",
          }}
        >
        

          <div className="mb-4 relative pb-3.5 before:content-[''] before:bg-gradient-to-r before:from-transparent before:via-gray-700 before:to-transparent before:h-px before:w-full before:absolute before:bottom-0 before:left-0">
            <p className="text-sm text-gray-400 line-clamp-2">
              {product.description?.substring(0, 80)}...
            </p>
          </div>

          <div className="flex justify-center space-x-2">
            <button
              onClick={handleAddToCart}
              className="bg-gray-800 h-10 px-6 text-sm font-medium text-gray-300 hover:bg-amber-600 hover:text-white transition-all duration-300 rounded-full transform hover:scale-105"
            >
              Add to Cart
            </button>

            <button
              onClick={handleToggleWishlist}
              className={`w-10 h-10 flex items-center justify-center ${
                inWishlist
                  ? "bg-amber-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-amber-600 hover:text-white"
              } transition-colors duration-300 rounded-full transform hover:scale-105`}
            >
              <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
