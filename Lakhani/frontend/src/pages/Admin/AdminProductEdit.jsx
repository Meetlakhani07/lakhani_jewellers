// AdminProductEdit.js - Dedicated component only for editing existing products
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { productService, categoryService } from "../../services/api";

const AdminProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    images: [],
    brand: "",
    category: "",
    countInStock: "",
    description: "",
    isActive: true,
    isFeatured: false,
    tags: [],
  });

  // Category state
  const [categories, setCategories] = useState({
    parents: [],
    children: {},
  });
  const [selectedParent, setSelectedParent] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching product data for ID:", id);

        // Fetch both categories and product data in parallel for efficiency
        try {
          const [categoriesRes, productRes] = await Promise.all([
            categoryService.getAllCategories(),
            productService.getProductById(id),
          ]);

          // Process categories
          const categoriesData =
            categoriesRes.data.categories || categoriesRes.data;
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

          setCategories({ parents, children });

          // Process product data
          const product = productRes.data.product || productRes.data;
          console.log("Product data received:", product);

          if (!product) {
            throw new Error("Product not found");
          }

          setFormData({
            name: product.name || "",
            price: product.price || "",
            image: product.image || "",
            images: product.images || [],
            brand: product.brand || "",
            category: product.category?._id || product.category || "",
            countInStock: product.countInStock || 0,
            description: product.description || "",
            isActive: product.isActive !== undefined ? product.isActive : true,
            isFeatured: product.isFeatured || false,
            tags: product.tags || [],
          });

          // Set parent category based on product's category
          if (product.category) {
            console.log("Setting parent category from product category");
            const categoryId =
              typeof product.category === "object"
                ? product.category._id
                : product.category;

            // Find the category in our loaded categories
            let foundParentId = null;

            // First, check if the category itself is a parent
            const parentCategory = parents.find((p) => p._id === categoryId);
            if (parentCategory) {
              foundParentId = categoryId;
            } else {
              // If not, look for the category in children and find its parent
              for (const parentId in children) {
                const childCategory = children[parentId].find(
                  (c) => c._id === categoryId
                );
                if (childCategory) {
                  foundParentId = parentId;
                  break;
                }
              }
            }

            if (foundParentId) {
              console.log("Found parent category:", foundParentId);
              setSelectedParent(foundParentId);
            } else if (parents.length > 0) {
              // Fallback to first parent if we couldn't find a match
              console.log(
                "Could not find matching parent category, using default"
              );
              setSelectedParent(parents[0]._id);
            }
          }

          if (product.image) {
            setImagePreview(product.image);
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to load product. Please try again.");
          throw err;
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "price" || name === "countInStock") {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleParentChange = (e) => {
    const parentId = e.target.value;
    setSelectedParent(parentId);

    if (
      categories.children[parentId] &&
      categories.children[parentId].length > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        category: categories.children[parentId][0]._id,
      }));
    } else {
      setFormData((prev) => ({ ...prev, category: parentId }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        countInStock: parseInt(formData.countInStock, 10),
        image: formData.image,
      };

      console.log("Updating product with ID:", id);
      console.log("Product data:", productData);

      await productService.updateProduct(id, productData);
      setSuccess(true);

      // Navigate back to products page after 2 seconds
      setTimeout(() => {
        navigate("/admin/products");
      }, 2000);
    } catch (err) {
      console.error("Error updating product:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update product. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />

          <div className="w-full md:w-3/4 md:pl-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Link
                  to="/admin/products"
                  className="text-amber-500 hover:underline"
                >
                  &larr; Back to Products
                </Link>
                <h1 className="text-3xl font-bold text-white mt-2">
                  Edit Product
                </h1>
              </div>
            </div>

            {error && (
              <div className="bg-red-900 text-white p-4 rounded mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900 text-white p-4 rounded mb-6">
                Product updated successfully! Redirecting...
              </div>
            )}

            {loading ? (
              <div className="text-white">Loading product data...</div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-white mb-2">
                      Product Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-white mb-2">
                      Price (£)*
                    </label>
                    <input
                      type="text"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-white mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                    />
                  </div>

                  {/* Parent Category Selection */}
                  <div>
                    <label
                      htmlFor="parentCategory"
                      className="block text-white mb-2"
                    >
                      Parent Category*
                    </label>
                    <select
                      id="parentCategory"
                      name="parentCategory"
                      value={selectedParent}
                      onChange={handleParentChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                      required
                    >
                      <option value="" disabled>
                        Select Parent Category
                      </option>
                      {categories.parents.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Child Category Selection (show only if parent has children) */}
                  <div>
                    <label htmlFor="category" className="block text-white mb-2">
                      Category*
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                      required
                    >
                      {/* If the selected parent has child categories, show them */}
                      {selectedParent &&
                      categories.children[selectedParent] &&
                      categories.children[selectedParent].length > 0 ? (
                        <>
                          <option value={selectedParent}>
                            All{" "}
                            {
                              categories.parents.find(
                                (p) => p._id === selectedParent
                              )?.name
                            }
                          </option>
                          {categories.children[selectedParent].map((child) => (
                            <option key={child._id} value={child._id}>
                              {child.name}
                            </option>
                          ))}
                        </>
                      ) : (
                        // If no children, use the parent as the category
                        <option value={selectedParent}>
                          {categories.parents.find(
                            (p) => p._id === selectedParent
                          )?.name || "Select Category"}
                        </option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="countInStock"
                      className="block text-white mb-2"
                    >
                      Count In Stock*
                    </label>
                    <input
                      type="text"
                      id="countInStock"
                      name="countInStock"
                      value={formData.countInStock}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-white mb-2"
                    >
                      Description*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                      required
                    ></textarea>
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="image" className="block text-white mb-2">
                      Product Image
                    </label>
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <input
                          type="url"
                          id="image"
                          name="image"
                          value={formData.image}
                          onChange={(e) =>
                            setFormData({ ...formData, image: e.target.value })
                          }
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500 mb-2"
                          placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-gray-400 text-sm mb-2">
                          Enter image URL or upload an image file.
                        </p>
                        <input
                          type="file"
                          id="imageFile"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-white"
                        />
                      </div>

                      {imagePreview && (
                        <div className="w-24 h-24 bg-gray-700 border border-gray-600 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={imagePreview}
                            alt="Product preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags input */}
                  <div className="md:col-span-2">
                    <label className="block text-white mb-2">Tags</label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                        placeholder="Add product tags"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-500 transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-700 text-white"
                          >
                            {tag}
                            <button
                              type="button"
                              className="ml-2 text-gray-400 hover:text-gray-200"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product status toggles */}
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-white">
                        Active (Visible on site)
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleChange}
                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-white">Featured Product</span>
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <Link
                    to="/admin/products"
                    className="py-3 px-6 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className={`py-3 px-6 rounded font-medium ${
                      submitting || success
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-amber-600 text-white hover:bg-amber-500"
                    }`}
                  >
                    {submitting ? "Updating..." : "Update Product"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductEdit;
