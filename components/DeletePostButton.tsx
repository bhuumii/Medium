"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeletePostButtonProps = {
  postId: string;
  postTitle: string;
  variant?: "icon" | "button";
  redirectTo?: string;
};

export default function DeletePostButton({
  postId,
  postTitle,
  variant = "button",
  redirectTo = "/stories",
}: DeletePostButtonProps) {
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

      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post");
      setIsDeleting(false);
    }
  }

  if (variant === "icon") {

    return (
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="relative group/delete flex flex-col items-center gap-1 border-none outline-none bg-transparent p-0"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#F2F2F2] transition-colors">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#6B6B6B] group-hover/delete:text-[#242424] transition-colors"
          >
            <path
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[11px] text-[#6B6B6B] whitespace-nowrap opacity-0 group-hover/delete:opacity-100 transition-opacity">
          {isDeleting ? "..." : "Delete"}
        </span>
      </button>
    );
  }


  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-[13px] text-[#6B6B6B] hover:text-[#242424] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-normal"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}