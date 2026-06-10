import { apiFetch } from "@/lib/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is not configured.");
}

export type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  social?: "NORMAL" | "GOOGLE" | "KAKAO";
  user_type?: "USER" | "ADMIN";
};

async function parseJson(response: Response) {
  return response.json().catch(() => null);
}

// 백엔드의 detail 형식을 읽어서 사용자에게 보여줄 문자열로 바꾼다
function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "object" && data !== null && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (typeof item === "object" && item !== null && "msg" in item) {
            const msg = (item as { msg?: unknown }).msg;
            return typeof msg === "string" ? msg : null;
          }
          return null;
        })
        .filter(Boolean);

      if (messages.length > 0) {
        const joined = messages.join(", ");

        // Pydantic 기본 영어 메시지를 프론트에서 읽기 좋은 한국어로 바꾼다
        if (joined.includes("at least 8 characters")) {
          return "비밀번호는 8자 이상이어야 합니다.";
        }

        if (joined.includes("value is not a valid email address")) {
          return "이메일 형식이 올바르지 않습니다.";
        }

        return joined;
      }
    }
  }

  return fallback;
}

// 브라우저의 네트워크 에러 문구를 그대로 보여주지 않고 사용자용 문구로 바꾼다
function getNetworkErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    if (error.message === "Failed to fetch") {
      return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    }

    return error.message;
  }

  return fallback;
}

export async function login(payload: { email: string; password: string }) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "로그인에 실패했습니다."));
    }

    return data as TokenResponse;
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error, "로그인에 실패했습니다."));
  }
}

export async function signup(payload: SignupRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        social: payload.social ?? "NORMAL",
        user_type: payload.user_type ?? "USER",
      }),
    });

    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "회원가입에 실패했습니다."));
    }

    return data as {
      user_id: string;
      email: string;
      name: string;
      social: string;
      user_type: string;
      created_at: string;
    };
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error, "회원가입에 실패했습니다."));
  }
}

export async function refresh(refreshToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    const data = await parseJson(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "토큰 재발급에 실패했습니다."));
    }

    return data as TokenResponse;
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error, "토큰 재발급에 실패했습니다."));
  }
}

export async function logout() {
  const response = await apiFetch("/auth/logout", {
    method: "POST",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail ?? "로그아웃에 실패했습니다.");
  }

  return data;
}

export async function deleteUser() {
  const response = await apiFetch("/auth/user", {
    method: "DELETE",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail ?? "회원 탈퇴에 실패했습니다.");
  }

  return data;
}