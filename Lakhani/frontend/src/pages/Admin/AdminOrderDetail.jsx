import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Printer,
  FileText,
  X,
  CreditCard,
  Clock,
  User,
  MapPin,
  Loader,
  CheckSquare,
  XCircle,
  Edit,
  Save,
  ChevronLeft,
  PoundSterling,
  CalendarDays,
  ShoppingBag,
} from "lucide-react";
import { orderService } from "../../services/api";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Status update state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Tracking information state
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: "",
    carrier: "",
    trackingUrl: "",
  });
  const [savingTracking, setSavingTracking] = useState(false);

  // Payment status state
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Order notes state
  const [showNotes, setShowNotes] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Load the order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await orderService.getOrderById(id);
        setOrder(data);

        // Initialize tracking info if exists
        if (data.tracking) {
          setTrackingInfo({
            trackingNumber: data.tracking.trackingNumber || "",
            carrier: data.tracking.carrier || "",
            trackingUrl: data.tracking.trackingUrl || "",
          });
        }

        // Initialize order note if exists
        if (data.adminNotes) {
          setOrderNote(data.adminNotes);
        }

        setError(null);
      } catch (err) {
        setError("Failed to fetch order details. Please try again.");
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Show success message for 3 seconds
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Handle order status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const note = `Status updated to ${newStatus} by admin`;
      const { data } = await orderService.updateOrderStatus(id, {
        status: newStatus,
        note,
      });
      setOrder(data.order);
      showSuccess(`Order status updated to ${newStatus}`);
    } catch (err) {
      setError("Failed to update order status. Please try again.");
      console.error("Error updating order status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle payment status update
  const handlePaymentUpdate = async (isPaid) => {
    try {
      setUpdatingPayment(true);
      const { data } = await orderService.updatePaymentStatus(id, {
        isPaid,
        paidAt: isPaid ? new Date().toISOString() : null,
      });
      setOrder(data.order);
      showSuccess(`Payment status updated to ${isPaid ? "Paid" : "Unpaid"}`);
    } catch (err) {
      setError("Failed to update payment status. Please try again.");
      console.error("Error updating payment status:", err);
    } finally {
      setUpdatingPayment(false);
    }
  };

  // Handle tracking info update
  const handleTrackingChange = (e) => {
    const { name, value } = e.target;
    setTrackingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save tracking information
  const handleTrackingSave = async (e) => {
    e.preventDefault();
    try {
      setSavingTracking(true);
      const { data } = await orderService.updateTracking(id, trackingInfo);
      setOrder(data.order);
      showSuccess("Tracking information updated successfully");
    } catch (err) {
      setError("Failed to update tracking information. Please try again.");
      console.error("Error updating tracking info:", err);
    } finally {
      setSavingTracking(false);
    }
  };

  // Save admin notes
  const handleNoteSave = async (e) => {
    e.preventDefault();
    try {
      setSavingNote(true);
      const { data } = await orderService.updateOrderNotes(id, orderNote);
      setOrder(data.order);
      showSuccess("Admin notes saved successfully");
      setShowNotes(false);
    } catch (err) {
      setError("Failed to save admin notes. Please try again.");
      console.error("Error saving admin notes:", err);
    } finally {
      setSavingNote(false);
    }
  };

  // Cancel order
  const handleCancelOrder = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setUpdatingStatus(true);
      const reason = "Order cancelled by admin";
      const { data } = await orderService.cancelOrder(id, reason);
      setOrder(data.order);
      showSuccess("Order cancelled successfully");
    } catch (err) {
      setError("Failed to cancel order. Please try again.");
      console.error("Error cancelling order:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Print the order details
  const handlePrint = () => {
    window.print();
  };

  // Format date in a readable way
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge based on status
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
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
    }
  };
  return (
    <div className="py-10 print:py-2">
      <div className="container mx-auto px-4 print:px-0">
        <div className="flex flex-col md:flex-row print:flex-col">
          {/* <div className="w-full md:w-1/4 mb-6 md:mb-0 print:hidden"> */}
            <AdminSidebar />
          {/* </div> */}

          <div className="w-full md:w-3/4 md:pl-8 print:pl-0 print:w-full">
            <div className="flex justify-between items-center mb-6 print:hidden">
              <div>
                <Link
                  to="/admin/orders"
                  className="text-amber-500 hover:underline flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
                </Link>
                <h1 className="text-3xl font-bold text-white mt-2 flex items-center">
                  <ShoppingBag className="w-7 h-7 mr-3" />
                  Order #{order && order._id.substring(order._id.length - 6)}
                </h1>
              </div>

              {/* Quick Actions */}
              {order && (
                <div className="flex space-x-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors flex items-center"
                    title="Print Order"
                  >
                    <Printer className="w-4 h-4 mr-1" /> Print
                  </button>
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-1" />{" "}
                    {showNotes ? "Hide Notes" : "Add Notes"}
                  </button>
                </div>
              )}
            </div>

            {/* Print header for receipts */}
            <div className="hidden print:block mb-8">
              <h1 className="text-2xl font-bold text-center">Order Details</h1>
              <p className="text-center text-gray-600">
                {order && `Order #${order._id.substring(order._id.length - 6)}`}
              </p>
              <p className="text-center text-gray-600">
                {order && formatDate(order.createdAt)}
              </p>
              <hr className="my-4" />
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-900 text-white p-4 rounded mb-6 flex items-center print:hidden">
                <AlertTriangle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-900 text-white p-4 rounded mb-6 flex items-center print:hidden">
                <CheckCircle className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
            )}

            {/* Admin Notes Form */}
            {showNotes && order && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6 print:hidden">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Admin Notes
                </h2>
                <form onSubmit={handleNoteSave}>
                  <div className="mb-4">
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      rows="4"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                      placeholder="Add private notes about this order (only visible to administrators)"
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowNotes(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded mr-2 hover:bg-gray-500 transition-colors flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingNote}
                      className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-500 transition-colors flex items-center"
                    >
                      {savingNote ? (
                        <>
                          <Loader className="w-4 h-4 mr-1 animate-spin" />{" "}
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1" /> Save Notes
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-white flex items-center justify-center py-10">
                <Loader className="w-6 h-6 mr-3 animate-spin text-amber-500" />
                Loading order details...
              </div>
            ) : !order ? (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
                <p className="text-white mb-4">Order not found.</p>
                <Link
                  to="/admin/orders"
                  className="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-500 transition-colors flex items-center justify-center w-max mx-auto"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to All Orders
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Summary */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 print:bg-white print:border-gray-300">
                    <h2 className="text-xl font-bold text-white print:text-black mb-4 flex items-center">
                      <Package className="w-5 h-5 mr-2 print:text-black" />
                      Order Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-white print:text-black">
                      <div>
                        <p className="text-gray-400 print:text-gray-600 mb-1 flex items-center">
                          <CalendarDays className="w-4 h-4 mr-1" /> Order Date
                        </p>
                        <p>{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 print:text-gray-600 mb-1 flex items-center">
                          <Clock className="w-4 h-4 mr-1" /> Status
                        </p>
                        <div className="flex items-center print:block">
                          {getStatusBadge(order.status)}
                          <span className="print:inline hidden ml-2">
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 print:text-gray-600 mb-1 flex items-center">
                          <PoundSterling className="w-4 h-4 mr-1" /> Total Amount
                        </p>
                        <p>£{order.totalPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 print:text-gray-600 mb-1 flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" /> Payment Method
                        </p>
                        <p>{order.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 print:text-gray-600 mb-1 flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" /> Payment Status
                        </p>
                        <p>
                          {order.isPaid
                            ? `Paid on ${formatDate(order.paidAt)}`
                            : "Not Paid"}
                        </p>
                      </div>
                      {order.status === "Order Shipped" && order.tracking && (
                        <div className="col-span-2">
                          <p className="text-gray-400 print:text-gray-600 mb-1 flex items-center">
                            <Truck className="w-4 h-4 mr-1" /> Tracking
                            Information
                          </p>
                          <p>
                            {order.tracking.carrier}:{" "}
                            {order.tracking.trackingNumber}
                            {order.tracking.trackingUrl && (
                              <a
                                href={order.tracking.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-amber-500 hover:underline print:hidden"
                              >
                                Track Package
                              </a>
                            )}
                            <span className="hidden print:inline ml-2">
                              {order.tracking.trackingUrl}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Admin Notes Display */}
                    {order.adminNotes && !showNotes && (
                      <div className="mt-5 pt-5 border-t border-gray-700 print:border-gray-300">
                        <h3 className="text-white print:text-black font-medium mb-2 flex items-center">
                          <FileText className="w-4 h-4 mr-2 print:text-black" />
                          Admin Notes:
                        </h3>
                        <p className="text-gray-300 print:text-gray-700 whitespace-pre-line">
                          {order.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 print:bg-white print:border-gray-300">
                    <h2 className="text-xl font-bold text-white print:text-black mb-4 flex items-center">
                      <ShoppingBag className="w-5 h-5 mr-2 print:text-black" />
                      Order Items
                    </h2>
                    <div className="divide-y divide-gray-700 print:divide-gray-300">
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="py-4 flex items-center">
                          <div className="w-16 h-16 bg-gray-700 print:bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-4 flex-grow">
                            <Link
                              to={`/product/${item.product}`}
                              className="text-amber-500 print:text-black hover:underline"
                            >
                              {item.name}
                            </Link>
                            <div className="text-gray-400 print:text-gray-600 text-sm">
                              {item.qty} × £{item.price.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-white print:text-black font-medium">
                            £{(item.qty * item.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-700 print:border-gray-300">
                      <div className="flex justify-between text-gray-400 print:text-gray-600 mb-2">
                        <span>Subtotal:</span>
                        <span>£{order.totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-400 print:text-gray-600 mb-2">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="flex justify-between text-white print:text-black font-medium text-lg mt-2 pt-2 border-t border-gray-700 print:border-gray-300">
                        <span>Total:</span>
                        <span>£{order.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status History (for admin view only) */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 print:hidden">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Status History
                    </h2>

                    <div className="relative">
                      <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-700"></div>

                      {order.statusHistory && order.statusHistory.length > 0 ? (
                        <div className="space-y-6">
                          {order.statusHistory.map((history, index) => (
                            <div key={index} className="relative pl-10">
                              <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center z-10">
                                {history.status === "Order Confirmed" && (
                                  <CheckCircle className="w-4 h-4 text-white" />
                                )}
                                {history.status === "Payment Processing" && (
                                  <CreditCard className="w-4 h-4 text-white" />
                                )}
                                {history.status === "Order Processing" && (
                                  <Package className="w-4 h-4 text-white" />
                                )}
                                {history.status === "Order Shipped" && (
                                  <Truck className="w-4 h-4 text-white" />
                                )}
                                {history.status === "Delivered" && (
                                  <CheckSquare className="w-4 h-4 text-white" />
                                )}
                                {history.status === "Cancelled" && (
                                  <XCircle className="w-4 h-4 text-white" />
                                )}
                              </div>

                              <div>
                                <h3 className="text-white font-medium flex items-center">
                                  {history.status}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                  {formatDate(history.date)}
                                </p>
                                {history.note && (
                                  <p className="text-gray-300 mt-1">
                                    {history.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No status history available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Info and Actions */}
                <div className="lg:col-span-1">
                  {/* Customer Details */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 print:bg-white print:border-gray-300">
                    <h2 className="text-xl font-bold text-white print:text-black mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 print:text-black" />
                      Customer Information
                    </h2>
                    {order.user ? (
                      <>
                        <div className="mb-4">
                          <p className="text-gray-400 print:text-gray-600 mb-1">
                            Name
                          </p>
                          <p className="text-white print:text-black">
                            {order.user.name}
                          </p>
                        </div>
                        <div className="mb-4">
                          <p className="text-gray-400 print:text-gray-600 mb-1">
                            Email
                          </p>
                          <p className="text-white print:text-black">
                            {order.user.email}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 print:text-gray-600">
                        Customer details not available
                      </p>
                    )}
                  </div>

                  {/* Shipping Details */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8 print:bg-white print:border-gray-300">
                    <h2 className="text-xl font-bold text-white print:text-black mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 print:text-black" />
                      Shipping Address
                    </h2>
                    <p className="text-white print:text-black whitespace-pre-line">
                      {order.shippingAddress.address},<br />
                      {order.shippingAddress.city}
                      <br />
                      {order.shippingAddress.postalCode},<br />
                      {order.shippingAddress.country}
                    </p>
                  </div>

                  <h2>
                    <Truck className="w-5 h-5 mr-2" />
                    Tracking Information
                  </h2>
                  <form onSubmit={handleTrackingSave}>
                    <div className="mb-4">
                      <label className="block text-white mb-2">Carrier</label>
                      <input
                        type="text"
                        name="carrier"
                        value={trackingInfo.carrier}
                        onChange={handleTrackingChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                        placeholder="e.g. UPS, FedEx, Royal Mail"
                        disabled={order.status === "Cancelled"}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-white mb-2">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        name="trackingNumber"
                        value={trackingInfo.trackingNumber}
                        onChange={handleTrackingChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                        placeholder="Enter tracking number"
                        disabled={order.status === "Cancelled"}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-white mb-2">
                        Tracking URL (Optional)
                      </label>
                      <input
                        type="url"
                        name="trackingUrl"
                        value={trackingInfo.trackingUrl}
                        onChange={handleTrackingChange}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                        placeholder="https://..."
                        disabled={order.status === "Cancelled"}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={savingTracking || order.status === "Cancelled"}
                      className={`w-full py-2 px-4 rounded font-medium flex items-center justify-center ${
                        savingTracking || order.status === "Cancelled"
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-amber-600 text-white hover:bg-amber-500"
                      }`}
                    >
                      {savingTracking ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save & Ship Order
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Update Order Status */}
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Update Order Status
                  </h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleStatusUpdate("Order Confirmed")}
                      disabled={
                        updatingStatus ||
                        order.status === "Order Confirmed" ||
                        order.status === "Cancelled"
                      }
                      className={`w-full py-2 px-4 rounded font-medium transition-colors flex items-center justify-center ${
                        updatingStatus ||
                        order.status === "Order Confirmed" ||
                        order.status === "Cancelled"
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-500"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Confirmed
                    </button>

                    <button
                      onClick={() => handleStatusUpdate("Payment Processing")}
                      disabled={
                        updatingStatus ||
                        order.status === "Payment Processing" ||
                        order.status === "Cancelled"
                      }
                      className={`w-full py-2 px-4 rounded font-medium transition-colors flex items-center justify-center ${
                        updatingStatus ||
                        order.status === "Payment Processing" ||
                        order.status === "Cancelled"
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-yellow-600 text-white hover:bg-yellow-500"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Mark as Payment Processing
                    </button>

                    <button
                      onClick={() => handleStatusUpdate("Order Processing")}
                      disabled={
                        updatingStatus ||
                        order.status === "Order Processing" ||
                        order.status === "Cancelled"
                      }
                      className={`w-full py-2 px-4 rounded font-medium transition-colors flex items-center justify-center ${
                        updatingStatus ||
                        order.status === "Order Processing" ||
                        order.status === "Cancelled"
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-purple-600 text-white hover:bg-purple-500"
                      }`}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Mark as Processing
                    </button>

                    <button
                      onClick={() => handleStatusUpdate("Order Shipped")}
                      disabled={
                        updatingStatus ||
                        order.status === "Order Shipped" ||
                        order.status === "Delivered" ||
                        order.status === "Cancelled"
                      }
                      className={`w-full py-2 px-4 rounded font-medium transition-colors flex items-center justify-center ${
                        updatingStatus ||
                        order.status === "Order Shipped" ||
                        order.status === "Delivered" ||
                        order.status === "Cancelled"
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-indigo-600 text-white hover:bg-indigo-500"
                      }`}
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Mark as Shipped
                    </button>

                    <button
                      onClick={() => handleStatusUpdate("Delivered")}
                      disabled={
                        updatingStatus ||
                        order.status === "Delivered" ||
                        order.status === "Cancelled"
                      }
                      className={`w-full py-2 px-4 rounded font-medium transition-colors flex items-center justify-center ${
                        updatingStatus ||
                        order.status === "Delivered" ||
                        order.status === "Cancelled"
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-500"
                      }`}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Mark as Delivered
                    </button>

                    <button
                      onClick={handleCancelOrder}
                      disabled={
                        updatingStatus ||
                        order.status === "Delivered" ||
                        order.status === "Cancelled"
                      }
                      className={`w-full py-2 px-4 rounded font-medium transition-colors flex items-center justify-center ${
                        updatingStatus ||
                        order.status === "Delivered" ||
                        order.status === "Cancelled"
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-500"
                      }`}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
