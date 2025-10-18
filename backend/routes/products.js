const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');
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

// @route   GET /api/products
// @desc    Get products with location-based filtering
// @access  Public (with optional auth for user location)
router.get('/', [
  query('latitude').optional().isFloat({ min: -90, max: 90 }),
  query('longitude').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isInt({ min: 1, max: 1000 }),
  query('category').optional().isIn(['food', 'attire', 'decor', 'lighting', 'flowers', 'other']),
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
      page = 1,
      limit = 20
    } = req.query;

    let query = { isAvailable: true, ecoFriendly: true };

    // Add category filter
    if (category) {
      query.category = category;
    }

    let products;

    // If location is provided, use geospatial query
    if (latitude && longitude) {
      const userLocation = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };

      products = await Product.find({
        ...query,
        location: {
          $near: {
            $geometry: userLocation,
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      })
      .populate('vendor', 'name email phone address location donationScore')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

      // Calculate distances
      products = products.map(product => {
        const distance = calculateDistance(
          latitude, longitude,
          product.location.coordinates[1], product.location.coordinates[0]
        );
        product._distance = Math.round(distance * 10) / 10; // Round to 1 decimal
        return product;
      });
    } else {
      // No location provided, return all products
      products = await Product.find(query)
        .populate('vendor', 'name email phone address location donationScore')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
    }

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: products.length
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name email phone address location donationScore');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Vendor only)
router.post('/', authenticateToken, requireRole(['vendor']), uploadMultiple('images', 5), [
  body('name').trim().isLength({ min: 2 }).withMessage('Product name required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['food', 'attire', 'decor', 'lighting', 'flowers', 'other']).withMessage('Valid category required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], handleUploadError, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    // Check if images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'At least one image is required' 
      });
    }

    const {
      name,
      description,
      category,
      price,
      address,
      latitude,
      longitude,
      tags
    } = req.body;

    // Get image filenames
    const images = req.files.map(file => file.filename);

    // Parse tags if provided
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = [];
      }
    }

    const product = new Product({
      vendor: req.user._id,
      name,
      description,
      category,
      price: parseFloat(price),
      images,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      tags: parsedTags
    });

    await product.save();
    await product.populate('vendor', 'name email phone address location donationScore');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Vendor only - own products)
router.put('/:id', authenticateToken, requireRole(['vendor']), [
  body('name').optional().trim().isLength({ min: 2 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('category').optional().isIn(['food', 'attire', 'decor', 'lighting', 'flowers', 'other']),
  body('price').optional().isFloat({ min: 0 }),
  body('address').optional().trim().isLength({ min: 5 }),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {};
    const { name, description, category, price, address, latitude, longitude, tags, isAvailable } = req.body;

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (address) updateData.address = address;
    if (latitude && longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }
    if (tags) updateData.tags = tags;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('vendor', 'name email phone address location donationScore');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Vendor only - own products)
router.delete('/:id', authenticateToken, requireRole(['vendor']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user owns this product
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/vendor/my-products
// @desc    Get vendor's own products
// @access  Private (Vendor only)
router.get('/vendor/my-products', authenticateToken, requireRole(['vendor']), async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ products });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products/:id/contact
// @desc    Show vendor contact info (increment inquiry count)
// @access  Private (Customer only)
router.post('/:id/contact', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name email phone address location donationScore');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment inquiry count
    product.inquiryCount += 1;
    await product.save();

    res.json({
      message: 'Contact information retrieved',
      vendor: {
        name: product.vendor.name,
        email: product.vendor.email,
        phone: product.vendor.phone,
        address: product.vendor.address,
        donationScore: product.vendor.donationScore
      }
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
