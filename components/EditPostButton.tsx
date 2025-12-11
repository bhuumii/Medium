"use client";

import Link from "next/link";

type EditPostButtonProps = {
  postSlug: string;
};

export default function EditPostButton({ postSlug }: EditPostButtonProps) {
  return (
    <Link
      href={`/editor/${postSlug}`}
      className="inline-flex items-center justify-center px-10 py-[10px] text-[14px] text-white bg-[#BFDBFE] border border-[#BFDBFE] rounded-full hover:bg-[#93C5FD] hover:border-[#93C5FD] transition-all font-normal whitespace-nowrap no-underline min-w-[95px]"
    >
      Edit
    </Link>
  );
}
