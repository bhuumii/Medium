

import Link from 'next/link'
import Editor from '../../components/Editor'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'

export default async function EditorPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login?callbackUrl=/editor')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <Link href="/" className="text-sm text-[#6b6b6b] hover:underline">
          ← Back
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Write</h1>
      <Editor />
    </div>
  )
}
