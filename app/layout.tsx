// app/layout.tsx
"use client";

import "./globals.css";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppShell from "../components/AppShell";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Hide AppShell (sidebar/header) for editor pages
  const isEditorPage = pathname?.startsWith("/editor");

  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          {isEditorPage ? (
            // Editor pages - no AppShell, just content
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
