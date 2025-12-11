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
  const userName = session.user.name || "there";

  const resolved = await searchParams;
  const activeTab = resolved.tab === "by-you" ? "by-you" : "for-you";

  const where =
    activeTab === "by-you"
      ? {
          authorId: userId,
          isPublished: true,
        }
      : {
          authorId: { not: userId },
          isPublished: true,
        };

  const posts = await prisma.post.findMany({
    where,
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

    <main 
      className="home-layout w-full mx-auto px-6"
      style={{ maxWidth: '1200px' }} 
    >
 
      <section className="feed-header" style={{ paddingTop: "10px" }}>
        
     
        <div className="w-full text-left" style={{ marginBottom: "2rem" }}>
          
        
          <h1 
            className="text-[42px] font-bold text-[#242424] tracking-tight leading-tight"
            style={{ marginTop: 0 }}
          >
            Welcome, {userName}
          </h1>
          <p className="text-[24px] text-[#6B6B6B] mt-0">
            How are you doing today?
          </p>
        </div>

      
        <div className="feed-tabs flex gap-8 border-b border-[#f2f2f2] mb-8">
          <a
            className={
              activeTab === "for-you"
                ? "feed-tab feed-tab--active no-underline pb-3 border-b-2 border-black font-medium text-[18px] text-black"
                : "feed-tab no-underline pb-3 text-[#6B6B6B] hover:text-black transition-colors text-[18px]"
            }
            href="/home?tab=for-you"
          >
            For you
          </a>
          <a
            className={
              activeTab === "by-you"
                ? "feed-tab feed-tab--active no-underline pb-3 border-b-2 border-black font-medium text-[18px] text-black"
                : "feed-tab no-underline pb-3 text-[#6B6B6B] hover:text-black transition-colors text-[18px]"
            }
            href="/home?tab=by-you"
          >
            By you
          </a>
        </div>
      </section>

   
      <section className="feed-list">
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


        {posts.length === 0 && (
          <p className="empty-feed text-gray-500 mt-4">
            {activeTab === "by-you"
              ? "You haven't published any stories yet. Click on Write to publish your first one."
              : "No stories yet from other users."}
          </p>
        )}
      </section>
    </main>
  );
}