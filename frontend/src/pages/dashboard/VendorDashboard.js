import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Heart, 
  BarChart3, 
  MessageCircle,
  TrendingUp,
  MapPin,
  Star,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeDonations: 0,
    donationScore: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getVendorStats();
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching vendor stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'My Products',
      description: 'Manage your product listings',
      icon: Package,
      link: '/my-products',
      color: 'bg-blue-500'
    },
    {
      title: 'Add Product',
      description: 'Create new product listing',
      icon: Plus,
      link: '/add-product',
      color: 'bg-green-500'
    },
    {
      title: 'Create Donation',
      description: 'Post items for NGO pickup',
      icon: Heart,
      link: '/create-donation',
      color: 'bg-red-500'
    },
    {
      title: 'My Stats',
      description: 'View your performance metrics',
      icon: BarChart3,
      link: '/my-stats',
      color: 'bg-purple-500'
    }
  ];

  const statsData = [
    {
      title: 'Total Products',
      value: loading ? '...' : stats.totalProducts.toString(),
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Active Donations',
      value: loading ? '...' : stats.activeDonations.toString(),
      icon: Heart,
      color: 'text-red-600'
    },
    {
      title: 'Donation Score',
      value: loading ? '...' : stats.donationScore.toString(),
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'Messages',
      value: loading ? '...' : stats.unreadMessages.toString(),
      icon: MessageCircle,
      color: 'text-green-600'
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
          Manage your products and donations to build your eco-friendly reputation
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
        {/* Recent Messages */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
            <Link
              to="/vendor-chat"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">C</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Customer Inquiry</p>
                <p className="text-xs text-gray-500">Interested in your organic vegetables</p>
              </div>
              <span className="text-xs text-gray-400">5m ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-purple-600">N</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">NGO Request</p>
                <p className="text-xs text-gray-500">Requested your leftover produce donation</p>
              </div>
              <span className="text-xs text-gray-400">1h ago</span>
            </div>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Donations</h3>
            <Link
              to="/my-donations"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Organic Vegetables</p>
                <p className="text-xs text-gray-500">Status: Confirmed</p>
              </div>
              <span className="badge-success">+10 pts</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Eco-friendly Packaging</p>
                <p className="text-xs text-gray-500">Status: Requested</p>
              </div>
              <span className="badge-warning">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Product Views</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8% from last month</span>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Leaderboard Rank</p>
                <p className="text-2xl font-bold text-gray-900">#15</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+3 positions this month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div className="mt-8 card">
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Your Store Location</p>
            <p className="text-sm text-gray-500">{user?.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
