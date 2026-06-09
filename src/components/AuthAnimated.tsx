import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle, ArrowRightCircle, LogIn, UserPlus } from "lucide-react";
import { signup as signupApi } from "@/lib/authApi";
import { useAuthStore } from "@/stores/authStore";
import "@/components/auth-animated.css";

type AuthAnimatedProps = {
  initialMode: "signin" | "signup";
};

export function AuthAnimated({ initialMode }: AuthAnimatedProps) {
  const navigate = useNavigate();
  const signin = useAuthStore((s) => s.signin);

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("");

  // 로그인과 회원가입 에러를 분리해서 서로 섞이지 않게 관리한다
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 현재 모드에 따라 뒤집기 애니메이션 클래스를 결정한다
  const containerClass = useMemo(() => {
    if (mode === "signup") return "auth-flip-container active";
    return "auth-flip-container close";
  }, [mode]);

  // 로그인 입력값을 다시 수정하기 시작하면 이전 에러 문구를 지운다
  useEffect(() => {
    if (loginError) {
      setLoginError("");
    }
  }, [loginEmail, loginPassword]);

  // 회원가입 입력값을 다시 수정하기 시작하면 이전 에러 문구를 지운다
  useEffect(() => {
    if (signupError) {
      setSignupError("");
    }
  }, [signupName, signupEmail, signupPassword, signupPasswordConfirm]);

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!loginEmail.trim()) {
      setLoginError("이메일을 입력해주세요.");
      return;
    }

    if (!loginPassword.trim()) {
      setLoginError("비밀번호를 입력해주세요.");
      return;
    }

    setLoginError("");
    setIsSubmitting(true);

    try {
      await signin({
        email: loginEmail,
        password: loginPassword,
      });
      navigate("/chat");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!signupName.trim()) {
      setSignupError("이름을 입력해주세요.");
      return;
    }

    if (!signupEmail.trim()) {
      setSignupError("이메일을 입력해주세요.");
      return;
    }

    if (!signupPassword.trim()) {
      setSignupError("비밀번호를 입력해주세요.");
      return;
    }

    if (signupPassword.length < 8) {
      setSignupError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (!signupPasswordConfirm.trim()) {
      setSignupError("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (signupPassword !== signupPasswordConfirm) {
      setSignupError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setSignupError("");
    setIsSubmitting(true);

    try {
      await signupApi({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        social: "NORMAL",
        user_type: "USER",
      });

      // 회원가입이 끝나면 로그인 화면으로 돌려보낸다
      setMode("signin");
      navigate("/signin");
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-flip-page">
      <div id="container" className={containerClass}>
        <div className="login">
          <div className="content">
            <h1>Log In</h1>
            <form onSubmit={handleLoginSubmit}>
              <input
                type="email"
                placeholder="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              {loginError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {loginError}
                </p>
              )}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "처리 중..." : "Log In"}
              </button>
            </form>

            <span className="loginwith">Or Connect with</span>
            <div className="social-buttons" aria-label="Social login">
              <button type="button" className="social-icon" aria-label="Google login">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7.1 0-.7-.1-1.4-.2-2H12z" />
                  <path fill="#34A853" d="M12 22c2.6 0 4.9-.9 6.6-2.5l-3.1-2.4c-.9.6-2 .9-3.5.9-2.7 0-4.9-1.8-5.7-4.3l-3.2 2.5C4.8 19.8 8.1 22 12 22z" />
                  <path fill="#4A90E2" d="M6.3 13.7c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7L3.1 7.8C2.4 9.1 2 10.5 2 12s.4 2.9 1.1 4.2l3.2-2.5z" />
                  <path fill="#FBBC05" d="M12 6.8c1.4 0 2.6.5 3.5 1.3l2.6-2.6C16.8 4.2 14.6 3 12 3 8.1 3 4.8 5.2 3.1 8.8l3.2 2.5c.8-2.5 3-4.5 5.7-4.5z" />
                </svg>
              </button>
              <button type="button" className="social-icon kakao" aria-label="Kakao login">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="#FEE500" />
                  <path fill="#191919" d="M12 7.1c-3.1 0-5.6 1.9-5.6 4.2 0 1.6 1.2 3 2.9 3.7l-.6 2.3 2.5-1.8c.3 0 .5.1.8.1 3.1 0 5.6-1.9 5.6-4.2S15.1 7.1 12 7.1z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="page front">
          <div className="content">
            <UserPlus className="panel-icon" aria-hidden="true" />
            <h1>Hello, friend!</h1>
            <p>Enter your personal details and start journey with us</p>
            <button
              type="button"
              id="register"
              onClick={() => {
                setLoginError("");
                setSignupError("");
                setMode("signup");
                navigate("/signup");
              }}
            >
              Register
              <ArrowRightCircle size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="page back">
          <div className="content">
            <LogIn className="panel-icon" aria-hidden="true" />
            <h1>Welcome Back!</h1>
            <p>To keep connected with us please login with your personal info</p>
            <button
              type="button"
              id="login"
              onClick={() => {
                setLoginError("");
                setSignupError("");
                setMode("signin");
                navigate("/signin");
              }}
            >
              <ArrowLeftCircle size={20} aria-hidden="true" />
              Log In
            </button>
          </div>
        </div>

        <div className="register">
          <div className="content">
            <h1>Sign Up</h1>
            <div className="social-buttons" aria-label="Social signup">
              <button type="button" className="social-icon" aria-label="Google signup">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7.1 0-.7-.1-1.4-.2-2H12z" />
                  <path fill="#34A853" d="M12 22c2.6 0 4.9-.9 6.6-2.5l-3.1-2.4c-.9.6-2 .9-3.5.9-2.7 0-4.9-1.8-5.7-4.3l-3.2 2.5C4.8 19.8 8.1 22 12 22z" />
                  <path fill="#4A90E2" d="M6.3 13.7c-.2-.6-.3-1.1-.3-1.7s.1-1.2.3-1.7L3.1 7.8C2.4 9.1 2 10.5 2 12s.4 2.9 1.1 4.2l3.2-2.5z" />
                  <path fill="#FBBC05" d="M12 6.8c1.4 0 2.6.5 3.5 1.3l2.6-2.6C16.8 4.2 14.6 3 12 3 8.1 3 4.8 5.2 3.1 8.8l3.2 2.5c.8-2.5 3-4.5 5.7-4.5z" />
                </svg>
              </button>
              <button type="button" className="social-icon kakao" aria-label="Kakao signup">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" fill="#FEE500" />
                  <path fill="#191919" d="M12 7.1c-3.1 0-5.6 1.9-5.6 4.2 0 1.6 1.2 3 2.9 3.7l-.6 2.3 2.5-1.8c.3 0 .5.1.8.1 3.1 0 5.6-1.9 5.6-4.2S15.1 7.1 12 7.1z" />
                </svg>
              </button>
            </div>

            <span className="loginwith">Or</span>

            <form onSubmit={handleRegisterSubmit}>
              <input
                type="text"
                placeholder="name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="confirm password"
                value={signupPasswordConfirm}
                onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                required
              />
              {signupError && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {signupError}
                </p>
              )}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "처리 중..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}