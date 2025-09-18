// src/utils/hasPermission.ts

interface User {
  permissions?: string[];
}

// Checks if the user has all required permissions
export function hasPermission(
  user: User | null | undefined,
  required: string[]
): boolean {
  if (!user || !user.permissions) return false;
  return required.every((perm) => user.permissions!.includes(perm));
}
