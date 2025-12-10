// app/page.tsx
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import LandingHeader from "../components/LandingHeader";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const { data: session, status } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signup");

  const isAuthenticated = status === "authenticated";

  const handleStartReading = () => {
    if (isAuthenticated) {
      window.location.href = "/home";
    } else {
      setModalMode("signup");
      setModalOpen(true);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        background: "#F7F4ED",
        position: "relative",
      }}
    >
      {/* Header */}
      <LandingHeader
        session={session}
        onSignInClick={() => {
          setModalMode("signin");
          setModalOpen(true);
        }}
        onGetStartedClick={() => {
          setModalMode("signup");
          setModalOpen(true);
        }}
      />

      {/* Hero Section */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          height: "calc(100vh - 80px)",
        }}
      >
        {/* Left Content */}
        <div style={{ flex: 1, maxWidth: "550px" }}>
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "106px",
              fontWeight: "400",
              lineHeight: "1",
              letterSpacing: "-0.02em",
              marginBottom: "32px",
              color: "#242424",
            }}
          >
            Stories That Matter
          </h1>

          <p
            style={{
              fontSize: "24px",
              lineHeight: "1.4",
              color: "#242424",
              marginBottom: "48px",
              maxWidth: "480px",
            }}
          >
            Share your thoughts with readers who care.
          </p>

          <button
            onClick={handleStartReading}
            className="start-reading-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "12px 48px",
              backgroundColor: "#242424",
              color: "white",
              borderRadius: "999px",
              fontSize: "18px",
              fontWeight: "500",
              border: "none",
              cursor: "pointer",
            }}
          >
            Start reading
          </button>
        </div>

        {/* Right Side - Clean empty space */}
        <div style={{ flex: 1 }} />
      </div>

      {/* Bottom Border */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "#242424",
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
      />

      {/* Hover styles */}
      <style jsx>{`
        .start-reading-btn {
          transition: background-color 0.2s;
        }
        .start-reading-btn:hover {
          background-color: #000 !important;
        }
      `}</style>
    </div>
  );
}
