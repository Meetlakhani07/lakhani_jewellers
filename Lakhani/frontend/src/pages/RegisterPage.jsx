// EnhancedRegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import {
  Eye,
  EyeOff,
  User,
  UserPlus,
  Key,
  Mail,
  Lock,
  AlertCircle,
  Loader,
} from "lucide-react";

const RegisterPage = () => {
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretKey, setSecretKey] = useState("");

  // UI states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminFields, setShowAdminFields] = useState(false);
  const [isAdminRegistration, setIsAdminRegistration] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auth context and navigation
  const { register, updateUserInfo } = useAuth();
  const navigate = useNavigate();

  // Toggle admin registration mode
  const toggleAdminMode = () => {
    if (!showAdminFields) {
      setShowAdminFields(true);
    } else {
      setIsAdminRegistration(!isAdminRegistration);
      if (!isAdminRegistration) {
        // Scrolling to secret key field when enabling admin registration
        setTimeout(() => {
          const secretKeyField = document.getElementById("secret-key");
          if (secretKeyField) {
            secretKeyField.scrollIntoView({ behavior: "smooth" });
            secretKeyField.focus();
          }
        }, 100);
      }
    }
  };

  // Handle regular user registration
  const handleRegularRegistration = async () => {
    try {
      const result = await register(name, email, password);
      if (result.success) {
        navigate("/account");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register");
    }
  };

  // Handle admin registration
  const handleAdminRegistration = async () => {
    try {
      const { data } = await authService.createAdmin({
        name,
        email,
        password,
        secretKey,
      });

      // Update auth context with the admin user data
      updateUserInfo(data);

      setSuccess("Admin account created successfully!");
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create admin account. Check your secret key."
      );
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Admin registration requires secret key
    if (isAdminRegistration && !secretKey) {
      setError("Secret key is required for admin registration");
      return;
    }

    try {
      setLoading(true);

      if (isAdminRegistration) {
        await handleAdminRegistration();
      } else {
        await handleRegularRegistration();
      }
    } catch (err) {
      setError(err.message || "Registration failed");
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
            {/* Heading with double-click functionality */}
            <h2
              className="text-3xl font-bold text-white text-center mb-2 cursor-pointer select-none"
              onDoubleClick={toggleAdminMode}
            >
              Create an Account
            </h2>

            {/* Admin mode indicator */}
            {showAdminFields && (
              <div className="flex items-center justify-center mb-6">
                <div
                  className={`flex items-center space-x-2 py-1 px-3 rounded-full text-sm border cursor-pointer transition-colors ${
                    isAdminRegistration
                      ? "bg-amber-600/20 border-amber-600 text-amber-500"
                      : "bg-gray-800/20 border-gray-700 text-gray-400"
                  }`}
                  onClick={() => setIsAdminRegistration(!isAdminRegistration)}
                >
                  <UserPlus size={16} />
                  <span>
                    {isAdminRegistration
                      ? "Admin Registration"
                      : "Customer Registration"}
                  </span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-white p-4 rounded-lg mb-6 flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="bg-green-900/50 border border-green-700 text-white p-4 rounded-lg mb-6 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* Registration form */}
            <form
              onSubmit={handleSubmit}
              className="bg-gray-900 p-8 rounded-lg border border-gray-700"
            >
              {/* Name field */}
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-white mb-2 flex items-center"
                >
                  <User size={16} className="mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600"
                  required
                />
              </div>

              {/* Email field */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-white mb-2 flex items-center"
                >
                  <Mail size={16} className="mr-2" />
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

              {/* Password field */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-white mb-2 flex items-center"
                >
                  <Lock size={16} className="mr-2" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Password must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password field */}
              <div className="mb-6">
                <label
                  htmlFor="confirm-password"
                  className="block text-white mb-2 flex items-center"
                >
                  <Lock size={16} className="mr-2" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-transparent border border-gray-700 rounded text-white focus:border-amber-600 pr-10"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Secret Key field - Only visible in admin registration mode */}
              {isAdminRegistration && (
                <div className="mb-6 bg-amber-900/10 p-3 rounded border border-amber-800/30">
                  <label
                    htmlFor="secret-key"
                    className="block text-amber-400 mb-2 flex items-center"
                  >
                    <Key size={16} className="mr-2" />
                    Admin Secret Key
                  </label>
                  <input
                    type="password"
                    id="secret-key"
                    value={secretKey}
                    onChange={(e) => setSecretKey(e.target.value)}
                    className="w-full p-3 bg-transparent border border-amber-700/50 rounded text-white focus:border-amber-600"
                    required={isAdminRegistration}
                    placeholder="Enter admin secret key"
                  />
                  <p className="text-xs text-amber-500/80 mt-1">
                    This key is required to create an admin account
                  </p>
                </div>
              )}

              {/* Submit button */}
              <div className="mb-6">
                <button
                  type="submit"
                  className={`w-full py-3 rounded font-medium transition-colors flex items-center justify-center ${
                    isAdminRegistration
                      ? "bg-amber-700 text-white hover:bg-amber-800"
                      : "bg-amber-600 text-white hover:bg-amber-300 hover:text-black"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="mr-2 animate-spin" />
                      {isAdminRegistration
                        ? "Creating Admin Account..."
                        : "Creating Account..."}
                    </>
                  ) : (
                    <>
                      {isAdminRegistration ? (
                        <>
                          <UserPlus size={18} className="mr-2" />
                          Register as Admin
                        </>
                      ) : (
                        "Register"
                      )}
                    </>
                  )}
                </button>
              </div>

              {/* Login link */}
              <div className="text-center text-gray-400">
                Already have an account?
                <Link
                  to="/login"
                  className="text-amber-600 ml-1 hover:underline"
                >
                  Login now
                </Link>
              </div>
            </form>

            {/* Developer hint - Only visible in development */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>
                  Double-click on "Create an Account" to toggle admin
                  registration
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegisterPage;
