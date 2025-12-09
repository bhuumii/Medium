// app/home/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { prisma } from "../../lib/prisma";
import PostCard from "../../components/PostCard";

type HomePageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function HomeSignedIn({ searchParams }: HomePageProps) {
  // 1) Protect route – only logged-in users
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/");
  }

  const userId = session.user.id;

  // Next.js 15: searchParams is a Promise
  const resolved = await searchParams;
  const activeTab = resolved.tab === "by-you" ? "by-you" : "for-you";

  // 2) Fetch posts depending on tab - ONLY PUBLISHED POSTS
  const where =
    activeTab === "by-you"
      ? { 
          authorId: userId,
          isPublished: true  // ✅ Only show published posts in "By You"
        }
      : { 
          authorId: { not: userId },
          isPublished: true  // ✅ Only show published posts in "For You"
        };

  const posts = await prisma.post.findMany({
    where,
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // 3) Fetch bookmarks for this user so we can mark saved posts
  const savedRows = await prisma.bookmark.findMany({
    where: { userId },
    select: { postId: true },
  });

  const savedPostIds = new Set(
    savedRows.map((row: { postId: string }) => row.postId)
  );

  return (
    <main className="home-layout">
      {/* Tabs like Medium: For you / By you */}
      <section className="feed-header">
        <div className="feed-tabs">
          <a
            className={
              activeTab === "for-you"
                ? "feed-tab feed-tab--active no-underline"
                : "feed-tab no-underline"
            }
            href="/home?tab=for-you"
          >
            For you
          </a>
          <a
            className={
              activeTab === "by-you"
                ? "feed-tab feed-tab--active no-underline"
                : "feed-tab no-underline"
            }
            href="/home?tab=by-you"
          >
            By you
          </a>
        </div>
      </section>

      {/* Posts list */}
      <section className="feed-list">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            initialIsSaved={savedPostIds.has(post.id)}
          />
        ))}

        {posts.length === 0 && (
          <p className="empty-feed">
            {activeTab === "by-you" 
              ? "You haven't published any stories yet. Click on Write to publish your first one."
              : "No stories yet from other users."
            }
          </p>
        )}
      </section>
    </main>
  );
}
