import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Trash2, ShoppingCart, X, AlertCircle } from "lucide-react";

const WishList = () => {
  const { wishlistItems, loading, removeFromWishlist, clearWishlist } =
    useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    setIsEmpty(!wishlistItems || wishlistItems.length === 0);
  }, [wishlistItems]);

  const handleAddToCart = (item) => {
    addToCart({
      product: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      qty: 1,
    });
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const handleClearWishlist = () => {
    if (window.confirm("Are you sure you want to clear your wishlist?")) {
      clearWishlist();
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle size={48} className="text-amber-600 mb-4" />
            <h2 className="text-2xl font-semibold text-white mb-4">
              Please Login to Access Your Wishlist
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
              You need to be logged in to view and manage your wishlist. Please
              login or create an account to continue.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="bg-amber-600 text-white px-6 py-2 rounded font-medium hover:bg-amber-700 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border border-amber-600 text-amber-600 px-6 py-2 rounded font-medium hover:bg-amber-600 hover:text-white transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-6">My Wishlist</h1>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        ) : isEmpty ? (
          <div className="py-16 text-center border border-gray-800 rounded-lg">
            <div className="max-w-md mx-auto">
              <img
                src="/images/icon/empty-wishlist.svg"
                alt="Empty Wishlist"
                className="h-32 mb-6 mx-auto opacity-60"
                onError={(e) => {
                  e.target.onError = null;
                  e.target.src = "";
                  e.target.style.display = "none";
                }}
              />
              <h2 className="text-xl font-semibold text-white mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-gray-400 mb-6">
                Add items to your wishlist to save them for later. Items in your
                wishlist will be saved here for you to purchase when you're
                ready.
              </p>
              <Link
                to="/products"
                className="bg-amber-600 text-white px-6 py-3 rounded-full inline-block font-medium hover:bg-amber-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="mb-10">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearWishlist}
                className="flex items-center text-sm text-gray-400 hover:text-amber-600 transition-colors"
              >
                <Trash2 size={16} className="mr-1" /> Clear Wishlist
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="min-w-full divide-y divide-gray-800">
                {/* Table Header */}
                <div className="bg-gray-800 px-6 py-4 grid grid-cols-12 items-center">
                  <div className="col-span-5 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Product
                  </div>
                  <div className="col-span-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Price
                  </div>
                  <div className="col-span-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date Added
                  </div>
                  <div className="col-span-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-800">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.product._id}
                      className="px-6 py-4 grid grid-cols-12 items-center hover:bg-gray-800/30"
                    >
                      {/* Product */}
                      <div className="col-span-5 flex items-center">
                        <Link
                          to={`/product/${item.product._id}`}
                          className="flex-shrink-0 h-16 w-16 bg-gray-800 rounded overflow-hidden mr-4"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </Link>
                        <div className="overflow-hidden">
                          <Link
                            to={`/product/${item.product._id}`}
                            className="text-white hover:text-amber-600 font-medium line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          {item.product.categories && (
                            <div className="text-xs text-gray-400 mt-1">
                              {item.product.categories.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-2 text-center">
                        <span className="text-amber-600 font-medium">
                          £{item.product.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Date Added */}
                      <div className="col-span-2 text-center text-gray-400 text-sm">
                        {new Date(item.addedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 flex justify-center space-x-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="bg-amber-600 text-white text-xs px-4 py-2 rounded-full flex items-center hover:bg-amber-700 transition-colors"
                        >
                          <ShoppingCart size={14} className="mr-1" /> Add to
                          Cart
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveFromWishlist(item.product._id)
                          }
                          className="border border-gray-700 text-gray-400 p-2 rounded-full hover:border-red-500 hover:text-red-500 transition-colors"
                          title="Remove from wishlist"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Link
                to="/products"
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default WishList;
