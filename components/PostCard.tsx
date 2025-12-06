
import Link from 'next/link'

export default function PostCard({ post }: { post: any }) {
  return (
    <article className="border-b border-[#f2f2f2] pb-6">
      <div className="text-xs text-[#6b6b6b] mb-2">
        <Link
          href={`/users/${post.authorId}`}
          className="hover:underline font-medium text-[#242424]"
        >
          {post.author?.name ?? 'Unknown'}
        </Link>{' '}
        · {new Date(post.createdAt).toLocaleDateString()}
      </div>

    
      <Link
        href={`/posts/${encodeURIComponent(post.slug)}`}
        className="block group"
      >
        <h2 className="text-xl font-semibold leading-snug group-hover:underline">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-1 text-sm text-[#6b6b6b]">
            {post.excerpt.length > 140
              ? post.excerpt.slice(0, 140) + '…'
              : post.excerpt}
          </p>
        )}
      </Link>

      <div className="mt-3 flex items-center gap-3 text-xs text-[#6b6b6b]">
        <span>{Math.max(1, Math.round(post.content.length / 800))} min read</span>
        <span>·</span>
        <button className="hover:text-black">Save</button>
      </div>
    </article>
  )
}
