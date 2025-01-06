import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext'; // Adjust the import based on your structure
import { Loader } from '@/components/common/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated,isLoading } = useAuth();

  if (isLoading) {
    return <Loader />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/authentication"/>;
};

export default ProtectedRoute;
