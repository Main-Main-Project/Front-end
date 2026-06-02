import { create } from "zustand";
import { mockUser } from "@/data/mock";

type AuthState = {
  isSignedIn: boolean;
  user: { name: string; email: string; pushNotifications: boolean } | null;
  signin: () => void;
  signout: () => void;
  updateProfile: (payload: { name: string; email: string; pushNotifications: boolean }) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isSignedIn: false,
  user: null,
  // 현재는 Mock 사용자로 로그인 상태만 전환한다.
  signin: () => set({ isSignedIn: true, user: mockUser }),
  signout: () => set({ isSignedIn: false, user: null }),
  updateProfile: (payload) => set({ user: payload }),
}));
