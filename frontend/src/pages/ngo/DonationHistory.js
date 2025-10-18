import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, CheckCircle, User, Phone, Mail, MapPin, Package, Heart } from 'lucide-react';
import { donationsAPI } from '../../services/api';
import { getCategoryColor } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await donationsAPI.getMyRequests();
      // Filter only completed donations for history
      const completedRequests = (response.data.donations || []).filter(request => request.status === 'completed');
      setHistory(completedRequests);
    } catch (error) {
      console.error('Error fetching donation history:', error);
      toast.error('Failed to fetch donation history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Donation History</h1>
          <p className="text-gray-600">Record of received donations and impact</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Donation History</h1>
        <p className="text-gray-600">Record of received donations and impact</p>
      </div>

      {history.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Donation History</h3>
            <p className="text-gray-500">You haven't completed any donations yet. Start by requesting donations from vendors!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((donation) => (
            <div key={donation._id} className="card">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Donation Image */}
                <div className="md:w-32 md:h-32 w-full h-48">
                  {donation.images && donation.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000/uploads/${donation.images[0]}`}
                      alt={donation.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>

                {/* Donation Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{donation.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{donation.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Donation Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>Quantity: {donation.quantity}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(donation.category)}`}>
                          {donation.category}
                        </span>
                      </div>
                      {donation.impactNotes && (
                        <div className="flex items-start space-x-2 text-gray-600">
                          <Heart className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="text-xs">{donation.impactNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Vendor Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{donation.vendor.name}</span>
                      </div>
                      {donation.vendor.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{donation.vendor.phone}</span>
                        </div>
                      )}
                      {donation.vendor.email && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{donation.vendor.email}</span>
                        </div>
                      )}
                      <div className="flex items-start space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{donation.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Requested: {new Date(donation.requestedAt).toLocaleString()}</p>
                      {donation.confirmedAt && (
                        <p>Confirmed: {new Date(donation.confirmedAt).toLocaleString()}</p>
                      )}
                      {donation.completedAt && (
                        <p>Completed: {new Date(donation.completedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {history.length > 0 && (
        <div className="card mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{history.length}</p>
              <p className="text-sm text-gray-600">Total Donations Received</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {history.reduce((sum, donation) => sum + parseInt(donation.quantity) || 0, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Items Received</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {new Set(history.map(d => d.vendor._id)).size}
              </p>
              <p className="text-sm text-gray-600">Unique Vendors</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationHistory;