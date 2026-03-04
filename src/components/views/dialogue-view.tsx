"use client";

import React, { useState, useMemo } from "react";
import { MessageSquare, Filter, ArrowRight } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations } from "@/lib/i18n";
import type { DialogueAttribution, CharacterEntity } from "@/types";

/* ═══════════════════════════════════════════════════════════
 * DialogueView — Track character speech and mentions
 * Filter by character, type, chapter; navigate to scenes
 * ═══════════════════════════════════════════════════════════ */

export default function DialogueView() {
  const { dialogueAttributions, entities, chapters, settings, setView, selectScene } = useNovelTeaStore();
  const store = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");

  const [charFilter, setCharFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"" | "speech" | "mention">("");

  const characters = useMemo(
    () => entities.filter((e) => e.entityType === "character") as CharacterEntity[],
    [entities]
  );

  const filtered = useMemo(() => {
    let items = dialogueAttributions;
    if (charFilter) items = items.filter((d) => d.characterId === charFilter);
    if (typeFilter) items = items.filter((d) => d.type === typeFilter);
    return items.sort((a, b) => b.createdAt - a.createdAt);
  }, [dialogueAttributions, charFilter, typeFilter]);

  // Aggregate stats per character
  const charStats = useMemo(() => {
    const map = new Map<string, { speech: number; mention: number }>();
    dialogueAttributions.forEach((d) => {
      const entry = map.get(d.characterId) || { speech: 0, mention: 0 };
      if (d.type === "speech") entry.speech++;
      else entry.mention++;
      map.set(d.characterId, entry);
    });
    return map;
  }, [dialogueAttributions]);

  const goToScene = (attr: DialogueAttribution) => {
    if (attr.chapterId && attr.sceneId) {
      selectScene(attr.chapterId, attr.sceneId);
      setView("editor");
    }
  };

  const getCharacterColor = (charId: string) => {
    const char = characters.find((c) => c.id === charId) as CharacterEntity | undefined;
    return char?.dialogueColor || "#60a5fa";
  };

  const getCharacterName = (charId: string) => {
    return entities.find((e) => e.id === charId)?.name || "?";
  };

  const getChapterTitle = (chapterId: string) => {
    return chapters.find((c) => c.id === chapterId)?.title || chapterId;
  };

  const getSceneTitle = (chapterId: string, sceneId: string) => {
    const ch = chapters.find((c) => c.id === chapterId);
    return ch?.scenes.find((s) => s.id === sceneId)?.title || sceneId;
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <MessageSquare size={18} style={{ color: "var(--primary)" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700 }}>{t.dialogue.title}</h1>
        </div>
        <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20 }}>{t.dialogue.subtitle}</p>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={14} style={{ color: "var(--text-dim)" }} />
          <select
            className="input"
            style={{ width: 200 }}
            value={charFilter}
            onChange={(e) => setCharFilter(e.target.value)}
          >
            <option value="">{t.dialogue.allCharacters}</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="input"
            style={{ width: 160 }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "" | "speech" | "mention")}
          >
            <option value="">{t.dialogue.allTypes}</option>
            <option value="speech">{t.dialogue.speechType}</option>
            <option value="mention">{t.dialogue.mentionType}</option>
          </select>
          <span style={{ fontSize: 11, color: "var(--text-dim)", marginLeft: 8 }}>
            {filtered.length} {t.dialogue.count}
          </span>
        </div>

        {/* Character stat cards */}
        {characters.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, marginBottom: 24 }}>
            {characters.map((c) => {
              const stats = charStats.get(c.id);
              if (!stats) return null;
              const color = (c as CharacterEntity).dialogueColor || "#60a5fa";
              return (
                <div
                  key={c.id}
                  style={{
                    padding: "10px 14px",
                    background: "var(--bg-secondary)",
                    border: `1px solid ${charFilter === c.id ? color : "var(--border)"}`,
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                  onClick={() => setCharFilter(charFilter === c.id ? "" : c.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                    {t.dialogue.directSpeech}: {stats.speech} · {t.dialogue.mentioned}: {stats.mention}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Attribution list */}
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>
            <MessageSquare size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>{t.dialogue.noAttributions}</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((attr) => {
              const color = getCharacterColor(attr.characterId);
              return (
                <div
                  key={attr.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "10px 14px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color }}>{getCharacterName(attr.characterId)}</span>
                      <span
                        className="badge"
                        style={{
                          fontSize: 10,
                          background: attr.type === "speech" ? "rgba(96,165,250,0.15)" : "rgba(251,113,133,0.15)",
                          color: attr.type === "speech" ? "#60a5fa" : "#fb7185",
                          borderColor: attr.type === "speech" ? "#60a5fa" : "#fb7185",
                        }}
                      >
                        {attr.type === "speech" ? t.dialogue.speechType : t.dialogue.mentionType}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 4, lineHeight: 1.5 }}>
                      {attr.type === "speech" ? `"${attr.text}"` : attr.text}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                      {getChapterTitle(attr.chapterId)} → {getSceneTitle(attr.chapterId, attr.sceneId)}
                    </div>
                  </div>
                  <button
                    className="btn-ghost"
                    style={{ padding: 4, flexShrink: 0 }}
                    onClick={() => goToScene(attr)}
                    title={t.dialogue.goToScene}
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
