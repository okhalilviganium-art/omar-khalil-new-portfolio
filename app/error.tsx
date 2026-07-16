"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#020409",
        color: "#e8eaf6",
        fontFamily: "'Outfit', sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: "5rem",
          lineHeight: 1,
          background: "linear-gradient(135deg, #ff6b9d, #ff4d6a)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "1rem",
        }}
      >
        Something went wrong
      </div>
      <p
        style={{
          color: "rgba(255,255,255,.45)",
          fontSize: ".9rem",
          marginBottom: "2rem",
          maxWidth: 400,
        }}
      >
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        style={{
          padding: ".7rem 1.8rem",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #6c63ff, #5a52d5)",
          color: "#fff",
          border: "none",
          fontSize: ".85rem",
          cursor: "pointer",
          fontFamily: "'Space Mono', monospace",
          letterSpacing: ".1em",
          textTransform: "uppercase",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
