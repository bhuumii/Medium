'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AuthButtons() {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

 
  if (session) {
    const initial = session.user?.name?.[0]?.toUpperCase() ?? 'U'

    return (
      <div className="flex items-center gap-4 text-sm">
        <Link
          href="/editor"
          className="rounded-full border border-black px-4 py-1 hover:bg-black hover:text-white transition"
        >
          Write
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="hidden sm:inline text-[#6b6b6b] hover:underline"
        >
          Sign out
        </button>

   
        <Link
          href="/profile"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm"
          aria-label="Profile"
        >
          {initial}
        </Link>
      </div>
    )
  }


  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        onClick={() => signIn(undefined, { callbackUrl: '/home' })}
        className="hover:underline"
      >
        Sign in
      </button>
      <button
        onClick={() => signIn(undefined, { callbackUrl: '/home' })}
        className="rounded-full bg-black text-white px-4 py-1"
      >
        Get started
      </button>
    </div>
  )
}
