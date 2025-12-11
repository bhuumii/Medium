"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PublishPostButtonProps = {
  postId: string;
  postSlug: string;
};

export default function PublishPostButton({
  postId,
  postSlug,
}: PublishPostButtonProps) {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);

  async function handlePublish() {
    setIsPublishing(true);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to publish post");
        setIsPublishing(false);
        return;
      }

      // Success - redirect to published post
      router.push(`/posts/${postSlug}`);
      router.refresh();
    } catch (error) {
      console.error("Error publishing post:", error);
      alert("Error publishing post");
      setIsPublishing(false);
    }
  }

  return (
    <button
      onClick={handlePublish}
      disabled={isPublishing}
      className="inline-flex items-center justify-center px-10 py-[10px] text-[14px] text-white bg-[#10b981] border border-[#10b981] rounded-full hover:bg-[#059669] hover:border-[#059669] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[95px]"
>
      {isPublishing ? "Publishing..." : "Publish"}
    </button>
  );
}
