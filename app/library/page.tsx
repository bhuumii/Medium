// app/library/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { prisma } from "../../lib/prisma";
import PostCard from "../../components/PostCard";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      post: {
        include: { author: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const posts = bookmarks.map((b) => b.post);

  return (
    <main className="home-layout">
      {/* simple header like other feeds */}
      <section className="feed-header">
        <div className="feed-tabs">
          <button className="feed-tab feed-tab--active">Reading list</button>
        </div>
      </section>

      <section className="feed-list">
        {posts.length === 0 ? (
          <p className="empty-feed">
            No stories in your reading list yet.
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              initialIsSaved={true} // everything in Library is already saved
            />
          ))
        )}
      </section>
    </main>
  );
}
