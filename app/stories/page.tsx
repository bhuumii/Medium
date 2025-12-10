// app/stories/page.tsx
import { prisma } from "../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "../../lib/formatDate";
import DeletePostButton from "../../components/DeletePostButton";

interface StoriesPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const { tab } = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });

  // Separate drafts vs published based on isPublished field
  const drafts = posts.filter(post => !post.isPublished);
  const published = posts.filter(post => post.isPublished);

  const activeTab = tab === "drafts" ? "drafts" : "published";
  const activeList = activeTab === "drafts" ? drafts : published;

  return (
    // 1. UPDATED: Added 'home-layout' and matched max-width/padding to Library page
    <main 
      className="home-layout w-full mx-auto px-6" 
      style={{ maxWidth: '1200px' }}
    >
      {/* 2. UPDATED: Matched paddingTop (10px) to Library header */}
      <section className="feed-header" style={{ paddingTop: "10px" }}>
        
        {/* Title: Matches Library typography and spacing */}
        <h1 
          className="text-[42px] font-bold text-[#242424] tracking-tight leading-tight mb-8 text-left" 
          style={{ marginTop: 0 }}
        >
          Stories
        </h1>

        {/* 3. UPDATED: Tabs container - Flex, gap-8, and bottom border like Library */}
        <div className="feed-tabs flex gap-8 border-b border-[#f2f2f2] mb-8">
          
          {/* Drafts Tab */}
          <Link 
            href="/stories?tab=drafts"
            className={
              activeTab === "drafts"
                ? "feed-tab feed-tab--active no-underline pb-3 border-b-2 border-black font-medium text-[18px] text-black"
                : "feed-tab no-underline pb-3 text-[#6B6B6B] hover:text-black transition-colors text-[18px]"
            }
          >

            Drafts {drafts.length > 0 && <span className="text-[13px] opacity-70" style={{ marginLeft: "5px" }}>{drafts.length}</span>}
          </Link>

          {/* Published Tab */}
          <Link 
            href="/stories?tab=published"
            className={
              activeTab === "published"
                ? "feed-tab feed-tab--active no-underline pb-3 border-b-2 border-black font-medium text-[18px] text-black"
                : "feed-tab no-underline pb-3 text-[#6B6B6B] hover:text-black transition-colors text-[18px]"
            }
          >
       
           Published {published.length > 0 && <span className="text-[13px] opacity-70" style={{ marginLeft: "5px" }}>{published.length}</span>}
          </Link>
        </div>
      </section>

      {/* Content List */}
      <section className="feed-list">
        {activeList.length === 0 ? (
          <p className="empty-feed text-gray-500 mt-4">
            {activeTab === "drafts" 
              ? "You have no drafts." 
              : "You haven't published any stories yet."}
          </p>
        ) : (
          <div className="space-y-8">
            {activeList.map((post) => (
              <article
                key={post.id}
                className="group pb-8 border-b border-[#F2F2F2] last:border-b-0"
              >
                {/* Story Content */}
                <div className="flex items-start justify-between gap-6">
                  {/* Left: Story Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="block mb-2 group/title"
                    >
                      <h2 className="text-[20px] font-bold text-[#242424] leading-tight group-hover/title:text-[#000] transition-colors">
                        {post.title}
                      </h2>
                    </Link>

                    {post.excerpt && (
                      <p className="text-[#6B6B6B] text-[16px] leading-[24px] mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-2 text-[13px] text-[#6B6B6B]">
                      <span className="inline-flex items-center bg-[#F2F2F2] px-2 py-1 rounded text-[#242424] font-normal">
                        {activeTab === "drafts" ? "Draft" : "Published"}
                      </span>
                      <span>·</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  {/* Right: Edit & Delete Icons */}
                  <div className="flex-shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Edit Icon */}
                    <Link
                      href={`/editor/${post.slug}`}
                      className="relative group/edit flex flex-col items-center gap-1"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#F2F2F2] transition-colors">
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          className="text-[#6B6B6B] group-hover/edit:text-[#242424] transition-colors"
                        >
                          <path 
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="text-[11px] text-[#6B6B6B] whitespace-nowrap opacity-0 group-hover/edit:opacity-100 transition-opacity">
                        Edit
                      </span>
                    </Link>

                    {/* Delete Icon */}
                    <DeletePostButton
                      postId={post.id}
                      postTitle={post.title}
                      variant="icon"
                      redirectTo={`/stories?tab=${activeTab}`}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}