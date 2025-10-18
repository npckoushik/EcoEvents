import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { 
  Home, 
  Search, 
  Store, 
  Users, 
  Trophy, 
  MessageCircle,
  Package,
  Plus,
  Heart,
  BarChart3,
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';

const Layout = () => {
  const { user, logout, hasRole, getPrimaryRole } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    const primaryRole = getPrimaryRole();
    
    if (primaryRole === 'customer') {
      return [
        { path: '/dashboard', label: t('navigation.customerDashboard'), icon: Home },
        { path: '/search-products', label: t('navigation.searchProducts'), icon: Search },
        { path: '/find-vendors', label: t('navigation.findVendors'), icon: Store },
        { path: '/find-ngos', label: t('navigation.findNGOs'), icon: Users },
        { path: '/leaderboard', label: t('navigation.leaderboard'), icon: Trophy },
        { path: '/chat', label: t('navigation.chat'), icon: MessageCircle },
      ];
    } else if (primaryRole === 'vendor') {
      return [
        { path: '/vendor-dashboard', label: t('navigation.vendorDashboard'), icon: Home },
        { path: '/my-products', label: t('navigation.myProducts'), icon: Package },
        { path: '/add-product', label: t('navigation.addProduct'), icon: Plus },
        { path: '/create-donation', label: t('navigation.createDonation'), icon: Heart },
        { path: '/my-donations', label: t('navigation.myDonations'), icon: Heart },
        { path: '/my-stats', label: t('navigation.myStats'), icon: BarChart3 },
        { path: '/vendor-chat', label: t('navigation.vendorChat'), icon: MessageCircle },
      ];
    } else if (primaryRole === 'ngo') {
      return [
        { path: '/ngo-dashboard', label: t('navigation.ngoDashboard'), icon: Home },
        { path: '/available-donations', label: t('navigation.availableDonations'), icon: Package },
        { path: '/my-requests', label: t('navigation.myRequests'), icon: Heart },
        { path: '/donation-history', label: t('navigation.donationHistory'), icon: BarChart3 },
        { path: '/ngo-leaderboard', label: t('navigation.ngoLeaderboard'), icon: Trophy },
      ];
    }
    
    return [];
  };

  const navigationItems = getNavigationItems();

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900">EcoEvents</span>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.roles?.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Language Selector */}
      <div className="px-4 py-2 border-t border-gray-200">
        <LanguageSelector />
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('auth.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-lg font-bold text-gray-900">EcoEvents</span>
          </div>

          <div className="w-10"></div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
