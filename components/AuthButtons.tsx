
'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AuthButtons() {
  const { data: session, status } = useSession()

  if (status === 'loading') return null


  if (session) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/editor" className="hover:underline">
          Write
        </Link>
        <span>
          Hi, <span className="font-semibold">{session.user?.name ?? 'User'}</span>
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="rounded-full border border-black bg-transparent px-4 py-1"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/login" className="hover:underline">
        Sign in
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-black text-white px-4 py-1"
      >
        Get started
      </Link>
    </div>
  )
}
