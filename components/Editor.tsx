// components/Editor.tsx
"use client";

import { FormEvent, useRef, useState, useEffect } from "react";
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
  color: "#333",
  cursor: "pointer",
  fontSize: "1rem",
  padding: "0.35rem 0.5rem",
  borderRadius: 4,
  transition: "background 0.2s",
};

const linkInputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "0.25rem",
  marginBottom: "0.5rem",
  padding: "0.3rem 0.4rem",
  borderRadius: 4,
  border: "1px solid #ddd",
  background: "#fff",
  color: "#333",
};

export default function Editor(props: EditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(props.initialTitle || "");
  const [excerpt, setExcerpt] = useState(props.initialExcerpt || "");
  const [isSaving, setIsSaving] = useState(false);

  const [lastSaved, setLastSaved] = useState<string>("");   // NEW
  const [autoSaving, setAutoSaving] = useState(false);      // NEW

  // HTML will live inside this contentEditable div
  const editorRef = useRef<HTMLDivElement | null>(null);

  // --- link dialog state ---
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const savedRangeRef = useRef<Range | null>(null);

  // Set initial content once when component mounts
  useEffect(() => {
    if (editorRef.current && props.initialContent && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = props.initialContent;
    }
  }, [props.initialContent]);

  // ------- NEW: auto-save draft helper -------
  async function autoSaveDraft() {
    if (autoSaving) return;

    const contentHtml = editorRef.current?.innerHTML ?? "";
    const currentContent = title + excerpt + contentHtml;

    // only save if there is a title and content changed
    if (!title.trim() || currentContent === lastSaved) return;

    setAutoSaving(true);

    try {
      if (props.postId) {
        // Update existing post as draft
        await fetch(`/api/posts/${props.postId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            excerpt,
            content: contentHtml,
            isPublished: false,
          }),
        });
      } else {
        // Create new draft
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            excerpt,
            content: contentHtml,
            isPublished: false,
          }),
        });

        if (res.ok) {
          const newPost = await res.json();
          // Move editor into edit mode for this draft
          window.history.replaceState({}, "", `/editor/${newPost.slug}`);
        }
      }

      setLastSaved(currentContent);
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      setAutoSaving(false);
    }
  }

  // ------- NEW: auto-save every 30s -------
  useEffect(() => {
    const interval = setInterval(() => {
      autoSaveDraft();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [title, excerpt, lastSaved, autoSaving]);

  // ------- NEW: save on window close -------
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    const contentHtml = editorRef.current?.innerHTML ?? "";
    const currentContent = title + excerpt + contentHtml;
    if (title.trim() && currentContent !== lastSaved) {
      e.preventDefault();
      e.returnValue = "";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [title, excerpt, lastSaved]);

  /* ---------------- toolbar helpers ---------------- */

  // normal execCommand helpers for bold / italic
  function applyCommand(cmd: string, value?: string) {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    document.execCommand(cmd, false, value ?? "");
    // Refocus the editor after command
    editorRef.current?.focus();
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
    
    editorRef.current?.focus();
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
    
    editorRef.current?.focus();
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
      editorRef.current?.focus();
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
    
    editorRef.current?.focus();
  }

  /* ---------------- link handling ---------------- */

  function openLinkDialog() {
    if (typeof window === "undefined") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      alert("Please select some text first");
      return;
    }
    
    const range = sel.getRangeAt(0);
    if (range.collapsed) {
      alert("Please select some text to add a link");
      return;
    }

    // save the range so we can restore it after user types in the dialog
    savedRangeRef.current = range.cloneRange();

    const selectedText = range.toString();
    setLinkText(selectedText);
    setLinkUrl("");
    setShowLinkDialog(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
  if (typeof window === "undefined") return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const node = range.commonAncestorContainer;
  const element = node instanceof HTMLElement ? node : node.parentElement;
  
  // Handle Backspace in blockquote
  if (e.key === "Backspace") {
    const blockquote = element?.closest("blockquote");
    
    if (blockquote) {
      // Check if cursor is at the start and blockquote is empty or nearly empty
      const text = blockquote.textContent?.trim() || "";
      const cursorAtStart = range.startOffset === 0;
      
      if (cursorAtStart || text === "") {
        e.preventDefault();
        document.execCommand("formatBlock", false, "p");
        return;
      }
    }
  }
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
      alert("Please provide both text and URL");
      setShowLinkDialog(false);
      return;
    }

    // Focus the editor first
    editorRef.current?.focus();

    const sel = window.getSelection();
    if (!sel) return;

    // Restore the saved selection
    sel.removeAllRanges();
    sel.addRange(savedRangeRef.current);

    // Create the link element
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.textContent = text;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.style.color = "#0066cc";
    anchor.style.textDecoration = "underline";

    try {
      // Delete the selected content
      savedRangeRef.current.deleteContents();
      
      // Insert the link
      savedRangeRef.current.insertNode(anchor);
      
      // Move cursor after the link
      savedRangeRef.current.setStartAfter(anchor);
      savedRangeRef.current.setEndAfter(anchor);
      savedRangeRef.current.collapse(true);
      
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    } catch (err) {
      console.error("Error inserting link:", err);
    }

    // cleanup dialog
    savedRangeRef.current = null;
    setShowLinkDialog(false);
    setLinkText("");
    setLinkUrl("");
    
    // Refocus editor
    setTimeout(() => {
      editorRef.current?.focus();
    }, 100);
  }

  function handleLinkCancel() {
    savedRangeRef.current = null;
    setShowLinkDialog(false);
    setLinkText("");
    setLinkUrl("");
    editorRef.current?.focus();
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
    <div className="editor-container" style={{ minHeight: "100vh", background: "#fff" }}>
      <form onSubmit={handlePublish} style={{ maxWidth: 800, margin: "0 auto", padding: "0 1.5rem", paddingBottom: "120px" }}>
        {/* Sticky top bar */}
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.5rem",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    background: "#fff",
    zIndex: 100,
    borderBottom: "1px solid #f0f0f0",
  }}
>
  {/* LEFT: logo + back underneath */}
  <div style={{ display: "flex", flexDirection: "column" }}>
    <div
      style={{
        fontSize: "1.75rem",
        fontFamily: "var(--font-serif, Georgia, 'Times New Roman', serif)",
        fontWeight: 400,
        letterSpacing: "-0.02em",
        color: "#000",
        lineHeight: 1,
      }}
    >
      Medium
    </div>

    <button
      type="button"
        onClick={async () => {
    await autoSaveDraft();      // <— ensure draft save
    router.push("/home");       // then go back
  }}
      style={{
        marginTop: "4px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
         color: "#000",        // solid black
    fontSize: "1.1rem",   // slightly bigger
    fontWeight: 700,   
        alignSelf: "flex-start",
      }}
    >
      {"< "}
    </button>
  </div>

  {/* RIGHT: keep your existing buttons block here unchanged */}
  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
    {/* Save as Draft + Publish buttons as you already have */}
  </div>


          
          {/* Buttons Container */}
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            {/* Save as Draft Button - Light Yellow */}
            <button
              type="button"
              onClick={handleDraft}
              disabled={isSaving}
              className="inline-flex items-center justify-center px-10 py-[10px] text-[14px] text-gray-800 bg-[#FEF3C7] border border-[#FEF3C7] rounded-full hover:bg-[#FDE68A] hover:border-[#FDE68A] transition-all font-normal disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[95px]"
            >
              Save as Draft
            </button>
            
            {/* Publish Button - Light Green */}
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center px-10 py-[10px] text-[14px] text-white bg-[#10b981] border border-[#10b981] rounded-full hover:bg-[#059669] hover:border-[#059669] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[95px]"
            >
              {isSaving ? "Saving..." : props.postId ? "Update" : "Publish"}
            </button>
          </div>
        </div>

        {/* Content area with top padding for fixed header */}
        <div style={{ paddingTop: "80px" }}>
          {/* title + excerpt inputs */}
                {/* title + excerpt inputs */}
          <div style={{ marginBottom: "2rem" }}>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: "2.75rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                fontFamily: "Charter, Georgia, 'Times New Roman', serif",
                letterSpacing: "-0.02em",
                color: "#242424",
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
                fontSize: "1.25rem",
                fontFamily: "Charter, Georgia, 'Times New Roman', serif",
                color: "#6B6B6B",
                lineHeight: 1.5,
              }}
            />
          </div>


          {/* main content editor */}
                    {/* main content editor */}
        <div
  ref={editorRef}
  contentEditable
  suppressContentEditableWarning
  onKeyDown={handleKeyDown}
  style={{
    minHeight: "60vh",
    outline: "none",
    fontSize: "1.25rem",
    lineHeight: 1.75,
    fontFamily: "Charter, Georgia, 'Times New Roman', serif",
    color: "#242424",
    letterSpacing: "-0.003em",
  }}
/>


        </div>
      </form>

      {/* Fixed COMPACT formatting toolbar at BOTTOM - GREY BACKGROUND */}
           {/* Fixed COMPACT formatting toolbar at BOTTOM - MUCH SMALLER */}
           {/* SUPER COMPACT toolbar at bottom */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          padding: "6px 10px",
          borderRadius: 20,
          background: "#f5f5f5",
          border: "1px solid #e0e0e0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          zIndex: 50,
        }}
      >
        <button
          type="button"
          onClick={() => applyCommand("bold")}
          style={{
            border: "none",
            background: "transparent",
            color: "#333",
            cursor: "pointer",
            fontSize: "14px",
            padding: "5px 10px",
            borderRadius: 4,
          }}
          title="Bold"
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e8e8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => applyCommand("italic")}
          style={{
            border: "none",
            background: "transparent",
            color: "#333",
            cursor: "pointer",
            fontSize: "14px",
            padding: "5px 10px",
            borderRadius: 4,
          }}
          title="Italic"
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e8e8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <em>i</em>
        </button>
        <button
          type="button"
          onClick={openLinkDialog}
          style={{
            border: "none",
            background: "transparent",
            color: "#333",
            cursor: "pointer",
            fontSize: "14px",
            padding: "5px 10px",
            borderRadius: 4,
          }}
          title="Insert link"
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e8e8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          🔗
        </button>
        <button
          type="button"
          onClick={toggleHeading}
          style={{
            border: "none",
            background: "transparent",
            color: "#333",
            cursor: "pointer",
            fontSize: "14px",
            padding: "5px 10px",
            borderRadius: 4,
          }}
          title="Big text"
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e8e8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <strong>T</strong>
        </button>
        <button
          type="button"
          onClick={toggleBlockQuote}
          style={{
            border: "none",
            background: "transparent",
            color: "#333",
            cursor: "pointer",
            fontSize: "15px",
            padding: "5px 10px",
            borderRadius: 4,
          }}
          title="Quote"
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e8e8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          "
        </button>
        <button
          type="button"
          onClick={() => toggleInlineSpan("editor-comment")}
          style={{
            border: "none",
            background: "transparent",
            color: "#333",
            cursor: "pointer",
            fontSize: "14px",
            padding: "5px 10px",
            borderRadius: 4,
          }}
          title="Highlight"
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e8e8e8")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          💬
        </button>
      </div>



      {/* link dialog */}
      {showLinkDialog && (
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            color: "#333",
            padding: "1rem 1.25rem",
            borderRadius: 8,
            boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
            border: "1px solid #e0e0e0",
            zIndex: 150,
            minWidth: 320,
          }}
        >
          <form onSubmit={handleLinkSubmit}>
            <div style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
              Insert link
            </div>
            <label style={{ fontSize: "0.85rem", display: "block", marginBottom: "0.5rem" }}>
              Text
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                style={linkInputStyle}
                autoFocus
              />
            </label>
            <label style={{ fontSize: "0.85rem", display: "block" }}>
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
                  border: "1px solid #ddd",
                  background: "#fff",
                  color: "#333",
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
           {/* styles */}
      <style jsx global>{`
        blockquote {
          border-left: 3px solid #ddd;
          margin: 0 0 1rem 0;
          padding-left: 1rem;
          font-style: italic;
          color: #555;
          font-family: Charter, Georgia, 'Times New Roman', serif;
        }
        span.editor-comment {
          background: #e8f3ff;
          border-radius: 999px;
          padding: 0 0.3rem;
        }
        h2 {
          font-family: Charter, Georgia, 'Times New Roman', serif;
          font-size: 2rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 1.5rem 0 1rem;
          color: #242424;
        }
        p {
          font-family: Charter, Georgia, 'Times New Roman', serif;
          font-size: 1.25rem;
          line-height: 1.75;
          color: #242424;
          margin-bottom: 1rem;
        }
      `}</style>

    </div>
  );
}
