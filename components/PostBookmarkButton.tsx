// components/PostBookmarkButton.tsx
"use client";

import { useState, MouseEvent } from "react";

type PostBookmarkButtonProps = {
  postId: string;
  initialIsSaved: boolean;
};

export default function PostBookmarkButton({
  postId,
  initialIsSaved,
}: PostBookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [saving, setSaving] = useState(false);

  async function handleToggleSave(e: MouseEvent<HTMLButtonElement>) {
    // don’t scroll / click links etc
    e.preventDefault();
    e.stopPropagation();

    if (saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) throw new Error("Failed to toggle bookmark");

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
    <button
      type="button"
      onClick={handleToggleSave}
      aria-label={tooltip}
      title={tooltip}
      disabled={saving}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-[#e6e6e6] bg-white hover:bg-[#f2f2f2] transition ${
        saving ? "opacity-60 cursor-default" : ""
      }`}
    >
      {/* same bookmark icon style as PostCard */}
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17l-7-4-7 4V4z"
          fill={isSaved ? "#000" : "none"}
          stroke="#000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
