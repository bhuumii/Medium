// components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import AuthButtons from './AuthButtons'

export default function Navbar() {
  const { status } = useSession()

  // 1. Logged In View (White Header, Search, Profile)
  if (status === 'authenticated') {
    return (
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          {/* Left: Logo + Search */}
          <div className="flex items-center gap-4">
            <Link href="/home" aria-label="Home">
               {/* Medium Icon */}
               <svg viewBox="0 0 1043.63 592.71" className="h-8 w-auto fill-black">
                 <path d="M588.67 296.36c0 163.67-131.78 296.35-294.33 296.35S0 460 0 296.36 131.78 0 294.34 0s294.33 132.69 294.33 296.36M911.56 296.36c0 154.06-65.89 279-147.17 279s-147.17-124.94-147.17-279 65.88-279 147.16-279 147.17 124.9 147.17 279M1043.63 296.36c0 138-23.17 249.94-51.76 249.94s-51.75-111.91-51.75-249.94 23.17-249.94 51.75-249.94 51.76 111.9 51.76 249.94" />
               </svg>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-[#f9f9f9] rounded-full px-3 py-2 gap-2 w-60">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 text-black" />
            </div>
          </div>

          {/* Right: Write + Profile */}
          <div className="flex items-center gap-6">
             <AuthButtons />
          </div>
        </div>
      </header>
    )
  }

  // 2. Logged Out View (Yellow Header)
  return (
    <header className="border-b border-black bg-[#ffc017]">
      <div className="mx-auto max-w-7xl px-4 h-20 flex items-center justify-between">
        <Link href="/" className="text-3xl font-serif font-bold tracking-tight text-black">
          Medium
        </Link>
        <nav className="flex items-center gap-4">
          <AuthButtons />
        </nav>
      </div>
    </header>
  )
}