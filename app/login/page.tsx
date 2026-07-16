"use client";

import { useState } from "react";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await loginAction(email, password);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020409",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "clamp(1.5rem, 5vw, 2.5rem)",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(108,99,255,0.15)",
          borderRadius: 16,
          boxShadow: "0 0 60px rgba(108,99,255,0.08)",
          margin: "0 1rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              fontSize: "2rem",
              color: "#6c63ff",
              marginBottom: "0.5rem",
            }}
          >
            {"◈"}
          </div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.8rem",
              color: "#fff",
              letterSpacing: 2,
              margin: 0,
            }}
          >
            ADMIN LOGIN
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.85rem",
              marginTop: "0.4rem",
            }}
          >
            Sign in to access the dashboard
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              background: "rgba(255,68,68,0.1)",
              border: "1px solid rgba(255,68,68,0.3)",
              borderRadius: 8,
              color: "#ff6b6b",
              fontSize: "0.85rem",
            }}
          >
            <i className="bi bi-exclamation-circle" style={{ marginRight: 8 }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.75rem",
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: "0.5rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(108,99,255,0.2)",
                borderRadius: 8,
                color: "#fff",
                fontSize: "0.95rem",
                fontFamily: "'Outfit', sans-serif",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(108,99,255,0.5)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(108,99,255,0.2)")
              }
            />
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <label
              style={{
                display: "block",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.75rem",
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: "0.5rem",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(108,99,255,0.2)",
                borderRadius: 8,
                color: "#fff",
                fontSize: "0.95rem",
                fontFamily: "'Outfit', sans-serif",
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(108,99,255,0.5)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "rgba(108,99,255,0.2)")
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: loading
                ? "rgba(108,99,255,0.4)"
                : "linear-gradient(135deg, #6c63ff, #5a52d5)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: "1rem",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: 0.5,
              transition: "opacity 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right" /> Sign In
              </>
            )}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
