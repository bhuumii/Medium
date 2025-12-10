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

  const initial = name?.[0]?.toUpperCase() ?? "U";

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600 text-sm font-medium text-white hover:bg-orange-700 transition-colors"
        aria-label="User menu"
      >
        {initial}
      </button>

      {open && (
        <div 
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-md bg-white shadow-xl border border-gray-200"
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          {/* Top card with avatar and name */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-base font-medium text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 truncate">
                {name ?? "User"}
              </div>
              <Link
                href="/profile"
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setOpen(false)}
              >
                View profile
              </Link>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <Link
              href="/profile"
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              View / Edit profile
            </Link>

            <Link
              href="/password"
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              Change password
            </Link>

            <div className="border-t border-gray-100 my-2" />

            <button
              type="button"
              className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
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
