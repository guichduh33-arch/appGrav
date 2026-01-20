// Auth Components - Public API
// Export all authentication-related components

export {
  PermissionGuard,
  RouteGuard,
  AdminOnly,
  ManagerOnly,
} from './PermissionGuard';

export type { PermissionGuardProps } from '@/types/auth';
