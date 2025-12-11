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

 
    const updateData: any = {};
    
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      }
      updateData.title = body.title;
    }
    
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt ?? '';
    if (body.content !== undefined) updateData.content = body.content ?? '';
    
    if (body.isPublished !== undefined) {
      updateData.isPublished = body.isPublished;
   
      if (body.isPublished && !existingPost.isPublished) {
        updateData.publishedAt = new Date();
      }
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
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


// DELETE handler
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (existingPost.author.email !== session.user.email) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Delete the post 
    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Post deleted' }, { status: 200 });
  } catch (err: any) {
    console.error('DELETE /api/posts/[id] error', err);
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
