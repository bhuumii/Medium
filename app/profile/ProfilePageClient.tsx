// app/profile/ProfilePageClient.tsx
"use client";

import { useState } from "react";
import ProfileAboutForm, {
  ProfileFormValues,
} from "@/components/profile/ProfileAboutForm";

type UserForProfile = {
  id: string;
  name: string | null;
  pronouns: string | null;
  shortBio: string | null;
  about: string | null;
};

type Props = {
  user: UserForProfile;
};

export default function ProfilePageClient({ user }: Props) {
  const [tab, setTab] = useState<"home" | "about">("home");

  const initialValues: ProfileFormValues = {
    name: user.name ?? "",
    pronouns: user.pronouns ?? "",
    shortBio: user.shortBio ?? "",
    about: user.about ?? "",
  };

  return (
    <div className="home-layout">
      <h1 className="text-4xl font-bold mb-6">
        {user.name || "Profile"}
      </h1>

      {/* Tabs */}
      <div className="tabs mb-6">
        <button
          type="button"
          className={`tab ${tab === "home" ? "active" : ""}`}
          onClick={() => setTab("home")}
        >
          Home
        </button>
        <button
          type="button"
          className={`tab ${tab === "about" ? "active" : ""}`}
          onClick={() => setTab("about")}
        >
          About
        </button>
      </div>

      {/* HOME TAB: reading list layout */}
      {tab === "home" && (
        <section>
          {/* Your reading-list card UI here */}
          <div className="border border-neutral-200 rounded-md bg-neutral-50 p-6">
            <p className="text-sm text-neutral-600 mb-2">Reading list</p>
            <p className="text-sm text-neutral-500">No stories</p>
          </div>
        </section>
      )}

      {/* ABOUT TAB: profile form */}
      {tab === "about" && (
        <section className="max-w-xl">
          <ProfileAboutForm
            userId={user.id}
            initialValues={initialValues}
          />
        </section>
      )}
    </div>
  );
}
