"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/home", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/stories", label: "Stories" },
  { href: "/profile", label: "Profile" },
];

export default function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname();


  if (!open) return null;

  return (
    <aside className="sidebar">
      <ul>
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                style={
                  active
                    ? { fontWeight: 600, color: "#000000" }
                    : undefined
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
