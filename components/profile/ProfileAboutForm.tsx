"use client";

import { useState } from "react";

export type ProfileFormValues = {
  name: string;
  pronouns: string;
  shortBio: string;
  about: string;
};

type Props = {
  userId: string;
  initialValues: ProfileFormValues;
};

export default function ProfileAboutForm({ userId, initialValues }: Props) {
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...values }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save profile");
      }

      setMessage("Profile saved");
    } catch (err: any) {
      console.error(err);
      setMessage(err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={50}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
          value={values.name}
          onChange={handleChange}
        />
        <p className="text-xs text-neutral-500">
          {values.name.length}/50
        </p>
      </div>

      {/* Pronouns */}
      <div>
        <label htmlFor="pronouns" className="block text-sm font-medium mb-1">
          Pronouns
        </label>
        <input
          id="pronouns"
          name="pronouns"
          type="text"
          maxLength={4}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
          value={values.pronouns}
          onChange={handleChange}
        />
        <p className="text-xs text-neutral-500">
          {values.pronouns.length}/4
        </p>
      </div>

      {/* Short bio */}
      <div>
        <label htmlFor="shortBio" className="block text-sm font-medium mb-1">
          Short bio
        </label>
        <textarea
          id="shortBio"
          name="shortBio"
          rows={3}
          maxLength={160}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
          value={values.shortBio}
          onChange={handleChange}
        />
        <p className="text-xs text-neutral-500">
          {values.shortBio.length}/160
        </p>
      </div>

      {/* About */}
      <div>
        <label htmlFor="about" className="block text-sm font-medium mb-1">
          About page
        </label>
        <textarea
          id="about"
          name="about"
          rows={5}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
          value={values.about}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center rounded-full border border-black px-4 py-2 text-sm font-medium"
      >
        {saving ? "Saving..." : "Save"}
      </button>

      {message && (
        <p className="text-xs text-green-600 pt-1">{message}</p>
      )}
    </form>
  );
}
