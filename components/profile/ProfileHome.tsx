"use client";

type UserForProfileHome = {
  name: string | null;
};

export default function ProfileHome({ user }: { user: UserForProfileHome }) {
  const initial = (user.name ?? "U").charAt(0).toUpperCase();

  return (
    <section>
  
      <div className="border border-neutral-200 rounded-md overflow-hidden">
        {/* Header with avatar + name */}
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-700 border-b border-neutral-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f4511e] text-white text-sm font-semibold">
            {initial}
          </div>
          <span className="font-medium">{user.name}</span>
        </div>

        {/* Body */}
        <div className="px-4 py-4">
          <h2 className="font-semibold mb-1 text-lg">Reading list</h2>
          <p className="text-xs text-neutral-500">No stories</p>
        </div>
      </div>
    </section>
  );
}
