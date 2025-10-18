import React, { useState, useEffect, useCallback } from 'react';
import { Package, Clock, CheckCircle, XCircle, User, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { donationsAPI } from '../../services/api';
import { getCategoryColor, getStatusColor, getStatusText } from '../../utils/helpers';
import ChatButton from '../../components/ChatButton';
import toast from 'react-hot-toast';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await donationsAPI.getMyRequests();
      setRequests(response.data.donations || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getStatusIcon = (status) => {
    switch (status) {
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

  const handleNgoComplete = async (donationId, ngoNotes = '') => {
    try {
      await donationsAPI.ngoCompleteDonation(donationId, { ngoNotes });
      toast.success('Donation marked as completed successfully!');
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error completing donation:', error);
      toast.error('Failed to mark donation as completed');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Requests</h1>
          <p className="text-gray-600">Track your donation requests</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Requests</h1>
        <p className="text-gray-600">Track your donation requests and their status</p>
      </div>

      {requests.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Yet</h3>
            <p className="text-gray-500">You haven't made any donation requests yet. Browse available donations to get started!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="card">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Donation Image */}
                <div className="md:w-32 md:h-32 w-full h-48">
                  {request.images && request.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000/uploads/${request.images[0]}`}
                      alt={request.title}
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

                {/* Request Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Donation Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>Quantity: {request.quantity}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(request.category)}`}>
                          {request.category}
                        </span>
                      </div>
                      {request.expiryDate && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Expires: {new Date(request.expiryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Vendor Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{request.vendor.name}</span>
                      </div>
                      {request.vendor.phone && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{request.vendor.phone}</span>
                        </div>
                      )}
                      {request.vendor.email && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{request.vendor.email}</span>
                        </div>
                      )}
                      <div className="flex items-start space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{request.address}</span>
                      </div>
                      
                      {/* Chat with Vendor */}
                      <div className="pt-2">
                        <ChatButton
                          targetUserId={request.vendor._id}
                          targetUserName={request.vendor.name}
                          targetUserRole="vendor"
                          donationId={request._id}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Request Timeline */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Requested: {new Date(request.requestedAt).toLocaleString()}</p>
                      {request.confirmedAt && (
                        <p>Confirmed: {new Date(request.confirmedAt).toLocaleString()}</p>
                      )}
                      {request.pickedUpAt && (
                        <p>Picked Up: {new Date(request.pickedUpAt).toLocaleString()}</p>
                      )}
                      {request.completedAt && (
                        <p>Completed: {new Date(request.completedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {request.status === 'picked_up' && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">Ready to confirm completion?</p>
                          <p className="text-xs">Mark as completed once you've received and verified the donation.</p>
                        </div>
                        <button
                          onClick={() => {
                            const notes = prompt('Add any notes about the donation (optional):');
                            handleNgoComplete(request._id, notes || '');
                          }}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark as Completed</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Impact Notes */}
                  {request.impactNotes && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 mb-1">Vendor Notes:</p>
                        <p className="text-gray-600">{request.impactNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* NGO Notes */}
                  {request.ngoNotes && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 mb-1">Your Notes:</p>
                        <p className="text-gray-600">{request.ngoNotes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;