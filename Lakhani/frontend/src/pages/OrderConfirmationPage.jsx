import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle,
  Printer,
  Package,
  Truck,
  ShoppingBag,
  Clock,
  ChevronLeft,
  ShieldCheck,
  CalendarCheck,
  CreditCard,
  Loader,
  AlertTriangle,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { orderService } from "../services/api";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);

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

  // Native browser print function
  const handlePrint = () => {
    // Add print-specific classes to body before printing
    document.body.classList.add("is-printing");

    // Small timeout to ensure styles are applied
    setTimeout(() => {
      window.print();

      // Remove classes after print dialog is closed
      setTimeout(() => {
        document.body.classList.remove("is-printing");
      }, 500);
    }, 100);
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const orderDate = formatDate(order.createdAt);
  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const estimatedDeliveryDate = formatDate(estimatedDelivery);

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
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded-full">
            <AlertTriangle className="w-3 h-3 mr-1" />
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

  return (
    <>
      <Header />
      <section className="py-16 print:py-0 print:my-0">
        <div className="container mx-auto px-4 print:px-0">
          <div className="order-receipt max-w-4xl mx-auto">
            {/* Header logo for print only */}
            <div className="hidden print:block text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Lakhani Jewellers</h1>
              <p className="text-base">Leicester, United Kingdom</p>
              <p className="text-sm">
                Phone: +44 123 456 7890 | Email: contact@lakhaniJewellers.com
              </p>
              <div className="border-b-2 border-gray-300 my-4"></div>
            </div>

            {/* Success Header Section */}
            <div className="text-center mb-10 print:mb-4">
              <div className="text-green-500 mb-6 print:hidden">
                <CheckCircle className="w-20 h-20 mx-auto" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-bold text-white print:text-black mb-4">
                Thank You for Your Order!
              </h1>
              <p className="text-gray-400 print:text-gray-700 mb-6 text-lg max-w-2xl mx-auto">
                Your order has been placed successfully and is now being
                processed. Your order confirmation is below.
              </p>

              <div className="flex justify-center space-x-4 mb-8 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Print Receipt
                </button>
                <Link
                  to={`/order/${id}`}
                  className="flex items-center bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-500 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  View Order Details
                </Link>
              </div>

              <div className="bg-gray-800 print:bg-gray-100 rounded-lg p-5 mb-8 inline-block">
                <div className="flex items-baseline mb-1">
                  <h2 className="text-white print:text-black text-lg font-medium mr-2">
                    Order Number:
                  </h2>
                  <span className="text-amber-500 print:text-black font-bold">
                    {id.substring(0, 8)}
                  </span>
                </div>
                <div className="flex items-baseline">
                  <h2 className="text-white print:text-black text-lg font-medium mr-2">
                    Order Date:
                  </h2>
                  <span className="text-gray-300 print:text-gray-700">
                    {orderDate}
                  </span>
                </div>
                <div className="flex items-baseline mt-1">
                  <h2 className="text-white print:text-black text-lg font-medium mr-2">
                    Status:
                  </h2>
                  <span className="print:hidden">
                    {getStatusBadge(order.status)}
                  </span>
                  <span className="hidden print:inline text-black">
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Details Section */}
            <div className="bg-gray-900 print:bg-white border border-gray-700 print:border-gray-300 rounded-lg overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-700 print:border-gray-300">
                <h2 className="text-xl font-bold text-white print:text-black mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 print:text-black" />
                  Order Summary
                </h2>
                <table className="w-full">
                  <thead className="border-b border-gray-700 print:border-gray-300">
                    <tr>
                      <th className="py-3 text-left text-white print:text-black">
                        Product
                      </th>
                      <th className="py-3 text-center text-white print:text-black">
                        Quantity
                      </th>
                      <th className="py-3 text-right text-white print:text-black">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 print:border-gray-300"
                      >
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-16 h-16 mr-4 hidden sm:block print:hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                            <div>
                              <span className="text-white print:text-black hover:text-amber-600 print:hover:text-black">
                                {item.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center text-white print:text-black">
                          {item.qty}
                        </td>
                        <td className="py-4 text-right text-amber-600 print:text-black font-medium">
                          GBP {(item.price * item.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-b border-gray-700 print:border-gray-300">
                      <td
                        className="py-4 text-white print:text-black font-medium"
                        colSpan="2"
                      >
                        Subtotal:
                      </td>
                      <td className="py-4 text-right text-amber-600 print:text-black font-medium">
                        GBP {order.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-700 print:border-gray-300">
                      <td
                        className="py-4 text-white print:text-black font-medium"
                        colSpan="2"
                      >
                        Shipping:
                      </td>
                      <td className="py-4 text-right text-white print:text-black">
                        Free
                      </td>
                    </tr>
                    <tr>
                      <td
                        className="py-4 text-white print:text-black font-bold text-lg"
                        colSpan="2"
                      >
                        Total:
                      </td>
                      <td className="py-4 text-right text-amber-600 print:text-black font-bold text-lg">
                        GBP {order.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Shipping & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900 print:bg-white border border-gray-700 print:border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white print:text-black mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 print:text-black" />
                  Shipping Information
                </h3>
                <div className="mb-4 text-gray-300 print:text-gray-700">
                  <p className="mb-1">
                    <span className="font-medium text-white print:text-black">
                      Address:
                    </span>{" "}
                    {order.shippingAddress.address}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium text-white print:text-black">
                      City:
                    </span>{" "}
                    {order.shippingAddress.city}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium text-white print:text-black">
                      Postal Code:
                    </span>{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium text-white print:text-black">
                      Country:
                    </span>{" "}
                    {order.shippingAddress.country}
                  </p>
                </div>

                {/* Tracking information if available */}
                {order.tracking && order.tracking.trackingNumber && (
                  <div className="mt-4 pt-4 border-t border-gray-700 print:border-gray-300">
                    <p className="font-medium text-white print:text-black mb-1">
                      Tracking Information:
                    </p>
                    <p className="text-gray-300 print:text-gray-700">
                      <span className="font-medium text-white print:text-black">
                        Carrier:
                      </span>{" "}
                      {order.tracking.carrier}
                    </p>
                    <p className="text-gray-300 print:text-gray-700">
                      <span className="font-medium text-white print:text-black">
                        Tracking Number:
                      </span>{" "}
                      {order.tracking.trackingNumber}
                    </p>
                    {order.tracking.trackingUrl && (
                      <a
                        href={order.tracking.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:underline mt-2 inline-flex items-center print:hidden"
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Track your package
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                )}

                {!order.tracking && (
                  <div className="mt-4 pt-4 border-t border-gray-700 print:border-gray-300">
                    <div className="flex items-center mb-2">
                      <p className="text-gray-300 print:text-gray-700">
                        {order.isDelivered
                          ? `Delivered on ${new Date(
                              order.deliveredAt
                            ).toLocaleDateString()}`
                          : `Estimated delivery: ${estimatedDeliveryDate}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-900 print:bg-white border border-gray-700 print:border-gray-300 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white print:text-black mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 print:text-black" />
                  Payment Information
                </h3>
                <div className="mb-4">
                  <p className="mb-1 text-gray-300 print:text-gray-700">
                    <span className="font-medium text-white print:text-black">
                      Method:
                    </span>{" "}
                    {order.paymentMethod === "credit_card"
                      ? "Credit Card"
                      : order.paymentMethod}
                  </p>
                  {order.paymentDetails && order.paymentDetails.cardLast4 && (
                    <p className="mb-1 text-gray-300 print:text-gray-700">
                      <span className="font-medium text-white print:text-black">
                        Card:
                      </span>{" "}
                      **** **** **** {order.paymentDetails.cardLast4}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700 print:border-gray-300">
                  <div className="flex items-center">
                    <p className="text-gray-300 print:text-gray-700">
                      {order.isPaid
                        ? `Paid on ${new Date(
                            order.paidAt
                          ).toLocaleDateString()}`
                        : "Payment pending"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-gray-900 print:bg-white border border-gray-700 print:border-gray-300 rounded-lg p-6 mb-8 print:hidden">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Order Progress
              </h3>

              <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-700"></div>

                {/* Order Confirmed */}
                <div className="relative pl-10 mb-8">
                  <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Order Confirmed</h4>
                    <p className="text-gray-400 text-sm">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="text-gray-300 mt-1">
                      Your order has been received and is being processed.
                    </p>
                  </div>
                </div>

                {/* Order Processing */}
                <div className="relative pl-10 mb-8">
                  <div
                    className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center z-10 
                  ${
                    ["Order Processing", "Order Shipped", "Delivered"].includes(
                      order.status
                    )
                      ? "bg-green-500"
                      : "bg-gray-700"
                  }`}
                  >
                    <Package
                      className={`w-4 h-4 ${
                        [
                          "Order Processing",
                          "Order Shipped",
                          "Delivered",
                        ].includes(order.status)
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Order Processing</h4>
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
                <div className="relative pl-10 mb-8">
                  <div
                    className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center z-10 
                  ${
                    ["Order Shipped", "Delivered"].includes(order.status)
                      ? "bg-green-500"
                      : "bg-gray-700"
                  }`}
                  >
                    <Truck
                      className={`w-4 h-4 ${
                        ["Order Shipped", "Delivered"].includes(order.status)
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Order Shipped</h4>
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
                    {!["Order Shipped", "Delivered"].includes(order.status) && (
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
                      ? "bg-green-500"
                      : "bg-gray-700"
                  }`}
                  >
                    <CheckCircle
                      className={`w-4 h-4 ${
                        order.status === "Delivered"
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Delivered</h4>
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

            {/* Receipt ID & Security Notice */}
            <div className="border-t border-b border-gray-700 print:border-gray-300 py-4 my-6">
              <div className="text-center">
                <p className="mb-1 text-gray-300 print:text-black">
                  <strong className="text-white print:text-black">
                    Receipt ID:
                  </strong>{" "}
                  REC-{id?.substring(0, 12)}
                </p>
                <p className="mb-1 text-gray-300 print:text-black">
                  <strong className="text-white print:text-black">
                    Date Issued:
                  </strong>{" "}
                  {orderDate}
                </p>
                <p className="text-gray-300 print:text-black">
                  <strong className="text-white print:text-black">
                    This is an official receipt of your purchase.
                  </strong>
                </p>
              </div>
            </div>

            {/* Additional Information and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                <ShieldCheck className="w-8 h-8 mx-auto text-amber-600 mb-3" />
                <h3 className="text-white font-medium mb-2">Secure Order</h3>
                <p className="text-gray-400 text-sm">
                  Your order is protected by our secure payment system
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                <CalendarCheck className="w-8 h-8 mx-auto text-amber-600 mb-3" />
                <h3 className="text-white font-medium mb-2">
                  Guaranteed Delivery
                </h3>
                <p className="text-gray-400 text-sm">
                  We guarantee delivery by {estimatedDeliveryDate.split(",")[0]}
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
                <ShoppingBag className="w-8 h-8 mx-auto text-amber-600 mb-3" />
                <h3 className="text-white font-medium mb-2">Order Tracking</h3>
                <p className="text-gray-400 text-sm">
                  Track your order anytime from your account page
                </p>
              </div>
            </div>

            <div className="mt-8 text-center print:hidden">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/products"
                  className="bg-gray-700 text-white py-3 px-6 rounded font-medium hover:bg-gray-600 transition-colors"
                >
                  Continue Shopping
                </Link>
                <Link
                  to="/account"
                  className="bg-amber-600 text-white py-3 px-6 rounded font-medium hover:bg-amber-500 transition-colors"
                >
                  Go to My Account
                </Link>
              </div>
            </div>

            {/* Print footer */}
            <div className="hidden print:block text-center mt-10 pt-6 border-t border-gray-300">
              <p className="text-sm">Thank you for shopping with us!</p>
              <p className="text-xs mt-2">
                Visit us online at www.lakhanijewellers.com
              </p>
            </div>
          </div>

          {/* Add a style tag for print media */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @media print {
              @page {
                size: portrait;
                margin: 0.5cm;
              }
              body {
                color: #000;
                background: #fff;
              }
              .container {
                max-width: 100%;
              }
              .print\\:hidden {
                display: none !important;
              }
              .print\\:block {
                display: block !important;
              }
              .print\\:text-black {
                color: #000 !important;
              }
              .print\\:text-gray-700 {
                color: #374151 !important;
              }
              .print\\:bg-white {
                background-color: #fff !important;
              }
              .print\\:border-gray-300 {
                border-color: #d1d5db !important;
              }
            }
          `,
            }}
          />
        </div>
      </section>
      <Footer/>
    </>
  );
};

export default OrderConfirmationPage;
