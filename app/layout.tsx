// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import type { ReactNode } from "react";
import AppShell from "../components/AppShell";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "Medium clone",
  description: "Medium clone built with Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <AppShell>{children}</AppShell>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
