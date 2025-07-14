import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/account");
      }
      return;
    }

    // Check localStorage as fallback
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (token && userInfo) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/account");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const result = await login(email, password);

      if (result.success) {
        // Get latest user data after login
        const userInfo = localStorage.getItem("userInfo");
        const isAdmin = localStorage.getItem("isAdmin") === "true";

        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/account");
        }
      } else {
        setError(result.error || "Failed to login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white text-center mb-8">
              Login
            </h2>
            {error && (
              <div className="bg-red-900 text-white p-4 rounded mb-6">
                {error}
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="bg-gray-900 p-8 rounded-lg border border-gray-700"
            >
              <div className="mb-4">
                <label htmlFor="email" className="block text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                  required
                />
                <div className="mt-1 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-amber-600 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
              <div className="mb-6">
                <button
                  type="submit"
                  className="w-full bg-amber-600 text-white py-3 rounded font-medium hover:bg-amber-300 hover:text-black transition-colors"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
              <div className="text-center text-gray-400">
                Don't have an account?
                <Link
                  to="/register"
                  className="text-amber-600 ml-1 hover:underline"
                >
                  Register now
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default LoginPage;
