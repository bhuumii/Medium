'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import AuthModal from './AuthModal'

type Mode = 'signup' | 'signin' 

export default function HeaderNav() {
  const { data: session, status } = useSession()
  const [openMode, setOpenMode] = useState<Mode | null>(null)

  const closeModal = () => setOpenMode(null)

  if (status === 'authenticated' && session?.user) {
    return (
      <>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/" className="hover:underline hidden sm:inline">
            Our story
          </Link>
          <Link href="/" className="hover:underline hidden sm:inline">
            Membership
          </Link>
          <Link href="/editor" className="hover:underline">
            Write
          </Link>
          <span className="hidden sm:inline">
            Hi, <span className="font-semibold">{session.user.name}</span>
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-full border border-black bg-transparent px-4 py-1"
          >
            Sign out
          </button>
        </nav>
      </>
    )
  }

  return (
    <>
      <nav className="flex items-center gap-5 text-sm">
        <Link href="/" className="hover:underline hidden sm:inline">
          Our story
        </Link>
        <Link href="/" className="hover:underline hidden sm:inline">
          Membership
        </Link>

     

        <button
          type="button"
          onClick={() => setOpenMode('signin')}
          className="hover:underline"
        >
          Sign in
        </button>

        <button
          type="button"
          onClick={() => setOpenMode('signup')}
          className="rounded-full bg-black text-white px-4 py-1"
        >
          Get started
        </button>
      </nav>

      {openMode && (
  <AuthModal
    isOpen={true}
    mode={openMode}
    onClose={closeModal}
  />
)}
    </>
  )
}
