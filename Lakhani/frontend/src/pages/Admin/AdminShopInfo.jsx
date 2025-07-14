import { useState, useEffect } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { shopInfoService } from "../../services/api";

const AdminShopInfo = () => {
  const [shopInfo, setShopInfo] = useState({
    shopName: "",
    tagline: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    description: "",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: "",
      pinterest: "",
    },
    storeHours: {
      monday: { openTime: "09:00 AM", closeTime: "18:00 PM", isClosed: false },
      tuesday: { openTime: "09:00 AM", closeTime: "18:00 PM", isClosed: false },
      wednesday: {
        openTime: "09:00 AM",
        closeTime: "18:00 PM",
        isClosed: false,
      },
      thursday: {
        openTime: "09:00 AM",
        closeTime: "18:00 PM",
        isClosed: false,
      },
      friday: { openTime: "09:00 AM", closeTime: "18:00 PM", isClosed: false },
      saturday: {
        openTime: "10:00 AM",
        closeTime: "16:00 PM",
        isClosed: false,
      },
      sunday: { openTime: "10:00 AM", closeTime: "16:00 PM", isClosed: true },
    },
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("general"); // general, hours, social

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        setLoading(true);
        const response = await shopInfoService.getShopInfo();
        const data = response.data;

        if (data) {
          // Convert array of store hours to object format for easier form handling
          const hoursObj = {};
          if (Array.isArray(data.storeHours)) {
            data.storeHours.forEach((dayInfo) => {
              const day = dayInfo.day.toLowerCase();
              hoursObj[day] = {
                openTime: dayInfo.openTime || "09:00 AM",
                closeTime: dayInfo.closeTime || "18:00 PM",
                isClosed: dayInfo.isClosed || false,
              };
            });
          }

          // Set all shop info with proper structure
          setShopInfo({
            shopName: data.shopName || "",
            tagline: data.tagline || "",
            email: data.email || "",
            phone: data.contactNumber || "",
            description: data.description || "",
            // Ensure address object has all needed fields
            address: {
              street: data.address?.street || "",
              city: data.address?.city || "",
              state: data.address?.state || "",
              zipCode: data.address?.zipCode || "",
              country: data.address?.country || "",
            },
            // Social media links
            socialMedia: {
              facebook: data.socialMedia?.facebook || "",
              instagram: data.socialMedia?.instagram || "",
              twitter: data.socialMedia?.twitter || "",
              pinterest: data.socialMedia?.pinterest || "",
            },
            // Store hours
            storeHours: hoursObj.monday ? hoursObj : shopInfo.storeHours,
          });
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching shop info:", err);
        setError("Failed to fetch shop information. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchShopInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShopInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShopInfo((prevInfo) => ({
      ...prevInfo,
      address: {
        ...prevInfo.address,
        [name]: value,
      },
    }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setShopInfo((prevInfo) => ({
      ...prevInfo,
      socialMedia: {
        ...prevInfo.socialMedia,
        [name]: value,
      },
    }));
  };

  const handleHoursChange = (day, field, value) => {
    setShopInfo((prevInfo) => ({
      ...prevInfo,
      storeHours: {
        ...prevInfo.storeHours,
        [day]: {
          ...prevInfo.storeHours[day],
          [field]:
            field === "isClosed" ? !prevInfo.storeHours[day].isClosed : value,
        },
      },
    }));
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    await saveShopInfo("infoUpdate");
  };

  const handleHoursSubmit = async (e) => {
    e.preventDefault();
    await saveShopInfo("hours");
  };

  const handleSocialSubmit = async (e) => {
    e.preventDefault();
    await saveShopInfo("infoUpdate");
  };

  const saveShopInfo = async (endpoint) => {
    try {
      setSubmitting(true);
      setError(null);

      // Construct data to update based on endpoint
      let updateData;

      if (endpoint === "hours") {
        // Convert storeHours object to array format that backend expects
        const storeHoursArray = Object.entries(shopInfo.storeHours).map(
          ([day, hours]) => ({
            day: day.charAt(0).toUpperCase() + day.slice(1), // Capitalize day name
            openTime: hours.openTime,
            closeTime: hours.closeTime,
            isClosed: hours.isClosed,
          })
        );

        updateData = { storeHours: storeHoursArray };
        await shopInfoService.updateStoreHours(updateData);
      } else {
        // For general and social info
        const { storeHours, ...generalInfo } = shopInfo;
        updateData = {
          ...generalInfo,
          contactNumber: shopInfo.phone, // Map to correct field name
        };

        await shopInfoService.updateShopInfo(updateData);
      }

      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error updating shop info:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update shop information. Please try again."
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
            <h1 className="text-3xl font-bold text-white mb-6">
              Shop Information
            </h1>

            {error && (
              <div className="bg-red-900 text-white p-4 rounded mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-900 text-white p-4 rounded mb-6">
                Shop information updated successfully!
              </div>
            )}

            {loading ? (
              <div className="text-white">Loading shop information...</div>
            ) : (
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="border-b border-gray-700">
                  <div className="flex">
                    <button
                      className={`px-6 py-4 font-medium ${
                        activeTab === "general"
                          ? "bg-gray-700 text-amber-500 border-b-2 border-amber-500"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => setActiveTab("general")}
                    >
                      General Info
                    </button>
                    <button
                      className={`px-6 py-4 font-medium ${
                        activeTab === "hours"
                          ? "bg-gray-700 text-amber-500 border-b-2 border-amber-500"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => setActiveTab("hours")}
                    >
                      Store Hours
                    </button>
                    <button
                      className={`px-6 py-4 font-medium ${
                        activeTab === "social"
                          ? "bg-gray-700 text-amber-500 border-b-2 border-amber-500"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => setActiveTab("social")}
                    >
                      Social Media
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* General Information Tab */}
                  {activeTab === "general" && (
                    <form onSubmit={handleGeneralSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="shopName"
                            className="block text-white mb-2"
                          >
                            Shop Name*
                          </label>
                          <input
                            type="text"
                            id="shopName"
                            name="shopName"
                            value={shopInfo.shopName}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="tagline"
                            className="block text-white mb-2"
                          >
                            Tagline
                          </label>
                          <input
                            type="text"
                            id="tagline"
                            name="tagline"
                            value={shopInfo.tagline}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-white mb-2"
                          >
                            Contact Email*
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={shopInfo.email}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-white mb-2"
                          >
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={shopInfo.phone}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                          />
                        </div>

                        {/* Address Fields - Now Structured */}
                        <div>
                          <label
                            htmlFor="street"
                            className="block text-white mb-2"
                          >
                            Street Address
                          </label>
                          <input
                            type="text"
                            id="street"
                            name="street"
                            value={shopInfo.address.street}
                            onChange={handleAddressChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="city"
                            className="block text-white mb-2"
                          >
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={shopInfo.address.city}
                            onChange={handleAddressChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="state"
                            className="block text-white mb-2"
                          >
                            State/Province
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={shopInfo.address.state}
                            onChange={handleAddressChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="zipCode"
                            className="block text-white mb-2"
                          >
                            Postal/ZIP Code
                          </label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={shopInfo.address.zipCode}
                            onChange={handleAddressChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="country"
                            className="block text-white mb-2"
                          >
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            value={shopInfo.address.country}
                            onChange={handleAddressChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label
                            htmlFor="description"
                            className="block text-white mb-2"
                          >
                            About Our Shop
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            value={shopInfo.description}
                            onChange={handleInputChange}
                            rows="5"
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                          ></textarea>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`py-3 px-6 rounded font-medium ${
                            submitting
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-amber-600 text-white hover:bg-amber-500"
                          }`}
                        >
                          {submitting
                            ? "Saving..."
                            : "Save General Information"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Store Hours Tab */}
                  {activeTab === "hours" && (
                    <form onSubmit={handleHoursSubmit}>
                      <div className="space-y-4">
                        {Object.entries(shopInfo.storeHours).map(
                          ([day, hours]) => (
                            <div
                              key={day}
                              className="flex items-center p-3 bg-gray-700 rounded"
                            >
                              <div className="w-32 font-medium text-white capitalize">
                                {day}
                              </div>

                              <div className="flex items-center ml-6 space-x-4 flex-grow">
                                <label className="flex items-center text-gray-300">
                                  <input
                                    type="checkbox"
                                    checked={hours.isClosed}
                                    onChange={() =>
                                      handleHoursChange(
                                        day,
                                        "isClosed",
                                        !hours.isClosed
                                      )
                                    }
                                    className="mr-2 h-4 w-4"
                                  />
                                  Closed
                                </label>

                                {!hours.isClosed && (
                                  <>
                                    <div className="flex items-center">
                                      <span className="text-gray-400 mr-2">
                                        Open:
                                      </span>
                                      <input
                                        type="text"
                                        value={hours.openTime}
                                        onChange={(e) =>
                                          handleHoursChange(
                                            day,
                                            "openTime",
                                            e.target.value
                                          )
                                        }
                                        className="p-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-amber-500"
                                        placeholder="9:00 AM"
                                      />
                                    </div>

                                    <div className="flex items-center">
                                      <span className="text-gray-400 mr-2">
                                        Close:
                                      </span>
                                      <input
                                        type="text"
                                        value={hours.closeTime}
                                        onChange={(e) =>
                                          handleHoursChange(
                                            day,
                                            "closeTime",
                                            e.target.value
                                          )
                                        }
                                        className="p-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-amber-500"
                                        placeholder="6:00 PM"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`py-3 px-6 rounded font-medium ${
                            submitting
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-amber-600 text-white hover:bg-amber-500"
                          }`}
                        >
                          {submitting ? "Saving..." : "Save Store Hours"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Social Media Tab */}
                  {activeTab === "social" && (
                    <form onSubmit={handleSocialSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="facebook"
                            className="block text-white mb-2"
                          >
                            Facebook Page URL
                          </label>
                          <input
                            type="url"
                            id="facebook"
                            name="facebook"
                            value={shopInfo.socialMedia.facebook}
                            onChange={handleSocialChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                            placeholder="https://facebook.com/your-page"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="instagram"
                            className="block text-white mb-2"
                          >
                            Instagram Profile
                          </label>
                          <input
                            type="url"
                            id="instagram"
                            name="instagram"
                            value={shopInfo.socialMedia.instagram}
                            onChange={handleSocialChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                            placeholder="https://instagram.com/your-profile"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="twitter"
                            className="block text-white mb-2"
                          >
                            Twitter Profile
                          </label>
                          <input
                            type="url"
                            id="twitter"
                            name="twitter"
                            value={shopInfo.socialMedia.twitter}
                            onChange={handleSocialChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                            placeholder="https://twitter.com/your-handle"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="pinterest"
                            className="block text-white mb-2"
                          >
                            Pinterest Profile
                          </label>
                          <input
                            type="url"
                            id="pinterest"
                            name="pinterest"
                            value={shopInfo.socialMedia.pinterest}
                            onChange={handleSocialChange}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white focus:border-amber-500"
                            placeholder="https://pinterest.com/your-profile"
                          />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`py-3 px-6 rounded font-medium ${
                            submitting
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-amber-600 text-white hover:bg-amber-500"
                          }`}
                        >
                          {submitting ? "Saving..." : "Save Social Media Links"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminShopInfo;
