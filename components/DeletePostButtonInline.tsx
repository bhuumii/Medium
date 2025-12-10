// components/DeletePostButtonInline.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeletePostButtonInlineProps = {
  postId: string;
  postTitle: string;
  redirectTo?: string;
};

export default function DeletePostButtonInline({
  postId,
  postTitle,
  redirectTo = "/stories",
}: DeletePostButtonInlineProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${postTitle}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete post");
        setIsDeleting(false);
        return;
      }

      // Success - redirect
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post");
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
     className="inline-flex items-center justify-center px-10 py-[10px] text-[14px] text-white bg-[#9CA3AF] border border-[#9CA3AF] rounded-full hover:bg-[#6B7280] hover:border-[#6B7280] transition-all font-normal disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[95px]"
>
      {isDeleting ? "..." : "Delete"}
    </button>
  );
}
