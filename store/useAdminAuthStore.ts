import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdminUser } from "@/types/admin";

interface AdminAuthStore {
  user: AdminUser | null;
  token: string | null;
  apiKey: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: AdminUser, token: string, apiKey?: string) => void;
  setApiKey: (key: string) => void;
  logout: () => void;
  setHydrated: (state: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      apiKey: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (user, token, apiKey) =>
        set({
          user,
          token,
          apiKey: apiKey || process.env.NEXT_PUBLIC_ADMIN_API_KEY || "velora_admin_secret_api_key_2026",
          isAuthenticated: true,
        }),

      setApiKey: (key: string) => set({ apiKey: key }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_auth_storage");
        }
        set({
          user: null,
          token: null,
          apiKey: null,
          isAuthenticated: false,
        });
      },

      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: "admin_auth_storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
