export const ROLES = ["visitor", "author", "editor", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const canPublish = (role: Role) => role === "editor" || role === "admin";
export const canManageUsers = (role: Role) => role === "admin";
