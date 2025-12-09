// components/Editor.tsx
"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type EditorProps = {
  initialTitle?: string;
  initialExcerpt?: string;
  initialContent?: string;
  postId?: string;
};

// Define styles at the top level
const toolbarButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  fontSize: "0.95rem",
};

const linkInputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "0.25rem",
  marginBottom: "0.5rem",
  padding: "0.3rem 0.4rem",
  borderRadius: 4,
  border: "1px solid #555",
  background: "#111",
  color: "white",
};

export default function Editor(props: EditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(props.initialTitle || "");
  const [excerpt, setExcerpt] = useState(props.initialExcerpt || "");
  const [isSaving, setIsSaving] = useState(false);

  // HTML will live inside this contentEditable div
  const editorRef = useRef<HTMLDivElement | null>(null);

  // --- link dialog state ---
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const savedRangeRef = useRef<Range | null>(null);

  /* ---------------- toolbar helpers ---------------- */

  // normal execCommand helpers for bold / italic
  function applyCommand(cmd: string, value?: string) {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    document.execCommand(cmd, false, value ?? "");
  }

  // Toggle block size: normal paragraph <p> ↔ heading <h2>
  function toggleHeading() {
    if (typeof window === "undefined") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const element =
      node instanceof HTMLElement ? node : (node.parentElement as HTMLElement | null);

    const inHeading = element?.closest("h2");

    if (inHeading) {
      document.execCommand("formatBlock", false, "p");
    } else {
      document.execCommand("formatBlock", false, "h2");
    }
  }

  // NEW: toggle blockquote for the " icon
  function toggleBlockQuote() {
    if (typeof window === "undefined") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const element =
      node instanceof HTMLElement ? node : (node.parentElement as HTMLElement | null);

    const inBlockquote = element?.closest("blockquote");

    if (inBlockquote) {
      // turn back into normal paragraph
      document.execCommand("formatBlock", false, "p");
    } else {
      // make it a blockquote (slant line + italic via CSS)
      document.execCommand("formatBlock", false, "blockquote");
    }
  }

  // Generic toggle for inline <span class="...">
  function toggleInlineSpan(className: string) {
    if (typeof window === "undefined") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    const commonNode = range.commonAncestorContainer;
    const element =
      commonNode instanceof HTMLElement
        ? commonNode
        : (commonNode.parentElement as HTMLElement | null);

    const existingSpan = element?.closest("span." + className) as HTMLSpanElement | null;

    if (existingSpan) {
      // unwrap: replace the span with its children
      const parent = existingSpan.parentNode;
      if (!parent) return;
      while (existingSpan.firstChild) {
        parent.insertBefore(existingSpan.firstChild, existingSpan);
      }
      parent.removeChild(existingSpan);
      return;
    }

    // wrap selection in span
    const span = document.createElement("span");
    span.className = className;
    try {
      range.surroundContents(span);
    } catch {
      // if surroundContents fails (partial selection etc.), just skip gracefully
    }
  }

  /* ---------------- link handling ---------------- */

  function openLinkDialog() {
    if (typeof window === "undefined") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    // save the range so we can restore it after user types in the dialog
    savedRangeRef.current = range.cloneRange();

    const selectedText = sel.toString();
    setLinkText(selectedText);
    setLinkUrl("");
    setShowLinkDialog(true);
  }

  function handleLinkSubmit(e: FormEvent) {
    e.preventDefault();
    if (typeof window === "undefined") return;
    if (!savedRangeRef.current) {
      setShowLinkDialog(false);
      return;
    }

    const text = linkText.trim();
    const url = linkUrl.trim();
    if (!text || !url) {
      setShowLinkDialog(false);
      return;
    }

    const sel = window.getSelection();
    if (!sel) return;

    sel.removeAllRanges();
    sel.addRange(savedRangeRef.current);

    const range = sel.getRangeAt(0);

    // create <a> element to replace the selection
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.textContent = text;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    range.deleteContents();
    range.insertNode(anchor);

    // move caret after inserted link
    range.setStartAfter(anchor);
    range.setEndAfter(anchor);
    sel.removeAllRanges();
    sel.addRange(range);

    // cleanup dialog
    savedRangeRef.current = null;
    setShowLinkDialog(false);
    setLinkText("");
    setLinkUrl("");
  }

  function handleLinkCancel() {
    savedRangeRef.current = null;
    setShowLinkDialog(false);
    setLinkText("");
    setLinkUrl("");
  }

  /* ---------------- publish / update / draft ---------------- */

  async function handleSave(isPublished: boolean) {
    if (isSaving) return;
    
    const contentHtml = editorRef.current?.innerHTML ?? "";

    if (!title.trim()) {
      alert("Please add a title");
      return;
    }

    setIsSaving(true);

    try {
      // If we have a postId, UPDATE the post; otherwise CREATE new
      if (props.postId) {
        const res = await fetch(`/api/posts/${props.postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            excerpt,
            content: contentHtml,
            isPublished,
          }),
        });

        if (!res.ok) {
          console.error("Failed to update post");
          alert("Failed to update post");
          return;
        }

        const updatedPost = await res.json();
        
        // Redirect based on published status
        if (isPublished) {
          router.push(`/posts/${updatedPost.slug}`);
        } else {
          router.push("/stories?tab=drafts");
        }
      } else {
        // Create new post
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            excerpt,
            content: contentHtml,
            isPublished,
          }),
        });

        if (!res.ok) {
          console.error("Failed to save post");
          alert("Failed to save post");
          return;
        }

        const newPost = await res.json();

        // Redirect based on published status
        if (isPublished) {
          router.push(`/posts/${newPost.slug}`);
        } else {
          router.push("/stories?tab=drafts");
        }
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Error saving post");
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish(e: FormEvent) {
    e.preventDefault();
    await handleSave(true);
  }

  async function handleDraft(e: React.MouseEvent) {
    e.preventDefault();
    await handleSave(false);
  }

  /* ---------------- render ---------------- */

  return (
    <main className="editor-page">
      <form onSubmit={handlePublish} style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* top bar like Medium */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 0",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10,
          }}
        >
          <div style={{ fontSize: "1.3rem", fontWeight: 600 }}>Medium</div>
          
          {/* Buttons Container */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleDraft}
              disabled={isSaving}
              style={{
                borderRadius: 20,
                padding: "0.25rem 1rem",
                border: "1px solid #ddd",
                background: "white",
                color: "#242424",
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                borderRadius: 20,
                padding: "0.25rem 1rem",
                border: "none",
                background: "#1a8917",
                color: "white",
                cursor: isSaving ? "not-allowed" : "pointer",
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? "Saving..." : props.postId ? "Update" : "Publish"}
            </button>
          </div>
        </div>

        {/* fixed formatting toolbar */}
        <div
          className="editor-toolbar"
          style={{
            display: "inline-flex",
            gap: "0.5rem",
            padding: "0.35rem 0.6rem",
            borderRadius: 20,
            background: "#1a1a1a",
            color: "white",
            marginBottom: "1rem",
          }}
        >
          <button
            type="button"
            onClick={() => applyCommand("bold")}
            style={toolbarButtonStyle}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => applyCommand("italic")}
            style={toolbarButtonStyle}
          >
            <em>i</em>
          </button>
          <button
            type="button"
            onClick={openLinkDialog}
            style={toolbarButtonStyle}
            title="Insert link"
          >
            🔗
          </button>
          <button
            type="button"
            onClick={toggleHeading}
            style={toolbarButtonStyle}
            title="Big text"
          >
            T
          </button>
          <button
            type="button"
            onClick={toggleBlockQuote}
            style={toolbarButtonStyle}
            title="Quote"
          >
            "
          </button>
          <button
            type="button"
            onClick={() => toggleInlineSpan("editor-comment")}
            style={toolbarButtonStyle}
            title="Highlight"
          >
            💬
          </button>
        </div>

        {/* title + excerpt inputs */}
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "2.5rem",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}
          />
          <input
            type="text"
            placeholder="Short excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              color: "#666",
            }}
          />
        </div>

        {/* main content editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: props.initialContent || "" }}
          style={{
            minHeight: "50vh",
            outline: "none",
            fontSize: "1.1rem",
            lineHeight: 1.7,
          }}
        />
      </form>

      {/* small inline link dialog */}
      {showLinkDialog && (
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#222",
            color: "white",
            padding: "1rem 1.25rem",
            borderRadius: 8,
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
            zIndex: 50,
            minWidth: 320,
          }}
        >
          <form onSubmit={handleLinkSubmit}>
            <div style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
              Insert link
            </div>
            <label style={{ fontSize: "0.85rem" }}>
              Text
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                style={linkInputStyle}
              />
            </label>
            <label style={{ fontSize: "0.85rem" }}>
              URL
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                style={linkInputStyle}
              />
            </label>
            <div
              style={{
                marginTop: "0.75rem",
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}
            >
              <button
                type="button"
                onClick={handleLinkCancel}
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: 16,
                  border: "none",
                  background: "#444",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "0.25rem 0.9rem",
                  borderRadius: 16,
                  border: "none",
                  background: "#1a8917",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>
          </form>
        </div>
      )}

      {/* styles */}
      <style jsx global>{`
        blockquote {
          border-left: 3px solid #ddd;
          margin: 0 0 1rem 0;
          padding-left: 1rem;
          font-style: italic;
          color: #555;
        }
        span.editor-comment {
          background: #e8f3ff;
          border-radius: 999px;
          padding: 0 0.3rem;
        }
      `}</style>
    </main>
  );
}
