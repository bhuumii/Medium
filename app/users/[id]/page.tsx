
import { prisma } from '../../../lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {

  params: Promise<Record<string, string>>
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function UserProfilePage({ params }: Props) {
  const resolved = await params
  const userId = resolved.id ?? resolved.userId 

  if (!userId) {
    return notFound()
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) {
    return notFound()
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-start gap-4 mb-10">
        {/* Avatar with initial */}
        <div className="h-16 w-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold uppercase">
          {user.name?.[0] ?? '?'}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-1">{user.name}</h1>

          {user.bio && (
            <p className="text-sm text-[#6b6b6b] mb-1">
              {user.bio}
            </p>
          )}

          <p className="text-xs text-[#6b6b6b]">
            Joined {formatDate(user.createdAt)}
          </p>
        </div>
      </header>

      {/* Posts list */}
      <section>
        <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#6b6b6b] mb-4">
          Stories by {user.name}
        </h2>

        {user.posts.length === 0 ? (
          <p className="text-sm text-[#6b6b6b]">
            {user.name} hasn&apos;t published any stories yet.
          </p>
        ) : (
          <div className="space-y-6">
            {user.posts.map((post) => (
              <article
                key={post.id}
                className="border-b border-[#f2f2f2] pb-6"
              >
                <Link
                  href={`/posts/${encodeURIComponent(post.slug)}`}
                  className="block group"
                >
                  <h3 className="text-xl font-semibold leading-snug group-hover:underline">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-[#6b6b6b]">
                      {post.excerpt.length > 140
                        ? post.excerpt.slice(0, 140) + '…'
                        : post.excerpt}
                    </p>
                  )}
                </Link>

                <div className="mt-2 text-xs text-[#6b6b6b]">
                  {formatDate(post.createdAt)}
                  <span className="mx-2">·</span>
                  {Math.max(1, Math.round(post.content.length / 800))} min read
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
