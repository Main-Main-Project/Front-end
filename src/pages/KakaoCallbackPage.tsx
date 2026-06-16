import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { kakaoLogin } from "@/lib/authApi";
import { setTokens } from "@/lib/tokenStorage";
import { getUserInfo } from "@/lib/userApi";

export function KakaoCallbackPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const calledRef = useRef(false);

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

            setTokens({
            accessToken: result.access_token,
            refreshToken: result.refresh_token,
            });

            window.history.replaceState({}, document.title, "/auth/kakao/callback");

            const me = await getUserInfo();
            navigate(me.user_type === "ADMIN" ? "/admin" : "/chat", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "카카오 로그인 처리 실패");
        }
        };

        void run();
    }, [navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center">
        {error ? <p>{error}</p> : <p>카카오 로그인 처리 중...</p>}
        </div>
    );
}