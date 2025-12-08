
'use client'

import { FormEvent, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('alice@example.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleEmailSignIn(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    callbackUrl: '/home', 
    })

    setLoading(false)

    if (!res || res.error) {
      setError(res?.error || 'Invalid email or password')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        <Link href="/" className="text-sm text-[#6b6b6b] hover:underline">
          ← Back
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Welcome back.</h1>

      {/* Google sign in */}
      <button
        type="button"
        onClick={() => signIn('google', {  callbackUrl: '/home' })}
        className="w-full border rounded-full px-4 py-2 mb-4 text-sm flex items-center justify-center gap-2"
      >
        <span>Sign in with Google</span>
      </button>

      <div className="text-center text-xs text-[#6b6b6b] mb-4">or</div>

      {/* Email/password */}
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-black text-white px-4 py-2 text-sm"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-xs text-[#6b6b6b]">
        No account yet?{' '}
        <Link href="/register" className="underline">
          Create one
        </Link>
        .
      </p>
    </div>
  )
}
