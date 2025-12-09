// app/profile/ProfilePageClient.tsx
"use client";

import { useState, FormEvent } from "react";

type User = {
  id: string;
  name: string | null;
  pronouns: string | null;
  shortBio: string | null;
  about: string | null;
};

interface ProfilePageClientProps {
  user: User;
}

export default function ProfilePageClient({ user }: ProfilePageClientProps) {
  const [mode, setMode] = useState<"summary" | "edit">("summary");

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "2rem 1rem" }}>
      {mode === "summary" ? (
        <AboutSummary user={user} onEdit={() => setMode("edit")} />
      ) : (
        <EditProfileForm user={user} onDone={() => setMode("summary")} />
      )}
    </div>
  );
}

/* ---------- About summary view ---------- */

function AboutSummary({
  user,
  onEdit,
}: {
  user: User;
  onEdit: () => void;
}) {
  const initial = (user.name || "U").charAt(0).toUpperCase();

  return (
    <section>
      {/* Avatar + name + short bio */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "#c63d0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            color: "white",
            fontWeight: 600,
          }}
        >
          {initial}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
            {user.name || "Your name"}
          </div>
          <div style={{ color: "#555", marginTop: "0.25rem" }}>
            {user.shortBio || "Add a short bio…"}
          </div>
        </div>
      </div>

      {/* Edit link */}
      <button
        type="button"
        onClick={onEdit}
        style={{
          marginTop: "1rem",
          padding: 0,
          border: "none",
          background: "none",
          color: "#1a8917",
          cursor: "pointer",
          fontSize: "0.95rem",
        }}
      >
        Edit profile
      </button>

      {/* Full about text (optional) */}
      {user.about && (
        <div style={{ marginTop: "2rem", whiteSpace: "pre-wrap" }}>
          {user.about}
        </div>
      )}
    </section>
  );
}

/* ---------- Edit profile form ---------- */

function EditProfileForm({
  user,
  onDone,
}: {
  user: User;
  onDone: () => void;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [pronouns, setPronouns] = useState(user.pronouns ?? "");
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
          userId: user.id,
          name,
          pronouns,
          shortBio,
          about,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setStatus("saved");
      onDone();
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Name */}
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <div style={{ marginBottom: "0.25rem" }}>Name</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          style={{ width: "100%", padding: "0.4rem" }}
        />
        <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.15rem" }}>
          {name.length}/50
        </div>
      </label>

      {/* Pronouns */}
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <div style={{ marginBottom: "0.25rem" }}>Pronouns</div>
        <input
          value={pronouns}
          onChange={(e) => setPronouns(e.target.value)}
          maxLength={4}
          style={{ width: "100%", padding: "0.4rem" }}
        />
        <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.15rem" }}>
          {pronouns.length}/4
        </div>
      </label>

      {/* Short bio */}
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <div style={{ marginBottom: "0.25rem" }}>Short bio</div>
        <textarea
          value={shortBio}
          onChange={(e) => setShortBio(e.target.value)}
          maxLength={160}
          rows={3}
          style={{ width: "100%", padding: "0.4rem" }}
        />
        <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.15rem" }}>
          {shortBio.length}/160
        </div>
      </label>

      {/* About page */}
      <label style={{ display: "block", marginBottom: "1.25rem" }}>
        <div style={{ marginBottom: "0.25rem" }}>About page</div>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={6}
          style={{ width: "100%", padding: "0.4rem" }}
        />
      </label>

      <button type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Saving..." : "Save"}
      </button>

      {status === "saved" && (
        <span style={{ marginLeft: "0.75rem", color: "#1a8917" }}>
          Profile saved
        </span>
      )}
      {status === "error" && (
        <span style={{ marginLeft: "0.75rem", color: "red" }}>
          Failed to save
        </span>
      )}
    </form>
  );
}
