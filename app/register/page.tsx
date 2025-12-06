
'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleEmailSignUp(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || 'Registration failed')
      }

      // auto sign-in with credentials
      const loginRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      })

      if (!loginRes || loginRes.error) {
        router.push('/login')
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        <Link href="/" className="text-sm text-[#6b6b6b] hover:underline">
          ← Back
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        Create an account to start writing.
      </h1>

      {/* Google sign up  */}
      <button
        type="button"
        onClick={() => signIn('google', { callbackUrl })}
        className="w-full border rounded-full px-4 py-2 mb-4 text-sm flex items-center justify-center gap-2"
      >
        <span>Sign up with Google</span>
      </button>

      <div className="text-center text-xs text-[#6b6b6b] mb-4">or use email</div>

      {/* Email flow */}
      <form onSubmit={handleEmailSignUp} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

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

        <div>
          <label className="block text-sm mb-1">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-black text-white px-4 py-2 text-sm"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="mt-4 text-xs text-[#6b6b6b]">
        Already have an account?{' '}
        <Link href="/login" className="underline">
          Sign in
        </Link>
        .
      </p>
    </div>
  )
}
