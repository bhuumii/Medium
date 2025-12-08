// components/UserMenu.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type UserMenuProps = {
  name?: string | null;
  image?: string | null;
};

export default function UserMenu({ name, image }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // close on outside click
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initial = name?.[0]?.toUpperCase() ?? "B"; // fallback initial

  return (
    <div ref={ref} className="relative">
      {/* red circle avatar button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-700 text-sm font-semibold text-white"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          {/* top part that looks like Medium's card */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-700 text-sm font-semibold text-white">
              {initial}
            </div>
            <div className="text-sm">
              <div className="font-semibold leading-tight">
                {name ?? "Your profile"}
              </div>
              <Link
                href="/profile?tab=about"
                className="text-xs text-green-700 hover:underline"
                onClick={() => setOpen(false)}
              >
                View profile
              </Link>
            </div>
          </div>

          {/* menu options */}
          <div className="py-1 text-sm">
            <Link
              href="/profile?tab=about"
              className="block px-4 py-2 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              View / edit profile
            </Link>

            <Link
              href="/settings/password"
              className="block px-4 py-2 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              Change password
            </Link>

            <button
              type="button"
              className="block w-full px-4 py-2 text-left hover:bg-gray-50"
              onClick={() => {
                setOpen(false);
                signOut(); // next-auth logout
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
