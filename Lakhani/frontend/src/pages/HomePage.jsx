// HomePage.jsx
import { useState, useEffect } from "react";
import { productService } from "../services/api";
import HeroSlider from "../components/home/HeroSlider";
import BannerSection from "../components/home/BannerSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import BestsellingProducts from "../components/home/BestsellingProducts";
import SpecialCollection from "../components/home/SpecialCollection";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestsellingProducts, setBestsellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await productService.getAllProducts();
        console.log("Fetched data:", data);

        const featured = data.products
          .filter((product) => product.isFeatured)
          .slice(0, 10);
        setFeaturedProducts(featured);

        // Filter bestselling products
        const bestselling = data.products
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 10);
        setBestsellingProducts(bestselling);
      } catch (err) {
        setError(err.message || "Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  return (
    <main>
      <Header />
      {/* Hero Slider */}
      <HeroSlider />
      <BannerSection />
      <FeaturedProducts products={featuredProducts} />
      <BestsellingProducts products={bestsellingProducts} />
      <SpecialCollection />
      <Footer />
    </main>
  );
};

export default HomePage;
