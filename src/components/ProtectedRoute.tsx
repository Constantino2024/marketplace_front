import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, isCompany, getUserType, isTokenExpired, refreshToken } from '../services/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireCompany?: boolean;
  requireCustomer?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireCompany = false,
  requireCustomer = false
}: ProtectedRouteProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Verificar se está autenticado
      if (!isAuthenticated()) {
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      // Verificar se o token expirou
      if (isTokenExpired()) {
        // Tentar refresh token
        const refreshed = await refreshToken();
        if (!refreshed) {
          setIsValid(false);
          setIsChecking(false);
          return;
        }
      }

      const userType = getUserType();

      // Verificar permissões
      if (requireAdmin && userType !== 'admin') {
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      if (requireCompany && userType !== 'company') {
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      if (requireCustomer && userType !== 'customer') {
        setIsValid(false);
        setIsChecking(false);
        return;
      }

      setIsValid(true);
      setIsChecking(false);
    };

    checkAuth();
  }, [requireAdmin, requireCompany, requireCustomer]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isValid) {
    // Redirecionar baseado no tipo de usuário
    const userType = getUserType();
    if (userType === 'admin') return <Navigate to="/admin" replace />;
    if (userType === 'company') return <Navigate to="/store-admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}