import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const AdminSidebar = () => {
  const location = useLocation();
  const { user,logout } = useAuth();

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <div className="w-full mb-8 md:w-100 md:mb-0 md:h-screen  ">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-white text-xl font-bold">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="ml-3">
            <h3 className="text-white font-medium">
              {user?.name || "Admin User"}
            </h3>
            <p className="text-gray-400 text-sm">Administrator</p>
          </div>
        </div>

        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin"
                className={`block py-3 px-4 rounded transition-colors ${
                  isActive("/admin") &&
                  !isActive("/admin/orders") &&
                  !isActive("/admin/products")
                    ? "bg-amber-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className={`block py-3 px-4 rounded transition-colors ${
                  isActive("/admin/orders")
                    ? "bg-amber-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className={`block py-3 px-4 rounded transition-colors ${
                  isActive("/admin/products")
                    ? "bg-amber-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/admin/categories"
                className={`block py-3 px-4 rounded transition-colors ${
                  isActive("/admin/categories")
                    ? "bg-amber-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Categories
              </Link>
            </li>
            <li>
              <Link
                to="/admin/shop-info"
                className={`block py-3 px-4 rounded transition-colors ${
                  isActive("/admin/shop-info")
                    ? "bg-amber-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                Shop Information
              </Link>
            </li>
            <li className="border-b border-gray-700 py-2">
              <button
                onClick={logout}
                className="text-gray-300 hover:text-amber-600 transition-colors w-full text-left"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
