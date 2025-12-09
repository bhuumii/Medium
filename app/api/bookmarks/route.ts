// app/api/bookmarks/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { postId } = (await req.json()) as { postId?: string };

    if (!postId) {
      return NextResponse.json(
        { error: "Missing postId" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Because Bookmark has @@unique([userId, postId])
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existing) {
      // UNSAVE – delete the bookmark
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ saved: false }, { status: 200 });
    }

    // SAVE – create a new bookmark
    await prisma.bookmark.create({
      data: {
        userId,
        postId,
      },
    });

    return NextResponse.json({ saved: true }, { status: 200 });
  } catch (err) {
    console.error("Error in /api/bookmarks:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
