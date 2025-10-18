const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ngo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
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
  quantity: {
    type: String,
    required: true
  },
  images: [{
    type: String // File paths
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
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'requested', 'confirmed', 'picked_up', 'completed', 'expired'],
    default: 'available'
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  requestedAt: {
    type: Date,
    default: null
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  pickedUpAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  pickupInstructions: {
    type: String,
    default: ''
  },
  impactNotes: {
    type: String,
    default: ''
  },
  ngoNotes: {
    type: String,
    default: ''
  },
  pointsAwarded: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
donationSchema.index({ location: '2dsphere' });
donationSchema.index({ status: 1 });
donationSchema.index({ vendor: 1 });
donationSchema.index({ ngo: 1 });

// Virtual for distance calculation (will be populated by queries)
donationSchema.virtual('distance').get(function() {
  return this._distance;
});

donationSchema.set('toJSON', { virtuals: true });

// Method to check if donation is expired
donationSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

// Method to update status to expired
donationSchema.methods.markAsExpired = function() {
  if (this.status === 'available' && this.isExpired()) {
    this.status = 'expired';
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Donation', donationSchema);
