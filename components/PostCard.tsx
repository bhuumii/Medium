// components/PostCard.tsx
"use client"

import Link from "next/link"
import { formatDate } from "../lib/formatDate"

type PostCardProps = {
  post: {
    id: string
    title: string
    excerpt: string | null
    slug: string
    content?: string | null
    createdAt: Date
    author?: {
      name: string | null
    } | null
  }
}

export default function PostCard({ post }: PostCardProps) {
  const authorName = post.author?.name ?? "Unknown"
  const date = formatDate(post.createdAt)
  // Very rough read time – you can improve this later
  const readTime = "1 min read"

  return (
    <article className="post-card">
      <Link href={`/posts/${post.slug}`} className="post-card__inner">
        {/* LEFT SIDE: text */}
        <div className="post-card__text">
          <div className="post-card__meta">
            <span>{authorName}</span>
            <span className="dot">·</span>
            <span>{date}</span>
            <span className="dot">·</span>
            <span>{readTime}</span>
          </div>

          <h2 className="post-card__title">{post.title}</h2>

          {post.excerpt && (
            <p className="post-card__excerpt">{post.excerpt}</p>
          )}

          <div className="post-card__footer">
            <button
              type="button"
              className="post-card__save"
              onClick={(e) => e.preventDefault()} // don't navigate when clicking Save
            >
              Save
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: thumbnail placeholder (like Medium’s image) */}
        <div className="post-card__thumb" />
      </Link>
    </article>
  )
}
