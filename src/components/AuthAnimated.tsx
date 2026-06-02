import { FormEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircle, ArrowRightCircle, LogIn, UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import "@/components/auth-animated.css";

type AuthAnimatedProps = {
  initialMode: "signin" | "signup";
};

export function AuthAnimated({ initialMode }: AuthAnimatedProps) {
  const navigate = useNavigate();
  const signin = useAuthStore((s) => s.signin);
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("");

  // flip CSS는 컨테이너 클래스(active/close)로 애니메이션 상태를 제어한다.
  const containerClass = useMemo(() => {
    if (mode === "signup") return "auth-flip-container active";
    return "auth-flip-container close";
  }, [mode]);

  const handleLoginSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signin();
    navigate("/chat");
  };

  const handleRegisterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 회원가입은 비밀번호 확인 불일치 시 제출을 막는다.
    if (signupPassword !== signupPasswordConfirm) {
      return;
    }
    setMode("signin");
    navigate("/signin");
  };

  return (
    <div className="auth-flip-page">
      <div id="container" className={containerClass}>
        <div className="login">
          <div className="content">
            <h1>Log In</h1>
            <form onSubmit={handleLoginSubmit}>
              <input type="email" placeholder="email" required />
              <input type="password" placeholder="password" required />
              <button type="submit">Log In</button>
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
              <input type="text" placeholder="name" required />
              <input type="email" placeholder="email" required />
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
              {signupPasswordConfirm.length > 0 && signupPassword !== signupPasswordConfirm && (
                <span>Password does not match.</span>
              )}
              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
