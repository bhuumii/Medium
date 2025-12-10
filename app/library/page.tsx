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
              select: { likes: true },
            },
            likes: {
              where: { userId },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    posts = likes.map((l) => ({
      ...l.post,
      isLiked: l.post.likes.length > 0,
      likeCount: l.post._count.likes,
    }));
  } else {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: true,
            _count: {
              select: { likes: true },
            },
            likes: {
              where: { userId },
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    posts = bookmarks.map((b) => ({
      ...b.post,
      isLiked: b.post.likes.length > 0,
      likeCount: b.post._count.likes,
    }));
  }

  const savedRows = await prisma.bookmark.findMany({
    where: { userId },
    select: { postId: true },
  });

  const savedPostIds = new Set(savedRows.map((row) => row.postId));

  return (
    // 1. UPDATED: Expanded width to 1200px and added horizontal padding
    <main 
      className="home-layout w-full mx-auto px-6" 
      style={{ maxWidth: '1200px' }}
    >
      {/* Reduced top padding slightly to match Home page style */}
      <section className="feed-header" style={{ paddingTop: "10px" }}>
        
        {/* 2. UPDATED: Changed to text-left to align with the wider grid, removed massive bottom margin */}
        <h1
          className="text-[42px] font-bold text-[#242424] tracking-tight leading-tight mb-8 text-left"
          style={{ marginTop: 0 }}
        >
          Library
        </h1>

        {/* 3. UPDATED: Added flex, gap, and increased font size to 18px */}
        <div className="feed-tabs flex gap-8 border-b border-[#f2f2f2] mb-8">
          <a
            className={
              activeTab === "reading-list"
                ? "feed-tab feed-tab--active no-underline pb-3 border-b-2 border-black font-medium text-[18px] text-black"
                : "feed-tab no-underline pb-3 text-[#6B6B6B] hover:text-black transition-colors text-[18px]"
            }
            href="/library?tab=reading-list"
          >
            Reading list
          </a>
          <a
            className={
              activeTab === "liked"
                ? "feed-tab feed-tab--active no-underline pb-3 border-b-2 border-black font-medium text-[18px] text-black"
                : "feed-tab no-underline pb-3 text-[#6B6B6B] hover:text-black transition-colors text-[18px]"
            }
            href="/library?tab=liked"
          >
            Liked
          </a>
        </div>
      </section>

      <section className="feed-list">
        {posts.length === 0 ? (
          <p className="empty-feed text-gray-500 mt-4">
            {activeTab === "liked"
              ? "No liked stories yet."
              : "No stories in your reading list yet."}
          </p>
        ) : (
          posts.map((post) => {
            const words = post.content.split(/\s+/).length;
            const minutes = Math.ceil(words / 200);
            const readTime = `${minutes} min read`;

            return (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  readTime,
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