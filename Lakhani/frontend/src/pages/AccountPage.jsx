import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { orderService } from "../services/api";
import { authService } from "../services/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  User,
  Package,
  Settings,
  LogOut,
  Check,
  AlertCircle,
  Eye,
  ShoppingBag,
  Lock,
  Mail,
  Save,
  Loader,
  ShoppingCart,
} from "lucide-react";

const AccountPage = () => {
  const { user, logout, updateUserInfo } = useAuth();
  const { cart, hasItems } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    submitting: false,
    error: "",
    success: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    submitting: false,
    error: "",
    success: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Initialize profile form with user data
    if (user.name) {
      const nameParts = user.name.split(" ");
      setProfileForm((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: user.email || "",
      }));
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await orderService.getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
      error: "",
      success: "",
    }));
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
      error: "",
      success: "",
    }));
  };

  // Submit profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    setProfileForm((prev) => ({
      ...prev,
      submitting: true,
      error: "",
      success: "",
    }));

    try {
      const fullName =
        `${profileForm.firstName} ${profileForm.lastName}`.trim();

      const response = await authService.updateProfile({
        name: fullName,
        email: profileForm.email,
      });

      // Update user info in context
      updateUserInfo(response.data);

      setProfileForm((prev) => ({
        ...prev,
        submitting: false,
        success: "Profile updated successfully",
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        setProfileForm((prev) => ({ ...prev, success: "" }));
      }, 3000);
    } catch (err) {
      setProfileForm((prev) => ({
        ...prev,
        submitting: false,
        error: err.response?.data?.message || "Failed to update profile",
      }));
    }
  };

  // Submit password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordForm((prev) => ({
        ...prev,
        error: "New passwords do not match",
      }));
      return;
    }

    setPasswordForm((prev) => ({
      ...prev,
      submitting: true,
      error: "",
      success: "",
    }));

    try {
      const response = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Clear password fields
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        submitting: false,
        error: "",
        success: "Password updated successfully",
      });

      // If a new token was returned, update it
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordForm((prev) => ({ ...prev, success: "" }));
      }, 3000);
    } catch (err) {
      setPasswordForm((prev) => ({
        ...prev,
        submitting: false,
        error: err.response?.data?.message || "Failed to update password",
      }));
    }
  };

  return (
    <>
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
            <User className="w-8 h-8 mr-3" />
            My Account
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`w-full text-left p-4 flex items-center ${
                    activeTab === "dashboard"
                      ? "bg-amber-700 text-white"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full text-left p-4 flex items-center ${
                    activeTab === "orders"
                      ? "bg-amber-700 text-white"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <Package className="w-5 h-5 mr-3" />
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab("account_details")}
                  className={`w-full text-left p-4 flex items-center ${
                    activeTab === "account_details"
                      ? "bg-amber-700 text-white"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Account Details
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left p-4 flex items-center text-white hover:bg-gray-800"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Logout
                </button>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-3">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                {activeTab === "dashboard" && (
                  <div className="dashboard">
                    <h2 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Dashboard
                    </h2>
                    <p className="text-white mb-4">
                      Hello, <span className="font-medium">{user.name}</span>!
                    </p>
                    <p className="text-gray-400 mb-6">
                      From your account dashboard you can view your recent
                      orders, manage your shipping and billing addresses, and
                      edit your password and account details.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 bg-opacity-30 p-4 rounded">
                        <h3 className="text-white font-medium mb-2 flex items-center">
                          <Package className="w-4 h-4 mr-2" />
                          Recent Orders
                        </h3>
                        {loading ? (
                          <p className="text-gray-400 flex items-center">
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </p>
                        ) : orders.length > 0 ? (
                          <ul>
                            {orders.slice(0, 3).map((order) => (
                              <li key={order._id} className="mb-2">
                                <Link
                                  to={`/order/${order._id}`}
                                  className="text-amber-600 hover:underline flex items-center"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Order #{order._id.substring(0, 8)} -{" "}
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}
                                </Link>
                              </li>
                            ))}
                            {orders.length > 3 && (
                              <Link
                                to="/orders"
                                className="mt-2 text-amber-600 hover:underline flex items-center"
                              >
                                <ShoppingBag className="w-4 h-4 mr-1" />
                                View All Orders
                              </Link>
                            )}
                          </ul>
                        ) : (
                          <p className="text-gray-400">No orders yet.</p>
                        )}
                      </div>
                      <div className="bg-gray-800 bg-opacity-30 p-4 rounded">
                        <h3 className="text-white font-medium mb-2 flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          Account Information
                        </h3>
                        <p className="text-gray-400 mb-1">Name: {user.name}</p>
                        <p className="text-gray-400 mb-1">
                          Email: {user.email}
                        </p>
                        <button
                          onClick={() => setActiveTab("account_details")}
                          className="text-amber-600 hover:underline mt-2 flex items-center"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Edit Account Details
                        </button>
                      </div>
                    </div>

                    {/* Shopping Cart - Safe from errors with null checking */}
                    <div className="mt-6">
                      <h3 className="text-white font-medium mb-4 pb-2 border-b border-gray-700 flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Shopping Cart
                      </h3>

                      {hasItems ? (
                        <div className="bg-gray-800 bg-opacity-30 p-4 rounded">
                          <div className="space-y-4">
                            {cart.map((item) => (
                              <div
                                key={item.product}
                                className="flex items-center"
                              >
                                <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden">
                                  <img
                                    src={
                                      item.image || "/images/placeholder.jpg"
                                    }
                                    alt={item.name || "Product"}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/images/placeholder.jpg";
                                    }}
                                  />
                                </div>
                                <div className="ml-4 flex-1">
                                  <Link
                                    to={`/product/${item.product}`}
                                    className="text-white hover:text-amber-600"
                                  >
                                    {item.name || "Product"}
                                  </Link>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-gray-400">
                                      Qty: {item.qty || 1}
                                    </span>
                                    <span className="text-amber-600">
                                      £{(item.price || 0).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex justify-between">
                            <Link
                              to="/cart"
                              className="text-amber-600 hover:underline flex items-center"
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              View Cart
                            </Link>
                            <span className="text-white">
                              Total: £
                              {cart
                                .reduce(
                                  (total, item) =>
                                    total +
                                    (item?.price || 0) * (item?.qty || 1),
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-800 bg-opacity-30 rounded">
                          <ShoppingCart className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                          <p className="text-gray-400 mb-4">
                            Your cart is empty
                          </p>
                          <Link
                            to="/products"
                            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors inline-flex items-center"
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Shop Now
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="orders">
                    <h2 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      My Orders
                    </h2>

                    {loading ? (
                      <div className="text-center py-4">
                        <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-600" />
                        <p className="text-white">Loading orders...</p>
                      </div>
                    ) : error ? (
                      <div className="text-red-500 text-center py-4 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        {error}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-white text-center py-8">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-700" />
                        <p className="mb-4">
                          You haven't placed any orders yet.
                        </p>
                        <Link
                          to="/products"
                          className="bg-amber-600 text-white py-2 px-6 rounded inline-block hover:bg-amber-300 hover:text-black transition-colors"
                        >
                          Start Shopping
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-white">
                            <thead className="border-b border-gray-700">
                              <tr>
                                <th className="py-3 text-left">Order ID</th>
                                <th className="py-3 text-left">Date</th>
                                <th className="py-3 text-left">Status</th>
                                <th className="py-3 text-right">Total</th>
                                <th className="py-3 text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map((order) => (
                                <tr
                                  key={order._id}
                                  className="border-b border-gray-700"
                                >
                                  <td className="py-3">
                                    #{order._id.substring(0, 8)}
                                  </td>
                                  <td className="py-3">
                                    {new Date(
                                      order.createdAt
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="py-3">
                                    <span
                                      className={`inline-block px-2 py-1 rounded text-xs ${
                                        order.isPaid
                                          ? "bg-green-900 text-green-200"
                                          : "bg-yellow-900 text-yellow-200"
                                      }`}
                                    >
                                      {order.isPaid ? "Paid" : "Processing"}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right text-amber-600">
                                    GBP {order.totalPrice.toFixed(2)}
                                  </td>
                                  <td className="py-3 text-center">
                                    <Link
                                      to={`/order/${order._id}`}
                                      className="text-amber-600 hover:underline flex items-center justify-center"
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-6 text-center">
                          <Link
                            to="/orders"
                            className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors flex items-center justify-center mx-auto w-fit"
                          >
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            View All Orders
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "account_details" && (
                  <div className="account_details">
                    <h2 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Account Details
                    </h2>

                    {/* Profile Update Form */}
                    <form onSubmit={handleProfileSubmit} className="mb-8">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Personal Information
                      </h3>

                      {profileForm.error && (
                        <div className="bg-red-900 text-white p-3 rounded mb-4 flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          {profileForm.error}
                        </div>
                      )}

                      {profileForm.success && (
                        <div className="bg-green-900 text-white p-3 rounded mb-4 flex items-center">
                          <Check className="w-5 h-5 mr-2" />
                          {profileForm.success}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-white mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={profileForm.firstName}
                            onChange={handleProfileChange}
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
                            value={profileForm.lastName}
                            onChange={handleProfileChange}
                            className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-white mb-2 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                          required
                        />
                      </div>

                      <div className="mt-4">
                        <button
                          type="submit"
                          disabled={profileForm.submitting}
                          className="bg-amber-600 text-white py-2 px-6 rounded hover:bg-amber-300 hover:text-black transition-colors flex items-center"
                        >
                          {profileForm.submitting ? (
                            <>
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Password Change Form */}
                    <form onSubmit={handlePasswordSubmit}>
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Password Change
                      </h3>

                      {passwordForm.error && (
                        <div className="bg-red-900 text-white p-3 rounded mb-4 flex items-center">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          {passwordForm.error}
                        </div>
                      )}

                      {passwordForm.success && (
                        <div className="bg-green-900 text-white p-3 rounded mb-4 flex items-center">
                          <Check className="w-5 h-5 mr-2" />
                          {passwordForm.success}
                        </div>
                      )}

                      <div className="mb-4">
                        <label className="block text-white mb-2">
                          Current Password *
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-white mb-2">
                          New Password *
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-white mb-2">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                          required
                        />
                      </div>

                      <div className="mt-4">
                        <button
                          type="submit"
                          disabled={passwordForm.submitting}
                          className="bg-amber-600 text-white py-2 px-6 rounded hover:bg-amber-300 hover:text-black transition-colors flex items-center"
                        >
                          {passwordForm.submitting ? (
                            <>
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Update Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default AccountPage;
