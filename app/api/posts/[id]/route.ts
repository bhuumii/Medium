// app/api/posts/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { title, excerpt, content, isPublished } = body as {
      title?: string;
      excerpt?: string;
      content?: string;
      isPublished?: boolean;
    };

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Find the post and verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost.author.email !== session.user.email) {
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      );
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        excerpt: excerpt ?? '',
        content: content ?? '',
        isPublished: isPublished !== undefined ? isPublished : existingPost.isPublished,
        publishedAt: isPublished && !existingPost.isPublished ? new Date() : existingPost.publishedAt,
      },
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (err: any) {
    console.error('PUT /api/posts/[id] error', err);
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
