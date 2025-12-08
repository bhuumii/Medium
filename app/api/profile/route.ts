// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      userId,      // sent from the form
      name,
      pronouns,
      shortBio,
      about,
    } = body as {
      userId?: string;
      name?: string;
      pronouns?: string;
      shortBio?: string;
      about?: string;
    };

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    // Optional safety check: make sure the logged-in user is updating their own profile
    // (assuming you store user id on the session as `session.user.id`)
    if (session.user.id && session.user.id !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        // Only update fields that were actually sent
        ...(name !== undefined && { name }),
        ...(pronouns !== undefined && { pronouns }),
        ...(shortBio !== undefined && { shortBio }),
        ...(about !== undefined && { about }),
      },
      select: {
        id: true,
        name: true,
        pronouns: true,
        shortBio: true,
        about: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("Error updating profile:", err);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
