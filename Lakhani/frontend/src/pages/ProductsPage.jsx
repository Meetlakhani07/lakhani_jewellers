// Updated ProductsPage.jsx with hierarchical category filtering
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { productService, categoryService } from "../services/api";
import ProductCard from "../components/products/ProductCard";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const ProductsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get("category");
  const parentParam = queryParams.get("parent");
  const searchParam = queryParams.get("search");
  const sortParam = queryParams.get("sort") || "latest";

  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Category state
  const [categories, setCategories] = useState({
    parents: [],
    children: {},
    all: [],
  });

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(
    categoryParam || "all"
  );
  const [selectedParent, setSelectedParent] = useState(parentParam || "all");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState(sortParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParam || "");

  const productsPerPage = 12;

  // Fetch categories and organize them
  useEffect(() => {
    const fetchCategories = async () => {
      try {
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
      } catch (err) {
        setError("Failed to load categories");
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search);

    const categoryFromUrl = query.get("category");
    const parentFromUrl = query.get("parent");
    const searchFromUrl = query.get("search");
    const sortFromUrl = query.get("sort");

    // Sync URL query to state
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl);
    if (parentFromUrl) setSelectedParent(parentFromUrl);
    if (searchFromUrl) setSearchTerm(searchFromUrl);
    if (sortFromUrl) setSortBy(sortFromUrl);
  }, [location.search]);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query params from filters
        const queryParams = {};

        if (selectedParent !== "all") {
          queryParams.parent = selectedParent;
        } else if (selectedCategory !== "all") {
          queryParams.category = selectedCategory;
        }

        if (searchTerm) {
          queryParams.search = searchTerm;
        }

        // Map our sort values to API sort fields
        const sortMapping = {
          latest: "createdAt",
          "price-low": "price",
          "price-high": "price",
          popularity: "averageRating",
        };

        const orderMapping = {
          latest: "desc",
          "price-low": "asc",
          "price-high": "desc",
          popularity: "desc",
        };

        queryParams.sort = sortMapping[sortBy] || "createdAt";
        queryParams.order = orderMapping[sortBy] || "desc";

        // Add price range
        queryParams.minPrice = priceRange[0];
        queryParams.maxPrice = priceRange[1];

        // Add pagination
        queryParams.page = currentPage;
        queryParams.limit = productsPerPage;

        const productsRes = await productService.getAllProducts(queryParams);
        const { products, total, count } = productsRes.data;

        setProducts(products || []);
        setFilteredProducts(products || []);
        setTotalCount(total || count || products?.length || 0);
        setError(null);
      } catch (err) {
        setError("Failed to fetch products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Update URL with current filters
    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (selectedParent !== "all") params.set("parent", selectedParent);
    if (searchTerm) params.set("search", searchTerm);
    if (sortBy !== "latest") params.set("sort", sortBy);

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  }, [
    selectedCategory,
    selectedParent,
    sortBy,
    currentPage,
    searchTerm,
    priceRange,
    navigate,
    location.pathname,
  ]);

  // Handle parent category change
  const handleParentChange = (parentId) => {
    setSelectedParent(parentId);
    setSelectedCategory("all");
    setCurrentPage(1);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedParent("all");
    setCurrentPage(1);
  };

  // Handle price range change
  const handlePriceChange = (event, index) => {
    const newPriceRange = [...priceRange];
    newPriceRange[index] = Number(event.target.value);
    setPriceRange(newPriceRange);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Handle search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // The search will be applied in the useEffect
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedParent("all");
    setSearchTerm("");
    setSortBy("latest");
    setPriceRange([0, 5000]);
    setCurrentPage(1);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / productsPerPage);

  // Loading state
  if (loading && currentPage === 1) {
    return (
      <>
        <Header />
        <div className="py-20 text-center">
          <div className="animate-pulse">
            <p className="text-white">Loading products...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error && !products.length) {
    return (
      <>
        <Header />
        <div className="py-20 text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={clearFilters}
            className="mt-4 bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-500 transition-colors"
          >
            Clear Filters and Try Again
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-8">Products</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="col-span-1">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-white mb-6 pb-3 border-b border-gray-700">
                  Filters
                </h3>

                {/* Parent Categories */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Collections</h4>
                  <ul>
                    <li className="mb-2">
                      <button
                        className={`text-left w-full ${
                          selectedParent === "all" && selectedCategory === "all"
                            ? "text-amber-600"
                            : "text-white hover:text-amber-600"
                        }`}
                        onClick={() => {
                          setSelectedParent("all");
                          setSelectedCategory("all");
                        }}
                      >
                        All Collections
                      </button>
                    </li>
                    {categories.parents.map((parent) => (
                      <li key={parent._id} className="mb-2">
                        <button
                          className={`text-left w-full ${
                            selectedParent === parent._id
                              ? "text-amber-600"
                              : "text-white hover:text-amber-600"
                          }`}
                          onClick={() => handleParentChange(parent._id)}
                        >
                          {parent.name}
                        </button>

                        {/* Show child categories if this parent is selected */}
                        {selectedParent === parent._id &&
                          categories.children[parent._id] && (
                            <ul className="ml-4 mt-2 space-y-2">
                              <li>
                                <button
                                  className={`text-left w-full text-sm ${
                                    selectedCategory === "all"
                                      ? "text-amber-500"
                                      : "text-gray-400 hover:text-amber-500"
                                  }`}
                                  onClick={() => handleCategoryChange("all")}
                                >
                                  All {parent.name}
                                </button>
                              </li>
                              {categories.children[parent._id].map((child) => (
                                <li key={child._id}>
                                  <button
                                    className={`text-left w-full text-sm ${
                                      selectedCategory === child._id
                                        ? "text-amber-500"
                                        : "text-gray-400 hover:text-amber-500"
                                    }`}
                                    onClick={() =>
                                      handleCategoryChange(child._id)
                                    }
                                  >
                                    {child.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Price Range</h4>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">
                        Min (£)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={priceRange[1]}
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange(e, 0)}
                        className="w-full p-2 bg-transparent border border-gray-700 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">
                        Max (£)
                      </label>
                      <input
                        type="number"
                        min={priceRange[0]}
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 1)}
                        className="w-full p-2 bg-transparent border border-gray-700 rounded text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <h4 className="text-white font-medium mb-3">Search</h4>
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 pl-8 bg-transparent border border-gray-700 rounded text-white"
                    />
                    <i className="ion-ios-search-strong absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </form>
                </div>

                {/* Clear Filters Button */}
                {(selectedCategory !== "all" ||
                  selectedParent !== "all" ||
                  searchTerm ||
                  sortBy !== "latest" ||
                  priceRange[0] > 0 ||
                  priceRange[1] < 5000) && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2 px-4 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Products Area */}
            <div className="col-span-1 md:col-span-3">
              {/* Products Header */}
              <div className="flex flex-wrap justify-between items-center mb-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
                <div>
                  <p className="text-white">
                    Showing{" "}
                    {totalCount === 0
                      ? "0"
                      : (currentPage - 1) * productsPerPage + 1}
                    -{Math.min(currentPage * productsPerPage, totalCount)} of{" "}
                    {totalCount} products
                  </p>
                </div>
                <div>
                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="p-2 bg-gray-900 border border-gray-700 rounded text-white"
                  >
                    <option value="latest">Latest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="popularity">Popularity</option>
                  </select>
                </div>
              </div>

              {/* No Products State */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 bg-gray-900 border border-gray-700 rounded-lg">
                  <p className="text-white mb-4">
                    No products found matching your criteria.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="text-amber-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Loading More Indicator */}
                  {loading && currentPage > 1 && (
                    <div className="text-center mt-6">
                      <div className="animate-pulse text-white">
                        Loading more products...
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                      <ul className="flex">
                        <li>
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 mx-1 border border-gray-700 rounded ${
                              currentPage === 1
                                ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                                : "bg-gray-900 text-white hover:bg-amber-600"
                            }`}
                          >
                            Prev
                          </button>
                        </li>
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            // For large page counts, show a window of 5 pages around the current page
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else {
                              const startPage = Math.max(
                                1,
                                Math.min(currentPage - 2, totalPages - 4)
                              );
                              pageNum = startPage + i;
                            }

                            return (
                              <li key={pageNum}>
                                <button
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 py-1 mx-1 border border-gray-700 rounded ${
                                    currentPage === pageNum
                                      ? "bg-amber-600 text-white"
                                      : "bg-gray-900 text-white hover:bg-gray-800"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          }
                        )}
                        <li>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 mx-1 border border-gray-700 rounded ${
                              currentPage === totalPages
                                ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                                : "bg-gray-900 text-white hover:bg-amber-600"
                            }`}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default ProductsPage;
