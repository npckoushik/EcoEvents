import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Heart, 
  BarChart3, 
  Trophy,
  TrendingUp,
  MapPin,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';

const NGODashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    availableDonations: 0,
    activeRequests: 0,
    completedDonations: 0,
    partnerVendors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getNGOStats();
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching NGO stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Available Donations',
      description: 'Browse donations from vendors',
      icon: Package,
      link: '/available-donations',
      color: 'bg-blue-500'
    },
    {
      title: 'My Requests',
      description: 'Track your donation requests',
      icon: Heart,
      link: '/my-requests',
      color: 'bg-red-500'
    },
    {
      title: 'Donation History',
      description: 'View completed donations',
      icon: BarChart3,
      link: '/donation-history',
      color: 'bg-green-500'
    },
    {
      title: 'Leaderboard',
      description: 'See top donor vendors',
      icon: Trophy,
      link: '/ngo-leaderboard',
      color: 'bg-yellow-500'
    }
  ];

  const statsData = [
    {
      title: 'Available Donations',
      value: loading ? '...' : stats.availableDonations.toString(),
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Active Requests',
      value: loading ? '...' : stats.activeRequests.toString(),
      icon: Heart,
      color: 'text-red-600'
    },
    {
      title: 'Completed Donations',
      value: loading ? '...' : stats.completedDonations.toString(),
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Partner Vendors',
      value: loading ? '...' : stats.partnerVendors.toString(),
      icon: Trophy,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Connect with vendors and coordinate donations to make a positive impact
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gray-100`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                to={action.link}
                className="card-hover group"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
            <Link
              to="/my-requests"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Organic Vegetables</p>
                <p className="text-xs text-gray-500">Confirmed by EcoFriendly Store</p>
              </div>
              <span className="badge-success">Confirmed</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Eco Packaging</p>
                <p className="text-xs text-gray-500">Waiting for vendor response</p>
              </div>
              <span className="badge-warning">Pending</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Flower Arrangements</p>
                <p className="text-xs text-gray-500">Requested from Green Market</p>
              </div>
              <span className="badge-secondary">Requested</span>
            </div>
          </div>
        </div>

        {/* Top Partner Vendors */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Partners</h3>
            <Link
              to="/ngo-leaderboard"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View Leaderboard
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">E</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">EcoFriendly Store</p>
                <p className="text-xs text-gray-500">15 donations completed</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">150 pts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">G</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Green Market</p>
                <p className="text-xs text-gray-500">12 donations completed</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">120 pts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-purple-600">O</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Organic Farm</p>
                <p className="text-xs text-gray-500">8 donations completed</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">80 pts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Overview */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Impact Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Items Received</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+15% this month</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Families Helped</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% this month</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+2% this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div className="mt-8 card">
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Your Organization Location</p>
            <p className="text-sm text-gray-500">{user?.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;
