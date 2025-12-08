// app/home/page.tsx
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/authOptions"
import { prisma } from "../../lib/prisma"
import PostCard from "../../components/PostCard"
import { formatDate } from "../../lib/formatDate"

export default async function HomeSignedIn() {
  // 1) Protect route – only logged-in users
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/")
  }

  // 2) Fetch posts (same as your old Home)
  const posts = await prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <main className="home-layout">
      {/* Tabs like Medium: For you / Featured */}
      <section className="feed-header">
        <div className="feed-tabs">
          <button className="feed-tab feed-tab--active">For you</button>
          
        </div>
      </section>

      {/* Posts list */}
      <section className="feed-list">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {posts.length === 0 && (
          <p className="empty-feed">
            No stories yet. Click on <strong>Write</strong> in the top bar to
            publish your first one.
          </p>
        )}
      </section>
    </main>
  )
}
