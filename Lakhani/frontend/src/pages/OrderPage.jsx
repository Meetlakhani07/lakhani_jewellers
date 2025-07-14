import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderService } from "../services/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";


import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  Printer,
  Clock,
  ChevronLeft,
  ExternalLink,
  MapPin,
  User,
  CreditCard,
  ShoppingBag,
  Loader,
  Calendar,
  CheckSquare,
  XCircle,
} from "lucide-react";

const OrderPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await orderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch order details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Handle printing the receipt
  const handlePrint = () => {
    navigate(`/order-confirmation/${id}`);
  };

  // Format date in a readable way
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
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
            Payment Processing
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
            {status || "Processing"}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Loader className="h-10 w-10 text-amber-600 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Loading order details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-red-900 text-white p-4 rounded mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Link
            to="/account"
            className="text-amber-600 hover:underline flex items-center"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to My Account
          </Link>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-white text-lg">Order not found</p>
            <Link
              to="/account"
              className="text-amber-600 hover:underline mt-4 inline-flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to My Account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Package className="w-8 h-8 mr-3" />
              Order #{id.substring(0, 8)}
            </h1>
            <Link
              to="/account"
              className="text-amber-600 hover:underline flex items-center"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Back to My Account
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Order Status Banner */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-white font-medium mb-1">Order Status</h2>
                  <div className="flex items-center">
                    {getStatusBadge(order.status)}
                    <span className="ml-2 text-gray-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <button
                    onClick={handlePrint}
                    className="flex items-center bg-gray-700 text-white py-2 px-3 rounded hover:bg-gray-600 transition-colors"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Receipt
                  </button>
                  {order.tracking && order.tracking.trackingUrl && (
                    <a
                      href={order.tracking.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center bg-amber-600 text-white py-2 px-3 rounded hover:bg-amber-500 transition-colors"
                    >
                      <Truck className="w-4 h-4 mr-2" />
                      Track Order
                    </a>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Order Items
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-700">
                        <tr>
                          <th className="py-3 text-left text-white">Product</th>
                          <th className="py-3 text-center text-white">Price</th>
                          <th className="py-3 text-center text-white">
                            Quantity
                          </th>
                          <th className="py-3 text-right text-white">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderItems.map((item, index) => (
                          <tr key={index} className="border-b border-gray-700">
                            <td className="py-4">
                              <div className="flex items-center">
                                <div className="w-16 h-16 mr-4">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover rounded"
                                  />
                                </div>
                                <div>
                                  <Link
                                    to={`/product/${item.product}`}
                                    className="text-white hover:text-amber-600"
                                  >
                                    {item.name}
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-center text-amber-600">
                              GBP {item.price.toFixed(2)}
                            </td>
                            <td className="py-4 text-center text-white">
                              {item.qty}
                            </td>
                            <td className="py-4 text-right text-amber-600 font-medium">
                              GBP {(item.price * item.qty).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Order Progress Timeline */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Order Progress
                </h2>

                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-700"></div>

                  <div className="relative space-y-8">
                    {/* Order Confirmed */}
                    <div className="relative pl-10">
                      <div
                        className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center z-10 
                      ${order.status ? "bg-green-600" : "bg-gray-700"}`}
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          Order Confirmed
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-gray-300 mt-1">
                          Your order has been received and is being processed.
                        </p>
                      </div>
                    </div>

                    {/* Order Processing */}
                    <div className="relative pl-10">
                      <div
                        className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center z-10 
                      ${
                        [
                          "Order Processing",
                          "Order Shipped",
                          "Delivered",
                        ].includes(order.status)
                          ? "bg-green-600"
                          : "bg-gray-700"
                      }`}
                      >
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          Order Processing
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {[
                            "Order Processing",
                            "Order Shipped",
                            "Delivered",
                          ].includes(order.status)
                            ? order.statusHistory &&
                              order.statusHistory.find(
                                (h) => h.status === "Order Processing"
                              )
                              ? formatDate(
                                  order.statusHistory.find(
                                    (h) => h.status === "Order Processing"
                                  ).date
                                )
                              : "In progress"
                            : "Pending"}
                        </p>
                        <p className="text-gray-300 mt-1">
                          Your order is being prepared for shipment.
                        </p>
                      </div>
                    </div>

                    {/* Order Shipped */}
                    <div className="relative pl-10">
                      <div
                        className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center z-10 
                      ${
                        ["Order Shipped", "Delivered"].includes(order.status)
                          ? "bg-green-600"
                          : "bg-gray-700"
                      }`}
                      >
                        <Truck className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">
                          Order Shipped
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {["Order Shipped", "Delivered"].includes(order.status)
                            ? order.statusHistory &&
                              order.statusHistory.find(
                                (h) => h.status === "Order Shipped"
                              )
                              ? formatDate(
                                  order.statusHistory.find(
                                    (h) => h.status === "Order Shipped"
                                  ).date
                                )
                              : "Shipped"
                            : "Pending"}
                        </p>
                        {order.tracking && order.status === "Order Shipped" && (
                          <div className="text-gray-300 mt-1">
                            <p>
                              Your order has been shipped via{" "}
                              {order.tracking.carrier} with tracking number:{" "}
                              {order.tracking.trackingNumber}
                            </p>
                            {order.tracking.trackingUrl && (
                              <a
                                href={order.tracking.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-600 hover:underline mt-1 inline-flex items-center"
                              >
                                <Truck className="w-4 h-4 mr-1" />
                                Track your package
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            )}
                          </div>
                        )}
                        {!["Order Shipped", "Delivered"].includes(
                          order.status
                        ) && (
                          <p className="text-gray-300 mt-1">
                            Your order will be shipped soon.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivered */}
                    <div className="relative pl-10">
                      <div
                        className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center z-10 
                      ${
                        order.status === "Delivered"
                          ? "bg-green-600"
                          : "bg-gray-700"
                      }`}
                      >
                        <CheckSquare className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Delivered</h3>
                        <p className="text-gray-400 text-sm">
                          {order.status === "Delivered"
                            ? order.deliveredAt
                              ? formatDate(order.deliveredAt)
                              : "Delivered"
                            : "Pending"}
                        </p>
                        <p className="text-gray-300 mt-1">
                          {order.status === "Delivered"
                            ? "Your order has been delivered."
                            : "Your order will be delivered soon."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-1">
              {/* Order Summary */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-700 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Summary
                </h2>

                <div className="mb-4">
                  <div className="flex justify-between py-2">
                    <span className="text-white">Order Number:</span>
                    <span className="text-amber-500 font-medium">
                      {id.substring(0, 8)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white">Order Date:</span>
                    <span className="text-gray-300">
                      {formatDate(order.createdAt).split(",")[0]}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white">Status:</span>
                    <span>{getStatusBadge(order.status)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <div className="flex justify-between py-2">
                    <span className="text-white">Items Price:</span>
                    <span className="text-amber-600">
                      GBP {order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-white">Shipping:</span>
                    <span className="text-white">Free</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-700 mt-2">
                    <span className="text-white font-medium">Total:</span>
                    <span className="text-amber-600 font-bold">
                      GBP {order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-gray-700 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </h2>

                <div className="mb-3">
                  <p className="text-gray-400 mb-1">Method:</p>
                  <p className="text-white capitalize flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {order.paymentMethod}
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-gray-400 mb-1">Status:</p>
                  <p className="text-white">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        order.isPaid
                          ? "bg-green-900 text-green-200"
                          : "bg-yellow-900 text-yellow-200"
                      }`}
                    >
                      Paid
                    </span>
                  </p>
                </div>

                {order.isPaid && order.paidAt && (
                  <div>
                    <p className="text-gray-400 mb-1">Paid on:</p>
                    <p className="text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(order.paidAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Shipping Information */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-gray-700 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Information
                </h2>
                <div className="mb-4 text-gray-300">
                  <p className="mb-1">
                    <span className="font-medium text-white">Address:</span>{" "}
                    {order.shippingAddress.address}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium text-white">City:</span>{" "}
                    {order.shippingAddress.city}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium text-white">Postal Code:</span>{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium text-white">Country:</span>{" "}
                    {order.shippingAddress.country}
                  </p>
                </div>

                {order.tracking && order.tracking.trackingNumber && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="font-medium text-white mb-1">
                      Tracking Information:
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium text-white">Carrier:</span>{" "}
                      {order.tracking.carrier}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium text-white">
                        Tracking Number:
                      </span>{" "}
                      {order.tracking.trackingNumber}
                    </p>
                    {order.tracking.trackingUrl && (
                      <a
                        href={order.tracking.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:underline mt-2 inline-flex items-center"
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Track your package
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </>
  );
};

export default OrderPage;
