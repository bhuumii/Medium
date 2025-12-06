// app/posts/[slug]/page.tsx
import { prisma } from '../../../lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { formatDate } from '../../../lib/formatDate'

interface Props {
  params: Promise<{ slug: string }>
}

function normalizeSlug(raw: string | string[] | undefined): string | null {
  if (!raw) return null
  if (Array.isArray(raw)) return raw.join('/')
  return String(raw)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params
  const slug = normalizeSlug(resolved.slug)
  if (!slug) return { title: 'Post not found' }

  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  })
  if (!post) return { title: 'Post not found' }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function PostPage({ params }: Props) {
  const resolved = await params
  const slug = normalizeSlug(resolved.slug)

  if (!slug) return notFound()

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true, tags: true },
  })

  if (!post) return notFound()

    return (
    <article className="max-w-2xl">
      <div className="mb-6">
        <Link href="/" className="text-sm text-[#6b6b6b] hover:underline">
          ← Back
        </Link>
      </div>

          <header className="mb-8">
  <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
    {post.title}
  </h1>
  <div className="text-sm text-[#6b6b6b]">
    By{' '}
    {post.author ? (
      <Link
        href={`/users/${post.author.id}`}
        className="font-semibold hover:underline"
      >
        {post.author.name}
      </Link>
    ) : (
      <span className="font-semibold">Unknown</span>
    )}{' '}
    · {formatDate(post.createdAt)}
  </div>
</header>


      <section className="prose prose-sm md:prose-base max-w-none text-[17px] leading-relaxed">
        <p className="whitespace-pre-wrap">
          {post.content}
        </p>
      </section>
    </article>
  )

}
