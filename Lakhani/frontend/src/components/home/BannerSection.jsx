// BannerSection.jsx
import { Link } from "react-router-dom";

const BannerSection = () => {
  return (
    <section className="py-12 mb-16" id="banner">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* First Banner */}
          <div className="col-span-1 group">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80"></div>

              <Link to="/products?category=rings" className="block">
                <img
                  className="w-full h-[300px] object-cover transition-transform duration-700 group-hover:scale-110"
                  src="/images/banner/bg-1.jpg"
                  alt="Small design Rings"
                />
              </Link>

              <div className="absolute left-0 bottom-0 p-6 transition-all duration-500 z-20 w-full transform group-hover:translate-y-0 translate-y-0">
                <p className="text-amber-600 text-sm uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-4 group-hover:translate-y-0">
                  New Design
                </p>

                <h2 className="text-white text-2xl font-bold mb-3 transition-all duration-500 transform group-hover:text-amber-600 group-hover:translate-x-2">
                  Small design Rings
                </h2>

                <div className="flex items-center justify-between">
                  <span className="text-white bg-amber-600 px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                    Sale 20%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Second Banner */}
          <div className="col-span-1 group">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80"></div>

              <Link
                to="/products?category=rings&material=white-gold"
                className="block"
              >
                <img
                  className="w-full h-[300px] object-cover transition-transform duration-700 group-hover:scale-110"
                  src="/images/banner/bg-2.jpg"
                  alt="White gold rings"
                />
              </Link>

              <div className="absolute left-0 bottom-0 p-6 transition-all duration-500 z-20 w-full transform group-hover:translate-y-0 translate-y-0">
                <p className="text-amber-600 text-sm uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-4 group-hover:translate-y-0">
                  Bestselling Rings
                </p>

                <h2 className="text-white text-2xl font-bold mb-3 transition-all duration-500 transform group-hover:text-amber-600 group-hover:translate-x-2">
                  White gold rings
                </h2>

                <div className="flex items-center justify-between">
                  <span className="text-white bg-amber-600 px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                    Sale 10%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Third Banner */}
          <div className="col-span-1 group">
            <div className="relative overflow-hidden rounded-lg shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80"></div>

              <Link
                to="/products?category=rings&material=platinum"
                className="block"
              >
                <img
                  className="w-full h-[300px] object-cover transition-transform duration-700 group-hover:scale-110"
                  src="/images/banner/bg-3.jpg"
                  alt="Platinum Rings"
                />
              </Link>

              <div className="absolute left-0 bottom-0 p-6 transition-all duration-500 z-20 w-full transform group-hover:translate-y-0 translate-y-0">
                <p className="text-amber-600 text-sm uppercase tracking-wider mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-4 group-hover:translate-y-0">
                  Featured Rings
                </p>

                <h2 className="text-white text-2xl font-bold mb-3 transition-all duration-500 transform group-hover:text-amber-600 group-hover:translate-x-2">
                  Platinum Rings
                </h2>

                <div className="flex items-center justify-between">
                  <span className="text-white bg-amber-600 px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                    Sale 30%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
