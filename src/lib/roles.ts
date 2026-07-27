import type { UserRole } from '@/types/user';

export const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'user', label: 'Apprenant' },
  { value: 'instructor', label: 'Instructeur' },
  { value: 'founder', label: 'Fondateur' },
  { value: 'founder_instructor', label: 'Fondateur-Instructeur' },
  { value: 'developer', label: 'Développeur' },
];

export function roleLabel(role: string) {
  return roleOptions.find((r) => r.value === role)?.label ?? role;
}
