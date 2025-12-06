
'use client'
import Link from 'next/link'
export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="max-w-3xl mx-auto p-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">Medium Clone</Link>
        <nav className="space-x-4">
          <Link href="/explore">Explore</Link>
          <Link href="/profile">Profile</Link>
        </nav>
      </div>
    </header>
  )
}
