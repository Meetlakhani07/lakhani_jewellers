// src/pages/ProductDetailPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productService } from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Heart } from "lucide-react";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await productService.getProductById(id);
        setProduct(data.product);

        // Check if product is in wishlist
        setInWishlist(isInWishlist(id));

        // Fetch related products
        const allProductsResponse = await productService.getAllProducts();
        const allProducts = allProductsResponse.data.products || [];

        const related = allProducts
          .filter(
            (p) =>
              p._id !== data._id &&
              data?.categories &&
              p.categories?.some((cat) => data.categories.includes(cat))
          )
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (err) {
        setError(err.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isInWishlist]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        qty: quantity,
      });
      // Show notification or feedback
    }
  };

  const handleToggleWishlist = async () => {
    if (inWishlist) {
      await removeFromWishlist(product._id);
      setInWishlist(false);
    } else {
      const success = await addToWishlist(product._id);
      setInWishlist(success);
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="py-20 text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  if (!product)
    return (
      <div className="py-20 text-center">
        <p className="text-white">Product not found</p>
      </div>
    );

  return (
    <>
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full rounded-md"
                />
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-semibold mb-4 text-white">
                {product.name}
              </h1>

              <div className="mb-4">
                <div className="mb-2">
                  <span className="text-gray-400">Categories: {product.category.name} </span>
                </div>
                {product.tags && (
                  <div>
                    <span className="text-gray-400">Tags: </span>
                    {product.tags.map((tag, idx) => (
                      <span key={idx}>
                        <Link
                          to={`/products?tag=${tag}`}
                          className="text-amber-600 hover:underline"
                        >
                          {tag}
                        </Link>
                        {idx < product.tags.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                {typeof product.oldPrice === "number" && (
                  <span className="text-lg text-gray-500 line-through mr-3">
                    GBP. {product.oldPrice.toFixed(2)}
                  </span>
                )}
                {typeof product.price === "number" && (
                  <span className="text-2xl font-semibold text-amber-600">
                    GBP. {product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="mb-8">
                <p className="text-white leading-7">{product.description}</p>
              </div>

              <div className="mb-6">
                {product.variations && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-white mb-2">
                      Available Options:
                    </h3>
                    {Object.entries(product.variations).map(
                      ([name, options]) => (
                        <div key={name} className="mb-3">
                          <span className="text-white capitalize mr-2">
                            {name}:
                          </span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {options.map((option, idx) => (
                              <button
                                key={idx}
                                className="px-4 py-1 border border-gray-600 rounded hover:border-amber-600 text-white"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center mb-8">
                <div className="mr-4">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-20 h-10 px-4 border border-gray-600 bg-transparent text-white rounded"
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  className="bg-amber-600 text-white py-2 px-6 rounded font-medium hover:bg-amber-700 transition-colors mr-3"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`w-10 h-10 flex items-center justify-center rounded-full border ${
                    inWishlist
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-transparent text-white border-gray-600 hover:border-amber-600"
                  } transition-colors`}
                >
                  <Heart size={18} fill={inWishlist ? "white" : "none"} />
                </button>
              </div>

              <div>
                <span className="text-white mr-3">Share:</span>
                <div className="inline-flex">
                  <a
                    href="#"
                    className="mr-2 text-gray-400 hover:text-amber-600"
                  >
                    <i className="ion-social-facebook"></i>
                  </a>
                  <a
                    href="#"
                    className="mr-2 text-gray-400 hover:text-amber-600"
                  >
                    <i className="ion-social-twitter"></i>
                  </a>
                  <a
                    href="#"
                    className="mr-2 text-gray-400 hover:text-amber-600"
                  >
                    <i className="ion-social-pinterest"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-amber-600">
                    <i className="ion-social-instagram"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-medium text-white mb-6 pb-2 border-b border-gray-700">
                Related Products
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <div key={product._id}>
                    <div className="mb-3">
                      <Link to={`/product/${product._id}`}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full rounded-md"
                        />
                      </Link>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">
                        <Link
                          to={`/product/${product._id}`}
                          className="text-white hover:text-amber-600"
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <div>
                        {product.oldPrice && (
                          <span className="text-sm text-gray-500 line-through mr-2">
                            GBP. {product.oldPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-amber-600">
                          GBP. {product.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ProductDetailPage;
