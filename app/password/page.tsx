"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function ChangePasswordPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMsg, setStatusMsg] =
    useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);


  const hasPassword = session?.user?.email && (session?.user as any)?.hasPassword !== false;


  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
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
      

      setTimeout(() => {
        setStatusMsg("idle");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Something went wrong");
      setStatusMsg("error");
    }
  }

  if (status === "loading") {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <p style={{ color: '#757575' }}>Loading…</p>
      </div>
    );
  }

  return (
    <main style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '3rem 2rem' 
    }}>
      <h1 style={{ 
        fontSize: '2rem', 
        fontWeight: '700',
        marginBottom: '2rem',
        color: '#242424'
      }}>
        Change password
      </h1>

      {!hasPassword ? (
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#FFF3CD',
          border: '1px solid #FFE69C',
          borderRadius: '8px',
          color: '#856404'
        }}>
          <p style={{ margin: 0, lineHeight: '1.5' }}>
            <strong>Password login not configured for this account.</strong><br />
            You signed in with Google. To enable password login, please contact support or create a new account with email/password.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '14px',
              fontWeight: '500',
              color: '#242424'
            }}>
              Current password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#242424'}
              onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '14px',
              fontWeight: '500',
              color: '#242424'
            }}>
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#242424'}
              onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              fontSize: '14px',
              fontWeight: '500',
              color: '#242424'
            }}>
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '12px 16px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#242424'}
              onBlur={(e) => e.target.style.borderColor = '#d9d9d9'}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              type="submit"
              disabled={statusMsg === "saving"}
              style={{ 
                padding: '12px 32px',
                backgroundColor: statusMsg === "saving" ? '#757575' : '#242424',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: statusMsg === "saving" ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (statusMsg !== "saving") {
                  e.currentTarget.style.backgroundColor = '#000';
                }
              }}
              onMouseLeave={(e) => {
                if (statusMsg !== "saving") {
                  e.currentTarget.style.backgroundColor = '#242424';
                }
              }}
            >
              {statusMsg === "saving" ? "Changing…" : "Change password"}
            </button>

            {statusMsg === "saved" && !errorText && (
              <span style={{ color: '#1a8917', fontSize: '14px', fontWeight: '500' }}>
                ✓ Password updated successfully
              </span>
            )}
          </div>
        </form>
      )}

      {errorText && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem 1.5rem',
          backgroundColor: '#F8D7DA',
          border: '1px solid #F5C6CB',
          borderRadius: '8px',
          color: '#721C24',
          fontSize: '14px'
        }}>
          {errorText}
        </div>
      )}
    </main>
  );
}
