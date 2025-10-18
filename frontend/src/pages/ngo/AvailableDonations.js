import React, { useState, useEffect, useCallback } from 'react';
import { Package, MapPin, Clock, User, Heart, Search, Phone, Mail, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { donationsAPI } from '../../services/api';
import { getCategoryColor, formatDistance } from '../../utils/helpers';
import ChatButton from '../../components/ChatButton';
import toast from 'react-hot-toast';

const AvailableDonations = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    radius: 50,
    search: ''
  });
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        status: 'available',
        limit: 50
      };

      // Add location if user has it
      if (user?.location) {
        params.latitude = user.location.coordinates[1];
        params.longitude = user.location.coordinates[0];
        params.radius = filters.radius;
      }

      // Add category filter
      if (filters.category) {
        params.category = filters.category;
      }

      const response = await donationsAPI.getDonations(params);
      setDonations(response.data.donations || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleRequestDonation = async (donationId) => {
    try {
      await donationsAPI.requestDonation(donationId);
      toast.success('Donation request sent successfully!');
      fetchDonations(); // Refresh the list
    } catch (error) {
      console.error('Error requesting donation:', error);
      toast.error('Failed to request donation');
    }
  };

  const handleContactVendor = (donation) => {
    setSelectedDonation(donation);
    setShowContactModal(true);
  };

  const handleCloseContactModal = () => {
    setShowContactModal(false);
    setSelectedDonation(null);
  };

  const handleCallVendor = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailVendor = (email) => {
    window.open(`mailto:${email}`, '_self');
  };

  const filteredDonations = donations.filter(donation => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      donation.title.toLowerCase().includes(searchTerm) ||
      donation.description.toLowerCase().includes(searchTerm) ||
      donation.vendor.name.toLowerCase().includes(searchTerm)
    );
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'food', label: 'Food' },
    { value: 'attire', label: 'Attire' },
    { value: 'decor', label: 'Decor' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'flowers', label: 'Flowers' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Donations</h1>
          <p className="text-gray-600">Browse donations from vendors</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Donations</h1>
        <p className="text-gray-600">Browse donations from vendors that you can request</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search donations..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-48">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Radius Filter */}
          {user?.location && (
            <div className="md:w-32">
              <select
                value={filters.radius}
                onChange={(e) => setFilters({ ...filters, radius: parseInt(e.target.value) })}
                className="input-field"
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Donations Grid */}
      {filteredDonations.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Donations Available</h3>
            <p className="text-gray-500">
              {filters.search || filters.category 
                ? 'No donations match your current filters. Try adjusting your search criteria.'
                : 'No donations are currently available. Check back later!'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((donation) => (
            <div key={donation._id} className="card-hover">
              {/* Donation Image */}
              <div className="aspect-w-16 aspect-h-9 mb-4">
                {donation.images && donation.images.length > 0 ? (
                  <>
                    <img
                      src={`http://localhost:5000/uploads/${donation.images[0]}`}
                      alt={donation.title}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                      <span className="text-gray-400">Image not found</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>

              {/* Donation Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {donation.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(donation.category)}`}>
                    {donation.category}
                  </span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">
                  {donation.description}
                </p>

                {/* Vendor Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{donation.vendor.name}</span>
                    {donation._distance && (
                      <>
                        <span>•</span>
                        <span>{formatDistance(donation._distance)}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Vendor Contact Info */}
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    {donation.vendor.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{donation.vendor.phone}</span>
                      </div>
                    )}
                    {donation.vendor.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{donation.vendor.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Package className="w-4 h-4" />
                  <span>Quantity: {donation.quantity}</span>
                </div>

                {/* Expiry Date */}
                {donation.expiryDate && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Expires: {new Date(donation.expiryDate).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Address */}
                <div className="flex items-start space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1">{donation.address}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleRequestDonation(donation._id)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Request Donation</span>
                  </button>
                  
                  <ChatButton
                    targetUserId={donation.vendor._id}
                    targetUserName={donation.vendor.name}
                    targetUserRole="vendor"
                    donationId={donation._id}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedDonation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Contact Vendor</h3>
                <button
                  onClick={handleCloseContactModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Donation Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{selectedDonation.title}</h4>
                <p className="text-sm text-gray-600">{selectedDonation.description}</p>
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
                  <Package className="w-4 h-4" />
                  <span>Quantity: {selectedDonation.quantity}</span>
                </div>
              </div>

              {/* Vendor Info */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Vendor Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedDonation.vendor.name}</p>
                      <p className="text-sm text-gray-500">{selectedDonation.vendor.address}</p>
                    </div>
                  </div>

                  {selectedDonation.vendor.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium text-gray-900">{selectedDonation.vendor.phone}</p>
                      </div>
                    </div>
                  )}

                  {selectedDonation.vendor.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{selectedDonation.vendor.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-3">
                {selectedDonation.vendor.phone && (
                  <button
                    onClick={() => handleCallVendor(selectedDonation.vendor.phone)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Call Vendor</span>
                  </button>
                )}

                {selectedDonation.vendor.email && (
                  <button
                    onClick={() => handleEmailVendor(selectedDonation.vendor.email)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Send Email</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    handleRequestDonation(selectedDonation._id);
                    handleCloseContactModal();
                  }}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Heart className="w-5 h-5" />
                  <span>Request This Donation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableDonations;
