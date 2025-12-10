// components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const avatarInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const q = searchTerm.trim();
      if (!q) return;
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <header className="site-header">
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
          <span className="search-icon" aria-hidden="true">
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <circle
        cx="11"
        cy="11"
        r="6"
        stroke="#6B6B6B"
        strokeWidth="1.7"
      />
      <line
        x1="15"
        y1="15"
        x2="20"
        y2="20"
        stroke="#6B6B6B"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  </span>
          <input
    className="search-input"
    placeholder="Search"
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={handleSearchKeyDown}
  />
        </div>
      </div>

      <div className="site-header-right">
        <Link href="/editor" className="write-button">
          Write
        </Link>

        <div className="avatar-menu-wrapper" ref={menuRef}>
          <button
            type="button"
            className="avatar-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            {avatarInitial}
          </button>

          {menuOpen && (
            <div className="avatar-menu">
              <div className="avatar-menu-header">
                <div className="avatar-menu-circle">{avatarInitial}</div>
                <div className="avatar-menu-name">{userName}</div>
              </div>

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
                  onClick={() => signOut({ callbackUrl: "/" })}
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
