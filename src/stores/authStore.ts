import { create } from "zustand";
import { login as loginApi } from "@/lib/authApi";
import { getUserInfo } from "@/lib/userApi";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/tokenStorage";

type User = {
  name: string;
  email: string;
  pushNotifications: boolean;
};

type AuthState = {
  isSignedIn: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  signin: (payload: { email: string; password: string }) => Promise<void>;
  hydrateUser: () => Promise<void>;
  signout: () => void;
  updateProfile: (payload: User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isSignedIn: Boolean(getAccessToken()),
  user: null,
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),

  signin: async ({ email, password }) => {
    const tokens = await loginApi({ email, password });

    try {
      setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      // userInfo 조회는 apiFetch를 통해 호출되므로
      // access token이 만료되어도 refresh 후 자동 재시도된다
      const me = await getUserInfo();

      set({
        isSignedIn: true,
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
        user: {
          name: me.name,
          email: me.email,
          pushNotifications: true,
        },
      });
    } catch (error) {
      clearTokens();
      throw error;
    }
  },

  hydrateUser: async () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (!accessToken) {
      set({
        isSignedIn: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
      return;
    }

    try {
      // 새로고침 후에도 /userInfo 호출 시 refresh 흐름이 자동 적용된다
      const me = await getUserInfo();

      set({
        isSignedIn: true,
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken() ?? refreshToken,
        user: {
          name: me.name,
          email: me.email,
          pushNotifications: true,
        },
      });
    } catch {
      clearTokens();
      set({
        isSignedIn: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  },

  signout: () => {
    clearTokens();
    set({
      isSignedIn: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  updateProfile: (payload) => set({ user: payload }),
}));