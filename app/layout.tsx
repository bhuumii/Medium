// app/layout.tsx
"use client";

import "./globals.css";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppShell from "../components/AppShell";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Hide AppShell for editor and landing page
  const isEditorPage = pathname?.startsWith("/editor");
  const isLandingPage = pathname === "/";

  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          {(isEditorPage || isLandingPage) ? (
            // No AppShell - just content
            children
          ) : (
            // Regular pages - with AppShell (sidebar + header)
            <AppShell>{children}</AppShell>
          )}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
