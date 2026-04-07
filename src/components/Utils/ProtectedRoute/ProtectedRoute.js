import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../ComponentsCss/Authentication/authentication';

const ProtectedRoute = ({ job_roles, element }) => {
  const { user } = useAuth();
  console.log(user , "This is user");
  

  if (!user || (job_roles && !job_roles.includes(user.job_roles))) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;