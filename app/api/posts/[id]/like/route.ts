// app/api/posts/[id]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ params is a Promise
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: postId } = await params;  // ✅ Await params first!

    // Check if post exists and is published
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, isPublished: true },
    });

    if (!post || !post.isPublished) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json({ error: 'Already liked' }, { status: 400 });
    }

    // Create like
    await prisma.like.create({
      data: {
        userId: user.id,
        postId: postId,
      },
    });

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { postId },
    });

    return NextResponse.json({ liked: true, likeCount });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to like post' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ✅ params is a Promise
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: postId } = await params;  // ✅ Await params first!

    // Delete like
    await prisma.like.deleteMany({
      where: {
        userId: user.id,
        postId: postId,
      },
    });

    // Get updated like count
    const likeCount = await prisma.like.count({
      where: { postId },
    });

    return NextResponse.json({ liked: false, likeCount });
  } catch (error) {
    console.error('Unlike error:', error);
    return NextResponse.json({ error: 'Failed to unlike post' }, { status: 500 });
  }
}
