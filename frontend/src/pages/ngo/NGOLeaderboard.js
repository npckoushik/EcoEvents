import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Award, Medal, Star, MapPin, Phone, Mail, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';
import { formatDistance } from '../../utils/helpers';
import toast from 'react-hot-toast';

const NGOLeaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getLeaderboard({ period });
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return <Star className="w-5 h-5 text-blue-500" />;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-200';
    if (rank === 2) return 'bg-gray-50 border-gray-200';
    if (rank === 3) return 'bg-orange-50 border-orange-200';
    return 'bg-white border-gray-200';
  };

  const getBadgeText = (rank) => {
    if (rank === 1) return '🥇 Top Donor';
    if (rank === 2) return '🥈 Second Place';
    if (rank === 3) return '🥉 Third Place';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Leaderboard</h1>
          <p className="text-gray-600">See top donor vendors for partnership building</p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Leaderboard</h1>
        <p className="text-gray-600">See top donor vendors for partnership building</p>
      </div>

      {/* Period Filter */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'monthly'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'weekly'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leaderboard Data</h3>
            <p className="text-gray-500">No vendor donations found for the selected period.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((vendor, index) => {
            const rank = index + 1;
            const distance = user?.location && vendor.location 
              ? Math.round(calculateDistance(
                  user.location.coordinates[1], 
                  user.location.coordinates[0],
                  vendor.location.coordinates[1], 
                  vendor.location.coordinates[0]
                ) * 10) / 10
              : null;

            return (
              <div key={vendor._id} className={`card border-2 ${getRankColor(rank)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                      {getRankIcon(rank)}
                    </div>

                    {/* Vendor Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                        {rank <= 3 && (
                          <span className="text-xs font-medium text-gray-600">
                            {getBadgeText(rank)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{vendor.donationScore} points</span>
                        </div>
                        {distance && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{formatDistance(distance)}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        {vendor.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{vendor.phone}</span>
                          </div>
                        )}
                        {vendor.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{vendor.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{vendor.donationScore}</p>
                    <p className="text-sm text-gray-600">points</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Partnership Tips */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Partnership Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Top Donors</h4>
            <p>Vendors with high donation scores are more likely to have regular excess items and established donation processes.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Local Partners</h4>
            <p>Consider distance when building partnerships - closer vendors may offer more frequent pickup opportunities.</p>
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

export default NGOLeaderboard;