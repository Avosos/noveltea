"use client";

import React, { useState, useMemo } from "react";
import { BookMarked, Plus, Trash2, Edit3, Copy, ExternalLink, FileText, Search } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import type { Source, Footnote } from "@/types";

/* ═══════════════════════════════════════════════════════════
 * SourcesView — Citavi-like citation & research management
 * CRUD for sources with footnotes linked to chapters/scenes
 * ═══════════════════════════════════════════════════════════ */

const SOURCE_TYPES: Source["type"][] = ["book", "article", "website", "journal", "other"];

export default function SourcesView() {
  const { sources, footnotes, chapters, addSource, updateSource, deleteSource, addFootnote, updateFootnote, deleteFootnote, settings } = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [showNewSourceForm, setShowNewSourceForm] = useState(false);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return sources;
    const q = search.toLowerCase();
    return sources.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q) ||
        (s.notes || "").toLowerCase().includes(q)
    );
  }, [sources, search]);

  const getFootnotesForSource = (sourceId: string) => footnotes.filter((f) => f.sourceId === sourceId);

  const formatReference = (src: Source) => {
    let ref = src.author ? `${src.author}` : "";
    if (src.year) ref += ` (${src.year})`;
    if (src.title) ref += ref ? `. ${src.title}` : src.title;
    if (src.publisher) ref += `. ${src.publisher}`;
    if (src.pages) ref += `, S. ${src.pages}`;
    if (src.url) ref += `. ${src.url}`;
    return ref || src.title;
  };

  const copyReference = (src: Source) => {
    navigator.clipboard.writeText(formatReference(src));
    showToast(t.sources.copyReference + " ✓", "success");
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <BookMarked size={18} style={{ color: "var(--primary)" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>{t.sources.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20 }}>{t.sources.subtitle}</p>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
            <input className="input" style={{ width: "100%", paddingLeft: 30 }} placeholder={t.sources.searchSources} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={() => setShowNewSourceForm(true)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={14} /> {t.sources.addSource}
          </button>
        </div>

        {/* New source form */}
        {showNewSourceForm && (
          <SourceForm
            t={t}
            chapters={chapters}
            onSave={(src) => {
              addSource(src);
              setShowNewSourceForm(false);
              showToast(t.common.saved, "success");
            }}
            onCancel={() => setShowNewSourceForm(false)}
          />
        )}

        {/* Edit source form */}
        {editingSource && (
          <SourceForm
            t={t}
            chapters={chapters}
            initial={editingSource}
            onSave={(src) => {
              updateSource({ ...editingSource, ...src, id: editingSource.id, createdAt: editingSource.createdAt } as Source);
              setEditingSource(null);
              showToast(t.common.saved, "success");
            }}
            onCancel={() => setEditingSource(null)}
          />
        )}

        {/* Source list */}
        {filtered.length === 0 && !showNewSourceForm ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>
            <BookMarked size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>{t.sources.noSources}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((src) => {
              const srcFootnotes = getFootnotesForSource(src.id);
              const isExpanded = expandedSourceId === src.id;
              return (
                <div
                  key={src.id}
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                  }}
                >
                  {/* Source header */}
                  <div
                    style={{ padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}
                    onClick={() => setExpandedSourceId(isExpanded ? null : src.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{src.title || "Untitled"}</div>
                      <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                        {src.author}{src.year ? ` (${src.year})` : ""} · <span className="badge" style={{ fontSize: 10 }}>{t.sources[src.type as keyof typeof t.sources] || src.type}</span>
                        {srcFootnotes.length > 0 && (
                          <span style={{ marginLeft: 8, color: "var(--primary)" }}>
                            {srcFootnotes.length} {t.sources.footnotes}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <button className="btn-ghost" style={{ padding: 4 }} onClick={(e) => { e.stopPropagation(); copyReference(src); }} title={t.sources.copyReference}>
                        <Copy size={13} />
                      </button>
                      <button className="btn-ghost" style={{ padding: 4 }} onClick={(e) => { e.stopPropagation(); setEditingSource(src); }} title={t.common.edit}>
                        <Edit3 size={13} />
                      </button>
                      {src.url && (
                        <button className="btn-ghost" style={{ padding: 4 }} onClick={(e) => { e.stopPropagation(); window.electronAPI?.openExternal(src.url!); }} title="URL">
                          <ExternalLink size={13} />
                        </button>
                      )}
                      <button className="btn-ghost" style={{ padding: 4, color: "var(--error)" }} onClick={(e) => { e.stopPropagation(); deleteSource(src.id); }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded: notes + footnotes */}
                  {isExpanded && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
                      {src.notes && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, marginBottom: 8, lineHeight: 1.5 }}>
                          {src.notes}
                        </div>
                      )}
                      <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-dim)" }}>
                        <strong>{t.sources.footnotes}</strong>
                      </div>
                      {srcFootnotes.map((fn) => (
                        <div key={fn.id} style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, padding: "6px 8px", background: "var(--bg-hover)", borderRadius: "var(--radius-sm)" }}>
                          <FileText size={12} style={{ flexShrink: 0, color: "var(--text-dim)" }} />
                          <span style={{ flex: 1, fontSize: 12 }}>{fn.text}</span>
                          {fn.chapterId && (
                            <span className="badge" style={{ fontSize: 10 }}>
                              {chapters.find((c) => c.id === fn.chapterId)?.title || fn.chapterId}
                            </span>
                          )}
                          <button className="btn-ghost" style={{ padding: 2, color: "var(--error)" }} onClick={() => deleteFootnote(fn.id)}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                      <NewFootnoteInline sourceId={src.id} chapters={chapters} addFootnote={addFootnote} t={t} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Source form ─────────────────────────────────────────── */
function SourceForm({
  t,
  chapters,
  initial,
  onSave,
  onCancel,
}: {
  t: ReturnType<typeof getTranslations>;
  chapters: { id: string; title: string }[];
  initial?: Source;
  onSave: (src: Omit<Source, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [author, setAuthor] = useState(initial?.author || "");
  const [year, setYear] = useState(initial?.year || "");
  const [url, setUrl] = useState(initial?.url || "");
  const [publisher, setPublisher] = useState(initial?.publisher || "");
  const [pages, setPages] = useState(initial?.pages || "");
  const [type, setType] = useState<Source["type"]>(initial?.type || "book");
  const [notes, setNotes] = useState(initial?.notes || "");

  const submit = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), author: author.trim(), year: year.trim(), url: url.trim() || undefined, publisher: publisher.trim() || undefined, pages: pages.trim() || undefined, type, notes: notes.trim() || undefined });
  };

  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 3 }}>{t.sources.sourceTitle}</label>
          <input className="input" style={{ width: "100%" }} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 3 }}>{t.sources.author}</label>
          <input className="input" style={{ width: "100%" }} value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 3 }}>{t.sources.year}</label>
          <input className="input" style={{ width: "100%" }} value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 3 }}>{t.sources.type}</label>
          <select className="input" style={{ width: "100%" }} value={type} onChange={(e) => setType(e.target.value as Source["type"])}>
            {SOURCE_TYPES.map((st) => <option key={st} value={st}>{t.sources[st as keyof typeof t.sources] || st}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 3 }}>{t.sources.publisher}</label>
          <input className="input" style={{ width: "100%" }} value={publisher} onChange={(e) => setPublisher(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 3 }}>{t.sources.pages}</label>
          <input className="input" style={{ width: "100%" }} value={pages} onChange={(e) => setPages(e.target.value)} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 3 }}>{t.sources.url}</label>
          <input className="input" style={{ width: "100%" }} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 3 }}>{t.sources.notes}</label>
          <textarea className="input" style={{ width: "100%", minHeight: 60, resize: "vertical" }} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button className="btn-ghost" onClick={onCancel}>{t.common.cancel}</button>
        <button className="btn-primary" onClick={submit}>{t.common.save}</button>
      </div>
    </div>
  );
}

/* ─── Inline footnote adder ──────────────────────────────── */
function NewFootnoteInline({
  sourceId,
  chapters,
  addFootnote,
  t,
}: {
  sourceId: string;
  chapters: { id: string; title: string }[];
  addFootnote: (fn: Omit<Footnote, "id" | "createdAt">) => void;
  t: ReturnType<typeof getTranslations>;
}) {
  const [text, setText] = useState("");
  const [chapterId, setChapterId] = useState("");

  const submit = () => {
    if (!text.trim()) return;
    addFootnote({ sourceId, text: text.trim(), chapterId: chapterId || undefined });
    setText("");
    setChapterId("");
  };

  return (
    <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
      <input
        className="input"
        style={{ flex: 1 }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={t.sources.footnoteText}
      />
      <select className="input" style={{ width: 140 }} value={chapterId} onChange={(e) => setChapterId(e.target.value)}>
        <option value="">{t.sources.linkedChapter}</option>
        {chapters.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
      </select>
      <button className="btn-ghost" onClick={submit}><Plus size={14} /></button>
    </div>
  );
}
