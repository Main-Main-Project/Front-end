import { refresh } from "@/lib/authApi";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/tokenStorage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

// 동시에 여러 요청이 401이 나더라도 refresh 요청은 한 번만 보내기 위해 Promise를 공유한다
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = refresh(refreshToken)
      .then((tokens) => {
        setTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
        return tokens.accessToken;
      })
      .catch(() => {
        // refresh 자체가 실패하면 세션을 정리하고 다시 로그인하게 만든다
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const accessToken = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  // 401이 아니면 그대로 반환한다
  if (response.status !== 401) {
    return response;
  }

  const newAccessToken = await refreshAccessToken();

  if (!newAccessToken) {
    throw new Error("세션이 만료되었습니다. 다시 로그인해주세요.");
  }

  // 새 access token으로 원래 요청을 한 번만 재시도한다.
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${newAccessToken}`,
      ...(init.headers ?? {}),
    },
  });
}