// components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close the menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <header className="site-header">
      {/* LEFT: menu + logo + search */}
      <div className="site-header-left">
        <button
          type="button"
          className="menu-button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          aria-pressed={sidebarOpen}
        >
          <span />
          <span />
          <span />
        </button>

        <Link href="/home" className="logo">
          Medium
        </Link>

        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search"
            type="text"
          />
        </div>
      </div>

      {/* RIGHT: write, bell, avatar + menu */}
      <div className="site-header-right">
        <Link href="/editor" className="write-button">
          Write
        </Link>

        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
        >
          🔔
        </button>

        {/* Avatar + dropdown menu */}
        <div
          ref={menuRef}
          style={{ position: "relative", display: "inline-block" }}
        >
          <button
            type="button"
            className="avatar-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            B
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                marginTop: "0.5rem",
                background: "white",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                minWidth: "200px",
                padding: "0.5rem 0",
                zIndex: 1000,
              }}
              role="menu"
            >
              {/* View / Edit profile → /profile (About tab is default there) */}
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "0.6rem 1rem",
                  textDecoration: "none",
                  color: "#222",
                  fontSize: "0.95rem",
                }}
              >
                View / Edit profile
              </Link>

              {/* Change password → /password */}
              <Link
                href="/password"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "0.6rem 1rem",
                  textDecoration: "none",
                  color: "#222",
                  fontSize: "0.95rem",
                }}
              >
                Change password
              </Link>

              {/* Sign out */}
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.6rem 1rem",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  color: "#b00020",
                  marginTop: "0.25rem",
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
