import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import useAuth from "../../auth/useAuth";

type AuthResult = {
  success: boolean;
  message?: string;
};

export default function Login(): React.ReactElement {
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = decodeURIComponent(params.get("redirectTo") || "/");

  const [isSignupMode, setIsSignupMode] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const result = (await login(username, password, rememberMe)) as AuthResult;
    if (result.success) {
      navigate(redirectTo, { replace: true });
    } else {
      toast.error(result.message || "Invalid username or password", {
        theme: "colored",
      });
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required", { theme: "colored" });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { theme: "colored" });
      return;
    }

    const result = (await signup(name, username, password)) as AuthResult;

    if (result.success) {
      toast.success("Account created. Please sign in.", { theme: "colored" });
      setIsSignupMode(false);
      setPassword("");
      setConfirmPassword("");
      setRememberMe(false);
    } else {
      toast.error(result.message || "Signup failed", { theme: "colored" });
    }
  };

  return (
    <div className="login-page bg-body-secondary">
      <div className="login-box">
        <div className="login-logo">
          <a href="/">
            <b>Dev Pilot AI</b>
          </a>
        </div>
        <div className="card">
          <div className="card-body login-card-body">
            <p className="login-box-msg">
              {isSignupMode ? "Create your account" : "Sign in to start your session"}
            </p>
            <form onSubmit={isSignupMode ? handleSignup : handleLogin}>
              {isSignupMode && (
                <div className="input-group mb-3">
                  <input
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control"
                  />
                  <div className="input-group-text">
                    <span className="bi bi-person-badge"></span>
                  </div>
                </div>
              )}
              <div className="input-group mb-3">
                <input
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                />
                <div className="input-group-text">
                  <span className="bi bi-person"></span>
                </div>
              </div>
              <div className="input-group mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control"
                />
                <div className="input-group-text">
                  <i
                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    onClick={() => setShowPassword(!showPassword)}
                  ></i>
                </div>
              </div>
              {isSignupMode && (
                <div className="input-group mb-3">
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control"
                  />
                  <div className="input-group-text">
                    <span className="bi bi-shield-lock"></span>
                  </div>
                </div>
              )}
              <div className="row">
                <div className="col-8">
                  {!isSignupMode && (
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label className="form-check-label">Remember Me</label>
                    </div>
                  )}
                </div>
                <div className="col-4">
                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">
                      {isSignupMode ? "Sign Up" : "Sign In"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
            <p className="mt-3 mb-1">
              <button
                type="button"
                className="btn btn-link p-0"
                onClick={() => {
                  setIsSignupMode(!isSignupMode);
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                {isSignupMode
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </p>
            {!isSignupMode && (
              <p className="mb-1">
                <button type="button" className="btn btn-link p-0">
                  I forgot my password
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}