// components/AppShell.tsx
"use client";

import { useState, type ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-root">
      {/* Top Medium-like header */}
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main area: sidebar + content */}
      <main className="app-main">
        <Sidebar open={sidebarOpen} />
        <div className="app-content">{children}</div>
      </main>
    </div>
  );
}
