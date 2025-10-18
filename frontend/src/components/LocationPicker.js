import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { getLocation } from '../services/api';
import toast from 'react-hot-toast';

const LocationPicker = ({ 
  onLocationSelect, 
  initialLocation = null, 
  disabled = false,
  showMap = false 
}) => {
  const [location, setLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGetLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const coords = await getLocation();
      setLocation(coords);
      onLocationSelect(coords);
      toast.success('Location captured successfully!');
    } catch (error) {
      console.error('Location error:', error);
      setError('Unable to get your location. Please enable location services or enter manually.');
      toast.error('Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = (e) => {
    const { name, value } = e.target;
    if (name === 'latitude' || name === 'longitude') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const newLocation = {
          ...location,
          [name]: numValue
        };
        setLocation(newLocation);
        onLocationSelect(newLocation);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={loading || disabled}
          className="btn-outline flex items-center space-x-2 text-sm"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span>{location ? 'Update Location' : 'Get My Location'}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {location && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Location Captured</span>
          </div>
          <p className="text-sm text-green-700">
            Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)}
          </p>
        </div>
      )}

      {/* Manual Input Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            name="latitude"
            value={location?.latitude || ''}
            onChange={handleManualInput}
            disabled={disabled}
            className="input-field"
            placeholder="Enter latitude"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            name="longitude"
            value={location?.longitude || ''}
            onChange={handleManualInput}
            disabled={disabled}
            className="input-field"
            placeholder="Enter longitude"
          />
        </div>
      </div>

      <p className="text-xs text-gray-500">
        We need your location to show nearby vendors, products, and NGOs. 
        Your location is only used for proximity-based searches and is not shared with other users.
      </p>
    </div>
  );
};

export default LocationPicker;
