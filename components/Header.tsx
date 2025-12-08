// components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close avatar menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      {/* RIGHT: write, bell, avatar */}
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
        <div className="avatar-menu-wrapper" ref={menuRef}>
          <button
            type="button"
            className="avatar-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            B
          </button>

          {menuOpen && (
            <div className="avatar-menu">
              {/* Top card: avatar + name (no "View profile" text here) */}
              <div className="avatar-menu-header">
                <div className="avatar-menu-circle">B</div>
                <div className="avatar-menu-name">Bhumi</div>
              </div>

              {/* Options list */}
              <div className="avatar-menu-list">
                <Link href="/profile" className="avatar-menu-item">
                  View / Edit profile
                </Link>

                <Link href="/password" className="avatar-menu-item">
                  Change password
                </Link>

                <button
                  type="button"
                  className="avatar-menu-item avatar-menu-signout"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
