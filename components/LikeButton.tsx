'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type LikeButtonProps = {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  size?: 'small' | 'large';
};

export default function LikeButton({ 
  postId, 
  initialLiked, 
  initialLikeCount,
  size = 'small'
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);

    try {
      const method = liked ? 'DELETE' : 'POST';
      const res = await fetch(`/api/posts/${postId}/like`, { method });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update like');
      }

      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
      router.refresh();
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      style={{
        background: 'none',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        opacity: loading ? 0.5 : 1,
      }}
      title={liked ? 'Unlike' : 'Like'}
    >
      {/* Heart SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={liked ? '#ef4444' : 'none'}
        stroke={liked ? '#ef4444' : '#6b7280'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'all 0.2s',
          transform: liked ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      
      {/* Like count */}
      {likeCount > 0 && (
        <span
          style={{
            fontSize: '14px',
            color: liked ? '#ef4444' : '#6b7280',
            fontWeight: liked ? '500' : '400',
          }}
        >
          {likeCount}
        </span>
      )}
    </button>
  );
}
