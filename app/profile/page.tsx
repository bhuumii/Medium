import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import ProfilePageClient from "./ProfilePageClient";

export default async function ProfileRoute() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      shortBio: true,
      about: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const publishedPostsCount = await prisma.post.count({
    where: {
      authorId: user.id,
      isPublished: true,
    },
  });

  return (
    <ProfilePageClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        shortBio: user.shortBio,
        about: user.about,
        publishedPostsCount,
      }}
    />
  );
}
