
'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Editor() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Please add a title.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, excerpt, content }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Failed to create post')
      }

      const created = await res.json()
      router.push(`/posts/${encodeURIComponent(created.slug)}`)
    } catch (err: any) {
      setError(err?.message || 'An error occurred')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handlePublish} className="space-y-4">
      <div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short excerpt"
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-1 text-sm">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full p-3 border rounded font-sans"
          placeholder="Write your story..."
        />
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div>
        <button type="submit" disabled={saving} className="btn">
          {saving ? 'Publishing…' : 'Publish'}
        </button>
      </div>
    </form>
  )
}
