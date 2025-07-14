// Header.jsx
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import {
  Search,
  ShoppingBasket,
  Heart,
  User,
  X,
  Menu,
  Home,
  Info,
} from "lucide-react";
import { categoryService } from "../../services/api";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { cart, totalPrice, removeFromCart } = useCart();

  const wishlistContext = useWishlist ? useWishlist() : { wishlistItems: [] };
  const { wishlistItems } = wishlistContext;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const location = useLocation();

  // State for categories
  const [categories, setCategories] = useState({
    parents: [],
    children: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setCartOpen(false);
    setMobileMenuOpen(false);
  }, [location]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getAllCategories();

        // Extract categories data from the response
        const categoriesData = response.data.categories || response.data;

        if (!Array.isArray(categoriesData)) {
          throw new Error("Invalid data format received from API");
        }

        // Organize categories into parents and children
        const parents = categoriesData.filter((cat) => !cat.parentCategory);
        const children = {};

        // Group children by their parent category ID
        categoriesData.forEach((cat) => {
          if (cat.parentCategory) {
            const parentId =
              typeof cat.parentCategory === "object"
                ? cat.parentCategory._id
                : cat.parentCategory;

            if (!children[parentId]) {
              children[parentId] = [];
            }

            children[parentId].push(cat);
          }
        });

        setCategories({ parents, children });
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to fetch categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Safe calculation for cart quantity
  const getCartQuantity = () => {
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return 0;
    }
    return cart.reduce((total, item) => {
      const qty = item && item.qty ? Number(item.qty) : 0;
      return total + qty;
    }, 0);
  };

  // Safe calculation for total price
  const getFormattedTotalPrice = () => {
    if (!totalPrice && totalPrice !== 0) {
      return "£0.00";
    }
    return `£${Number(totalPrice).toFixed(2)}`;
  };

  // Get wishlist count
  const getWishlistCount = () => {
    if (!wishlistItems || !Array.isArray(wishlistItems)) {
      return 0;
    }
    return wishlistItems.length;
  };

  // Check if cart has items
  const hasCartItems = cart && Array.isArray(cart) && cart.length > 0;

  // Handle category navigation
  const handleCategoryClick = (parentId, childId = null) => {
    const queryParams = new URLSearchParams();

    if (childId) {
      queryParams.set("category", childId);
    } else {
      queryParams.set("category", parentId); 
    }

    navigate({
      pathname: "/products",
      search: queryParams.toString(),
    });

    setMobileMenuOpen(false);
  };
  return (
    <header className="bg-black">
      {/* Top Bar - Account Menu (Hidden on mobile) */}
      <div className="border-b border-gray-800 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end py-2">
            <div className="relative group">
              <a
                href="#"
                className="inline-block py-2 text-white group-hover:text-amber-600 transition-colors"
              >
                My Account <i className="ion-chevron-down text-xs ml-1"></i>
              </a>
              <ul className="absolute hidden right-0 top-full bg-gray-900 min-w-[200px] p-4 z-50 shadow-lg rounded-md group-hover:block">
                {user ? (
                  <>
                    <li className="border-b border-gray-700 py-2">
                      <Link
                        to="/account"
                        className="text-gray-300 hover:text-amber-600 transition-colors"
                      >
                        My Account
                      </Link>
                    </li>
                    <li className="border-b border-gray-700 py-2">
                      <Link
                        to="/myOrders"
                        className="text-gray-300 hover:text-amber-600 transition-colors"
                      >
                        My Orders
                      </Link>
                    </li>
                    <li className="border-b border-gray-700 py-2">
                      <button
                        onClick={logout}
                        className="text-gray-300 hover:text-amber-600 transition-colors w-full text-left"
                      >
                        Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="border-b border-gray-700 py-2">
                      <Link
                        to="/login"
                        className="text-gray-300 hover:text-amber-600 transition-colors"
                      >
                        Login
                      </Link>
                    </li>
                    <li className="border-b border-gray-700 py-2">
                      <Link
                        to="/register"
                        className="text-gray-300 hover:text-amber-600 transition-colors"
                      >
                        Register
                      </Link>
                    </li>
                  </>
                )}
                <li className="border-b border-gray-700 py-2">
                  <Link
                    to="/checkout"
                    className="text-gray-300 hover:text-amber-600 transition-colors"
                  >
                    Checkout
                  </Link>
                </li>
                <li className="border-b border-gray-700 py-2">
                  <Link
                    to="/cart"
                    className="text-gray-300 hover:text-amber-600 transition-colors"
                  >
                    Shopping Cart
                  </Link>
                </li>
                <li className="py-2">
                  <Link
                    to="/wishlist"
                    className="text-gray-300 hover:text-amber-600 transition-colors"
                  >
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Specific Top Bar */}
      <div className="md:hidden bg-black flex items-center justify-between py-2 px-4">
        {/* Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white focus:outline-none z-50"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* My Account Text - Visible on mobile */}
        <div className="text-white">
          {user ? (
            <Link to="/account">My Account</Link>
          ) : (
            <Link to="/login">My Account</Link>
          )}
        </div>
      </div>

      {/* Middle Section - Logo, Search/Cart */}
      <div className="py-4 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Phone Info - Hidden on mobile */}
            <div className="hidden md:flex items-center">
              <div className="mr-4">
                <img src="/images/icon/icon_phone.png" alt="Phone Icon" />
              </div>
              <div className="px-6 border-r-2 border-gray-700">
                <p className="text-amber-600">
                  Inquiry / Helpline:{" "}
                  <a href="tel:07436357152" className="hover:underline">
                    07436357152
                  </a>
                </p>
              </div>
            </div>

            {/* Logo - Centered on mobile */}
            <div className="flex-1 md:flex-none flex justify-center">
              <Link to="/">
                <img
                  src="/images/logo/LJ_Logo.png"
                  alt="Lakhani Jewellers"
                  className="max-h-14 md:max-h-16"
                />
              </Link>
            </div>

            {/* Search, Wishlist, and Cart */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <div className="relative">
                <Link
                  to="/wishlist"
                  className="w-10 h-10 flex items-center justify-center border border-gray-700 rounded-full text-white hover:border-amber-600 transition-colors"
                  title="My Wishlist"
                >
                  <Heart size={18} />
                </Link>
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-amber-600 text-white text-xs rounded-full">
                    {getWishlistCount()}
                  </span>
                )}
              </div>

              {/* Cart */}
              <div className="relative">
                <button
                  onClick={() => setCartOpen(!cartOpen)}
                  className="flex items-center px-4 py-2 border border-gray-700 rounded-full text-white hover:border-amber-600 transition-colors"
                >
                  <ShoppingBasket size={18} className="mr-2" />
                  <span>{getFormattedTotalPrice()}</span>
                </button>

                {/* Cart Item Count */}
                {getCartQuantity() > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 flex items-center justify-center bg-amber-600 text-white text-xs rounded-full">
                    {getCartQuantity()}
                  </span>
                )}

                {/* Mini Cart Drawer */}
                <div
                  className={`fixed inset-y-0 right-0 max-w-sm w-full bg-gray-900 z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
                    cartOpen ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  <div className="flex flex-col h-full">
                    {/* Cart Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                      <h3 className="text-lg font-medium text-white">
                        Shopping Cart
                      </h3>
                      <button
                        onClick={() => setCartOpen(false)}
                        className="text-gray-400 hover:text-amber-600 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Cart Body */}
                    <div className="flex-grow overflow-y-auto p-4">
                      {!hasCartItems ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <i className="ion-android-cart text-5xl text-gray-600 mb-4"></i>
                          <p className="text-gray-400 mb-4">
                            Your cart is empty
                          </p>
                          <Link
                            to="/products"
                            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                            onClick={() => setCartOpen(false)}
                          >
                            Continue Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {cart.map((item) => (
                            <div
                              key={item?.product || Math.random()}
                              className="flex items-center py-4 border-b border-gray-800"
                            >
                              <div className="w-20 h-20 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                                <Link
                                  to={`/product/${item?.product}`}
                                  onClick={() => setCartOpen(false)}
                                >
                                  <img
                                    src={
                                      item?.image || "/images/placeholder.jpg"
                                    }
                                    alt={item?.name || "Product"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/images/placeholder.jpg";
                                    }}
                                  />
                                </Link>
                              </div>
                              <div className="flex-grow ml-4">
                                <Link
                                  to={`/product/${item?.product}`}
                                  className="text-white hover:text-amber-600 transition-colors font-medium"
                                  onClick={() => setCartOpen(false)}
                                >
                                  {item?.name || "Product"}
                                </Link>
                                <div className="text-gray-400 text-sm mt-1">
                                  Qty: {item?.qty || 1}
                                </div>
                                <div className="text-amber-600 font-medium mt-1">
                                  £{(item?.price || 0).toFixed(2)}
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  item?.product && removeFromCart(item.product)
                                }
                                className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Cart Footer */}
                    {hasCartItems && (
                      <div className="border-t border-gray-800 p-4">
                        <div className="flex justify-between mb-4">
                          <span className="text-white">Subtotal:</span>
                          <span className="text-white font-medium">
                            {getFormattedTotalPrice()}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <Link
                            to="/cart"
                            className="block w-full py-2 text-center bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                            onClick={() => setCartOpen(false)}
                          >
                            View Cart
                          </Link>
                          <Link
                            to="/checkout"
                            className="block w-full py-2 text-center bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                            onClick={() => setCartOpen(false)}
                          >
                            Checkout
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation - Hidden on mobile when not expanded */}
      <div
        className={`border-b border-gray-800 hidden md:block ${
          isSticky
            ? "sticky top-0 left-0 w-full bg-gray-900 bg-opacity-95 z-50 shadow-lg"
            : ""
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="relative">
            {/* Sticky Logo */}
            {isSticky && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                <Link to="/">
                  <img
                    src="/images/logo/LJ_Logo.png"
                    alt="Lakhani Jewellers"
                    className="h-10"
                  />
                </Link>
              </div>
            )}

            {/* Desktop Navigation */}
            <nav className="py-1">
              <ul className="flex justify-center items-center">
                {/* Home */}
                <li className="group">
                  <Link
                    to="/"
                    className="block px-5 py-3 text-white hover:text-amber-600 transition-colors font-medium"
                  >
                    Home
                  </Link>
                </li>

                {/* Categories - Dynamically Generated */}
                <li className="group relative">
                  <Link
                    to="/products"
                    className="block px-5 py-3 text-white hover:text-amber-600 transition-colors font-medium"
                  >
                    Category <i className="ion-chevron-down text-xs ml-1"></i>
                  </Link>
                  <div className="absolute left-0 top-full bg-gray-900 border border-gray-800 rounded shadow-lg p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                    {loading ? (
                      <div className="w-[400px] flex justify-center p-4">
                        <span className="text-gray-300">
                          Loading categories...
                        </span>
                      </div>
                    ) : error ? (
                      <div className="w-[400px] flex justify-center p-4">
                        <span className="text-red-500">
                          Error loading categories
                        </span>
                      </div>
                    ) : (
                      <div className="flex w-[400px]">
                        {/* Dynamically render parent categories and their children */}
                        {categories.parents.map((parent, index) => (
                          <div
                            key={parent._id}
                            className={`w-1/2 ${
                              index > 0
                                ? "pl-4 border-l border-gray-800"
                                : "pr-4"
                            }`}
                          >
                            <h3 className="text-white text-sm font-semibold uppercase mb-3">
                              <button
                                onClick={() => handleCategoryClick(parent._id)}
                                className="hover:text-amber-600 transition-colors"
                              >
                                {parent.name}
                              </button>
                            </h3>
                            <ul className="space-y-2">
                              {/* Child categories */}
                              {categories.children[parent._id] ? (
                                categories.children[parent._id].map((child) => (
                                  <li key={child._id}>
                                    <button
                                      onClick={() =>
                                        handleCategoryClick(
                                          parent._id,
                                          child._id
                                        )
                                      }
                                      className="text-gray-300 hover:text-amber-600 transition-colors text-left w-full"
                                    >
                                      {child.name}
                                    </button>
                                  </li>
                                ))
                              ) : (
                                <li>
                                  <button
                                    onClick={() =>
                                      handleCategoryClick(parent._id)
                                    }
                                    className="text-gray-300 hover:text-amber-600 transition-colors text-left w-full"
                                  >
                                    All {parent.name}
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>

                {/* My Account - Only shown if logged in */}
                {user && (
                  <li>
                    <Link
                      to="/account"
                      className="block px-5 py-3 text-white hover:text-amber-600 transition-colors font-medium"
                    >
                      My Account
                    </Link>
                  </li>
                )}

                {/* About Us */}
                <li>
                  <Link
                    to="/about"
                    className="block px-5 py-3 text-white hover:text-amber-600 transition-colors font-medium"
                  >
                    About Us
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full Screen */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black z-40">
          <div className="pt-20 px-6">
            <nav>
              <ul className="space-y-6 text-center">
                {/* Home - Mobile */}
                <li>
                  <Link
                    to="/"
                    className="flex items-center justify-center text-xl text-white hover:text-amber-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home size={20} className="mr-2" />
                    Home
                  </Link>
                </li>

                {/* Categories - Mobile */}
                <li className="space-y-4">
                  <Link
                    to="/products"
                    className="flex items-center justify-center text-xl text-white hover:text-amber-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingBasket size={20} className="mr-2" />
                    All Categories
                  </Link>

                  {/* Mobile Categories Submenu */}
                  {!loading && !error && categories.parents.length > 0 && (
                    <div className="mt-4 border-t border-gray-800 pt-4">
                      {categories.parents.map((parent) => (
                        <div key={parent._id} className="mb-4">
                          <button
                            onClick={() => handleCategoryClick(parent._id)}
                            className="text-lg text-white hover:text-amber-600 transition-colors"
                          >
                            {parent.name}
                          </button>

                          {categories.children[parent._id] && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {categories.children[parent._id].map((child) => (
                                <button
                                  key={child._id}
                                  onClick={() =>
                                    handleCategoryClick(parent._id, child._id)
                                  }
                                  className="text-sm text-gray-400 hover:text-amber-500 transition-colors"
                                >
                                  {child.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </li>

                {/* My Account - Mobile (Only if logged in) */}
                {user && (
                  <li>
                    <Link
                      to="/account"
                      className="flex items-center justify-center text-xl text-white hover:text-amber-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={20} className="mr-2" />
                      My Account
                    </Link>
                  </li>
                )}

                {/* About Us - Mobile */}
                <li>
                  <Link
                    to="/about"
                    className="flex items-center justify-center text-xl text-white hover:text-amber-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Info size={20} className="mr-2" />
                    About Us
                  </Link>
                </li>

                {/* Divider */}
                <li className="border-t border-gray-800 pt-6"></li>

                {/* Additional Mobile Links */}
                <li>
                  <Link
                    to="/wishlist"
                    className="flex items-center justify-center text-xl text-white hover:text-amber-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart size={20} className="mr-2" />
                    Wishlist
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className="flex items-center justify-center text-xl text-white hover:text-amber-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingBasket size={20} className="mr-2" />
                    Cart
                  </Link>
                </li>
                <li>
                  <Link
                    to="/checkout"
                    className="flex items-center justify-center text-xl text-white hover:text-amber-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Checkout
                  </Link>
                </li>

                {/* Login/Logout - Mobile */}
                {user ? (
                  <li className="pt-6">
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center text-xl text-white hover:text-amber-600 transition-colors w-full"
                    >
                      Logout
                    </button>
                  </li>
                ) : (
                  <li className="pt-6">
                    <Link
                      to="/login"
                      className="flex items-center justify-center text-xl text-white hover:text-amber-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Overlay for cart only */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setCartOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;
