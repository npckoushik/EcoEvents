import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { StreamChatProvider } from './contexts/StreamChatContext';
import './i18n';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import DashboardRedirect from './components/DashboardRedirect';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Dashboard pages
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import VendorDashboard from './pages/dashboard/VendorDashboard';
import NGODashboard from './pages/dashboard/NGODashboard';

// Chat pages
import Chat from './pages/Chat';
import VendorChat from './pages/VendorChat';

// Customer pages
import SearchProducts from './pages/customer/SearchProducts';
import FindVendors from './pages/customer/FindVendors';
import FindNGOs from './pages/customer/FindNGOs';
import Leaderboard from './pages/customer/Leaderboard';

// Vendor pages
import MyProducts from './pages/vendor/MyProducts';
import AddProduct from './pages/vendor/AddProduct';
import CreateDonation from './pages/vendor/CreateDonation';
import MyDonations from './pages/vendor/MyDonations';
import MyStats from './pages/vendor/MyStats';

// NGO pages
import AvailableDonations from './pages/ngo/AvailableDonations';
import MyRequests from './pages/ngo/MyRequests';
import DonationHistory from './pages/ngo/DonationHistory';
import NGOLeaderboard from './pages/ngo/NGOLeaderboard';

function App() {
  return (
    <AuthProvider>
      <StreamChatProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="App">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Dashboard routes */}
                <Route index element={<DashboardRedirect />} />
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="vendor-dashboard" element={<VendorDashboard />} />
                <Route path="ngo-dashboard" element={<NGODashboard />} />
                
                {/* Customer routes */}
                <Route path="search-products" element={<SearchProducts />} />
                <Route path="find-vendors" element={<FindVendors />} />
                <Route path="find-ngos" element={<FindNGOs />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="chat" element={<Chat />} />
                <Route path="vendor-chat" element={<VendorChat />} />
                
                {/* Vendor routes */}
                <Route path="my-products" element={<MyProducts />} />
                <Route path="add-product" element={<AddProduct />} />
                <Route path="create-donation" element={<CreateDonation />} />
                <Route path="my-donations" element={<MyDonations />} />
                <Route path="my-stats" element={<MyStats />} />
                <Route path="vendor-chat" element={<VendorChat />} />
                
                {/* NGO routes */}
                <Route path="available-donations" element={<AvailableDonations />} />
                <Route path="my-requests" element={<MyRequests />} />
                <Route path="donation-history" element={<DonationHistory />} />
                <Route path="ngo-leaderboard" element={<NGOLeaderboard />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </StreamChatProvider>
    </AuthProvider>
  );
}

export default App;
