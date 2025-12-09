// app/posts/[slug]/page.tsx
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatDate } from "../../../lib/formatDate";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import PostBookmarkButton from "../../../components/PostBookmarkButton";

interface Props {
  params: Promise<{ slug: string }>;
}

function normalizeSlug(raw: string | string[] | undefined): string | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw.join("/");
  return String(raw);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const slug = normalizeSlug(resolved.slug);
  if (!slug) return { title: "Post not found" };

  const post = await prisma.post.findUnique({
    where: { slug },
    select: { title: true, excerpt: true },
  });
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

export default async function PostPage({ params }: Props) {
  const resolved = await params;
  const slug = normalizeSlug(resolved.slug);

  if (!slug) return notFound();

  const session = await getServerSession(authOptions);

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!post) return notFound();

  // Check if current user is the author
  const isAuthor = session?.user?.email === post.author?.email;

  // Check if saved
  let initialIsSaved = false;
  if (session?.user?.id) {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        postId: post.id,
      },
      select: { id: true },
    });
    initialIsSaved = !!bookmark;
  }

  const authorName = post.author?.name ?? "Unknown";
  
  // Dynamic Avatar Initial
  const initial = authorName.charAt(0).toUpperCase();

  const date = formatDate(post.createdAt);

  // Read Time Calculation
  const words = post.content.split(/\s+/).length; 
  const minutes = Math.ceil(words / 200);
  const readTime = `${minutes} min read`;

  return (
    <main className="bg-white min-h-screen w-full font-sans text-left">
      <article className="max-w-[680px] mx-auto px-6 pt-12 pb-32 block text-left">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col mb-2">

          {/* TITLE with Edit Icon */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-[76px] md:text-[88px] font-extrabold text-[#242424] leading-[1.1] tracking-tight flex-1">
              {post.title}
            </h1>

            {/* Edit Icon - Only show if user is author */}
            {isAuthor && (
              <Link
                href={`/editor/${post.slug}`}
                className="relative group/edit flex flex-col items-center gap-1 mt-4"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#F2F2F2] transition-colors">
                  <svg 
                    width="22" 
                    height="22" 
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
            )}
          </div>

          {/* SUBTITLE */}
          {post.excerpt && (
            <h2 className="text-[22px] text-[#757575] leading-snug font-normal mb-4 text-left">
              {post.excerpt}
            </h2>
          )}

          {/* AUTHOR ROW - Clean Single Line */}
          <div className="flex items-center justify-between w-full">

            {/* Left: Avatar + Info */}
            <div className="flex items-center gap-10">
              
              {/* Avatar: Smaller (32px) */}
              <div 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#ea580c',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}
              >
                {initial}
              </div>

              {/* TEXT INFO: Name · Time · Date */}
              <div className="flex items-center gap-2 text-[15px]">
                
                {/* Name */}
                <span className="font-medium text-[#242424]">
                  {authorName}
                </span>

                {/* Dot Separator */}
                <span className="text-[#757575]">·</span>

                {/* Read Time */}
                <span className="text-[#757575]">
                  {readTime}
                </span>

                {/* Dot Separator */}
                <span className="text-[#757575]">·</span>

                {/* Date */}
                <span className="text-[#757575]">
                  {date}
                </span>

              </div>
            </div>

            {/* Right: Bookmark Button */}
            <div className="flex items-center border-l border-gray-200 pl-4 h-6">
              <PostBookmarkButton
                postId={post.id}
                initialIsSaved={initialIsSaved}
              />
            </div>
            
          </div>

          {/* DIVIDER LINE */}
          <div className="border-b border-[#f2f2f2] mt-8 w-full"></div>

        </header>

        {/* --- CONTENT --- */}
        <div className="prose prose-lg max-w-none text-left mt-12">
          <div
            className="font-serif text-[20px] text-[#242424] leading-[1.8] tracking-wide text-left [&>p]:mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

      </article>
    </main>
  );
}
