// app/password/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ChangePasswordPage() {
  const { status } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMsg, setStatusMsg] =
    useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  // If not logged in, send to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorText(null);

    if (newPassword.length < 6) {
      setErrorText("New password should be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorText("New password and confirmation do not match.");
      return;
    }

    setStatusMsg("saving");

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to change password");
      }

      setStatusMsg("saved");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Something went wrong");
      setStatusMsg("error");
    }
  }

  if (status === "loading") {
    return <p style={{ padding: "2rem" }}>Loading…</p>;
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
        Change password
      </h1>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.25rem" }}>Current password</div>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.25rem" }}>New password</div>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          <div style={{ marginBottom: "0.25rem" }}>Confirm new password</div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: "0.4rem" }}
          />
        </label>

        <button
          type="submit"
          disabled={statusMsg === "saving"}
          style={{ padding: "0.5rem 1rem" }}
        >
          {statusMsg === "saving" ? "Changing…" : "Change password"}
        </button>

        {statusMsg === "saved" && !errorText && (
          <span style={{ marginLeft: "0.75rem", color: "#1a8917" }}>
            Password updated
          </span>
        )}
      </form>

      {errorText && (
        <p style={{ marginTop: "0.75rem", color: "red" }}>{errorText}</p>
      )}
    </main>
  );
}
