import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Clock, CheckCircle, XCircle, User, Phone, Mail, Package, CheckCircle2 } from 'lucide-react';
import { donationsAPI } from '../../services/api';
import { getCategoryColor, getStatusColor, getStatusText } from '../../utils/helpers';
import ChatButton from '../../components/ChatButton';
import toast from 'react-hot-toast';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDonations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await donationsAPI.getMyDonations();
      setDonations(response.data.donations || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'requested':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'picked_up':
        return <Package className="w-4 h-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleConfirmRequest = async (donationId) => {
    try {
      await donationsAPI.confirmDonation(donationId);
      toast.success('Donation request confirmed!');
      fetchDonations();
    } catch (error) {
      console.error('Error confirming donation:', error);
      toast.error('Failed to confirm donation request');
    }
  };

  const handleCompleteDonation = async (donationId) => {
    try {
      await donationsAPI.completeDonation(donationId, { impactNotes: 'Donation completed successfully' });
      toast.success('Donation marked as completed!');
      fetchDonations();
    } catch (error) {
      console.error('Error completing donation:', error);
      toast.error('Failed to complete donation');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Donations</h1>
          <p className="text-gray-600">Track your donation posts and completion status</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Donations</h1>
        <p className="text-gray-600">Track your donation posts and completion status</p>
      </div>

      {donations.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Donations Yet</h3>
            <p className="text-gray-500">You haven't created any donations yet. Start by creating your first donation!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => (
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
                      {getStatusIcon(donation.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}>
                        {getStatusText(donation.status)}
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
                      {donation.expiryDate && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Expires: {new Date(donation.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* NGO Details (if requested) */}
                    {donation.requestedBy && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{donation.requestedBy.name}</span>
                        </div>
                        {donation.requestedBy.phone && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{donation.requestedBy.phone}</span>
                          </div>
                        )}
                        {donation.requestedBy.email && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{donation.requestedBy.email}</span>
                          </div>
                        )}
                        
                        {/* Chat with NGO */}
                        <div className="pt-2">
                          <ChatButton
                            targetUserId={donation.requestedBy._id}
                            targetUserName={donation.requestedBy.name}
                            targetUserRole="ngo"
                            donationId={donation._id}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {donation.status === 'requested' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleConfirmRequest(donation._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Confirm Request
                      </button>
                    </div>
                  )}

                  {donation.status === 'confirmed' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCompleteDonation(donation._id)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        Mark as Picked Up
                      </button>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Created: {new Date(donation.createdAt).toLocaleString()}</p>
                      {donation.requestedAt && (
                        <p>Requested: {new Date(donation.requestedAt).toLocaleString()}</p>
                      )}
                      {donation.confirmedAt && (
                        <p>Confirmed: {new Date(donation.confirmedAt).toLocaleString()}</p>
                      )}
                      {donation.pickedUpAt && (
                        <p>Picked Up: {new Date(donation.pickedUpAt).toLocaleString()}</p>
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
    </div>
  );
};

export default MyDonations;