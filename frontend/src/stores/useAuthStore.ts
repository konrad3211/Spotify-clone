import axios from "axios";
import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";

interface AuthStore {
  isAdmin: boolean;
  error: string | null;
  isLoading: boolean;
  checkAdminStatus: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAdmin: false,
  isLoading: false,
  error: null,

  checkAdminStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await axiosInstance.get("/admin/check");
      set({ isAdmin: res.data.admin });
    } catch (error) {
      set({ isAdmin: false });

      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Something went wrong"
        : "Something went wrong";

      set({ error: msg });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({ isAdmin: false, error: null, isLoading: false });
  },
}));
