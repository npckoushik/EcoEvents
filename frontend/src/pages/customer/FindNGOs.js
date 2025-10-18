import React, { useState, useEffect, useCallback } from 'react';
import { Users, MapPin, Heart, Phone, Mail, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';
import { formatDistance } from '../../utils/helpers';
import ChatButton from '../../components/ChatButton';
import toast from 'react-hot-toast';

const FindNGOs = () => {
  const { user } = useAuth();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    radius: 50,
    search: ''
  });

  const fetchNGOs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50
      };

      // Add location if user has it
      if (user?.location) {
        params.latitude = user.location.coordinates[1];
        params.longitude = user.location.coordinates[0];
        params.radius = filters.radius;
      }

      const response = await usersAPI.getNearbyNGOs(params);
      let ngoList = response.data.ngos || [];

      // Apply search filter
      if (filters.search) {
        ngoList = ngoList.filter(ngo =>
          ngo.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          ngo.address.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setNgos(ngoList);
    } catch (error) {
      console.error('Error fetching NGOs:', error);
      toast.error('Failed to fetch NGOs');
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    fetchNGOs();
  }, [fetchNGOs]);

  const handleCallNGO = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailNGO = (email) => {
    window.open(`mailto:${email}`, '_self');
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find NGOs</h1>
          <p className="text-gray-600">Connect with local NGOs for personal donations</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find NGOs</h1>
        <p className="text-gray-600">Connect with local NGOs for personal donations</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search NGOs by name or address..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filters.radius}
              onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value={10}>Within 10km</option>
              <option value={25}>Within 25km</option>
              <option value={50}>Within 50km</option>
              <option value={100}>Within 100km</option>
            </select>
          </div>
        </div>
      </div>

      {ngos.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No NGOs Found</h3>
            <p className="text-gray-500">
              {filters.search 
                ? 'No NGOs match your search criteria. Try adjusting your search terms.'
                : 'No NGOs found in your area. Try expanding your search radius.'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ngos.map((ngo) => {
            const distance = user?.location && ngo.location 
              ? Math.round(calculateDistance(
                  user.location.coordinates[1], 
                  user.location.coordinates[0],
                  ngo.location.coordinates[1], 
                  ngo.location.coordinates[0]
                ) * 10) / 10
              : null;

            return (
              <div key={ngo._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{ngo.name}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>NGO</span>
                      </div>
                    </div>
                  </div>
                  {distance && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{formatDistance(distance)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{ngo.address}</span>
                  </div>

                  {ngo.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{ngo.phone}</span>
                    </div>
                  )}

                  {ngo.email && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{ngo.email}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 mt-4">
                  {/* Chat Button - Primary Action */}
                  <ChatButton
                    targetUserId={ngo._id}
                    targetUserName={ngo.name}
                    targetUserRole="ngo"
                    className="w-full"
                  />
                  
                  {/* Secondary Actions */}
                  <div className="flex space-x-2">
                    {ngo.phone && (
                      <button
                        onClick={() => handleCallNGO(ngo.phone)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </button>
                    )}
                    {ngo.email && (
                      <button
                        onClick={() => handleEmailNGO(ngo.email)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Donating to NGOs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Personal Donations</h4>
            <p>Contact NGOs directly to donate personal items, clothing, or household goods that can help their cause.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Volunteer Opportunities</h4>
            <p>Many NGOs also welcome volunteers. Ask about volunteer opportunities when you contact them.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate distance
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

export default FindNGOs;