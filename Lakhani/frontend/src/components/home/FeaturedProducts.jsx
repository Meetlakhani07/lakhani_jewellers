import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Tag,
  Clock,
  ShoppingCart,
  Heart,
  Eye,
  Star,
  StarHalf,
} from "lucide-react";

const FeaturedProducts = ({ products }) => {
  const [activeTab, setActiveTab] = useState("featured");
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Function to render star ratings
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`star-${i}`}
          className="w-4 h-4 fill-amber-400 text-amber-400"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half-star"
          className="w-4 h-4 fill-amber-400 text-amber-400"
        />
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-star-${i}`} className="w-4 h-4 text-gray-400" />
      );
    }

    return stars;
  };

  return (
    <section
      className="py-16 mb-16 bg-gradient-to-b from-gray-900 to-gray-950"
      id="featured"
    >
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <span className="text-amber-500 uppercase tracking-widest text-sm font-medium mb-3 inline-block">
            Exquisite Selection
          </span>
          <h2 className="text-4xl text-white font-bold mb-6">Our Collection</h2>
          <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover our exclusive collection of handcrafted jewelry, featuring
            the finest materials and exquisite designs.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-16">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-8">
            <button
              className={`group flex flex-col items-center transition-all duration-300`}
              onClick={() => setActiveTab("featured")}
            >
              <div
                className={`p-3 rounded-full ${
                  activeTab === "featured"
                    ? "bg-amber-600"
                    : "bg-gray-800 group-hover:bg-gray-700"
                } mb-2 transition-colors duration-300`}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span
                className={`font-medium ${
                  activeTab === "featured"
                    ? "text-amber-500"
                    : "text-gray-400 group-hover:text-white"
                } transition-colors duration-300`}
              >
                Featured
              </span>
              {activeTab === "featured" && (
                <div className="w-full h-0.5 bg-amber-600 mt-2"></div>
              )}
            </button>

            <button
              className={`group flex flex-col items-center transition-all duration-300`}
              onClick={() => setActiveTab("arrivals")}
            >
              <div
                className={`p-3 rounded-full ${
                  activeTab === "arrivals"
                    ? "bg-amber-600"
                    : "bg-gray-800 group-hover:bg-gray-700"
                } mb-2 transition-colors duration-300`}
              >
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span
                className={`font-medium ${
                  activeTab === "arrivals"
                    ? "text-amber-500"
                    : "text-gray-400 group-hover:text-white"
                } transition-colors duration-300`}
              >
                New Arrivals
              </span>
              {activeTab === "arrivals" && (
                <div className="w-full h-0.5 bg-amber-600 mt-2"></div>
              )}
            </button>

            <button
              className={`group flex flex-col items-center transition-all duration-300`}
              onClick={() => setActiveTab("onsale")}
            >
              <div
                className={`p-3 rounded-full ${
                  activeTab === "onsale"
                    ? "bg-amber-600"
                    : "bg-gray-800 group-hover:bg-gray-700"
                } mb-2 transition-colors duration-300`}
              >
                <Tag className="w-6 h-6 text-white" />
              </div>
              <span
                className={`font-medium ${
                  activeTab === "onsale"
                    ? "text-amber-500"
                    : "text-gray-400 group-hover:text-white"
                } transition-colors duration-300`}
              >
                On Sale
              </span>
              {activeTab === "onsale" && (
                <div className="w-full h-0.5 bg-amber-600 mt-2"></div>
              )}
            </button>
          </div>
        </div>

        {/* Products Display */}
        <div className="relative min-h-96">
          {/* Featured Products */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "featured"
                ? "opacity-100 translate-y-0"
                : "opacity-0 absolute inset-0 pointer-events-none translate-y-8"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="group animate-fadeInUp bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <div className="relative pt-[100%]">
                    <Link
                      to={`/product/${product._id}`}
                      className="block absolute inset-0"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </Link>

                    {/* Overlay with actions */}
                    <div
                      className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                        hoveredProduct === product._id
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      <div className="flex space-x-3">
                        <Link
                          to={`/product/${product._id}`}
                          className="bg-white text-gray-900 p-3 rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between">
                      {product.isOnSale && (
                        <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          SALE
                        </span>
                      )}
                      {product.isNewArrival && (
                        <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full ml-auto">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Product Title */}
                    <h3 className="text-lg text-white font-bold mb-2 line-clamp-1 group-hover:text-amber-500 transition-colors duration-300">
                      <Link to={`/product/${product._id}`}>{product.name}</Link>
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline">
                        <span className="text-amber-500 text-lg font-semibold">
                          GBP {product.price?.toFixed(2)}
                        </span>
                        {product.oldPrice && (
                          <span className="text-gray-500 text-sm ml-2 line-through">
                            GBP {product.oldPrice?.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-amber-600 transition-colors duration-300"
                        onClick={() => {
                          // Quick add to cart functionality
                        }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length > 8 && (
              <div className="text-center mt-14">
                <Link
                  to="/products?filter=featured"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  View All Featured
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            )}
          </div>

          {/* New Arrivals */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "arrivals"
                ? "opacity-100 translate-y-0"
                : "opacity-0 absolute inset-0 pointer-events-none translate-y-8"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products
                .filter((p) => p.isNewArrival)
                .map((product, index) => (
                  <div
                    key={product._id}
                    className="group animate-fadeInUp bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <div className="relative pt-[100%]">
                      <Link
                        to={`/product/${product._id}`}
                        className="block absolute inset-0"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </Link>

                      {/* Overlay with actions */}
                      <div
                        className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                          hoveredProduct === product._id
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        <div className="flex space-x-3">
                          <Link
                            to={`/product/${product._id}`}
                            className="bg-white text-gray-900 p-3 rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button
                            className="bg-white text-gray-900 p-3 rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
                            onClick={() => {
                              // Wishlist functionality
                            }}
                          >
                            <Heart className="w-5 h-5" />
                          </button>
                          <button
                            className="bg-white text-gray-900 p-3 rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
                            onClick={() => {
                              // Add to cart functionality
                            }}
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          NEW
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Category */}
                      <div className="text-xs text-amber-500 mb-2 uppercase tracking-wider">
                        {product.category || "Jewelry"}
                      </div>

                      {/* Product Title */}
                      <h3 className="text-lg text-white font-bold mb-2 line-clamp-1 group-hover:text-amber-500 transition-colors duration-300">
                        <Link to={`/product/${product._id}`}>
                          {product.name}
                        </Link>
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex mr-2">
                          {renderRating(product.rating || 4.5)}
                        </div>
                        <span className="text-xs text-gray-400">
                          (
                          {product.reviewCount ||
                            Math.floor(Math.random() * 50) + 5}
                          )
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline">
                          <span className="text-amber-500 text-lg font-semibold">
                            GBP {product.price?.toFixed(2)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-gray-500 text-sm ml-2 line-through">
                              GBP {product.oldPrice?.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-amber-600 transition-colors duration-300"
                          onClick={() => {
                            // Quick add to cart functionality
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {products.filter((p) => p.isNewArrival).length > 8 && (
              <div className="text-center mt-14">
                <Link
                  to="/products?filter=new"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  View All New Arrivals
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            )}
          </div>

          {/* On Sale */}
          <div
            className={`transition-all duration-500 ${
              activeTab === "onsale"
                ? "opacity-100 translate-y-0"
                : "opacity-0 absolute inset-0 pointer-events-none translate-y-8"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products
                .filter((p) => p.isOnSale)
                .map((product, index) => (
                  <div
                    key={product._id}
                    className="group animate-fadeInUp bg-gray-800/30 backdrop-blur-sm rounded-xl overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onMouseEnter={() => setHoveredProduct(product._id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    <div className="relative pt-[100%]">
                      <Link
                        to={`/product/${product._id}`}
                        className="block absolute inset-0"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </Link>

                      {/* Overlay with actions */}
                      <div
                        className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                          hoveredProduct === product._id
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                      >
                        <div className="flex space-x-3">
                          <Link
                            to={`/product/${product._id}`}
                            className="bg-white text-gray-900 p-3 rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <button
                            className="bg-white text-gray-900 p-3 rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
                            onClick={() => {
                              // Wishlist functionality
                            }}
                          >
                            <Heart className="w-5 h-5" />
                          </button>
                          <button
                            className="bg-white text-gray-900 p-3 rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
                            onClick={() => {
                              // Add to cart functionality
                            }}
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          SALE
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      {/* Category */}
                      <div className="text-xs text-amber-500 mb-2 uppercase tracking-wider">
                        {product.category || "Jewelry"}
                      </div>

                      {/* Product Title */}
                      <h3 className="text-lg text-white font-bold mb-2 line-clamp-1 group-hover:text-amber-500 transition-colors duration-300">
                        <Link to={`/product/${product._id}`}>
                          {product.name}
                        </Link>
                      </h3>

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex mr-2">
                          {renderRating(product.rating || 4.5)}
                        </div>
                        <span className="text-xs text-gray-400">
                          (
                          {product.reviewCount ||
                            Math.floor(Math.random() * 50) + 5}
                          )
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline">
                          <span className="text-amber-500 text-lg font-semibold">
                            GBP {product.price?.toFixed(2)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-gray-500 text-sm ml-2 line-through">
                              GBP {product.oldPrice?.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-amber-600 transition-colors duration-300"
                          onClick={() => {
                            // Quick add to cart functionality
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {products.filter((p) => p.isOnSale).length > 8 && (
              <div className="text-center mt-14">
                <Link
                  to="/products?filter=sale"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  View All Sale Items
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
};

export default FeaturedProducts;
