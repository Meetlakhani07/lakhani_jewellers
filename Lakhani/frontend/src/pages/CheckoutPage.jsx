// CheckoutPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { orderService } from "../services/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

import {
  CreditCard,
  User,
  ShieldCheck,
  Truck,
  Clock,
  Info,
  Loader2,
} from "lucide-react";

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "United Kingdom",
  });

  const [shippingDetails, setShippingDetails] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "United Kingdom",
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
  });

  const [shipToDifferent, setShipToDifferent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Format credit card number as user types (add spaces every 4 digits)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    } else {
      return v;
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      setPaymentDetails((prev) => ({
        ...prev,
        [name]: formatCardNumber(value),
      }));
    } else if (name === "expiryDate") {
      setPaymentDetails((prev) => ({
        ...prev,
        [name]: formatExpiryDate(value),
      }));
    } else {
      setPaymentDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    // Validate credit card (basic validation)
    const cardNumberClean = paymentDetails.cardNumber.replace(/\s/g, "");
    if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      setError("Please enter a valid card number");
      return false;
    }

    // Validate expiry date
    const expiryParts = paymentDetails.expiryDate.split("/");
    if (
      expiryParts.length !== 2 ||
      expiryParts[0].length !== 2 ||
      expiryParts[1].length !== 2
    ) {
      setError("Please enter a valid expiry date (MM/YY)");
      return false;
    }

    const month = parseInt(expiryParts[0], 10);
    const year = parseInt(`20${expiryParts[1]}`, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12) {
      setError("Please enter a valid month (01-12)");
      return false;
    }

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setError("Your card has expired");
      return false;
    }

    // Validate CVV
    if (
      paymentDetails.cvv.length < 3 ||
      paymentDetails.cvv.length > 4 ||
      !/^\d+$/.test(paymentDetails.cvv)
    ) {
      setError("Please enter a valid CVV");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare order data
      const orderData = {
        orderItems: cart.map((item) => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item.product,
        })),
        shippingAddress: shipToDifferent
          ? {
              address: `${shippingDetails.firstName} ${shippingDetails.lastName}, ${shippingDetails.address}`,
              city: shippingDetails.city,
              postalCode: shippingDetails.postcode,
              country: shippingDetails.country,
            }
          : {
              address: `${billingDetails.firstName} ${billingDetails.lastName}, ${billingDetails.address}`,
              city: billingDetails.city,
              postalCode: billingDetails.postcode,
              country: billingDetails.country,
            },
        paymentMethod: "credit_card",
        totalPrice,
        paymentDetails: {
          cardLast4: paymentDetails.cardNumber.slice(-4),
          cardholderName: paymentDetails.cardholderName,
        },
      };

      // Submit order
      const { data } = await orderService.createOrder(orderData);

      clearCart();

      navigate(`/order-confirmation/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  if (!user) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              Please login to continue
            </h2>
            <Link
              to="/login"
              className="bg-amber-600 text-white py-2 px-6 rounded inline-block hover:bg-amber-300 hover:text-black transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header title="Checkout" />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

          {error && (
            <div className="bg-red-900 text-white p-4 rounded mb-6">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="col-span-1 lg:col-span-2">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Billing Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={billingDetails.firstName}
                      onChange={handleBillingChange}
                      className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={billingDetails.lastName}
                      onChange={handleBillingChange}
                      className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={billingDetails.email}
                    onChange={handleBillingChange}
                    className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={billingDetails.phone}
                    onChange={handleBillingChange}
                    className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={billingDetails.address}
                    onChange={handleBillingChange}
                    className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-white mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={billingDetails.city}
                      onChange={handleBillingChange}
                      className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">
                      State/County *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={billingDetails.state}
                      onChange={handleBillingChange}
                      className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">
                      Postcode/ZIP *
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      value={billingDetails.postcode}
                      onChange={handleBillingChange}
                      className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2">Country *</label>
                    <select
                      name="country"
                      value={billingDetails.country}
                      onChange={handleBillingChange}
                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white focus:border-amber-600"
                      required
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shipToDifferent}
                      onChange={() => setShipToDifferent(!shipToDifferent)}
                      className="mr-2"
                    />
                    <span className="text-white">
                      Ship to a different address?
                    </span>
                  </label>
                </div>
              </div>

              {shipToDifferent && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipping Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-white mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={shippingDetails.firstName}
                        onChange={handleShippingChange}
                        className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={shippingDetails.lastName}
                        onChange={handleShippingChange}
                        className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-white mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={shippingDetails.address}
                      onChange={handleShippingChange}
                      className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-white mb-2">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingDetails.city}
                        onChange={handleShippingChange}
                        className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">
                        State/County *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={shippingDetails.state}
                        onChange={handleShippingChange}
                        className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">
                        Postcode/ZIP *
                      </label>
                      <input
                        type="text"
                        name="postcode"
                        value={shippingDetails.postcode}
                        onChange={handleShippingChange}
                        className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white mb-2">Country *</label>
                      <select
                        name="country"
                        value={shippingDetails.country}
                        onChange={handleShippingChange}
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white focus:border-amber-600"
                        required
                      >
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Credit Card Payment Form */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Details
                </h3>

                <div className="mb-4">
                  <label className="block text-white mb-2">Card Number *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600 pr-10"
                      required
                    />
                    <div className="absolute right-3 top-3">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    Enter your 16-digit card number without spaces or dashes.
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-2">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    name="cardholderName"
                    value={paymentDetails.cardholderName}
                    onChange={handlePaymentChange}
                    placeholder="Name as it appears on your card"
                    className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentDetails.expiryDate}
                      onChange={handlePaymentChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                      required
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Format: MM/YY (e.g. 12/25)
                    </p>
                  </div>
                  <div>
                    <label className="block text-white mb-2">CVV *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cvv"
                        value={paymentDetails.cvv}
                        onChange={handlePaymentChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                        required
                      />
                      <div className="absolute right-3 top-3">
                        <Info className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      3-4 digit security code on the back of your card
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center">
                    <ShieldCheck className="w-5 h-5 text-amber-600 mr-2" />
                    <span className="text-gray-400 text-sm">
                      Secure payment processing
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-700">
                  Your Order
                </h3>

                <div className="mb-6">
                  <div className="flex justify-between py-3 border-b border-gray-700">
                    <span className="text-white font-medium">Product</span>
                    <span className="text-white font-medium">Total</span>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={item.product}
                      className="flex justify-between py-3 border-b border-gray-700"
                    >
                      <span className="text-white truncate max-w-[180px]">
                        {item.name}{" "}
                        <span className="text-gray-400">× {item.qty}</span>
                      </span>
                      <span className="text-amber-600">
                        GBP {(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between py-3 border-b border-gray-700">
                    <span className="text-white">Subtotal</span>
                    <span className="text-amber-600">
                      GBP {totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between py-3 border-b border-gray-700">
                    <span className="text-white">Shipping</span>
                    <span className="text-white">Free</span>
                  </div>

                  <div className="flex justify-between py-3">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-amber-600 font-bold text-xl">
                      GBP {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-3 text-center rounded font-medium hover:bg-amber-300 hover:text-black transition-colors block"
                  disabled={loading || cart.length === 0}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="animate-spin mr-3 h-5 w-5 text-white" />
                      Processing...
                    </div>
                  ) : (
                    "Place Order"
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">
                    By placing an order you agree to our
                    <Link
                      to="/terms"
                      className="text-amber-600 hover:underline ml-1"
                    >
                      Terms and Conditions
                    </Link>
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center mb-3">
                    <ShieldCheck className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="text-white text-sm">Secure checkout</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <Truck className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="text-white text-sm">Free delivery</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-amber-600 mr-2" />
                    <span className="text-white text-sm">Fast processing</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
      <Footer/>
    </>
  );
};

export default CheckoutPage;
