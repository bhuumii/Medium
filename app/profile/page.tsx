// app/profile/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import ProfilePageClient from "./ProfilePageClient";

export default async function ProfileRoute() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      pronouns: true,
      shortBio: true,
      about: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfilePageClient user={user} />;
}
