// Export all authentication components and utilities
export { withAuth } from './withAuth';
export { AuthGuard } from './AuthGuard';
export { AuthProvider, useAuthContext } from '../providers/AuthProvider';

// Re-export existing components for convenience
export {
  ProtectedRoute,
  RequireAuth,
  RequireVerified,
  RequireAdmin,
  RequireUser,
} from './protected-route';
