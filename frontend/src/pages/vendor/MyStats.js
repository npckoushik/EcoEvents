import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, Heart, Trophy, TrendingUp, Users, Calendar, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { donationsAPI, usersAPI } from '../../services/api';
import toast from 'react-hot-toast';

const MyStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    completedDonations: 0,
    pendingDonations: 0,
    totalRequests: 0,
    donationScore: 0,
    leaderboardRank: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch vendor's donations
      const donationsResponse = await donationsAPI.getMyDonations();
      const donations = donationsResponse.data.donations || [];
      
      // Fetch leaderboard to get rank
      const leaderboardResponse = await usersAPI.getLeaderboard();
      const leaderboard = leaderboardResponse.data.leaderboard || [];
      
      // Calculate stats
      const totalDonations = donations.length;
      const completedDonations = donations.filter(d => d.status === 'completed').length;
      const pendingDonations = donations.filter(d => ['available', 'requested', 'confirmed'].includes(d.status)).length;
      const totalRequests = donations.filter(d => d.requestedBy).length;
      
      // Find user's rank in leaderboard
      const userRank = leaderboard.findIndex(vendor => vendor._id === user?._id) + 1;
      
      setStats({
        totalDonations,
        completedDonations,
        pendingDonations,
        totalRequests,
        donationScore: user?.donationScore || 0,
        leaderboardRank: userRank || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Award className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-500" />;
    return <TrendingUp className="w-6 h-6 text-blue-500" />;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-100';
    if (rank === 2) return 'text-gray-600 bg-gray-100';
    if (rank === 3) return 'text-orange-600 bg-orange-100';
    return 'text-blue-600 bg-blue-100';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Stats</h1>
          <p className="text-gray-600">View your donation score and leaderboard position</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Stats</h1>
        <p className="text-gray-600">View your donation score and leaderboard position</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Donations */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Completed Donations */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedDonations}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending Donations */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingDonations}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Total Requests */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Donation Score */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Donation Score</p>
              <p className="text-2xl font-bold text-gray-900">{stats.donationScore}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Leaderboard Rank */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leaderboard Rank</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.leaderboardRank > 0 ? `#${stats.leaderboardRank}` : 'Unranked'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              {getRankIcon(stats.leaderboardRank)}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-medium">
              {stats.totalDonations > 0 
                ? `${Math.round((stats.completedDonations / stats.totalDonations) * 100)}%`
                : '0%'
              }
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Request Rate</span>
            <span className="font-medium">
              {stats.totalDonations > 0 
                ? `${Math.round((stats.totalRequests / stats.totalDonations) * 100)}%`
                : '0%'
              }
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Average Score per Donation</span>
            <span className="font-medium">
              {stats.completedDonations > 0 
                ? Math.round(stats.donationScore / stats.completedDonations)
                : '0'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.completedDonations >= 1 && (
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Trophy className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">First Donation</span>
            </div>
          )}
          {stats.completedDonations >= 5 && (
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">5 Donations</span>
            </div>
          )}
          {stats.completedDonations >= 10 && (
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">10 Donations</span>
            </div>
          )}
          {stats.leaderboardRank <= 3 && stats.leaderboardRank > 0 && (
            <div className={`flex items-center space-x-3 p-3 rounded-lg ${getRankColor(stats.leaderboardRank)}`}>
              {getRankIcon(stats.leaderboardRank)}
              <span className="text-sm font-medium">Top {stats.leaderboardRank}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyStats;