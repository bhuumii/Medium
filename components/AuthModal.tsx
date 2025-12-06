
'use client'

import Link from 'next/link'

type Mode = 'signup' | 'signin' | 'write'

const copyByMode: Record<
  Mode,
  { title: string; mainCta: string; footer: React.ReactNode }
> = {
  signup: {
    title: 'Join Medium.',
    mainCta: 'Sign up with email',
    footer: (
      <>
        Already have an account?{' '}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </>
    ),
  },
  signin: {
    title: 'Welcome back.',
    mainCta: 'Sign in with email',
    footer: (
      <>
        No account?{' '}
        <Link href="/register" className="underline">
          Create one
        </Link>
      </>
    ),
  },
  write: {
    title: 'Create an account to start writing.',
    mainCta: 'Sign up with email',
    footer: (
      <>
        Already have an account?{' '}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </>
    ),
  },
}

export default function AuthModal({
  mode,
  onClose,
}: {
  mode: Mode
  onClose: () => void
}) {
  const copy = copyByMode[mode]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-8 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
          {copy.title}
        </h2>

        <div className="space-y-3 mb-6">
       
          <button className="w-full border rounded-full py-2 text-sm flex items-center justify-center gap-2">
            <span>G</span>
            <span className="font-medium">Continue with Google (UI only)</span>
          </button>

          <button className="w-full border rounded-full py-2 text-sm flex items-center justify-center gap-2">
            <span>f</span>
            <span className="font-medium">Continue with Facebook (UI only)</span>
          </button>

          <Link
            href={mode === 'signin' ? '/login' : '/register'}
            className="w-full border rounded-full py-2 text-sm flex items-center justify-center gap-2 bg-black text-white"
            onClick={onClose}
          >
            <span>✉</span>
            <span className="font-medium">{copy.mainCta}</span>
          </Link>
        </div>

        <p className="text-xs text-center text-[#6b6b6b]">{copy.footer}</p>
      </div>
    </div>
  )
}
