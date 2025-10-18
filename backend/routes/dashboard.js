const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const Donation = require('../models/Donation');

const router = express.Router();

// @route   GET /api/dashboard/customer/stats
// @desc    Get customer dashboard statistics
// @access  Private (Customer only)
router.get('/customer/stats', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Check if user is a customer
    if (!user.roles?.includes('customer')) {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

    // Get user's location for nearby calculations
    const userLocation = user.location?.coordinates;

    // Calculate nearby vendors count
    let nearbyVendorsCount = 0;
    if (userLocation) {
      const nearbyVendors = await User.find({
        roles: 'vendor',
        isActive: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userLocation
            },
            $maxDistance: 50000 // 50km radius
          }
        }
      }).limit(1000); // Limit to prevent performance issues
      nearbyVendorsCount = nearbyVendors.length;
    }

    // Calculate available products count
    let availableProductsCount = 0;
    if (userLocation) {
      const nearbyProducts = await Product.find({
        isActive: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userLocation
            },
            $maxDistance: 50000 // 50km radius
          }
        }
      }).limit(1000); // Limit to prevent performance issues
      availableProductsCount = nearbyProducts.length;
    }

    // Calculate nearby NGOs count
    let nearbyNGOCount = 0;
    if (userLocation) {
      const nearbyNGOs = await User.find({
        roles: 'ngo',
        isActive: true,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: userLocation
            },
            $maxDistance: 50000 // 50km radius
          }
        }
      }).limit(1000); // Limit to prevent performance issues
      nearbyNGOCount = nearbyNGOs.length;
    }

    // Calculate unread messages count (placeholder - would need chat integration)
    const unreadMessagesCount = 0; // TODO: Implement with Stream Chat

    const stats = {
      nearbyVendors: nearbyVendorsCount,
      availableProducts: availableProductsCount,
      nearbyNGOs: nearbyNGOCount,
      unreadMessages: unreadMessagesCount
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get customer dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/vendor/stats
// @desc    Get vendor dashboard statistics
// @access  Private (Vendor only)
router.get('/vendor/stats', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Check if user is a vendor
    if (!user.roles?.includes('vendor')) {
      return res.status(403).json({ message: 'Access denied. Vendor role required.' });
    }

    const userId = user._id;

    // Calculate vendor-specific statistics
    const [
      totalProducts,
      activeDonations,
      completedDonations,
      unreadMessages
    ] = await Promise.all([
      Product.countDocuments({ vendor: userId, isActive: true }),
      Donation.countDocuments({ vendor: userId, status: { $in: ['available', 'requested', 'confirmed', 'picked_up'] } }),
      Donation.countDocuments({ vendor: userId, status: 'completed' }),
      // TODO: Implement with Stream Chat
      Promise.resolve(0)
    ]);

    const stats = {
      totalProducts,
      activeDonations,
      donationScore: user.donationScore || 0,
      unreadMessages
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get vendor dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/ngo/stats
// @desc    Get NGO dashboard statistics
// @access  Private (NGO only)
router.get('/ngo/stats', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    // Check if user is an NGO
    if (!user.roles?.includes('ngo')) {
      return res.status(403).json({ message: 'Access denied. NGO role required.' });
    }

    const userId = user._id;

    // Calculate NGO-specific statistics
    const [
      availableDonations,
      activeRequests,
      completedDonations,
      partnerVendors
    ] = await Promise.all([
      Donation.countDocuments({ status: 'available' }),
      Donation.countDocuments({ requestedBy: userId, status: { $in: ['requested', 'confirmed', 'picked_up'] } }),
      Donation.countDocuments({ requestedBy: userId, status: 'completed' }),
      // Count unique vendors that this NGO has worked with
      Donation.distinct('vendor', { requestedBy: userId, status: 'completed' }).then(vendors => vendors.length)
    ]);

    const stats = {
      availableDonations,
      activeRequests,
      completedDonations,
      partnerVendors
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get NGO dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
