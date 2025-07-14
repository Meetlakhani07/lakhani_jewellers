import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { shopInfoService } from "../services/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ExternalLink,
} from "lucide-react";

const AboutUsPage = () => {
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDay, setCurrentDay] = useState("");

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        setLoading(true);
        const { data } = await shopInfoService.getShopInfo();
        setShopInfo(data);
      } catch (err) {
        console.error("Error fetching shop info:", err);
        setError("Failed to load store information. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    // Get current day for highlighting in store hours
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    setCurrentDay(days[today.getDay()]);

    fetchShopInfo();
  }, []);

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`;
  };

  const getGoogleMapsUrl = (address, location) => {
    const formattedAddress = encodeURIComponent(formatAddress(address));
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyCV2zJ_h4crOd7Q83SCdx1G5PKalVvWMvc&q=${formattedAddress}&zoom=16`;
  };

  const isStoreOpenNow = () => {
    if (!shopInfo || !shopInfo.storeHours) return "Checking...";

    const now = new Date();
    const todayHours = shopInfo.storeHours.find(
      (hours) => hours.day === currentDay
    );

    if (!todayHours || todayHours.isClosed) return "Closed";

    // Parse opening and closing times
    if (todayHours.openTime === "Closed" || todayHours.closeTime === "Closed") {
      return "Closed";
    }

    const openTime = new Date(`${now.toDateString()} ${todayHours.openTime}`);
    const closeTime = new Date(`${now.toDateString()} ${todayHours.closeTime}`);

    // Check if current time is between open and close times
    return now >= openTime && now <= closeTime ? "Open Now" : "Closed";
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">About Us</h1>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-900 to-black py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About {shopInfo?.shopName}
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              {shopInfo?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Store Information Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact Information */}
            <div className="bg-gray-900 rounded-lg p-8 shadow-xl order-2 md:order-1">
              <h2 className="text-3xl font-bold text-white mb-8 border-b border-amber-600 pb-4">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-600 rounded-full flex items-center justify-center mr-5">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Our Location
                    </h3>
                    <p className="text-gray-300">
                      {shopInfo?.address?.street}
                      <br />
                      {shopInfo?.address?.city}, {shopInfo?.address?.state}
                      <br />
                      {shopInfo?.address?.zipCode}
                      <br />
                      {shopInfo?.address?.country}
                    </p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        formatAddress(shopInfo?.address)
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-500 mt-2 inline-block transition-colors"
                    >
                      Get Directions{" "}
                      <ExternalLink size={14} className="inline ml-1" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-600 rounded-full flex items-center justify-center mr-5">
                    <Phone size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Phone
                    </h3>
                    <p className="text-gray-300">
                      <a
                        href={`tel:${shopInfo?.contactNumber}`}
                        className="text-amber-600 hover:text-amber-500 transition-colors"
                      >
                        {shopInfo?.contactNumber}
                      </a>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Call us directly for immediate assistance
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 flex-shrink-0 bg-amber-600 rounded-full flex items-center justify-center mr-5">
                    <Mail size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Email
                    </h3>
                    <p className="text-gray-300">
                      <a
                        href={`mailto:${shopInfo?.email}`}
                        className="text-amber-600 hover:text-amber-500 transition-colors"
                      >
                        {shopInfo?.email}
                      </a>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      We'll respond as soon as possible
                    </p>
                  </div>
                </div>

                {/* Social Media */}
                <div className="pt-6 border-t border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Follow Us
                  </h3>
                  <div className="flex space-x-4">
                    {shopInfo?.socialMedia?.facebook && (
                      <a
                        href={shopInfo.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-800 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                    {shopInfo?.socialMedia?.twitter && (
                      <a
                        href={shopInfo.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-800 hover:bg-blue-400 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {shopInfo?.socialMedia?.instagram && (
                      <a
                        href={shopInfo.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-800 hover:bg-pink-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {shopInfo?.socialMedia?.pinterest && (
                      <a
                        href={shopInfo.socialMedia.pinterest}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gray-800 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-pinterest"
                        >
                          <path d="M9 19c-5 1-5-4-7-4" />
                          <path d="M12 16a3 3 0 0 1-3 3c-5-1-5-4-7-4" />
                          <path d="M12 4a8 8 0 0 0-8 8 8 8 0 0 0 8 8 8 8 0 0 0 8-8 8 8 0 0 0-8-8v0" />
                          <line x1="13" x2="17" y1="7" y2="7" />
                          <line x1="15" x2="15" y1="5" y2="9" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Map and Hours */}
            <div className="order-1 md:order-2">
              {/* Google Map */}
              <div className="h-72 md:h-96 bg-gray-800 rounded-lg overflow-hidden mb-8">
                {shopInfo?.location && (
                  <iframe
                    title="Store Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={getGoogleMapsUrl(shopInfo.address, shopInfo.location)}
                    allowFullScreen
                  ></iframe>
                )}
              </div>

              {/* Store Hours */}
              <div className="bg-gray-900 rounded-lg p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Store Hours</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isStoreOpenNow() === "Open Now"
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {isStoreOpenNow()}
                  </span>
                </div>

                <ul className="space-y-3">
                  {shopInfo?.storeHours?.map((hours) => (
                    <li
                      key={hours.day}
                      className={`flex justify-between py-2 border-b border-gray-800 ${
                        hours.day === currentDay
                          ? "text-amber-600"
                          : "text-white"
                      }`}
                    >
                      <span className="font-medium">{hours.day}</span>
                      <span>
                        {hours.isClosed
                          ? "Closed"
                          : `${hours.openTime} - ${hours.closeTime}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
            <p className="text-gray-300 leading-relaxed">
              At {shopInfo?.shopName}, we take pride in our heritage and
              craftsmanship. Our journey began with a simple passion for
              creating exquisite jewelry that tells a story and becomes a
              cherished part of your life's most precious moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black p-8 rounded-lg shadow-xl text-center">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 13.5C17 15.3333 15.5 17 12 20C8.5 17 7 15.3333 7 13.5C7 11.6667 8.5 10 12 10C15.5 10 17 11.6667 17 13.5Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 8V10"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 4V6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Finest Materials
              </h3>
              <p className="text-gray-400">
                We source only the highest quality materials, from ethically
                mined diamonds to premium metals, ensuring each piece meets our
                exacting standards.
              </p>
            </div>

            <div className="bg-black p-8 rounded-lg shadow-xl text-center">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 19L12 12L20 19"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 5L12 12L20 5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Expert Craftsmanship
              </h3>
              <p className="text-gray-400">
                Our master jewelers bring decades of experience to every piece,
                combining traditional techniques with modern innovation.
              </p>
            </div>

            <div className="bg-black p-8 rounded-lg shadow-xl text-center">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 9V15"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 12L9 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Personalized Service
              </h3>
              <p className="text-gray-400">
                We believe in building lasting relationships with our clients,
                offering personalized consultations and custom design services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-amber-700 to-amber-600 rounded-lg shadow-xl overflow-hidden">
            <div className="p-10 text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Visit Our Store Today
              </h2>
              <p className="text-white text-lg mb-8 max-w-xl mx-auto">
                Experience our collection in person and let our experts help you
                find the perfect piece for any occasion.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <a
                  href={`tel:${shopInfo?.contactNumber}`}
                  className="bg-white text-amber-700 py-3 px-8 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Phone size={18} className="inline mr-2" /> Call Us
                </a>
                <a
                  href={`mailto:${shopInfo?.email}`}
                  className="bg-transparent border-2 border-white text-white py-3 px-8 rounded-full font-semibold hover:bg-white/10 transition-colors"
                >
                  <Mail size={18} className="inline mr-2" /> Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default AboutUsPage;
