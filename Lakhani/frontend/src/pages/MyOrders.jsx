import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/api";
import Header from "../components/layout/Header";

import {
  ShoppingBag,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Eye,
  CalendarRange,
  ClipboardList,
  Package,
  Truck,
  CreditCard,
  XCircle,
  Filter,
  RefreshCcw,
  Loader,
} from "lucide-react";

import Footer from "../components/layout/Footer";

const MyOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await orderService.getUserOrders();
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  useEffect(() => {
    // Apply filters and search
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "paid") {
        result = result.filter((order) => order.isPaid);
      } else if (statusFilter === "processing") {
        result = result.filter((order) => !order.isPaid);
      } else if (statusFilter === "delivered") {
        result = result.filter((order) => order.isDelivered);
      } else if (statusFilter === "shipping") {
        result = result.filter((order) => order.isPaid && !order.isDelivered);
      }
    }

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (order) =>
          order._id.toLowerCase().includes(term) ||
          order.orderItems.some((item) =>
            item.name.toLowerCase().includes(term)
          )
      );
    }

    // Apply sorting
    if (sortBy === "date-desc") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "date-asc") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "total-desc") {
      result.sort((a, b) => b.totalPrice - a.totalPrice);
    } else if (sortBy === "total-asc") {
      result.sort((a, b) => a.totalPrice - b.totalPrice);
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, statusFilter, searchTerm, sortBy]);

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate order status badge
  const getStatusBadge = (order) => {
    if (order.isDelivered) {
      return (
        <span className="flex items-center bg-green-900 text-green-200 px-3 py-1 rounded-full text-xs font-medium">
          <CheckCircle className="w-3 h-3 mr-1" />
          Delivered
        </span>
      );
    } else if (order.isPaid) {
      return (
        <span className="flex items-center bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
          <Truck className="w-3 h-3 mr-1" />
          Shipping
        </span>
      );
    } else {
      return (
        <span className="flex items-center bg-yellow-900 text-yellow-200 px-3 py-1 rounded-full text-xs font-medium">
          <Clock className="w-3 h-3 mr-1" />
          Processing
        </span>
      );
    }
  };

  // Handle print receipt
  const handlePrint = (orderId) => {
    navigate(`/order-confirmation/${orderId}`);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("date-desc");
  };

  return (
    <>
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <ShoppingBag className="mr-3 h-8 w-8" />
              My Orders
            </h1>
            <Link
              to="/account"
              className="text-amber-600 hover:text-amber-500 flex items-center"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Account
            </Link>
          </div>

          {error && (
            <div className="bg-red-900 text-white p-4 rounded mb-6 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-5 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <h2 className="text-white text-lg font-semibold flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filter Orders
              </h2>
              <button
                onClick={resetFilters}
                className="text-gray-400 hover:text-amber-600 flex items-center transition-colors"
              >
                <RefreshCcw className="w-4 h-4 mr-1" />
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {/* Search Box */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders by ID or product name"
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-600 appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="shipping">Shipping</option>
                  <option value="delivered">Delivered</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Sort By */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarRange className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-600 appearance-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="total-desc">Price: High to Low</option>
                  <option value="total-asc">Price: Low to High</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-10">
              <Loader className="h-10 w-10 text-amber-600 animate-spin mx-auto mb-4" />
              <p className="text-white">Loading your orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-10 text-center">
              <ClipboardList className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white text-xl font-medium mb-2">
                No Orders Found
              </h3>
              <p className="text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? "Try changing your search or filter criteria"
                  : "You haven't placed any orders yet"}
              </p>
              <Link
                to="/products"
                className="mt-6 inline-block bg-amber-600 text-white py-2 px-6 rounded hover:bg-amber-500 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-gray-400">
                Showing {indexOfFirstOrder + 1}-
                {Math.min(indexOfLastOrder, filteredOrders.length)} of{" "}
                {filteredOrders.length} orders
              </p>

              {currentOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="bg-gray-800 p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-white font-medium">
                          Order #{order._id.substring(0, 8)}
                        </h3>
                        <span className="ml-3">{getStatusBadge(order)}</span>
                      </div>
                      <p className="text-gray-400 text-sm flex items-center mt-1">
                        <CalendarRange className="w-4 h-4 mr-1" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 mt-3 md:mt-0">
                      <button
                        onClick={() => handlePrint(order._id)}
                        className="flex items-center text-gray-400 hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Receipt</span>
                      </button>
                      <Link
                        to={`/order/${order._id}`}
                        className="flex items-center text-amber-600 hover:text-amber-500 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">View Details</span>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-4">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-700">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex justify-between">
                              <h4 className="text-white">{item.name}</h4>
                              <p className="text-amber-600 font-medium">
                                GBP {(item.price * item.qty).toFixed(2)}
                              </p>
                            </div>
                            <p className="text-gray-400 text-sm">
                              Qty: {item.qty} x GBP {item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-800 bg-opacity-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="flex items-center">
                      <div className="mr-6">
                        <p className="text-gray-400 text-sm">Payment Method</p>
                        <p className="text-white flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {order.paymentMethod === "credit_card"
                            ? "Credit Card"
                            : order.paymentMethod}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Shipping To</p>
                        <p className="text-white truncate max-w-xs">
                          {order.shippingAddress.address},{" "}
                          {order.shippingAddress.city}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <p className="text-gray-400 text-sm">Total Amount</p>
                      <p className="text-xl font-bold text-amber-600">
                        GBP {order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md ${
                        currentPage === 1
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-white hover:bg-gray-800"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {[...Array(totalPages).keys()].map((number) => (
                      <button
                        key={number + 1}
                        onClick={() => handlePageChange(number + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === number + 1
                            ? "bg-amber-600 text-white"
                            : "text-white hover:bg-gray-800"
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}

                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md ${
                        currentPage === totalPages
                          ? "text-gray-500 cursor-not-allowed"
                          : "text-white hover:bg-gray-800"
                      }`}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer/>
    </>
  );
};

// ChevronDown icon component
const ChevronDown = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
};

export default MyOrdersPage;
