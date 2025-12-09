
import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'

function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || `post-${Date.now()}`
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { title, excerpt, content } = body as {
      title?: string
      excerpt?: string
      content?: string
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const author = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!author) {
      return NextResponse.json(
        { error: 'No user found for this session.' },
        { status: 500 }
      )
    }

    const base = makeSlug(title)
    let slug = base
    let i = 1
    
    while (true) {
      const existing = await prisma.post.findUnique({ where: { slug } })
      if (!existing) break
      slug = `${base}-${i++}`
    }

    const post = await prisma.post.create({
      data: {
        title,
        excerpt: excerpt ?? '',
        content: content ?? '',
        slug,
        authorId: author.id,

        isPublished: true,
    publishedAt: new Date(),
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/posts error', err)
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    )
  }
}
