/**
 * Auth Middleware - Protect routes and check authentication
 */

import { auth } from './config';

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Middleware to check if user is authenticated
 * Usage in API routes or server-side
 */
export async function authMiddleware(
  req: any,
  options: AuthMiddlewareOptions = {}
) {
  const { requireAuth = true, redirectTo = '/login' } = options;

  try {
    // Get session from request
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (requireAuth && !session) {
      return {
        authenticated: false,
        user: null,
        redirect: redirectTo,
      };
    }

    return {
      authenticated: !!session,
      user: session?.user || null,
      session,
    };
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return {
      authenticated: false,
      user: null,
      error: error.message,
    };
  }
}

/**
 * React hook for client-side auth checking
 */
export function useAuth() {
  // This would be implemented with React context/hooks
  // For now, returning a placeholder
  return {
    user: null,
    loading: true,
    isAuthenticated: false,
    signIn: async () => {},
    signOut: async () => {},
  };
}

/**
 * Higher-order component to protect pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: AuthMiddlewareOptions = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated && options.requireAuth) {
      if (typeof window !== 'undefined') {
        window.location.href = options.redirectTo || '/login';
      }
      return null;
    }

    return <Component {...props} />;
  };
}

/**
 * Check authentication status on server-side
 */
export async function requireAuth(req: any) {
  const result = await authMiddleware(req, { requireAuth: true });

  if (!result.authenticated) {
    throw new Error('Authentication required');
  }

  return result;
}
