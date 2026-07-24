import type { UserRole } from '@/types/user';

/** Où rediriger un utilisateur juste après connexion, selon son rôle. */
export function getHomePathForRole(role: UserRole): string {
  switch (role) {
    case 'instructor':
      return '/admin/instructor';
    case 'founder':
    case 'founder_instructor':
      return '/admin/founder';
    case 'developer':
      return '/admin/developer';
    case 'user':
    default:
      return '/dashboard';
  }
}

/** Un rôle a-t-il accès à au moins un espace admin ? */
export function isAdminRole(role: UserRole): boolean {
  return role !== 'user';
}
