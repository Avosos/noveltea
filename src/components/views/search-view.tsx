"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Search as SearchIcon, FileText, User, MapPin, Building, Gem, ScrollText } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";

export default function SearchView() {
  const { chapters, entities, selectScene, selectEntity } = useNovelTeaStore();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return { scenes: [], entities: [] };
    const q = query.toLowerCase();

    const sceneResults: { chapterId: string; chapterTitle: string; sceneId: string; sceneTitle: string; snippet: string }[] = [];
    for (const ch of chapters) {
      for (const scene of ch.scenes) {
        const content = scene.content || "";
        const idx = content.toLowerCase().indexOf(q);
        if (idx !== -1 || scene.title.toLowerCase().includes(q)) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(content.length, idx + q.length + 40);
          sceneResults.push({
            chapterId: ch.id,
            chapterTitle: ch.title,
            sceneId: scene.id,
            sceneTitle: scene.title,
            snippet: idx >= 0 ? "..." + content.slice(start, end) + "..." : "",
          });
        }
      }
    }

    const entityResults = entities.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
    );

    return { scenes: sceneResults, entities: entityResults };
  }, [query, chapters, entities]);

  const totalResults = results.scenes.length + results.entities.length;

  const ENTITY_ICONS: Record<string, React.ReactNode> = {
    character: <User size={13} />,
    location: <MapPin size={13} />,
    organization: <Building size={13} />,
    artifact: <Gem size={13} />,
    lore: <ScrollText size={13} />,
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20 }}>Search</h1>

        <div style={{ position: "relative", marginBottom: 24 }}>
          <SearchIcon size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
          <input
            className="input"
            style={{ width: "100%", padding: "12px 16px 12px 42px", fontSize: 15 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scenes, entities, and tags..."
            autoFocus
          />
        </div>

        {query.trim() && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
            {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}

        {/* Scene results */}
        {results.scenes.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Scenes ({results.scenes.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {results.scenes.map((r) => (
                <div
                  key={r.sceneId}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onClick={() => selectScene(r.chapterId, r.sceneId)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <FileText size={13} style={{ color: "var(--accent)", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {r.sceneTitle}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>in {r.chapterTitle}</span>
                  </div>
                  {r.snippet && (
                    <HighlightedSnippet text={r.snippet} query={query} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Entity results */}
        {results.entities.length > 0 && (
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Entities ({results.entities.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {results.entities.map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: "var(--radius-sm)",
                    cursor: "pointer", transition: "background 0.1s",
                  }}
                  onClick={() => selectEntity(e.id)}
                  onMouseEnter={(ev) => (ev.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: "var(--text-muted)" }}>{ENTITY_ICONS[e.entityType]}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{e.name}</span>
                  <span className="badge" style={{ fontSize: 10 }}>{e.entityType}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {query.trim() && totalResults === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-dim)" }}>
            <SearchIcon size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontSize: 14 }}>No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function HighlightedSnippet({ text, query }: { text: string; query: string }) {
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return (
    <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, paddingLeft: 21 }}>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} style={{ background: "var(--accent-dim)", color: "var(--accent)", borderRadius: 2 }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}
