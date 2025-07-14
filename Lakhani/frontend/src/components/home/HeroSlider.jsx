// HeroSlider.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HeroSlider = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slides] = useState([
    {
      image: "/images/slider/1.png",
      title: "Necklace",
      subtitle: "22 Carat gold necklace for wedding",
      offer: "exclusive offer ",
      price: 895,
    },
    {
      image: "/images/slider/2.jpg",
      title: "Earings and Pendant",
      subtitle: "Complete bridal set with white pearls",
      offer: "exclusive offer",
      price: 999,
    },
    {
      image: "/images/slider/3.jpg",
      title: "Wedding Rings",
      subtitle: "LJ Special wedding rings for couples.",
      offer: "exclusive offer",
      price: 189,
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [activeSlide]);

  const nextSlide = () => {
    if (!animating) {
      setAnimating(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        setAnimating(false);
      }, 700);
    }
  };

  const prevSlide = () => {
    if (!animating) {
      setAnimating(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
        setAnimating(false);
      }, 700);
    }
  };

  const goToSlide = (index) => {
    if (!animating && index !== activeSlide) {
      setAnimating(true);
      setTimeout(() => {
        setActiveSlide(index);
        setAnimating(false);
      }, 700);
    }
  };

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Background gradient overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent z-10 pointer-events-none"></div>

      {/* Slide images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
            index === activeSlide
              ? "opacity-100 scale-100 z-0"
              : "opacity-0 scale-110 -z-10"
          }`}
        >
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-cover"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: index === activeSlide ? "scale(1)" : "scale(1.1)",
              transition: "transform 7s ease-out",
            }}
          />
        </div>
      ))}

      {/* Content container */}
      <div className="container mx-auto px-4 h-full relative z-20">
        <div className="flex items-center h-full">
          <div className="w-full max-w-2xl">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`${index === activeSlide ? "block" : "hidden"}`}
              >
                <div className="space-y-4 ml-5">
                  {/* Animated badge */}
                  <div
                    className={`${
                      index === activeSlide
                        ? "animate-slideInRight opacity-100"
                        : "opacity-0"
                    } transition-all duration-1000 delay-300`}
                  >
                    <span className="inline-block bg-amber-600 text-white px-4 py-1 rounded-full text-sm uppercase tracking-wider mb-4">
                      {slide.offer}
                    </span>
                  </div>

                  {/* Title with animated reveal */}
                  <h1
                    className={`text-white text-5xl font-bold mb-2 ${
                      index === activeSlide
                        ? "animate-revealFromLeft opacity-100"
                        : "opacity-0"
                    } transition-all duration-1000 delay-500`}
                  >
                    {slide.title}
                  </h1>

                  {/* Subtitle with animated reveal */}
                  <p
                    className={`text-2xl text-gray-300 leading-relaxed mb-6 ${
                      index === activeSlide
                        ? "animate-revealFromLeft opacity-100"
                        : "opacity-0"
                    } transition-all duration-1000 delay-700`}
                  >
                    {slide.subtitle}
                  </p>

                  {/* Price with fade in animation */}
                  <div
                    className={`text-white text-lg mb-8 ${
                      index === activeSlide
                        ? "animate-fadeIn opacity-100"
                        : "opacity-0"
                    } transition-all duration-1000 delay-900`}
                  >
                    <span>starting at </span>
                    <span className="text-2xl font-medium text-amber-600 ml-2">
                      GBP. {slide.price}
                    </span>
                  </div>

                  {/* Button with scale animation */}
                  <div
                    className={`${
                      index === activeSlide
                        ? "animate-scaleIn opacity-100"
                        : "opacity-0"
                    } transition-all duration-1000 delay-1100`}
                  >
                    <Link
                      to="/products"
                      className="bg-amber-600 text-white px-8 py-3 rounded-full text-lg font-medium inline-flex items-center hover:bg-amber-700 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                    >
                      Shop Now
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-amber-600 transition-colors duration-300 text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 hover:bg-amber-600 transition-colors duration-300 text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dots navigation */}
      <div className="absolute bottom-8 w-full text-center z-20">
        <div className="inline-flex bg-black/30 rounded-full p-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full mx-1.5 transition-all duration-300 ${
                index === activeSlide
                  ? "bg-amber-600 w-6"
                  : "bg-white/50 hover:bg-white"
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Custom animations for elements */}
      <style jsx>{`
        @keyframes revealFromLeft {
          0% {
            transform: translateX(-50px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          0% {
            transform: translateX(50px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-revealFromLeft {
          animation: revealFromLeft 1s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 1s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HeroSlider;
