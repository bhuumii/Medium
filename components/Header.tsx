// components/Header.tsx
"use client";

import Link from "next/link";

type HeaderProps = {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
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

        <button type="button" className="avatar-button">
          B
        </button>
      </div>
    </header>
  );
}
