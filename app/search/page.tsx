import { prisma } from "../../lib/prisma";
import PostCard from "../../components/PostCard";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || "";

  let posts: any[] = [];

  if (query) {
    posts = await prisma.post.findMany({
      where: {
  isPublished: true,
  OR: [
    { title: { contains: query } },
    { content: { contains: query } },
  ],
},

      include: {
        author: true,
        _count: { select: { likes: true } },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  const savedRows = userId
    ? await prisma.bookmark.findMany({
        where: { userId },
        select: { postId: true },
      })
    : [];

  const savedPostIds = new Set(savedRows.map((r) => r.postId));

  return (
    <main className="home-layout">
      <section className="feed-header" style={{ paddingTop: "3rem" }}>
        <h1 className="text-[42px] font-bold text-[#242424] tracking-tight leading-tight mb-2 text-left">
          Results for <span className="italic">{query || "…"}</span>
        </h1>
      </section>

      <section className="feed-list">
        {!query && <p className="empty-feed">Type something in the search bar.</p>}

        {query && posts.length === 0 && (
          <p className="empty-feed">No stories found for “{query}”.</p>
        )}

       {posts.map((post) => {
  const words = post.content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  const readTime = `${minutes} min read`;

  return (
    <div
      key={post.id}
      className="transition-colors duration-150 hover:bg-[#F9FAFB] cursor-pointer -mx-6 px-6"
    >
      <PostCard
        post={{
          ...post,
          isLiked: post.likes.length > 0,
          likeCount: post._count.likes,
          readTime,
        }}
        initialIsSaved={savedPostIds.has(post.id)}
      />
    </div>
  );
})}

      </section>
    </main>
  );
}
