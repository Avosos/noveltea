"use client";

import React, { useState } from "react";
import { Plus, GripVertical, Trash2, ChevronDown, ChevronRight, Edit3, BookOpen } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import type { Chapter } from "@/types";

export default function ChaptersView() {
  const {
    chapters, story, addChapter, deleteChapter, selectChapter, selectScene,
    addScene, deleteScene, updateChapter, wordCount,
  } = useNovelTeaStore();

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [titleValue, setTitleValue] = useState("");

  const toggleExpand = (id: string) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startEditTitle = (ch: Chapter) => {
    setEditingTitle(ch.id);
    setTitleValue(ch.title);
  };

  const saveTitle = (ch: Chapter) => {
    if (titleValue.trim()) {
      updateChapter({ ...ch, title: titleValue.trim() });
    }
    setEditingTitle(null);
  };

  // Group by act
  const acts = story?.acts || [];

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              Chapters & Scenes
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {chapters.length} chapters · {chapters.reduce((a, c) => a + c.scenes.length, 0)} scenes · {wordCount.total.toLocaleString()} words
            </p>
          </div>
          <button className="btn-primary" onClick={() => addChapter()} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> New Chapter
          </button>
        </div>

        {/* Structure view with acts */}
        {acts.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {acts.map((act, i) => {
              const actChapters = chapters.filter((c) => c.act === i + 1);
              const actWords = actChapters.reduce((sum, c) => sum + (wordCount.byChapter[c.id] || 0), 0);
              return (
                <div
                  key={act.id}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    {act.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {actChapters.length} chapter{actChapters.length !== 1 ? "s" : ""} · {actWords.toLocaleString()} words
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chapter list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {chapters.map((ch, idx) => {
            const expanded = expandedChapters[ch.id] ?? false;
            const chWords = wordCount.byChapter[ch.id] || 0;

            return (
              <div key={ch.id} className="card" style={{ overflow: "hidden" }}>
                {/* Chapter header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "12px 16px",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleExpand(ch.id)}
                >
                  <GripVertical size={14} style={{ color: "var(--text-dim)", cursor: "grab", flexShrink: 0 }} />
                  {expanded ? <ChevronDown size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />}

                  {editingTitle === ch.id ? (
                    <input
                      className="input"
                      style={{ padding: "2px 8px", fontSize: 14, fontWeight: 600, flex: 1 }}
                      value={titleValue}
                      onChange={(e) => setTitleValue(e.target.value)}
                      onBlur={() => saveTitle(ch)}
                      onKeyDown={(e) => e.key === "Enter" && saveTitle(ch)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span
                      style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}
                      onDoubleClick={(e) => { e.stopPropagation(); startEditTitle(ch); }}
                    >
                      {ch.title}
                    </span>
                  )}

                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{ch.scenes.length} scene{ch.scenes.length !== 1 ? "s" : ""}</span>
                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{chWords.toLocaleString()} words</span>
                  <span className="badge" style={{ fontSize: 10 }}>Act {ch.act}</span>

                  <button
                    className="btn-ghost"
                    style={{ padding: 4 }}
                    onClick={(e) => { e.stopPropagation(); selectChapter(ch.id); }}
                    title="Open in editor"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    className="btn-ghost"
                    style={{ padding: 4, color: "var(--error)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${ch.title}"?`)) deleteChapter(ch.id);
                    }}
                    title="Delete chapter"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Scenes list */}
                {expanded && (
                  <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "8px 16px 12px 44px" }}>
                    {ch.scenes.map((scene) => (
                      <div
                        key={scene.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          transition: "background 0.1s",
                        }}
                        onClick={() => selectScene(ch.id, scene.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <BookOpen size={12} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1 }}>{scene.title}</span>
                        {scene.pov && <span style={{ fontSize: 10, color: "var(--text-dim)" }}>POV</span>}
                        <TensionDot level={scene.tensionLevel} />
                        <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                          {(scene.content || "").trim().split(/\s+/).filter(Boolean).length}w
                        </span>
                        <button
                          className="btn-ghost"
                          style={{ padding: 2, color: "var(--error)" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (ch.scenes.length > 1 && confirm(`Delete "${scene.title}"?`)) {
                              deleteScene(ch.id, scene.id);
                            }
                          }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addScene(ch.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 10px",
                        background: "transparent",
                        border: "none",
                        color: "var(--text-dim)",
                        fontSize: 11,
                        cursor: "pointer",
                        borderRadius: 4,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
                    >
                      <Plus size={10} /> Add Scene
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TensionDot({ level }: { level: number }) {
  const color = level <= 3 ? "var(--success)" : level <= 6 ? "var(--warning)" : "var(--error)";
  return (
    <span
      title={`Tension: ${level}/10`}
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}
