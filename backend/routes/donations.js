const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { authenticateToken, requireRole, requireAnyRole, optionalAuth } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

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

// @route   GET /api/donations
// @desc    Get donations with location-based filtering
// @access  Public (with optional auth for user location)
router.get('/', [
  query('latitude').optional().isFloat({ min: -90, max: 90 }),
  query('longitude').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isInt({ min: 1, max: 1000 }),
  query('category').optional().isIn(['food', 'attire', 'decor', 'lighting', 'flowers', 'other']),
  query('status').optional().isIn(['available', 'requested', 'confirmed', 'picked_up', 'completed', 'expired']),
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
      category,
      status = 'available',
      page = 1,
      limit = 20
    } = req.query;

    let query = { status };

    // Add category filter
    if (category) {
      query.category = category;
    }

    let donations;

    // If location is provided, use geospatial query
    if (latitude && longitude) {
      const userLocation = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };

      donations = await Donation.find({
        ...query,
        location: {
          $near: {
            $geometry: userLocation,
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      })
      .populate('vendor', 'name email phone address location donationScore')
      .populate('ngo', 'name email phone address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      // Calculate distances
      donations = donations.map(donation => {
        const distance = calculateDistance(
          latitude, longitude,
          donation.location.coordinates[1], donation.location.coordinates[0]
        );
        donation._distance = Math.round(distance * 10) / 10; // Round to 1 decimal
        return donation;
      });
    } else {
      // No location provided, return all donations
      donations = await Donation.find(query)
        .populate('vendor', 'name email phone address location donationScore')
        .populate('ngo', 'name email phone address')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }

    res.json({
      donations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: donations.length
      }
    });
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/:id
// @desc    Get single donation by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('vendor', 'name email phone address location donationScore')
      .populate('ngo', 'name email phone address')
      .populate('requestedBy', 'name email phone address');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json({ donation });
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/donations
// @desc    Create new donation
// @access  Private (Vendor only)
router.post('/', authenticateToken, requireRole(['vendor']), uploadMultiple('images', 3), [
  body('title').trim().isLength({ min: 2 }).withMessage('Title required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['food', 'attire', 'decor', 'lighting', 'flowers', 'other']).withMessage('Valid category required'),
  body('quantity').trim().isLength({ min: 1 }).withMessage('Quantity required'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date required'),
  body('pickupInstructions').optional().trim()
], handleUploadError, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const {
      title,
      description,
      category,
      quantity,
      address,
      latitude,
      longitude,
      expiryDate,
      pickupInstructions = ''
    } = req.body;

    // Check if expiry date is in the future
    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ message: 'Expiry date must be in the future' });
    }

    // Get image filenames if uploaded
    const images = req.files ? req.files.map(file => file.filename) : [];

    const donation = new Donation({
      vendor: req.user._id,
      title,
      description,
      category,
      quantity,
      images,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      expiryDate: new Date(expiryDate),
      pickupInstructions
    });

    await donation.save();
    await donation.populate('vendor', 'name email phone address location donationScore');

    res.status(201).json({
      message: 'Donation created successfully',
      donation
    });
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/donations/:id
// @desc    Update donation
// @access  Private (Vendor only - own donations)
router.put('/:id', authenticateToken, requireRole(['vendor']), [
  body('title').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('category').optional().isIn(['food', 'attire', 'decor', 'lighting', 'flowers', 'other']),
  body('quantity').optional().trim().isLength({ min: 1 }),
  body('address').optional().trim().isLength({ min: 5 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('expiryDate').optional().isISO8601(),
  body('pickupInstructions').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user owns this donation
    if (donation.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow updates if donation is already requested, confirmed, picked up, or completed
    if (['requested', 'confirmed', 'picked_up', 'completed'].includes(donation.status)) {
      return res.status(400).json({ message: 'Cannot update donation that has been requested' });
    }

    const updateData = {};
    const { title, description, category, quantity, address, latitude, longitude, expiryDate, pickupInstructions } = req.body;

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (quantity) updateData.quantity = quantity;
    if (address) updateData.address = address;
    if (latitude && longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }
    if (expiryDate) {
      if (new Date(expiryDate) <= new Date()) {
        return res.status(400).json({ message: 'Expiry date must be in the future' });
      }
      updateData.expiryDate = new Date(expiryDate);
    }
    if (pickupInstructions !== undefined) updateData.pickupInstructions = pickupInstructions;

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('vendor', 'name email phone address location donationScore');

    res.json({
      message: 'Donation updated successfully',
      donation: updatedDonation
    });
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/donations/:id
// @desc    Delete donation
// @access  Private (Vendor only - own donations)
router.delete('/:id', authenticateToken, requireRole(['vendor']), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user owns this donation
    if (donation.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow deletion if donation is already requested, confirmed, picked up, or completed
    if (['requested', 'confirmed', 'picked_up', 'completed'].includes(donation.status)) {
      return res.status(400).json({ message: 'Cannot delete donation that has been requested' });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/donations/:id/request
// @desc    Request a donation (NGO only)
// @access  Private (NGO only)
router.post('/:id/request', authenticateToken, requireRole(['ngo']), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'Donation is not available for request' });
    }

    if (donation.isExpired()) {
      donation.status = 'expired';
      await donation.save();
      return res.status(400).json({ message: 'Donation has expired' });
    }

    // Update donation status
    donation.status = 'requested';
    donation.requestedBy = req.user._id;
    donation.requestedAt = new Date();

    await donation.save();
    await donation.populate('vendor', 'name email phone address location donationScore');
    await donation.populate('requestedBy', 'name email phone address');

    res.json({
      message: 'Donation requested successfully',
      donation
    });
  } catch (error) {
    console.error('Request donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/donations/:id/confirm
// @desc    Confirm a donation request (Vendor only)
// @access  Private (Vendor only - own donations)
router.post('/:id/confirm', authenticateToken, requireRole(['vendor']), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user owns this donation
    if (donation.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (donation.status !== 'requested') {
      return res.status(400).json({ message: 'Donation is not in requested status' });
    }

    // Update donation status
    donation.status = 'confirmed';
    donation.confirmedAt = new Date();

    await donation.save();
    await donation.populate('vendor', 'name email phone address location donationScore');
    await donation.populate('requestedBy', 'name email phone address');

    res.json({
      message: 'Donation confirmed successfully',
      donation
    });
  } catch (error) {
    console.error('Confirm donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/donations/:id/complete
// @desc    Mark donation as completed (Vendor only)
// @access  Private (Vendor only - own donations)
router.post('/:id/complete', authenticateToken, requireRole(['vendor']), [
  body('impactNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user owns this donation
    if (donation.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (donation.status !== 'confirmed') {
      return res.status(400).json({ message: 'Donation is not in confirmed status' });
    }

    // Update donation status to picked_up (waiting for NGO confirmation)
    donation.status = 'picked_up';
    donation.pickedUpAt = new Date();
    donation.impactNotes = req.body.impactNotes || '';

    await donation.save();
    await donation.populate('vendor', 'name email phone address location donationScore');
    await donation.populate('requestedBy', 'name email phone address');

    res.json({
      message: 'Donation marked as picked up. Waiting for NGO confirmation.',
      donation
    });
  } catch (error) {
    console.error('Complete donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/vendor/my-donations
// @desc    Get vendor's own donations
// @access  Private (Vendor only)
router.get('/vendor/my-donations', authenticateToken, requireRole(['vendor']), async (req, res) => {
  try {
    const donations = await Donation.find({ vendor: req.user._id })
      .populate('requestedBy', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json({ donations });
  } catch (error) {
    console.error('Get vendor donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations/ngo/my-requests
// @desc    Get NGO's requested donations
// @access  Private (NGO only)
router.get('/ngo/my-requests', authenticateToken, requireRole(['ngo']), async (req, res) => {
  try {
    const donations = await Donation.find({ requestedBy: req.user._id })
      .populate('vendor', 'name email phone address location donationScore')
      .sort({ createdAt: -1 });

    res.json({ donations });
  } catch (error) {
    console.error('Get NGO requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/donations/:id/ngo-complete
// @desc    Mark donation as completed by NGO (NGO only)
// @access  Private (NGO only - own requests)
router.post('/:id/ngo-complete', authenticateToken, requireRole(['ngo']), [
  body('ngoNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if NGO requested this donation
    if (donation.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (donation.status !== 'picked_up') {
      return res.status(400).json({ message: 'Donation is not in picked up status' });
    }

    // Update donation status and award points
    donation.status = 'completed';
    donation.completedAt = new Date();
    donation.ngoNotes = req.body.ngoNotes || '';
    donation.pointsAwarded = 10; // Award 10 points for completed donation

    // Update vendor's donation score
    const vendor = await User.findById(donation.vendor);
    vendor.donationScore += 10;
    await vendor.save();

    await donation.save();
    await donation.populate('vendor', 'name email phone address location donationScore');
    await donation.populate('requestedBy', 'name email phone address');

    res.json({
      message: 'Donation completed successfully. Vendor has been awarded points.',
      donation
    });
  } catch (error) {
    console.error('NGO complete donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
