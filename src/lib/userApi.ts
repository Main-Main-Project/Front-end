import { apiFetch } from "@/lib/apiClient";

export type UserInfoResponse = {
  user_id: string;
  email: string;
  name: string;
  social: string;
  user_type: "USER" | "ADMIN";
  created_at: string;
};

// 인증이 필요한 사용자 정보 조회는 apiFetch를 통해 호출해서
// access token 만료 시 refresh -> 재시도 흐름을 자동으로 타게 한다
export async function getUserInfo() {
  const response = await apiFetch("/user/userInfo", {
    method: "GET",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.detail ?? "사용자 정보를 불러오지 못했습니다.");
  }

  if (data?.user_type !== "USER" && data?.user_type !== "ADMIN") {
    throw new Error("알 수 없는 사용자 권한입니다.");
  }

  return data as UserInfoResponse;
}