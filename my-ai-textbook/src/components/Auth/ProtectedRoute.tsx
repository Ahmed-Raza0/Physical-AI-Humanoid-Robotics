import React, { ReactNode, useEffect, useState } from 'react';
import { useLocation } from '@docusaurus/router';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
  onUnauthorized?: () => void;
}

/**
 * Protected route component for authentication and authorization
 * Redirects to login or shows fallback if user is not authenticated
 * Future-ready for role-based access control
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requireAuth = true,
  allowedRoles = [],
  redirectTo = '/login',
  onUnauthorized,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    if (!ExecutionEnvironment.canUseDOM) return;

    // Check authentication status
    const checkAuth = async () => {
      try {
        // TODO: Replace with actual authentication check using better-auth
        // For now, check localStorage or session
        const authToken = localStorage.getItem('auth_token');
        const storedRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');

        setIsAuthenticated(!!authToken);
        setUserRoles(storedRoles);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserRoles([]);
      }
    };

    checkAuth();
  }, [location]);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔐</div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If auth is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    if (onUnauthorized) {
      onUnauthorized();
    }

    // Redirect to login
    if (ExecutionEnvironment.canUseDOM && redirectTo) {
      const currentPath = encodeURIComponent(location.pathname + location.search);
      window.location.href = `${redirectTo}?redirect=${currentPath}`;
    }

    // Show fallback while redirecting
    return (
      <>
        {fallback || (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔒</div>
            <h2>Authentication Required</h2>
            <p>Please log in to access this page.</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Redirecting to login...
            </p>
          </div>
        )}
      </>
    );
  }

  // Check role-based authorization
  if (allowedRoles.length > 0 && !allowedRoles.some((role) => userRoles.includes(role))) {
    if (onUnauthorized) {
      onUnauthorized();
    }

    return (
      <>
        {fallback || (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⛔</div>
            <h2>Access Denied</h2>
            <p>You do not have permission to view this page.</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
              Required roles: {allowedRoles.join(', ')}
            </p>
          </div>
        )}
      </>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
