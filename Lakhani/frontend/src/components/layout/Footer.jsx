// EnhancedFooter.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { shopInfoService } from "../../services/api";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const [shopInfo, setShopInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        setLoading(true);
        const { data } = await shopInfoService.getShopInfo();
        setShopInfo(data);
      } catch (err) {
        console.error("Error fetching shop info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopInfo();
  }, []);

  // Format address function
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}, ${address.country}`;
  };

  return (
    <footer className="border-t border-gray-700 pt-12 bg-black">
      <div className="container mx-auto px-4">
        <div className="pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About Column */}
            <div className="col-span-1 lg:col-span-2">
              <div>
                <h3 className="text-xl text-white font-normal mb-6">
                  About {shopInfo?.shopName || "Lakhani Jewellers"}
                </h3>
                <div>
                  {shopInfo?.description && (
                    <p className="mb-4 text-gray-400">{shopInfo.description}</p>
                  )}
                  <div className="flex items-start space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-400">
                      {shopInfo?.address
                        ? formatAddress(shopInfo.address)
                        : "129, Beatrice Road, Leicester, United Kingdom"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-gray-400">
                      <a
                        href={`tel:${
                          shopInfo?.contactNumber || "+447436357152"
                        }`}
                        className="hover:text-amber-600"
                      >
                        {shopInfo?.contactNumber || "(+44)7436357152"}
                      </a>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Mail className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-gray-400">
                      <a
                        href={`mailto:${
                          shopInfo?.email || "lakhanijewellers@gmail.com"
                        }`}
                        className="hover:text-amber-600"
                      >
                        {shopInfo?.email || "lakhanijewellers@gmail.com"}
                      </a>
                    </p>
                  </div>

                  {/* Social Media Links */}
                  <ul className="flex mt-4 space-x-3">
                    <li>
                      <a
                        href={shopInfo?.socialMedia?.facebook || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#2f2f2f] w-10 h-10 flex items-center justify-center rounded-full text-white text-lg hover:bg-amber-600 transition-colors"
                      >
                        <Facebook size={18} />
                      </a>
                    </li>
                    <li>
                      <a
                        href={shopInfo?.socialMedia?.twitter || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#2f2f2f] w-10 h-10 flex items-center justify-center rounded-full text-white text-lg hover:bg-amber-600 transition-colors"
                      >
                        <Twitter size={18} />
                      </a>
                    </li>
                    <li>
                      <a
                        href={shopInfo?.socialMedia?.instagram || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#2f2f2f] w-10 h-10 flex items-center justify-center rounded-full text-white text-lg hover:bg-amber-600 transition-colors"
                      >
                        <Instagram size={18} />
                      </a>
                    </li>
                    <li>
                      <a
                        href={shopInfo?.socialMedia?.pinterest || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#2f2f2f] w-10 h-10 flex items-center justify-center rounded-full text-white text-lg hover:bg-amber-600 transition-colors"
                      >
                        <Youtube size={18} />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-span-1">
              <div>
                <h3 className="text-xl text-white font-normal mb-6">
                  Information
                </h3>
                <div>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        to="/about"
                        className="text-gray-400 hover:text-amber-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 inline-block"></span>
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/products"
                        className="text-gray-400 hover:text-amber-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 inline-block"></span>
                        Products
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/terms"
                        className="text-gray-400 hover:text-amber-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 inline-block"></span>
                        Terms & Conditions
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/privacy"
                        className="text-gray-400 hover:text-amber-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 inline-block"></span>
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/faq"
                        className="text-gray-400 hover:text-amber-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 inline-block"></span>
                        FAQ
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* My Account */}
            <div className="col-span-1">
              <div>
                <h3 className="text-xl text-white font-normal mb-6">
                  My Account
                </h3>
                <div>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        to="/account"
                        className="text-gray-400 hover:text-amber-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 inline-block"></span>
                        My Account
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/wishlist"
                        className="text-gray-400 hover:text-amber-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 inline-block"></span>
                        Wishlist
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/cart"
                        className="text-gray-400 hover:text-amber-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 inline-block"></span>
                        Shopping Cart
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/checkout"
                        className="text-gray-400 hover:text-amber-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 inline-block"></span>
                        Checkout
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/MyOrders"
                        className="text-gray-400 hover:text-amber-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-amber-600 rounded-full mr-2 inline-block"></span>
                        Your Orders
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Store Hours (only if available) */}
        {shopInfo?.storeHours && shopInfo.storeHours.length > 0 && (
          <div className="pb-8 border-t border-gray-800 pt-8">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl text-white font-normal mb-4 text-center">
                Store Hours
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {shopInfo.storeHours.map((hours) => (
                  <div
                    key={hours.day}
                    className={`text-center p-2 rounded ${
                      hours.isClosed ? "bg-gray-900" : "bg-gray-800"
                    }`}
                  >
                    <p className="text-amber-600 font-medium">{hours.day}</p>
                    <p className="text-gray-300 text-sm mt-1">
                      {hours.isClosed
                        ? "Closed"
                        : `${hours.openTime} - ${hours.closeTime}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="py-8 border-t border-gray-700">
          <div className="text-center">
            <p className="text-gray-400">
              Copyright &copy; {new Date().getFullYear()}{" "}
              <Link to="/" className="text-amber-600 hover:underline">
                {shopInfo?.shopName || "Lakhani Jewellers"}
              </Link>{" "}
              All rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
// 