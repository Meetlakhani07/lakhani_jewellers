import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { orderService, productService } from "../../services/api";
import {
  FaBox,
  FaShoppingBag,
  FaMoneyBillWave,
  FaClock,
  FaUser,
} from "react-icons/fa";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    revenue: {
      total: 0,
      lastMonth: 0,
    },
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const ordersResponse = await orderService.getAllOrders({
          page: 1,
          limit: 100, // Get enough orders to calculate stats
        });

        const ordersData =
          ordersResponse.data.orders || ordersResponse.data || [];
        const orders = Array.isArray(ordersData) ? ordersData : [];

        // Set recent orders (only the first 5)
        setRecentOrders(orders.slice(0, 5));

        // Calculate order statistics
        const confirmedOrders = orders.filter(
          (order) => order.status === "Order Confirmed"
        ).length;
        const paymentProcessingOrders = orders.filter(
          (order) => order.status === "Payment Processing"
        ).length;
        const orderProcessingOrders = orders.filter(
          (order) => order.status === "Order Processing"
        ).length;
        const shippedOrders = orders.filter(
          (order) => order.status === "Order Shipped"
        ).length;
        const deliveredOrders = orders.filter(
          (order) => order.status === "Delivered"
        ).length;

        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => {
          // Only count completed/delivered orders in revenue
          if (order.status === "Delivered" || order.isPaid) {
            return sum + (order.totalPrice || 0);
          }
          return sum;
        }, 0);

        // Calculate last month's revenue
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthRevenue = orders.reduce((sum, order) => {
          const orderDate = new Date(order.createdAt);
          if (
            (order.status === "Delivered" || order.isPaid) &&
            orderDate >= lastMonth &&
            orderDate < now
          ) {
            return sum + (order.totalPrice || 0);
          }
          return sum;
        }, 0);

        // Fetch products
        const productsResponse = await productService.getAllProducts();
        const products = productsResponse.data || [];
        const totalProducts = Array.isArray(products) ? products.length : 0;

        // Set all dashboard stats
        setStats({
          totalOrders: orders.length,
          pendingOrders: confirmedOrders + paymentProcessingOrders,
          processingOrders: orderProcessingOrders,
          shippedOrders: shippedOrders,
          deliveredOrders: deliveredOrders,
          totalProducts: totalProducts,
          totalUsers: 0, // Can't get this without a user endpoint
          revenue: {
            total: totalRevenue,
            lastMonth: lastMonthRevenue,
          },
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Error fetching dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date in a readable way
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Return status badge based on order status
  const getStatusBadge = (status) => {
    if (!status)
      return (
        <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
          Unknown
        </span>
      );

    // Match status based on the actual values from your backend
    if (status === "Order Confirmed") {
      return (
        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
          Confirmed
        </span>
      );
    } else if (
      status === "Payment Processing" ||
      status === "Order Processing"
    ) {
      return (
        <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
          Processing
        </span>
      );
    } else if (status === "Order Shipped") {
      return (
        <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
          Shipped
        </span>
      );
    } else if (status === "Delivered") {
      return (
        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
          Delivered
        </span>
      );
    } else if (status === "Cancelled") {
      return (
        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
          Cancelled
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
          {status}
        </span>
      );
    }
  };

  // Get order ID display (last 6 characters or full if shorter)
  const getOrderIdDisplay = (orderId) => {
    if (!orderId) return "N/A";

    if (typeof orderId === "object" && orderId._id) {
      orderId = orderId._id;
    }

    const idStr = String(orderId);
    return idStr.length > 6 ? idStr.substring(idStr.length - 6) : idStr;
  };

  // Get customer name from order
  const getCustomerName = (order) => {
    if (!order) return "Guest";

    // Handle different user data structures
    if (order.user) {
      if (typeof order.user === "object") {
        return order.user.name || order.user.email || "Guest";
      }
      return order.user;
    }

    return "Guest";
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />

          <div className="w-full md:w-3/4 md:pl-8">
            <h1 className="text-3xl font-bold text-white mb-8">
              Admin Dashboard
            </h1>

            {error && (
              <div className="bg-red-900 text-white p-4 rounded mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-white text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500 mb-4"></div>
                <p>Loading dashboard data...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-amber-500 transition-colors">
                    <div className="flex items-center mb-3">
                      <div className="bg-amber-600/20 p-3 rounded-lg">
                        <FaShoppingBag className="text-amber-500 text-xl" />
                      </div>
                      <h3 className="text-amber-500 text-lg font-medium ml-3">
                        Total Orders
                      </h3>
                    </div>
                    <p className="text-3xl text-white font-bold">
                      {stats.totalOrders}
                    </p>
                    <Link
                      to="/admin/orders"
                      className="text-sm text-amber-500 hover:underline mt-2 inline-block"
                    >
                      View all orders
                    </Link>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-amber-500 transition-colors">
                    <div className="flex items-center mb-3">
                      <div className="bg-yellow-600/20 p-3 rounded-lg">
                        <FaClock className="text-yellow-500 text-xl" />
                      </div>
                      <h3 className="text-yellow-500 text-lg font-medium ml-3">
                        Processing
                      </h3>
                    </div>
                    <p className="text-3xl text-white font-bold">
                      {stats.processingOrders || stats.pendingOrders || 0}
                    </p>
                    <Link
                      to="/admin/orders?status=processing"
                      className="text-sm text-yellow-500 hover:underline mt-2 inline-block"
                    >
                      View processing orders
                    </Link>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-amber-500 transition-colors">
                    <div className="flex items-center mb-3">
                      <div className="bg-blue-600/20 p-3 rounded-lg">
                        <FaBox className="text-blue-500 text-xl" />
                      </div>
                      <h3 className="text-blue-500 text-lg font-medium ml-3">
                        Products
                      </h3>
                    </div>
                    <p className="text-3xl text-white font-bold">
                      {stats.totalProducts}
                    </p>
                    <Link
                      to="/admin/products"
                      className="text-sm text-blue-500 hover:underline mt-2 inline-block"
                    >
                      Manage products
                    </Link>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-amber-500 transition-colors">
                    <div className="flex items-center mb-3">
                      <div className="bg-green-600/20 p-3 rounded-lg">
                        <FaMoneyBillWave className="text-green-500 text-xl" />
                      </div>
                      <h3 className="text-green-500 text-lg font-medium ml-3">
                        Revenue
                      </h3>
                    </div>
                    <p className="text-3xl text-white font-bold">
                      {formatCurrency(stats.revenue.total)}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {formatCurrency(stats.revenue.lastMonth)} last month
                    </p>
                  </div>
                </div>

                {/* Order Status Summary */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
                  <h3 className="text-xl text-white font-bold mb-4">
                    Order Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-400">Confirmed</p>
                      <p className="text-2xl text-white font-bold">
                        {stats.pendingOrders || 0}
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-400">Processing</p>
                      <p className="text-2xl text-white font-bold">
                        {stats.processingOrders || 0}
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-400">Shipped</p>
                      <p className="text-2xl text-white font-bold">
                        {stats.shippedOrders || 0}
                      </p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-400">Delivered</p>
                      <p className="text-2xl text-white font-bold">
                        {stats.deliveredOrders || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Orders and Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl text-white font-bold mb-4">
                      Recent Orders
                    </h3>
                    <div className="space-y-4">
                      {recentOrders.length === 0 ? (
                        <p className="text-gray-400 py-4">No orders found.</p>
                      ) : (
                        recentOrders.map((order) => (
                          <div
                            key={order._id}
                            className="flex items-center justify-between py-3 border-b border-gray-700 hover:bg-gray-700/50 px-2 rounded transition-colors"
                          >
                            <div>
                              <Link
                                to={`/admin/orders/${order._id}`}
                                className="text-amber-500 hover:underline font-medium"
                              >
                                #{getOrderIdDisplay(order._id)}
                              </Link>
                              <p className="text-sm text-gray-400">
                                {formatDate(order.createdAt)} •{" "}
                                {getCustomerName(order)}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="text-white mr-3 font-medium">
                                {formatCurrency(order.totalPrice)}
                              </span>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {recentOrders.length > 0 && (
                      <div className="mt-6 text-center">
                        <Link
                          to="/admin/orders"
                          className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                        >
                          View all orders →
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl text-white font-bold mb-4">
                      Quick Actions
                    </h3>
                    <div className="grid gap-4">
                      <Link
                        to="/admin/products/new"
                        className="bg-amber-600 text-white py-3 px-4 rounded text-center hover:bg-amber-500 transition-colors flex items-center justify-center"
                      >
                        <FaBox className="mr-2" /> Add New Product
                      </Link>
                      <Link
                        to="/admin/categories"
                        className="bg-amber-600 text-white py-3 px-4 rounded text-center hover:bg-amber-500 transition-colors flex items-center justify-center"
                      >
                        <FaShoppingBag className="mr-2" /> Manage Categories
                      </Link>
                      <Link
                        to="/admin/orders"
                        className="bg-amber-600 text-white py-3 px-4 rounded text-center hover:bg-amber-500 transition-colors flex items-center justify-center"
                      >
                        <FaClock className="mr-2" /> Process Orders
                      </Link>
                      <Link
                        to="/admin/shop-info"
                        className="bg-amber-600 text-white py-3 px-4 rounded text-center hover:bg-amber-500 transition-colors flex items-center justify-center"
                      >
                        <FaUser className="mr-2" /> Update Shop Info
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
