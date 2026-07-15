"use client";

import { useState, useCallback } from "react";

interface TagEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
}

export default function TagEditor({ tags, onChange, placeholder = "Add new tag...", label }: TagEditorProps) {
  const [input, setInput] = useState("");

  const addTag = useCallback(() => {
    const val = input.trim();
    if (!val || tags.includes(val)) { setInput(""); return; }
    onChange([...tags, val]);
    setInput("");
  }, [input, tags, onChange]);

  const removeTag = useCallback((idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  }, [tags, onChange]);

  const moveTag = useCallback((from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= tags.length) return;
    const next = [...tags];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  }, [tags, onChange]);

  return (
    <div className="dash-field">
      {label && <label>{label}</label>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginBottom: ".5rem", minHeight: 32 }}>
        {tags.map((tag, i) => (
          <span key={`${tag}-${i}`} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: ".3rem .6rem", borderRadius: 100,
            background: "rgba(108,99,255,.1)", border: "1px solid var(--border)",
            fontFamily: "'Space Mono', monospace", fontSize: ".6rem", color: "var(--text)",
            letterSpacing: ".05em",
          }}>
            <span style={{ cursor: "default", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tag}</span>
            <button type="button" onClick={() => moveTag(i, -1)} disabled={i === 0}
              style={{ background: "none", border: "none", color: i === 0 ? "rgba(255,255,255,.15)" : "var(--accent2)", cursor: i === 0 ? "default" : "pointer", fontSize: ".55rem", padding: "0 2px", lineHeight: 1 }}>
              <i className="bi bi-chevron-up" />
            </button>
            <button type="button" onClick={() => moveTag(i, 1)} disabled={i === tags.length - 1}
              style={{ background: "none", border: "none", color: i === tags.length - 1 ? "rgba(255,255,255,.15)" : "var(--accent2)", cursor: i === tags.length - 1 ? "default" : "pointer", fontSize: ".55rem", padding: "0 2px", lineHeight: 1 }}>
              <i className="bi bi-chevron-down" />
            </button>
            <button type="button" onClick={() => removeTag(i)}
              style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: ".55rem", padding: "0 0 0 2px", lineHeight: 1 }}>
              <i className="bi bi-x-lg" />
            </button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: ".5rem" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
          style={{ flex: 1, padding: ".6rem .8rem", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", fontFamily: "'Outfit', sans-serif", fontSize: ".8rem", outline: "none" }} />
        <button type="button" onClick={addTag} className="dash-btn dash-btn-add" style={{ flexShrink: 0 }}>
          <i className="bi bi-plus-lg" /> Add
        </button>
      </div>
    </div>
  );
}
