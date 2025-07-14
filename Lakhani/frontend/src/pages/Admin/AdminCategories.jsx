import { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { categoryService } from "../../services/api";
import { FaPlus, FaEdit, FaTrash, FaEye, FaArrowLeft } from "react-icons/fa";

const AdminCategories = () => {
  // Main state
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // UI state
  const [mode, setMode] = useState("list"); // list, view, edit, create
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategory: "",
    isActive: true,
  });

  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAllCategories();

      const categoriesData = response.data.categories || response.data;

      if (!Array.isArray(categoriesData)) {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid data format received from API");
      }

      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get category by ID
  const fetchCategoryById = async (categoryId) => {
    try {
      setLoading(true);
      const response = await categoryService.getCategoryById(categoryId);

      // Extract category data accounting for different API response structures
      const categoryData = response.data.category || response.data;

      if (!categoryData || !categoryData._id) {
        throw new Error("Invalid category data received");
      }

      return categoryData;
    } catch (err) {
      console.error("Error fetching category:", err);
      setError("Failed to fetch category details. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString();
    } catch (err) {
      return "Invalid Date";
    }
  };

  // Get parent category name
  const getParentCategoryName = (parentId) => {
    // If parentId is null/undefined/empty, return dash
    if (!parentId) return "-";

    // If parentId is an object with a name property, use that directly
    if (typeof parentId === "object" && parentId.name) {
      return parentId.name;
    }

    // Extract ID string from parentId (whether it's an ObjectId object or string)
    const parentIdStr =
      typeof parentId === "object" && parentId._id
        ? parentId._id.toString()
        : typeof parentId === "object"
        ? parentId.toString()
        : parentId;

    // Find the matching category in our list
    const parent = categories.find((cat) => {
      const catId = typeof cat._id === "object" ? cat._id.toString() : cat._id;
      return catId === parentIdStr;
    });

    // Return the name if found, otherwise dash
    return parent ? parent.name : "-";
  };

  // Find all top-level categories
  const getParentCategories = () => {
    if (!Array.isArray(categories)) return [];

    // Filter out categories that are already child categories
    // to prevent circular references
    const allParentIds = categories
      .filter((cat) => cat.parentCategory)
      .map((cat) =>
        typeof cat.parentCategory === "object"
          ? cat.parentCategory.toString()
          : cat.parentCategory
      );

    return categories.filter((cat) => {
      const catId = typeof cat._id === "object" ? cat._id.toString() : cat._id;
      return !allParentIds.includes(catId) || !cat.parentCategory;
    });
  };

  // Find child categories for a parent
  const getChildCategories = (parentId) => {
    if (!parentId || !Array.isArray(categories)) return [];

    const parentIdStr =
      typeof parentId === "object" ? parentId.toString() : parentId;

    return categories.filter((cat) => {
      // Handle different formats of parentCategory
      if (!cat.parentCategory) return false;

      // If parentCategory is an object with _id
      if (typeof cat.parentCategory === "object" && cat.parentCategory._id) {
        const catParentId =
          typeof cat.parentCategory._id === "object"
            ? cat.parentCategory._id.toString()
            : cat.parentCategory._id;
        return catParentId === parentIdStr;
      }

      // If parentCategory is a string
      if (typeof cat.parentCategory === "string") {
        return cat.parentCategory === parentIdStr;
      }

      // If parentCategory is an ObjectId object
      if (typeof cat.parentCategory === "object") {
        return cat.parentCategory.toString() === parentIdStr;
      }

      return false;
    });
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parentCategory: "",
      isActive: true,
    });
  };

  // Switch to create mode
  const handleAddNew = () => {
    resetForm();
    setMode("create");
  };

  // Switch to view mode
  const handleView = async (categoryId) => {
    const category = await fetchCategoryById(categoryId);
    if (category) {
      setSelectedCategory(category);
      setMode("view");
    }
  };

  // Switch to edit mode
  const handleEdit = async (categoryId) => {
    const category = await fetchCategoryById(categoryId);
    if (category) {
      setSelectedCategory(category);

      // Extract parentCategory ID depending on its format
      let parentId = "";
      if (category.parentCategory) {
        if (typeof category.parentCategory === "string") {
          parentId = category.parentCategory;
        } else if (typeof category.parentCategory === "object") {
          parentId = category.parentCategory._id || "";
        }
      }

      setFormData({
        name: category.name || "",
        description: category.description || "",
        parentCategory: parentId,
        isActive: category.isActive !== undefined ? category.isActive : true,
      });

      setMode("edit");
    }
  };

  // Return to list view
  const handleBack = () => {
    setMode("list");
    setSelectedCategory(null);
    resetForm();
    setConfirmDelete(null);
  };

  // Confirm deletion of a category
  const handleDeleteConfirm = (categoryId) => {
    setConfirmDelete(categoryId);
  };

  // Cancel deletion
  const handleDeleteCancel = () => {
    setConfirmDelete(null);
  };

  // Delete a category
  const handleDelete = async (categoryId) => {
    try {
      setLoading(true);
      await categoryService.deleteCategory(categoryId);

      // Update state
      setCategories(categories.filter((cat) => cat._id !== categoryId));
      setSuccess("Category deleted successfully");

      // Close delete confirmation and return to list view
      setConfirmDelete(null);
      handleBack();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit form to create or update category
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Prepare category data
      const categoryData = {
        name: formData.name,
        slug: generateSlug(formData.name),
        description: formData.description,
        isActive: formData.isActive,
      };

      if (formData.parentCategory) {
        categoryData.parentCategory = formData.parentCategory;
      } else {
        categoryData.parentCategory = null;
      }

      let updatedCategory;

      if (mode === "edit" && selectedCategory) {
        const response = await categoryService.updateCategory(
          selectedCategory._id,
          categoryData
        );
        updatedCategory = response.data;

        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat._id === selectedCategory._id ? updatedCategory : cat
          )
        );

        setSuccess("Category updated successfully");
        window.location.reload();
      } else {
        const response = await categoryService.createCategory(categoryData);
        updatedCategory = response.data;

        setCategories((prevCategories) => [...prevCategories, updatedCategory]);

        setSuccess("Category created successfully");
        window.location.reload();
      }

      handleBack();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error saving category:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save category. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on selected status
  const getFilteredCategories = () => {
    if (!Array.isArray(categories)) return [];

    return categories.filter((cat) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "active") return cat.isActive;
      if (filterStatus === "inactive") return !cat.isActive;
      return true;
    });
  };

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          <AdminSidebar />

          <div className="w-full md:w-3/4 md:pl-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">
                Product Categories
              </h1>

              {mode === "list" && (
                <button
                  onClick={handleAddNew}
                  className="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-500 transition-colors flex items-center gap-2"
                >
                  <FaPlus /> Add New Category
                </button>
              )}

              {mode !== "list" && (
                <button
                  onClick={handleBack}
                  className="text-gray-300 hover:text-white flex items-center gap-2"
                >
                  <FaArrowLeft /> Back to List
                </button>
              )}
            </div>

            {/* Alerts */}
            {error && (
              <div className="bg-red-900 text-white p-4 rounded mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900 text-white p-4 rounded mb-6">
                {success}
              </div>
            )}

            {/* Delete Confirmation */}
            {confirmDelete && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Confirm Deletion
                </h2>
                <p className="text-white mb-4">
                  Are you sure you want to delete this category? This action
                  cannot be undone and may affect products assigned to this
                  category.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleDelete(confirmDelete)}
                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-500 transition-colors"
                  >
                    Delete
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

            {/* Form (Create or Edit) */}
            {(mode === "create" || mode === "edit") && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  {mode === "create" ? "Add New Category" : "Edit Category"}
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-white mb-2">
                      Category Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                      required
                    />
                    <p className="text-gray-400 mt-1 text-sm">
                      Slug: {formData.name ? generateSlug(formData.name) : ""}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-white mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="parentCategory"
                      className="block text-white mb-2"
                    >
                      Parent Category
                    </label>
                    <select
                      id="parentCategory"
                      name="parentCategory"
                      value={formData.parentCategory}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                    >
                      <option value="">None (Top Level Category)</option>
                      {getParentCategories()
                        .filter(
                          (cat) =>
                            !selectedCategory ||
                            cat._id !== selectedCategory._id
                        )
                        .map((cat) => (
                          <option
                            key={cat._id}
                            value={
                              typeof cat._id === "object"
                                ? cat._id.toString()
                                : cat._id
                            }
                          >
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-white">Active</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="py-2 px-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2 px-4 bg-amber-600 text-white rounded hover:bg-amber-500 transition-colors flex items-center gap-2"
                    >
                      {loading
                        ? "Processing..."
                        : mode === "create"
                        ? "Add Category"
                        : "Update Category"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Category Details View */}
            {mode === "view" && selectedCategory && (
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Category Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 block">Name:</span>
                        <span className="text-white text-lg">
                          {selectedCategory.name || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Slug:</span>
                        <span className="text-white">
                          {selectedCategory.slug || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Status:</span>
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            selectedCategory.isActive
                              ? "bg-green-900 text-green-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {selectedCategory.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">
                          Parent Category:
                        </span>
                        <span className="text-white">
                          {selectedCategory.parentCategory
                            ? selectedCategory.parentCategory.name ||
                              getParentCategoryName(
                                selectedCategory.parentCategory
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Additional Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 block">
                          Description:
                        </span>
                        <span className="text-white">
                          {selectedCategory.description ||
                            "No description provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">
                          Date Created:
                        </span>
                        <span className="text-white">
                          {formatDate(selectedCategory.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">
                          Last Updated:
                        </span>
                        <span className="text-white">
                          {formatDate(selectedCategory.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Child Categories Section */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Child Categories
                  </h3>

                  {(() => {
                    const childCategories = getChildCategories(
                      typeof selectedCategory._id === "object"
                        ? selectedCategory._id.toString()
                        : selectedCategory._id
                    );

                    if (childCategories.length === 0) {
                      return (
                        <p className="text-gray-400">
                          No child categories found
                        </p>
                      );
                    }

                    return (
                      <div className="bg-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-600">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                                Name
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                                Status
                              </th>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-300">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {childCategories.map((child) => (
                              <tr
                                key={child._id}
                                className="border-t border-gray-600"
                              >
                                <td className="px-4 py-3 text-white">
                                  {child.name}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      child.isActive
                                        ? "bg-green-900 text-green-300"
                                        : "bg-red-900 text-red-300"
                                    }`}
                                  >
                                    {child.isActive ? "Active" : "Inactive"}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    onClick={() => handleView(child._id)}
                                    className="text-blue-500 hover:text-blue-400 mr-3"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-8 flex space-x-4">
                  <button
                    onClick={() => handleEdit(selectedCategory._id)}
                    className="py-2 px-4 bg-amber-600 text-white rounded hover:bg-amber-500 transition-colors flex items-center gap-2"
                  >
                    <FaEdit /> Edit Category
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(selectedCategory._id)}
                    className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-500 transition-colors flex items-center gap-2"
                  >
                    <FaTrash /> Delete Category
                  </button>
                </div>
              </div>
            )}

            {/* Category List */}
            {mode === "list" && (
              <>
                {/* Filters */}
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`px-4 py-2 rounded ${
                        filterStatus === "all"
                          ? "bg-amber-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterStatus("active")}
                      className={`px-4 py-2 rounded ${
                        filterStatus === "active"
                          ? "bg-amber-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilterStatus("inactive")}
                      className={`px-4 py-2 rounded ${
                        filterStatus === "inactive"
                          ? "bg-amber-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>

                {loading && (
                  <div className="bg-gray-800 p-10 rounded-lg border border-gray-700 text-center">
                    <div className="animate-pulse text-xl text-white">
                      Loading categories...
                    </div>
                  </div>
                )}

                {!loading && getFilteredCategories().length === 0 && (
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
                    <p className="text-white mb-4">No categories found.</p>
                    <button
                      onClick={handleAddNew}
                      className="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-500 transition-colors"
                    >
                      Add Your First Category
                    </button>
                  </div>
                )}

                {!loading && getFilteredCategories().length > 0 && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Parent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {getFilteredCategories().map((category) => (
                          <tr key={category._id} className="hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {category.name || "Unnamed Category"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {category.parentCategory
                                ? category.parentCategory.name ||
                                  getParentCategoryName(category.parentCategory)
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  category.isActive
                                    ? "bg-green-900 text-green-300"
                                    : "bg-red-900 text-red-300"
                                }`}
                              >
                                {category.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-4">
                                <button
                                  onClick={() => handleView(category._id)}
                                  className="text-blue-500 hover:text-blue-400"
                                >
                                  View
                                </button>
                                <button
                                  onClick={() => handleEdit(category._id)}
                                  className="text-amber-500 hover:text-amber-400"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteConfirm(category._id)
                                  }
                                  className="text-red-500 hover:text-red-400"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
