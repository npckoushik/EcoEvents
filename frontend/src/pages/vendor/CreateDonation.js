import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Save, ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { donationsAPI } from '../../services/api';
import { getCategoryIcon, getCategoryColor } from '../../utils/helpers';
import ImageUpload from '../../components/ImageUpload';
import LocationPicker from '../../components/LocationPicker';
import toast from 'react-hot-toast';

const CreateDonation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'food',
    quantity: '',
    address: user?.address || '',
    expiryDate: '',
    pickupInstructions: ''
  });
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);

  const categories = [
    { value: 'food', label: 'Food', icon: '🍎' },
    { value: 'attire', label: 'Attire', icon: '👕' },
    { value: 'decor', label: 'Decor', icon: '🏠' },
    { value: 'lighting', label: 'Lighting', icon: '💡' },
    { value: 'flowers', label: 'Flowers', icon: '🌸' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  useEffect(() => {
    if (user?.location) {
      setLocation({
        latitude: user.location.coordinates[1],
        longitude: user.location.coordinates[0]
      });
    }

    // Set default expiry date to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setFormData(prev => ({
      ...prev,
      expiryDate: defaultDate.toISOString().split('T')[0]
    }));
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
      toast.error('Please set your location');
      return;
    }

    if (new Date(formData.expiryDate) <= new Date()) {
      toast.error('Expiry date must be in the future');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('quantity', formData.quantity);
      submitData.append('address', formData.address);
      submitData.append('latitude', location.latitude);
      submitData.append('longitude', location.longitude);
      submitData.append('expiryDate', formData.expiryDate);
      submitData.append('pickupInstructions', formData.pickupInstructions);

      // Add images
      images.forEach((image, index) => {
        submitData.append('images', image.file);
      });

      await donationsAPI.createDonation(submitData);
      
      toast.success('Donation created successfully!');
      navigate('/my-donations');
    } catch (error) {
      console.error('Error creating donation:', error);
      toast.error('Failed to create donation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/my-donations')}
            className="btn-outline flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Donations</span>
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Donation</h1>
        <p className="text-gray-600">Post items for NGOs to request and pickup</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Fresh Organic Vegetables"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="input-field"
                placeholder="Describe the items you're donating..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., 5 boxes, 10 kg, 20 pieces"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field pl-10"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When will these items expire or become unusable?
              </p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation Images</h2>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={3}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-2">
            Upload photos to help NGOs understand what you're donating
          </p>
        </div>

        {/* Location */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Location</h2>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Using Your Default Location</span>
            </div>
            <p className="text-sm text-green-700">
              NGOs will pick up donations from your registered address: <strong>{user?.address}</strong>
            </p>
            <p className="text-xs text-green-600 mt-1">
              To change your location, update your profile settings.
            </p>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter pickup address"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Instructions
            </label>
            <textarea
              name="pickupInstructions"
              value={formData.pickupInstructions}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Any special instructions for pickup (e.g., call before coming, items are in the back, etc.)"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/my-donations')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !location}
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Heart className="w-4 h-4" />
            )}
            <span>{loading ? 'Creating...' : 'Create Donation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateDonation;
