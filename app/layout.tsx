
import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import SessionProviderWrapper from '../components/SessionProviderWrapper'
import AuthButtons from '../components/AuthButtons'

export const metadata: Metadata = {
  title: 'Medium Clone',
  description: 'A Medium-like blogging platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#fdfcf6] text-[#242424]">
        <SessionProviderWrapper>
          <header className="border-b border-black/10 bg-[#ffc017]">
            <div className="mx-auto max-w-5xl flex items-center justify-between py-4 px-4 md:px-0">
              <Link href="/" className="text-2xl font-extrabold tracking-tight">
                Medium <span className="font-normal text-sm align-top">clone</span>
              </Link>

              <nav className="flex items-center gap-4">
                <AuthButtons />
              </nav>
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-4 md:px-0 py-8">
            {children}
          </main>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
