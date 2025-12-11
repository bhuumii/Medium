"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  shortBio: string | null;
  about: string | null;
  publishedPostsCount: number;
};

interface ProfilePageClientProps {
  user: User;
}

export default function ProfilePageClient({ user }: ProfilePageClientProps) {
  const [mode, setMode] = useState<"summary" | "edit">("summary");

  if (!user) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1rem", textAlign: "center" }}>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
  
    <div className="home-layout w-full mx-auto px-6" style={{ maxWidth: '1200px' }}>
      
    
      <div className="feed-header" style={{ paddingTop: "10px", paddingBottom: 0 }}>
        <h1
          className="text-[42px] font-bold text-[#242424] tracking-tight leading-tight mb-8 text-left"
          style={{ marginTop: 0 }}
        >
          Your Profile
        </h1>
      </div>

      {mode === "summary" ? (
        <AboutSummary user={user} onEdit={() => setMode("edit")} />
      ) : (
        <EditProfileForm user={user} onDone={() => setMode("summary")} />
      )}
    </div>
  );
}

/* About summary view */

function AboutSummary({
  user,
  onEdit,
}: {
  user: User;
  onEdit: () => void;
}) {
  if (!user) return null;

  const userName = user.name || "U";
  const initial = userName.charAt(0).toUpperCase();

  return (
    <section>
      {/* Avatar + name + short bio */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            backgroundColor: "#c63d0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            color: "white",
            fontWeight: 600,
            flexShrink: 0 
          }}
        >
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            {userName}
          </div>
          <div style={{ color: "#6B7280", fontSize: "0.95rem" }}>
            {user.shortBio || "Add a short bio…"}
          </div>
        </div>
      </div>

      {/* Edit profile button */}
      <button
        type="button"
        onClick={onEdit}
        style={{
          marginBottom: "2rem",
          padding: "8px 16px",
          border: "1px solid #1a8917",
          background: "white",
          color: "#1a8917",
          cursor: "pointer",
          fontSize: "0.95rem",
          borderRadius: "99px",
          fontWeight: 500,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f0fdf0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "white";
        }}
      >
        Edit profile
      </button>

      {/* Published Articles Card  */}
      <Link
        href="/stories?tab=published"
        style={{
          display: "block",
          padding: "1.5rem",
          backgroundColor: "#F9FAFB",
          borderRadius: "8px",
          border: "1px solid #E5E7EB",
          textDecoration: "none",
          transition: "all 0.2s",
          cursor: "pointer",
          marginBottom: "2rem",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#F3F4F6";
          e.currentTarget.style.borderColor = "#D1D5DB";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#F9FAFB";
          e.currentTarget.style.borderColor = "#E5E7EB";
        }}
      >
        <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "#000000", marginBottom: "0.25rem", textAlign: "center" }}>
          {user.publishedPostsCount || 0}
        </div>
        <div style={{ fontSize: "1rem", color: "#6B7280", fontWeight: 500, textAlign: "center" }}>
          Published {user.publishedPostsCount === 1 ? "Article" : "Articles"}
        </div>
      </Link>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #E5E7EB", marginBottom: "2rem" }} />

      {/* Full about text */}
      {user.about && (
        <div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem", color: "#111827" }}>
            About
          </h3>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", color: "#374151" }}>
            {user.about}
          </div>
        </div>
      )}

      {!user.about && (
        <div style={{ color: "#9CA3AF", fontStyle: "italic" }}>
          No bio added yet. Click "Edit profile" to add your about section.
        </div>
      )}
    </section>
  );
}

/* Edit profile form  */

function EditProfileForm({
  user,
  onDone,
}: {
  user: User;
  onDone: () => void;
}) {
  if (!user) return null;

  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [shortBio, setShortBio] = useState(user.shortBio ?? "");
  const [about, setAbout] = useState(user.about ?? "");

  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          shortBio,
          about,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setStatus("saved");
      
    
      router.refresh();
      
      setTimeout(() => {
        onDone();
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        Edit Profile
      </h2>

      {/* Email */}
      <label style={{ display: "block", marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
          Email
        </div>
        <input
          value={user.email || ""}
          readOnly
          disabled
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#F3F4F6",
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            fontSize: "0.95rem",
            color: "#6B7280",
            cursor: "not-allowed",
          }}
        />
        <div style={{ fontSize: "0.8rem", color: "#9CA3AF", marginTop: "0.25rem" }}>
          Email cannot be changed
        </div>
      </label>

      {/* Name */}
      <label style={{ display: "block", marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
          Name *
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          required
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            fontSize: "0.95rem",
          }}
        />
        <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "0.25rem" }}>
          {name.length}/50
        </div>
      </label>

      {/* Short bio */}
      <label style={{ display: "block", marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
          Short bio
        </div>
        <textarea
          value={shortBio}
          onChange={(e) => setShortBio(e.target.value)}
          maxLength={160}
          rows={3}
          placeholder="Tell readers about yourself in one line..."
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            fontSize: "0.95rem",
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
        <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "0.25rem" }}>
          {shortBio.length}/160
        </div>
      </label>

      {/* About page */}
      <label style={{ display: "block", marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
          About
        </div>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={8}
          placeholder="Tell your story. What do you write about? What are your interests?"
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #D1D5DB",
            borderRadius: "6px",
            fontSize: "0.95rem",
            fontFamily: "inherit",
            resize: "vertical",
            lineHeight: "1.6",
          }}
        />
      </label>

      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button
          type="submit"
          disabled={status === "saving"}
          style={{
            padding: "10px 24px",
            backgroundColor: "#1a8917",
            color: "white",
            border: "none",
            borderRadius: "99px",
            fontSize: "0.95rem",
            fontWeight: 500,
            cursor: status === "saving" ? "not-allowed" : "pointer",
            opacity: status === "saving" ? 0.7 : 1,
          }}
        >
          {status === "saving" ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={onDone}
          style={{
            padding: "10px 24px",
            backgroundColor: "white",
            color: "#374151",
            border: "1px solid #D1D5DB",
            borderRadius: "99px",
            fontSize: "0.95rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        {status === "saved" && (
          <span style={{ color: "#1a8917", fontSize: "0.9rem", fontWeight: 500 }}>
            ✓ Profile saved
          </span>
        )}
        {status === "error" && (
          <span style={{ color: "#DC2626", fontSize: "0.9rem", fontWeight: 500 }}>
            Failed to save
          </span>
        )}
      </div>
    </form>
  );
}