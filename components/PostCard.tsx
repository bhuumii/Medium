"use client";

import Link from "next/link";
import { useState, MouseEvent } from "react";
import { formatDate } from "../lib/formatDate";
import LikeButton from "./LikeButton";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    excerpt: string | null;
    slug: string;
    content?: string | null;
    createdAt: Date;
    author?: {
      name: string | null;
    } | null;
    isLiked: boolean;
    likeCount: number;
    readTime: string;  
  };
  initialIsSaved: boolean;
};

export default function PostCard({ post, initialIsSaved }: PostCardProps) {
  const authorName = post.author?.name ?? "Unknown";
  const date = formatDate(post.createdAt);
  const readTime = post.readTime; 

  const [isSaved, setIsSaved] = useState<boolean>(initialIsSaved);
  const [saving, setSaving] = useState(false);

  async function handleToggleSave(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle bookmark");
      }

      const data = (await res.json()) as { saved: boolean };
      setIsSaved(data.saved);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const tooltip = isSaved ? "Click to unsave" : "Click to save";

  return (
    <article className="post-card">
      <Link href={`/posts/${post.slug}`} className="post-card__inner">
        <div className="post-card__text" style={{ width: '100%' }}>
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

          <div 
            className="post-card__footer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '8px'
            }}
          >
            <LikeButton
              postId={post.id}
              initialLiked={post.isLiked}
              initialLikeCount={post.likeCount}
              size="small"
            />

            <button
              type="button"
              className={`post-card__bookmark ${isSaved ? "post-card__bookmark--saved" : ""}`}
              onClick={handleToggleSave}
              aria-label={tooltip}
              title={tooltip}
              disabled={saving}
              style={{
                background: 'none',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                padding: '4px',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17l-7-4-7 4V4z"
                  fill={isSaved ? "#000" : "none"}
                  stroke="#000"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}
