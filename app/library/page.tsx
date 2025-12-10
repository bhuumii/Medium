// app/library/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { prisma } from "../../lib/prisma";
import PostCard from "../../components/PostCard";

type LibraryPageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const userId = (session.user as { id: string }).id;

  const resolved = await searchParams;
  const activeTab = resolved.tab === "liked" ? "liked" : "reading-list";

  let posts;

  if (activeTab === "liked") {
    const likes = await prisma.like.findMany({
      where: { userId },
      include: {
        post: {
          include: { 
            author: true,
            _count: {
              select: { likes: true }
            },
            likes: {
              where: { userId },
              select: { id: true }
            }
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    posts = likes.map((l) => ({
      ...l.post,
      isLiked: l.post.likes.length > 0,
      likeCount: l.post._count.likes
    }));
  } else {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: { 
            author: true,
            _count: {
              select: { likes: true }
            },
            likes: {
              where: { userId },
              select: { id: true }
            }
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    posts = bookmarks.map((b) => ({
      ...b.post,
      isLiked: b.post.likes.length > 0,
      likeCount: b.post._count.likes
    }));
  }

  const savedRows = await prisma.bookmark.findMany({
    where: { userId },
    select: { postId: true },
  });

  const savedPostIds = new Set(savedRows.map((row) => row.postId));

  return (
    <main className="home-layout">
      <section className="feed-header">
        <div className="feed-tabs">
          <a
            className={
              activeTab === "reading-list"
                ? "feed-tab feed-tab--active no-underline"
                : "feed-tab no-underline"
            }
            href="/library?tab=reading-list"
          >
            Reading list
          </a>
          <a
            className={
              activeTab === "liked"
                ? "feed-tab feed-tab--active no-underline"
                : "feed-tab no-underline"
            }
            href="/library?tab=liked"
          >
            Liked
          </a>
        </div>
      </section>

      <section className="feed-list">
        {posts.length === 0 ? (
          <p className="empty-feed">
            {activeTab === "liked"
              ? "No liked stories yet."
              : "No stories in your reading list yet."}
          </p>
        ) : (
          posts.map((post) => {
            // ✅ Calculate read time (same as post page)
            const words = post.content.split(/\s+/).length;
            const minutes = Math.ceil(words / 200);
            const readTime = `${minutes} min read`;

            return (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  readTime: readTime  // ✅ Pass calculated read time
                }}
                initialIsSaved={savedPostIds.has(post.id)}
              />
            );
          })
        )}
      </section>
    </main>
  );
}
