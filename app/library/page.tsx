import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/authOptions'

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Your library</h1>
      <p className="text-sm text-[#6b6b6b]">
        We’ll later show saved/bookmarked posts here.
      </p>
    </div>
  )
}
