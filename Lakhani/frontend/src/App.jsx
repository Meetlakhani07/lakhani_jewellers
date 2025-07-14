import { Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import OrderPage from "./pages/OrderPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import MyOrders from "./pages/MyOrders";
import AboutUsPage from "./pages/AboutUsPage";

// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/Admin/AdminOrderDetail";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductEdit from "./pages/Admin/AdminProductEdit";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminShopInfo from "./pages/Admin/AdminShopInfo";

// Route protection
import AdminRoute from "./context/AdminRoutes";
import WishList from "./pages/Wishlist";
import AdminProductAdd from "./pages/Admin/AdminProductAdd";

function App() {
  return (
    <div className="home_black_version">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/wishlist" element={<WishList />} />
        <Route path="/MyOrders" element={<MyOrders />} />
        <Route path="/order/:id" element={<OrderPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route
          path="/order-confirmation/:id"
          element={<OrderConfirmationPage />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminRoute>
              <AdminOrderDetail />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products/new"
          element={
            <AdminRoute>
              <AdminProductAdd />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products/:id"
          element={
            <AdminRoute>
              <AdminProductEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/shop-info"
          element={
            <AdminRoute>
              <AdminShopInfo />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
