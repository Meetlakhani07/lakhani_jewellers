import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  CreditCard,
  Truck,
  CheckSquare,
  XCircle,
  Loader,
  CalendarDays,
  PoundSterling,
  User,
  Eye,
  AlertTriangle,
  ChevronDown,
  SlidersHorizontal,
  ShoppingBag,
} from "lucide-react";
import { orderService } from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminOrders = () => {
  // State for orders data
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortOption, setSortOption] = useState("createdAt-desc");
  const [currentPage, setCurrentPage] = useState(1);

  // Load orders with filters
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Build query params object
        const params = {
          page: currentPage,
          limit: 10,
        };

        // Get sort values
        const [sortBy, sortOrder] = sortOption.split("-");
        params.sortBy = sortBy;
        params.order = sortOrder;

        // Add status filter if not "all"
        if (status !== "all") {
          params.status = status;
        }

        // Add search term if present
        if (searchTerm) {
          params.search = searchTerm;
        }

        const response = await orderService.getAllOrders(params);
        setOrders(response.data.orders || []);
        setPagination(
          response.data.pagination || {
            total: response.data.orders?.length || 0,
            page: 1,
            pages: 1,
            limit: 10,
          }
        );
        setError(null);
      } catch (err) {
        setError("Failed to fetch orders. Please try again.");
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status, currentPage, searchTerm, sortOption]);

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1); 
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Reset all filters
  const resetFilters = () => {
    setStatus("all");
    setSearchTerm("");
    setSearchInput("");
    setSortOption("createdAt-desc");
    setCurrentPage(1);
  };

  // Format date in a readable way
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Order Confirmed":
        return (
          <span className="flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      case "Payment Processing":
        return (
          <span className="flex items-center px-3 py-1 bg-yellow-600 text-white text-xs rounded-full">
            <CreditCard className="w-3 h-3 mr-1" />
            Payment
          </span>
        );
      case "Order Processing":
        return (
          <span className="flex items-center px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
            <Package className="w-3 h-3 mr-1" />
            Processing
          </span>
        );
      case "Order Shipped":
        return (
          <span className="flex items-center px-3 py-1 bg-indigo-600 text-white text-xs rounded-full">
            <Truck className="w-3 h-3 mr-1" />
            Shipped
          </span>
        );
      case "Delivered":
        return (
          <span className="flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-full">
            <CheckSquare className="w-3 h-3 mr-1" />
            Delivered
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded-full">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center px-3 py-1 bg-gray-600 text-white text-xs rounded-full">
            <Package className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
    }
  };

  // Calculate the range of orders being displayed
  const startItem = ((pagination.page || 1) - 1) * (pagination.limit || 10) + 1;
  const endItem = Math.min(
    (pagination.page || 1) * (pagination.limit || 10),
    pagination.total || 0
  );

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          {/* <div className="w-full md:w-1/4 mb-6 mr-5 md:mb-0"> */}
            <AdminSidebar />
          {/* </div> */}

          <div className="w-full md:w-3/4 md:pl-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white flex items-center">
                <ShoppingBag className="w-7 h-7 mr-3" />
                Orders Management
              </h1>
              <p className="text-gray-400 mt-2">
                View and manage all customer orders
              </p>
            </div>

            {/* Filters and Search */}
            <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-4">
                <h2 className="text-white text-lg font-semibold flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter Orders
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-gray-400 hover:text-amber-600 flex items-center transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reset Filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Box */}
                <div className="col-span-1 md:col-span-3 lg:col-span-1">
                  <form onSubmit={handleSearch} className="flex">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by order ID or customer"
                        className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg text-white focus:outline-none focus:border-amber-600"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-amber-600 text-white px-4 rounded-r-lg hover:bg-amber-500 transition-colors"
                    >
                      Search
                    </button>
                  </form>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-600 appearance-none"
                    value={status}
                    onChange={handleStatusChange}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Order Confirmed">Order Confirmed</option>
                    <option value="Payment Processing">
                      Payment Processing
                    </option>
                    <option value="Order Processing">Order Processing</option>
                    <option value="Order Shipped">Order Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Sort By */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SlidersHorizontal className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-600 appearance-none"
                    value={sortOption}
                    onChange={handleSortChange}
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="totalPrice-desc">Price: High to Low</option>
                    <option value="totalPrice-asc">Price: Low to High</option>
                    <option value="status-asc">Status: A to Z</option>
                    <option value="status-desc">Status: Z to A</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900 text-white p-4 rounded mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="text-white flex items-center justify-center py-12">
                <Loader className="w-6 h-6 mr-3 animate-spin text-amber-500" />
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-white text-lg mb-4">No orders found</p>
                <p className="text-gray-400 mb-6">
                  {searchTerm || status !== "all"
                    ? "Try changing your search or filter criteria"
                    : "There are no orders in the system yet"}
                </p>
                {(searchTerm || status !== "all") && (
                  <button
                    onClick={resetFilters}
                    className="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-500 transition-colors inline-flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results summary */}
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-400">
                    Showing {startItem}-{endItem} of {pagination.total} orders
                  </p>
                </div>

                {/* Orders Table */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {orders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Link
                                to={`/admin/orders/${order._id}`}
                                className="text-amber-500 hover:text-amber-400 hover:underline font-medium"
                              >
                                #{order._id.substring(order._id.length - 6)}
                              </Link>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              <div className="flex items-center">
                                <CalendarDays className="h-4 w-4 mr-2 text-gray-400" />
                                {formatDate(order.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                {order.user?.name || "Guest"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              <div className="flex items-center">
                                <PoundSterling className="h-4 w-4 mr-1 text-gray-400" />
                                {order.totalPrice.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                to={`/admin/orders/${order._id}`}
                                className="text-amber-500 hover:text-amber-400 flex items-center w-max"
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
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center mt-6">
                    <nav className="flex items-center space-x-1">
                      <button
                        onClick={() =>
                          handlePageChange(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className={`p-2 rounded-md ${
                          currentPage === 1
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-white hover:bg-gray-700"
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      {/* Page numbers */}
                      {(() => {
                        const pages = [];
                        const maxPagesToShow = 5;

                        // Calculate range of pages to show
                        let startPage = Math.max(
                          1,
                          currentPage - Math.floor(maxPagesToShow / 2)
                        );
                        let endPage = Math.min(
                          pagination.pages,
                          startPage + maxPagesToShow - 1
                        );

                        // Adjust if we're near the end
                        if (endPage - startPage + 1 < maxPagesToShow) {
                          startPage = Math.max(1, endPage - maxPagesToShow + 1);
                        }

                        // Always show first page
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => handlePageChange(1)}
                              className="px-3 py-1 rounded-md text-white hover:bg-gray-700"
                            >
                              1
                            </button>
                          );

                          // Add ellipsis if there's a gap
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="text-gray-500">
                                ...
                              </span>
                            );
                          }
                        }

                        // Add page numbers
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => handlePageChange(i)}
                              className={`px-3 py-1 rounded-md ${
                                currentPage === i
                                  ? "bg-amber-600 text-white"
                                  : "text-white hover:bg-gray-700"
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Always show last page
                        if (endPage < pagination.pages) {
                          // Add ellipsis if there's a gap
                          if (endPage < pagination.pages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="text-gray-500">
                                ...
                              </span>
                            );
                          }

                          pages.push(
                            <button
                              key={pagination.pages}
                              onClick={() => handlePageChange(pagination.pages)}
                              className="px-3 py-1 rounded-md text-white hover:bg-gray-700"
                            >
                              {pagination.pages}
                            </button>
                          );
                        }

                        return pages;
                      })()}

                      <button
                        onClick={() =>
                          handlePageChange(
                            Math.min(pagination.pages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === pagination.pages}
                        className={`p-2 rounded-md ${
                          currentPage === pagination.pages
                            ? "text-gray-500 cursor-not-allowed"
                            : "text-white hover:bg-gray-700"
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
