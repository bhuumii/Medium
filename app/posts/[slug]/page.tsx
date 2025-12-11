import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatDate } from "../../../lib/formatDate";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/authOptions";
import PostBookmarkButton from "../../../components/PostBookmarkButton";
import DeletePostButtonInline from "../../../components/DeletePostButtonInline";
import PublishPostButton from "../../../components/PublishPostButton";
import EditPostButton from "../../../components/EditPostButton";
import LikeButton from "../../../components/LikeButton";  

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
    include: { 
      author: true,
      _count: {
        select: { likes: true }  
      },
      likes: session?.user?.id ? {
        where: { userId: session.user.id },  
        select: { id: true }
      } : false
    },
  });

  if (!post) return notFound();

 
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

  // Like data
  const isLiked = post.likes && Array.isArray(post.likes) ? post.likes.length > 0 : false;
  const likeCount = post._count.likes;

  const authorName = post.author?.name ?? "Unknown";

  //  Avatar Initial
  const initial = authorName.charAt(0).toUpperCase();

  const date = formatDate(post.publishedAt ?? post.createdAt);

  // Read Time Calculation
  const words = post.content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  const readTime = `${minutes} min read`;

  return (
    <main className="bg-white min-h-screen w-full font-sans text-left">
      <article className="max-w-[680px] mx-auto px-6 pt-12 pb-32 block text-left">
        
        
              {/* --- HEADER --- */}
        <header className="flex flex-col" style={{ marginBottom: '2rem' }}>

          {/* Author Actions */}
          {isAuthor && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'flex-end', 
              marginBottom: '2rem',
              gap: '12px'
            }}>
              {/* Publish Button - Only for Drafts */}
              {!post.isPublished && (
                <PublishPostButton
                  postId={post.id}
                  postSlug={post.slug}
                />
              )}
              
              {/* Edit Button */}
              <EditPostButton postSlug={post.slug} />
              
              {/* Delete Button */}
              <DeletePostButtonInline
                postId={post.id}
                postTitle={post.title}
                redirectTo="/stories"
              />
            </div>
          )}

          {/* TITLE */}
          <h1 
            style={{ 
              fontFamily: "Charter, Georgia, 'Times New Roman', serif",
              fontSize: '43px',
              fontWeight: '700',
              color: '#242424',
              lineHeight: '1.2',
              letterSpacing: '-0.02em',
              marginBottom: '8px'
            }}
          >
            {post.title}
          </h1>

          {/* SUBTITLE */}
          {post.excerpt && (
            <h2 
              style={{ 
                fontFamily: "Charter, Georgia, 'Times New Roman', serif",
                fontSize: '20px',
                color: '#6B6B6B',
                lineHeight: '1.4',
                fontWeight: '400',
                marginBottom: '24px'
              }}
            >
              {post.excerpt}
            </h2>
          )}

          {/* AUTHOR ROW */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            width: '100%',
            paddingTop: '8px'
          }}>

            {/* Left: Avatar + Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              
              {/* Avatar */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#ea580c',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '600',
                  flexShrink: 0
                }}
              >
                {initial}
              </div>

              {/* TEXT INFO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                
                {/* Name */}
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#242424' }}>
                  {authorName}
                </div>

                {/* Meta info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6B6B6B' }}>
                  <span>{readTime}</span>
                  <span>·</span>
                  <span>{date}</span>
                </div>

              </div>
            </div>

            {/* Right: Like + Bookmark Buttons */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              borderLeft: '1px solid #e5e5e5', 
              paddingLeft: '16px', 
              height: '32px' 
            }}>
              {/* Like Button */}
              <LikeButton
                postId={post.id}
                initialLiked={isLiked}
                initialLikeCount={likeCount}
                size="small"
              />

              {/* Bookmark Button */}
              <PostBookmarkButton
                postId={post.id}
                initialIsSaved={initialIsSaved}
              />
            </div>
            
          </div>

          {/* DIVIDER LINE */}
          <div style={{ 
            borderBottom: '1px solid #f2f2f2', 
            marginTop: '24px', 
            width: '100%' 
          }} />

        </header>

        {/* --- CONTENT --- */}
        <div className="prose prose-lg max-w-none text-left mt-10">
          <div
            className="post-content text-[20px] text-[#242424] leading-[1.8] text-left [&>p]:mb-7 [&>p]:font-serif [&_h2]:font-serif [&_h2]:text-[32px] [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-[1.3] [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#ddd] [&_blockquote]:my-6 [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#555] [&_blockquote]:font-serif [&_span.editor-comment]:bg-[#e8f3ff] [&_span.editor-comment]:rounded-full [&_span.editor-comment]:px-1.5 [&_a]:text-[#0066cc] [&_a]:underline hover:[&_a]:text-[#0052a3]"
            style={{ fontFamily: "Charter, Georgia, 'Times New Roman', serif" }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

      </article>
    </main>
  );
}
