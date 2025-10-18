import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Store, 
  Users, 
  Trophy, 
  MessageCircle,
  TrendingUp,
  MapPin,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI } from '../../services/api';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    nearbyVendors: 0,
    availableProducts: 0,
    nearbyNGOs: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardAPI.getCustomerStats();
        setStats(response.data.stats);
      } catch (error) {
        console.error('Error fetching customer stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Search Products',
      description: 'Find eco-friendly products near you',
      icon: Search,
      link: '/search-products',
      color: 'bg-blue-500'
    },
    {
      title: 'Find Vendors',
      description: 'Connect with local eco-friendly vendors',
      icon: Store,
      link: '/find-vendors',
      color: 'bg-green-500'
    },
    {
      title: 'Find NGOs',
      description: 'Discover NGOs in your area',
      icon: Users,
      link: '/find-ngos',
      color: 'bg-purple-500'
    },
    {
      title: 'Leaderboard',
      description: 'See top donor vendors',
      icon: Trophy,
      link: '/leaderboard',
      color: 'bg-yellow-500'
    }
  ];

  const statsData = [
    {
      title: 'Nearby Vendors',
      value: loading ? '...' : stats.nearbyVendors.toString(),
      icon: Store,
      color: 'text-green-600'
    },
    {
      title: 'Available Products',
      value: loading ? '...' : stats.availableProducts.toString(),
      icon: Search,
      color: 'text-blue-600'
    },
    {
      title: 'Local NGOs',
      value: loading ? '...' : stats.nearbyNGOs.toString(),
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Messages',
      value: loading ? '...' : stats.unreadMessages.toString(),
      icon: MessageCircle,
      color: 'text-orange-600'
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
          Discover eco-friendly products and connect with your local community
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
              to="/chat"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Green Store</p>
                <p className="text-xs text-gray-500">Thanks for your interest in our organic products!</p>
              </div>
              <span className="text-xs text-gray-400">2m ago</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Eco NGO</p>
                <p className="text-xs text-gray-500">We'd love to partner with you for donations</p>
              </div>
              <span className="text-xs text-gray-400">1h ago</span>
            </div>
          </div>
        </div>

        {/* Top Vendors */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Vendors</h3>
            <Link
              to="/leaderboard"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View Leaderboard
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-yellow-800">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">EcoFriendly Store</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">120 donations</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-800">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Green Market</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                    ))}
                    <Star className="w-3 h-3 text-gray-300" />
                  </div>
                  <span className="text-xs text-gray-500">95 donations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div className="mt-8 card">
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Your Location</p>
            <p className="text-sm text-gray-500">{user?.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
