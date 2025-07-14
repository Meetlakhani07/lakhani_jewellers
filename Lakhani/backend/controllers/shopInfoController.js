const ShopInfo = require('../models/ShopInfo');

const getShopInfo = async (req, res) => {
  try {
    let shopInfo = await ShopInfo.findOne();

    if (shopInfo) {
      res.json(shopInfo);
    } else {
      // Create default shop info for Leicester location
      const defaultShopInfo = new ShopInfo({
        
        shopName: "Elegant Jewelry Leicester",
        address: {
          street: "23 High Street",
          city: "Leicester",
          state: "Leicestershire",
          zipCode: "LE1 4FP",
          country: "United Kingdom"
        },
        location: {
          lat: 52.6369,
          lng: -1.1398
        },
        contactNumber: "+44-116-555-1234",
        email: "contact@elegantjewelry.co.uk",
        storeHours: [
          {
            day: "Monday",
            openTime: "10:00 AM",
            closeTime: "6:00 PM",
            isClosed: false
          },
          {
            day: "Tuesday",
            openTime: "10:00 AM",
            closeTime: "6:00 PM",
            isClosed: false
          },
          {
            day: "Wednesday",
            openTime: "10:00 AM",
            closeTime: "6:00 PM",
            isClosed: false
          },
          {
            day: "Thursday",
            openTime: "10:00 AM",
            closeTime: "6:00 PM",
            isClosed: false
          },
          {
            day: "Friday",
            openTime: "10:00 AM",
            closeTime: "7:00 PM",
            isClosed: false
          },
          {
            day: "Saturday",
            openTime: "9:00 AM",
            closeTime: "7:00 PM",
            isClosed: false
          },
          {
            day: "Sunday",
            openTime: "11:00 AM",
            closeTime: "4:00 PM",
            isClosed: false
          }
        ],
        socialMedia: {
          facebook: "https://facebook.com/elegantjewelry-leicester",
          instagram: "https://instagram.com/elegantjewelry_leicester",
          twitter: "https://twitter.com/elegantjewelry_leicester",
          pinterest: "https://pinterest.com/elegantjewelry_leicester"
        },
        description: "Elegant Jewelry Leicester offers exquisite handcrafted jewelry pieces using the finest materials. Visit our store in Leicester city centre for a personalized shopping experience."
      });

      const savedShopInfo = await defaultShopInfo.save();
      res.status(201).json(savedShopInfo);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateShopInfo = async (req, res) => {
  try {
    const {
      shopName,
      address,
      location,
      contactNumber,
      email,
      storeHours,
      socialMedia,
      description
    } = req.body;

    let shopInfo = await ShopInfo.findOne();

    if (shopInfo) {
      shopInfo.shopName = shopName || shopInfo.shopName;
      shopInfo.address = address || shopInfo.address;
      shopInfo.location = location || shopInfo.location;
      shopInfo.contactNumber = contactNumber || shopInfo.contactNumber;
      shopInfo.email = email || shopInfo.email;
      shopInfo.storeHours = storeHours || shopInfo.storeHours;
      shopInfo.socialMedia = socialMedia || shopInfo.socialMedia;
      shopInfo.description = description || shopInfo.description;

      const updatedShopInfo = await shopInfo.save();
      res.json(updatedShopInfo);
    } else {
      shopInfo = new ShopInfo({
        shopName,
        address,
        location,
        contactNumber,
        email,
        storeHours,
        socialMedia,
        description
      });

      const createdShopInfo = await shopInfo.save();
      res.status(201).json(createdShopInfo);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateStoreHours = async (req, res) => {
  try {
    const { storeHours } = req.body;

    let shopInfo = await ShopInfo.findOne();

    if (shopInfo) {
      shopInfo.storeHours = storeHours;

      const updatedShopInfo = await shopInfo.save();
      res.json(updatedShopInfo);
    } else {
      res.status(404).json({ message: 'Shop information not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getShopInfo, updateShopInfo, updateStoreHours };