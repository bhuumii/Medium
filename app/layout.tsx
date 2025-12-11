"use client";

import "./globals.css";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AppShell from "../components/AppShell";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  

  const isEditorPage = pathname?.startsWith("/editor");
  const isLandingPage = pathname === "/";

  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          {(isEditorPage || isLandingPage) ? (
          
            children
          ) : (
          
            <AppShell>{children}</AppShell>
          )}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
