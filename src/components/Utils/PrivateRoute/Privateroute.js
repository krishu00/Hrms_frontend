import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../ComponentsCss/Authentication/authentication';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;













