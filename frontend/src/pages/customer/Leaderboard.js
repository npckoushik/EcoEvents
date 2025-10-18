import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Star, Medal, Award, Crown } from 'lucide-react';
import { usersAPI } from '../../services/api';
import DistanceDisplay from '../../components/DistanceDisplay';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [pagination, setPagination] = useState({});

  const fetchLeaderboard = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await usersAPI.getLeaderboard({
        period,
        page,
        limit: 20
      });
      setLeaderboard(response.data.leaderboard);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-amber-700';
    return 'bg-gray-100';
  };

  const getBadgeText = (rank) => {
    if (rank === 1) return 'Champion';
    if (rank === 2) return 'Runner-up';
    if (rank === 3) return 'Third Place';
    if (rank <= 10) return 'Top 10';
    if (rank <= 50) return 'Top 50';
    return 'Participant';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Leaderboard</h1>
        <p className="text-gray-600">See the top donor vendors making a positive impact</p>
      </div>

      {/* Period Filter */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Ranking Period</h2>
          <div className="flex space-x-2">
            {[
              { value: 'all', label: 'All Time' },
              { value: 'monthly', label: 'This Month' },
              { value: 'weekly', label: 'This Week' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  period === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Top Performers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 0, 2].map((index) => {
              const vendor = leaderboard[index];
              if (!vendor) return null;
              
              return (
                <div
                  key={vendor._id}
                  className={`card text-center ${
                    index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${getRankColor(vendor.rank)}`}>
                    {getRankIcon(vendor.rank)}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{vendor.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{vendor.address}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-2xl font-bold text-primary-600">{vendor.donationScore}</span>
                      <span className="text-sm text-gray-500">points</span>
                    </div>
                    
                    <div className="badge-primary">
                      {getBadgeText(vendor.rank)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Complete Rankings</h2>
        
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rankings yet</h3>
            <p className="text-gray-500">Vendors need to complete donations to appear on the leaderboard.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((vendor, index) => (
              <div
                key={vendor._id}
                className={`flex items-center space-x-4 p-4 rounded-lg border transition-colors duration-200 ${
                  vendor.rank <= 3
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  {getRankIcon(vendor.rank)}
                </div>

                {/* Vendor Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {vendor.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{vendor.address}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-xl font-bold text-primary-600">{vendor.donationScore}</span>
                    </div>
                    <p className="text-xs text-gray-500">Points</p>
                  </div>

                  {vendor._distance && (
                    <div className="text-center">
                      <DistanceDisplay distance={vendor._distance} />
                      <p className="text-xs text-gray-500">Away</p>
                    </div>
                  )}

                  <div className="text-center">
                    <span className={`badge ${getRankColor(vendor.rank).includes('yellow') ? 'badge-warning' : 'badge-secondary'}`}>
                      {getBadgeText(vendor.rank)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <button
              onClick={() => fetchLeaderboard(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-outline"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => fetchLeaderboard(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mt-6 card">
        <div className="flex items-start space-x-3">
          <Trophy className="w-6 h-6 text-primary-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How the Leaderboard Works</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Vendors earn 10 points for each completed donation</li>
              <li>• Rankings are updated in real-time</li>
              <li>• Higher rankings increase visibility to customers</li>
              <li>• Top performers get special badges and recognition</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
