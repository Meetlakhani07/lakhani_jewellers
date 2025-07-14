// Updated AdminProducts.jsx with category filtering
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { productService, categoryService } from "../../services/api";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";

const AdminProducts = () => {
  // Products and categories data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({
    parents: [],
    children: {},
    all: [],
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Filter state
  const [filters, setFilters] = useState({
    category: "all",
    parent: "all",
    search: "",
    sortBy: "createdAt",
    order: "desc",
  });
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Load products and categories data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get categories first
        const categoriesRes = await categoryService.getAllCategories();
        const categoriesData =
          categoriesRes.data.categories || categoriesRes.data;

        // Organize categories
        const parents = categoriesData.filter((cat) => !cat.parentCategory);
        const children = {};

        categoriesData.forEach((cat) => {
          if (cat.parentCategory) {
            const parentId =
              typeof cat.parentCategory === "object"
                ? cat.parentCategory._id
                : cat.parentCategory;

            if (!children[parentId]) {
              children[parentId] = [];
            }

            children[parentId].push(cat);
          }
        });

        setCategories({
          parents,
          children,
          all: categoriesData,
        });

        // Fetch products with filters
        await fetchProducts();
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch products based on current filters
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Build query params from filters
      const queryParams = {};

      if (filters.parent !== "all") {
        queryParams.parent = filters.parent;
      } else if (filters.category !== "all") {
        queryParams.category = filters.category;
      }

      if (filters.search) {
        queryParams.search = filters.search;
      }

      queryParams.sort = filters.sortBy;
      queryParams.order = filters.order;

      const productsRes = await productService.getAllProducts(queryParams);
      const productsData = productsRes.data.products || productsRes.data;

      setProducts(Array.isArray(productsData) ? productsData : []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Run fetchProducts when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "parent" && value !== "all") {
      // If parent category is selected, reset child category filter
      setFilters({
        ...filters,
        parent: value,
        category: "all",
      });
    } else if (name === "category" && value !== "all") {
      // If child category is selected, reset parent category filter
      setFilters({
        ...filters,
        category: value,
        parent: "all",
      });
    } else {
      setFilters({
        ...filters,
        [name]: value,
      });
    }
  };

  // Handle search input
  const handleSearchInput = (e) => {
    const { value } = e.target;
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: "all",
      parent: "all",
      search: "",
      sortBy: "createdAt",
      order: "desc",
    });
  };

  // Delete functionality
  const handleDeleteConfirm = (productId) => {
    setConfirmDelete(productId);
  };

  const handleDeleteCancel = () => {
    setConfirmDelete(null);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setLoading(true);
      await productService.deleteProduct(productId);

      // Update the products list
      setProducts(products.filter((product) => product._id !== productId));
      setDeleteSuccess(true);
      setConfirmDelete(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
    } catch (err) {
      setError("Failed to delete product. Please try again.");
      console.error("Error deleting product:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    const category = categories.all.find((c) => c._id === categoryId);
    return category ? category.name : "Uncategorized";
  };

  // Helper function to get parent category for a product
  const getParentCategory = (product) => {
    if (!product.category) return "None";

    const category = categories.all.find(
      (c) =>
        c._id ===
        (typeof product.category === "object"
          ? product.category._id
          : product.category)
    );

    if (!category) return "Unknown";

    // If this is a child category, get the parent name
    if (category.parentCategory) {
      const parentId =
        typeof category.parentCategory === "object"
          ? category.parentCategory._id
          : category.parentCategory;

      const parent = categories.all.find((c) => c._id === parentId);
      return parent ? parent.name : "Unknown";
    }

    // If this is a parent category
    return category.name;
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />

          <div className="w-full md:w-3/4 md:pl-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Products</h1>

              <Link
                to="/admin/products/new"
                className="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-500 transition-colors flex items-center"
              >
                <FaPlus className="mr-2" /> Add New Product
              </Link>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="bg-red-900 text-white p-4 rounded mb-6">
                {error}
              </div>
            )}

            {deleteSuccess && (
              <div className="bg-green-900 text-white p-4 rounded mb-6">
                Product deleted successfully.
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            {confirmDelete && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                <p className="text-white mb-4">
                  Are you sure you want to delete this product? This action
                  cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleDeleteProduct(confirmDelete)}
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-500 transition-colors flex items-center"
                  >
                    <FaTrash className="mr-2" /> Delete
                  </button>
                  <button
                    onClick={handleDeleteCancel}
                    className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Filters Section */}
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-lg font-medium">
                  Filter Products
                </h2>
                <button
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className="text-gray-400 hover:text-white"
                >
                  {filterMenuOpen ? (
                    <FaTimes size={18} />
                  ) : (
                    <FaFilter size={18} />
                  )}
                </button>
              </div>

              {filterMenuOpen && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div>
                    <form onSubmit={handleSearchSubmit} className="flex">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={handleSearchInput}
                        className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-l px-3 py-2 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        className="bg-amber-600 text-white px-4 py-2 rounded-r hover:bg-amber-500 transition-colors"
                      >
                        <FaSearch />
                      </button>
                    </form>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Parent Category Filter */}
                    <div>
                      <label
                        htmlFor="parent-filter"
                        className="block text-white mb-2"
                      >
                        Parent Category:
                      </label>
                      <select
                        id="parent-filter"
                        name="parent"
                        value={filters.parent}
                        onChange={handleFilterChange}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                      >
                        <option value="all">All Parent Categories</option>
                        {categories.parents.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Child Category Filter - Only show if a parent is selected */}
                    <div>
                      <label
                        htmlFor="category-filter"
                        className="block text-white mb-2"
                      >
                        Category:
                      </label>
                      <select
                        id="category-filter"
                        name="category"
                        value={filters.category}
                        onChange={handleFilterChange}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-amber-500"
                        disabled={filters.parent !== "all"}
                      >
                        <option value="all">All Categories</option>
                        {categories.all.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <label
                        htmlFor="sort-by"
                        className="block text-white mb-2"
                      >
                        Sort By:
                      </label>
                      <div className="flex">
                        <select
                          id="sort-by"
                          name="sortBy"
                          value={filters.sortBy}
                          onChange={handleFilterChange}
                          className="w-2/3 bg-gray-700 text-white border border-gray-600 rounded-l px-3 py-2 focus:outline-none focus:border-amber-500"
                        >
                          <option value="createdAt">Date Added</option>
                          <option value="name">Name</option>
                          <option value="price">Price</option>
                          <option value="countInStock">Stock</option>
                        </select>
                        <select
                          name="order"
                          value={filters.order}
                          onChange={handleFilterChange}
                          className="w-1/3 bg-gray-700 text-white border-l-0 border border-gray-600 rounded-r px-3 py-2 focus:outline-none focus:border-amber-500"
                        >
                          <option value="asc">Asc</option>
                          <option value="desc">Desc</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="text-white bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Products Display */}
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-pulse text-xl text-white">
                  Loading products...
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
                <p className="text-white mb-4">
                  No products found for the selected filters.
                </p>
                {(filters.parent !== "all" ||
                  filters.category !== "all" ||
                  filters.search) && (
                  <button
                    onClick={clearFilters}
                    className="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-500 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-amber-600 transition-colors"
                  >
                    <div className="h-48 bg-gray-700 relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {}}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}

                      <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 px-2 py-1 rounded text-sm text-white">
                        £
                        {typeof product.price === "number"
                          ? product.price.toFixed(2)
                          : "0.00"}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-medium text-white mb-1 truncate">
                        {product.name}
                      </h3>

                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">
                            Category:
                          </span>
                          <span className="text-amber-500 text-sm">
                            {getCategoryName(
                              typeof product.category === "object"
                                ? product.category._id
                                : product.category
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Parent:</span>
                          <span className="text-amber-500 text-sm">
                            {getParentCategory(product)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Stock:</span>
                          {product.countInStock > 0 ? (
                            <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                              In Stock ({product.countInStock})
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-gray-400 text-sm line-clamp-2 h-10 mb-4">
                        {product.description}
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          to={`/admin/products/${product._id}`}
                          className="flex-1 bg-amber-600 text-white py-2 px-3 rounded text-center text-sm hover:bg-amber-500 transition-colors flex items-center justify-center"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteConfirm(product._id)}
                          className="flex-1 bg-gray-700 text-white py-2 px-3 rounded text-center text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
