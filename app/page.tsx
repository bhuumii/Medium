
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '../lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)


  const userId = (session?.user as any)?.id
  const startReadingHref = userId ? `/users/${userId}` : '/login'

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center">
      <div className="mx-auto max-w-5xl w-full px-4 md:px-0 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left side: text */}
        <section className="space-y-6">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-tight">
            Human stories &amp; ideas
          </h1>
          <p className="text-lg md:text-xl text-[#6b6b6b] max-w-xl">
            A place to read, write, and deepen your understanding.
          </p>

          <Link
            href={startReadingHref}
            className="inline-flex items-center rounded-full bg-black text-white px-6 py-3 text-sm font-medium"
          >
            Start reading
          </Link>
        </section>

      
        <section className="hidden md:flex justify-center">
          <div className="w-64 h-64 rounded-full bg-green-500/90 shadow-lg flex items-center justify-center text-white text-4xl">
            ✍️
          </div>
        </section>
      </div>
    </div>
  )
}
