import { create } from "zustand";
import { deleteUser as deleteUserApi, login as loginApi, logout as logoutApi } from "@/lib/authApi";
import { getUserInfo } from "@/lib/userApi";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/tokenStorage";
import { useChatStore } from "@/stores/chatStore";
import { useUiStore } from "@/stores/uiStore";

type User = {
  name: string;
  email: string;
  pushNotifications: boolean;
  userType: "USER" | "ADMIN";
};

type AuthState = {
  isSignedIn: boolean;
  isHydrating: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  signin: (payload: { email: string; password: string }) => Promise<User>;
  completeSocialSignin: (tokens: { accessToken: string; refreshToken: string }) => Promise<User>;
  hydrateUser: () => Promise<void>;
  signout: () => Promise<void>;
  withdraw: () => Promise<void>;
  updateProfile: (payload: Pick<User, "name" | "email" | "pushNotifications">) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isSignedIn: Boolean(getAccessToken()),
  isHydrating: true,
  user: null,
  accessToken: getAccessToken(),
  refreshToken: getRefreshToken(),

  signin: async ({ email, password }) => {
    useChatStore.getState().reset();
    useUiStore.getState().reset();

    const tokens = await loginApi({ email, password });

    try {
      setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      // userInfo 조회는 apiFetch를 통해 호출되므로
      // access token이 만료되어도 refresh 후 자동 재시도된다
      const UserInfo = await getUserInfo();

      const user: User = {
        name: UserInfo.name,
        email: UserInfo.email,
        pushNotifications: true,
        userType: UserInfo.user_type,
      };

      set({
        isSignedIn: true,
        isHydrating: false,
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
        user,
      });

      return user;
    } catch (error) {
      clearTokens();
      set({
        isSignedIn: false,
        isHydrating: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
      throw error;
    }
  },

  completeSocialSignin: async (tokens) => {
    useChatStore.getState().reset();
    useUiStore.getState().reset();

    try {
      setTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      const me = await getUserInfo();

      const user: User = {
        name: me.name,
        email: me.email,
        pushNotifications: true,
        userType: me.user_type,
      };

      set({
        isSignedIn: true,
        isHydrating: false,
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken(),
        user,
      });

      return user;
    } catch (error) {
      clearTokens();
      set({
        isSignedIn: false,
        isHydrating: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
      throw error;
    }
  },

  hydrateUser: async () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    set({ isHydrating: true });

    if (!accessToken) {
      useChatStore.getState().reset();
      useUiStore.getState().reset();

      set({
        isSignedIn: false,
        isHydrating: false,
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
        isHydrating: false,
        accessToken: getAccessToken(),
        refreshToken: getRefreshToken() ?? refreshToken,
        user: {
          name: me.name,
          email: me.email,
          pushNotifications: true,
          userType: me.user_type,
        },
      });
    } catch {
      useChatStore.getState().reset();
      useUiStore.getState().reset();
      clearTokens();
      set({
        isSignedIn: false,
        isHydrating: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  },

  signout: async () => {
    await logoutApi();

    useChatStore.getState().reset();
    useUiStore.getState().reset();

    clearTokens();
    set({
      isSignedIn: false,
      isHydrating: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  withdraw: async () => {
    await deleteUserApi();

    useChatStore.getState().reset();
    useUiStore.getState().reset();

    clearTokens();
    set({
      isSignedIn: false,
      isHydrating: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  updateProfile: (payload) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...payload } : null,
    })),
}));