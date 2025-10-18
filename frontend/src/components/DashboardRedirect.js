import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DashboardRedirect = () => {
  const { getDashboardRoute } = useAuth();
  
  return <Navigate to={getDashboardRoute()} replace />;
};

export default DashboardRedirect;
