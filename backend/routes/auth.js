const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { StreamChat } = require('stream-chat');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

// Stream Chat configuration
const STREAM_API_KEY = process.env.STREAM_API_KEY || 'cm6gt9re6pnp';
const STREAM_SECRET = process.env.STREAM_SECRET || 'fp7npfygectyp8zeu6fhzc5ghbbg5g33sd84x9awcwj87hd69fuv5u5negwnffw9';

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_SECRET);

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_SECRET, { expiresIn: '7d' });
};

// Create user in Stream Chat
const createStreamUser = async (user) => {
  try {
    const userId = user._id.toString();
    console.log(`Creating Stream Chat user: ${user.name} with ID: ${userId}`);
    
    const userData = {
      id: userId,
      name: user.name,
      email: user.email,
      image: user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
      // Add custom fields based on user role
      ...(user.roles?.includes('vendor') && { 
        vendorId: userId,
        isVendor: true,
        userType: 'vendor'
      }),
      ...(user.roles?.includes('ngo') && { 
        ngoId: userId,
        isNGO: true,
        userType: 'ngo'
      }),
      ...(user.roles?.includes('customer') && { 
        customerId: userId,
        isCustomer: true,
        userType: 'customer'
      })
    };
    
    console.log('Stream Chat user data:', userData);
    
    const result = await serverClient.upsertUser(userData);
    console.log(`Stream Chat user created successfully: ${user.name} (${userId})`, result);
  } catch (error) {
    console.error('Error creating Stream Chat user:', error);
    console.error('Error details:', error.response?.data || error.message);
    // Don't throw error - user creation should continue even if Stream Chat fails
  }
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('roles').isArray({ min: 1 }).withMessage('At least one role must be selected'),
  body('roles.*').isIn(['customer', 'vendor', 'ngo']).withMessage('Invalid role'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Valid phone number required'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password, roles, phone, address, latitude, longitude } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      roles,
      phone,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      }
    });

    await user.save();

    // Create user in Stream Chat
    await createStreamUser(user);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        location: user.location,
        address: user.address,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        location: user.location,
        address: user.address,
        phone: user.phone,
        donationScore: user.donationScore
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        roles: req.user.roles,
        location: req.user.location,
        address: req.user.address,
        phone: req.user.phone,
        donationScore: req.user.donationScore,
        profileImage: req.user.profileImage,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().trim().isLength({ min: 10 }).withMessage('Valid phone number required'),
  body('address').optional().trim().isLength({ min: 5 }).withMessage('Address required'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, phone, address, latitude, longitude } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (latitude && longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [longitude, latitude]
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, select: '-password' }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        location: user.location,
        address: user.address,
        phone: user.phone,
        donationScore: user.donationScore,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
