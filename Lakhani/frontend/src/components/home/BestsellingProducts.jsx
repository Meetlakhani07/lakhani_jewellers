// BestsellingProducts.jsx
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../products/ProductCard";
import { ChevronRight } from "lucide-react";

const BestsellingProducts = ({ products }) => {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slidesPerView = 2; 
  const totalSlides = Math.ceil(products.length / slidesPerView);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <section className="py-16 mb-16" id="bestselling">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <h2 className="text-3xl text-white font-normal relative z-10 mb-8 text-center">
            Bestselling Products
          </h2>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-10">
            <button
              onClick={prevSlide}
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-amber-600 transition-colors duration-300 ${
                currentSlide === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-100"
              }`}
              disabled={currentSlide === 0}
            >
              <i className="ion-chevron-left text-white"></i>
            </button>
          </div>

          <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
            <button
              onClick={nextSlide}
              className={`w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-amber-600 transition-colors duration-300 ${
                currentSlide === totalSlides - 1
                  ? "opacity-50 cursor-not-allowed"
                  : "opacity-100"
              }`}
              disabled={currentSlide === totalSlides - 1}
            >
              <ChevronRight />
            </button>
          </div>

          {/* Product Slider */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentSlide * (100 / slidesPerView)
                }%)`,
              }}
              ref={sliderRef}
            >
              {products.map((product) => (
                <div key={product._id} className={`w-1/${slidesPerView} px-4`}>
                  <div className="bg-gray-900 bg-opacity-30 rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/2 relative overflow-hidden">
                        <Link to={`/product/${product._id}`}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </Link>
                        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Link
                            to={`/product/${product._id}`}
                            className="bg-gray-800 text-white py-2 px-6 rounded hover:bg-amber-600 transition-colors duration-300 transform hover:scale-105"
                          >
                            Quick View
                          </Link>
                        </div>
                      </div>

                      <div className="md:w-1/2 p-6 flex flex-col justify-center">
                        <h3 className="text-xl text-white font-bold mb-2">
                          <Link
                            to={`/product/${product._id}`}
                            className="hover:text-amber-600 transition-colors duration-300"
                          >
                            {product.name}
                          </Link>
                        </h3>

                        <div className="mb-3">
                          <span className="text-amber-600 text-xl font-medium">
                            GBP. {product.price.toFixed(2)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-gray-500 text-sm ml-2 line-through">
                              GBP. {product.oldPrice.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                          {product.description?.substring(0, 100)}...
                        </p>

                        <button
                          onClick={() => {
                            // Add to cart functionality would go here
                          }}
                          className="bg-amber-600 text-white py-2 px-6 rounded-full hover:bg-amber-700 transition-colors duration-300 transform hover:scale-105 w-full md:w-auto text-center"
                        >
                          Add To Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestsellingProducts;
