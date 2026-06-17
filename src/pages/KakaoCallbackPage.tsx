import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { kakaoLogin } from "@/lib/authApi";
import { useAuthStore } from "@/stores/authStore";

export function KakaoCallbackPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const calledRef = useRef(false);
    const completeSocialSignin = useAuthStore((s) => s.completeSocialSignin);

    useEffect(() => {
        if (calledRef.current) return;
        calledRef.current = true;

        const run = async () => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
            setError("인가 코드가 없습니다.");
            return;
        }

        try {
            const result = await kakaoLogin(code);

            const user = await completeSocialSignin({
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            });

            window.history.replaceState({}, document.title, "/auth/kakao/callback");

            navigate(user.userType === "ADMIN" ? "/admin" : "/chat", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "카카오 로그인 처리 실패");
        }
        };

        void run();
    }, [completeSocialSignin,navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
        {error ? <p>{error}</p> : <p>카카오 로그인 처리 중...</p>}
        </div>
    );
}