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
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/");
  }

  const userId = session.user.id;

  const resolved = await searchParams;
  const activeTab = resolved.tab === "by-you" ? "by-you" : "for-you";

  const where =
    activeTab === "by-you"
      ? { 
          authorId: userId,
          isPublished: true
        }
      : { 
          authorId: { not: userId },
          isPublished: true
        };

  const posts = await prisma.post.findMany({
    where,
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
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const savedRows = await prisma.bookmark.findMany({
    where: { userId },
    select: { postId: true },
  });

  const savedPostIds = new Set(
    savedRows.map((row: { postId: string }) => row.postId)
  );

  return (
    <main className="home-layout">
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

      <section className="feed-list">
        {posts.map((post) => {
          // ✅ Calculate read time (same as post page)
          const words = post.content.split(/\s+/).length;
          const minutes = Math.ceil(words / 200);
          const readTime = `${minutes} min read`;

          return (
            <PostCard
              key={post.id}
              post={{
                ...post,
                isLiked: post.likes.length > 0,
                likeCount: post._count.likes,
                readTime: readTime  // ✅ Pass calculated read time
              }}
              initialIsSaved={savedPostIds.has(post.id)}
            />
          );
        })}

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
