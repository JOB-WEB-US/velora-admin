import { create } from "zustand";
import { AdminUser } from "@/types/admin";
import { apiClient } from "@/lib/api/client";

interface AdminAuthStore {
  user: AdminUser | null;
  token: string | null;
  apiKey: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoadingSession: boolean;
  setAuth: (user: AdminUser, token?: string | null, apiKey?: string) => void;
  setApiKey: (key: string) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  checkAuthSession: () => Promise<boolean>;
  setHydrated: (state: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthStore>((set, get) => ({
  user: null,
  token: null,
  apiKey: null,
  isAuthenticated: false,
  isHydrated: false,
  isLoadingSession: false,

  setAuth: (user, token, apiKey) => {
    // Dọn dẹp tàn dư localStorage cũ nếu có
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_auth_storage");
    }
    set({
      user,
      token: token || null,
      apiKey: apiKey || null,
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  setApiKey: (key: string) => set({ apiKey: key }),

  setToken: (token: string | null) => set({ token }),

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_auth_storage");
    }
    set({
      user: null,
      token: null,
      apiKey: null,
      isAuthenticated: false,
      isHydrated: true,
    });
  },

  checkAuthSession: async () => {
    // Nếu đã có session trong memory
    if (get().isAuthenticated && get().user) {
      set({ isHydrated: true });
      return true;
    }

    set({ isLoadingSession: true });
    try {
      // 1. Kiểm tra session hiện tại qua HttpOnly Cookie
      const { data } = await apiClient.get("/auth/me");
      if (data?.authenticated && data?.user) {
        const user = data.user;
        if (["ADMIN", "SUPER_ADMIN", "SHIPPER"].includes(user.role)) {
          set({
            user: {
              id: user.userId || user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              avatar: user.avatar,
            },
            isAuthenticated: true,
            isHydrated: true,
            isLoadingSession: false,
          });
          return true;
        }
      }
    } catch {
      // 2. Nếu access token hết hạn, thử refresh token rotation
      try {
        const refreshRes = await apiClient.post("/auth/refresh");
        if (refreshRes.data?.user) {
          const user = refreshRes.data.user;
          const newToken = refreshRes.data.token;
          set({
            user: {
              id: user.id || user.userId,
              email: user.email,
              name: user.name,
              role: user.role,
              avatar: user.avatar,
            },
            token: newToken || null,
            isAuthenticated: true,
            isHydrated: true,
            isLoadingSession: false,
          });
          return true;
        }
      } catch {
        // Cả 2 đều thất bại -> Chưa đăng nhập
      }
    }

    // Xóa state nếu không hợp lệ
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: true,
      isLoadingSession: false,
    });
    return false;
  },

  setHydrated: (state) => set({ isHydrated: state }),
}));
