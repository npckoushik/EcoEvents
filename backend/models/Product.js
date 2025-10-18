const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['food', 'attire', 'decor', 'lighting', 'flowers', 'other'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String, // File paths
    required: true
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  ecoFriendly: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  contactVisible: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
  inquiryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
productSchema.index({ location: '2dsphere' });
productSchema.index({ category: 1 });
productSchema.index({ vendor: 1 });

// Virtual for distance calculation (will be populated by queries)
productSchema.virtual('distance').get(function() {
  return this._distance;
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
