import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
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
      }}
    >
      <div
        style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: "6rem",
          lineHeight: 1,
          background: "linear-gradient(135deg, #6c63ff, #00d4ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </div>
      <p
        style={{
          color: "rgba(255,255,255,.45)",
          fontSize: "1rem",
          marginBottom: "2rem",
        }}
      >
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          padding: ".7rem 1.8rem",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #6c63ff, #5a52d5)",
          color: "#fff",
          textDecoration: "none",
          fontSize: ".9rem",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
