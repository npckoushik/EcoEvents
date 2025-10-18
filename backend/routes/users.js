const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireAnyRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Helper function to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// @route   GET /api/users/vendors/nearby
// @desc    Get nearby vendors
// @access  Public (with optional auth for user location)
router.get('/vendors/nearby', [
  query('latitude').optional().isFloat({ min: -90, max: 90 }),
  query('longitude').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isInt({ min: 1, max: 1000 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      latitude,
      longitude,
      radius = 50,
      page = 1,
      limit = 20
    } = req.query;

    let vendors;

    // If location is provided, use geospatial query
    if (latitude && longitude) {
      const userLocation = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };

      vendors = await User.find({
        roles: 'vendor',
        isActive: true,
        location: {
          $near: {
            $geometry: userLocation,
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      })
      .select('-password -email')
      .sort({ donationScore: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      // Calculate distances
      vendors = vendors.map(vendor => {
        const distance = calculateDistance(
          latitude, longitude,
          vendor.location.coordinates[1], vendor.location.coordinates[0]
        );
        vendor._distance = Math.round(distance * 10) / 10; // Round to 1 decimal
        return vendor;
      });
    } else {
      // No location provided, return all vendors
      vendors = await User.find({
        roles: 'vendor',
        isActive: true
      })
      .select('-password -email')
      .sort({ donationScore: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    }

    res.json({
      vendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: vendors.length
      }
    });
  } catch (error) {
    console.error('Get nearby vendors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/ngos/nearby
// @desc    Get nearby NGOs
// @access  Public (with optional auth for user location)
router.get('/ngos/nearby', [
  query('latitude').optional().isFloat({ min: -90, max: 90 }),
  query('longitude').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isInt({ min: 1, max: 1000 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      latitude,
      longitude,
      radius = 50,
      page = 1,
      limit = 20
    } = req.query;

    let ngos;

    // If location is provided, use geospatial query
    if (latitude && longitude) {
      const userLocation = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };

      ngos = await User.find({
        roles: 'ngo',
        isActive: true,
        location: {
          $near: {
            $geometry: userLocation,
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      })
      .select('-password -email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      // Calculate distances
      ngos = ngos.map(ngo => {
        const distance = calculateDistance(
          latitude, longitude,
          ngo.location.coordinates[1], ngo.location.coordinates[0]
        );
        ngo._distance = Math.round(distance * 10) / 10; // Round to 1 decimal
        return ngo;
      });
    } else {
      // No location provided, return all NGOs
      ngos = await User.find({
        roles: 'ngo',
        isActive: true
      })
      .select('-password -email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    }

    res.json({
      ngos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: ngos.length
      }
    });
  } catch (error) {
    console.error('Get nearby NGOs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/leaderboard
// @desc    Get vendor leaderboard
// @access  Public
router.get('/leaderboard', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('period').optional().isIn(['all', 'monthly', 'weekly'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      page = 1,
      limit = 20,
      period = 'all'
    } = req.query;

    let query = {
      roles: 'vendor',
      isActive: true,
      donationScore: { $gt: 0 } // Only show vendors with donations
    };

    // Add time-based filtering if needed
    if (period === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      query.updatedAt = { $gte: oneMonthAgo };
    } else if (period === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      query.updatedAt = { $gte: oneWeekAgo };
    }

    const vendors = await User.find(query)
      .select('-password -email')
      .sort({ donationScore: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add ranking
    const rankedVendors = vendors.map((vendor, index) => ({
      ...vendor.toObject(),
      rank: (page - 1) * limit + index + 1
    }));

    // Get total count for pagination
    const totalVendors = await User.countDocuments(query);

    res.json({
      leaderboard: rankedVendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalVendors,
        totalPages: Math.ceil(totalVendors / limit)
      },
      period
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Private (own profile or public for vendors)
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can view stats (own profile or vendor profile)
    const canView = req.user._id.toString() === userId.toString() || user.hasRole('vendor');

    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = {
      donationScore: user.donationScore,
      roles: user.roles,
      memberSince: user.createdAt,
      lastLogin: user.lastLogin
    };

    // Add role-specific stats
    if (user.hasRole('vendor')) {
      const Product = require('../models/Product');
      const Donation = require('../models/Donation');

      const [productCount, donationCount, completedDonations] = await Promise.all([
        Product.countDocuments({ vendor: userId }),
        Donation.countDocuments({ vendor: userId }),
        Donation.countDocuments({ vendor: userId, status: 'completed' })
      ]);

      stats.vendorStats = {
        totalProducts: productCount,
        totalDonations: donationCount,
        completedDonations,
        completionRate: donationCount > 0 ? Math.round((completedDonations / donationCount) * 100) : 0
      };
    }

    if (user.hasRole('ngo')) {
      const Donation = require('../models/Donation');

      const [requestedDonations, completedDonations] = await Promise.all([
        Donation.countDocuments({ requestedBy: userId }),
        Donation.countDocuments({ requestedBy: userId, status: 'completed' })
      ]);

      stats.ngoStats = {
        requestedDonations,
        completedDonations,
        successRate: requestedDonations > 0 ? Math.round((completedDonations / requestedDonations) * 100) : 0
      };
    }

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
