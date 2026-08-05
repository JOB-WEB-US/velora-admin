export type AdminRole = "ADMIN" | "SUPER_ADMIN" | "SHIPPER";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
}

export interface AdminApiKey {
  id: string;
  name: string;
  keyHash: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  apiKey: string | null;
  isAuthenticated: boolean;
}
