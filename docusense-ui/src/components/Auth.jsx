import { useState, useEffect } from "react";
import api from "../api/client";
import "./Auth.css";

export default function Auth({ onAuthSuccess }) {
  const [view, setView] = useState("login"); // 'login' | 'register' | 'forgot' | 'reset'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrlInfo, setResetUrlInfo] = useState("");

  // Detect reset token in URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setToken(tokenParam);
      setView("reset");
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setMessage("");
      
      const res = await api.post("/auth/register", { name, email, password });
      
      localStorage.setItem("docusense_token", res.data.access_token);
      localStorage.setItem("docusense_user", JSON.stringify(res.data.user));
      onAuthSuccess(res.data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please fill out all fields.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setMessage("");
      
      const res = await api.post("/auth/login", { email, password });
      
      localStorage.setItem("docusense_token", res.data.access_token);
      localStorage.setItem("docusense_user", JSON.stringify(res.data.user));
      onAuthSuccess(res.data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setMessage("");
      setResetUrlInfo("");
      
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      
      // In development/test mode, show the mock token and URL
      if (res.data.reset_url) {
        setResetUrlInfo(res.data.reset_url);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter a new password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      setMessage("");
      
      const res = await api.post("/auth/reset-password", { token, password });
      setMessage(res.data.message);
      
      // Remove query param from browser address bar
      window.history.replaceState({}, document.title, window.location.pathname);
      
      setTimeout(() => {
        setView("login");
        setPassword("");
        setConfirmPassword("");
        setToken("");
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card animate-fade-in">
        <div className="auth-logo-section">
          <div className="logo-container">
            <div className="logo-icon">D</div>
            <div className="logo-details">
              <div className="logo-main-text">
                <span className="logo-text-docusense">DocuSense</span>
                <span className="logo-text-ai">AI</span>
              </div>
              <div className="logo-subtitle">INTELLIGENT DOCUMENT ANALYSIS</div>
            </div>
          </div>
        </div>

        {error && <div className="auth-alert alert-error">{error}</div>}
        {message && <div className="auth-alert alert-success">{message}</div>}

        {view === "login" && (
          <form onSubmit={handleLogin} className="auth-form">
            <h3>Welcome Back</h3>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner"></span> : "Sign In"}
            </button>
            <div className="auth-actions">
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setView("register");
                  setError("");
                  setMessage("");
                }}
              >
                Create an account
              </button>
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setView("forgot");
                  setError("");
                  setMessage("");
                }}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {view === "register" && (
          <form onSubmit={handleRegister} className="auth-form">
            <h3>Create Account</h3>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password (Min 6 chars)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner"></span> : "Sign Up"}
            </button>
            <div className="auth-actions">
              <span>Already have an account?</span>
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setView("login");
                  setError("");
                  setMessage("");
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {view === "forgot" && (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <h3>Reset Password</h3>
            <p className="form-desc">
              Enter your email address and we'll generate a password reset link.
            </p>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner"></span> : "Send Reset Link"}
            </button>
            
            {resetUrlInfo && (
              <div className="dev-reset-box">
                <strong>🔧 Local Test Reset Link:</strong>
                <a href={resetUrlInfo} className="dev-reset-link">
                  Click here to Reset Password
                </a>
              </div>
            )}

            <div className="auth-actions justify-center">
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setView("login");
                  setError("");
                  setMessage("");
                  setResetUrlInfo("");
                }}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {view === "reset" && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <h3>Set New Password</h3>
            <p className="form-desc">Choose a secure password for your account.</p>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner"></span> : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
