"use client";

import React, { useMemo } from "react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations } from "@/lib/i18n";
import type { Chapter, Plotline } from "@/types";

const ACT_LABELS = ["Act I — Setup", "Act II — Confrontation", "Act III — Resolution"];
const ACT_COLORS = ["#60a5fa", "#f59e0b", "#ef4444"];

export default function StoryMapView() {
  const { story, chapters, wordCount, settings } = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");

  const plotlines = story?.plotlines || [];
  const acts = story?.acts || [];

  const totalWords = wordCount.total || 1;

  // Group chapters by act
  const chaptersByAct: Record<number, Chapter[]> = useMemo(() => {
    const grouped: Record<number, Chapter[]> = { 1: [], 2: [], 3: [] };
    chapters.forEach((ch) => {
      const act = ch.act || 1;
      if (!grouped[act]) grouped[act] = [];
      grouped[act].push(ch);
    });
    return grouped;
  }, [chapters]);

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>{t.storyMap.title}</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
          {t.storyMap.subtitle}
        </p>

        {/* Three-act bar */}
        <div style={{ display: "flex", gap: 2, height: 40, borderRadius: "var(--radius-sm)", overflow: "hidden", marginBottom: 32 }}>
          {[1, 2, 3].map((act) => {
            const actWords = (chaptersByAct[act] || []).reduce((s, c) => s + (wordCount.byChapter[c.id] || 0), 0);
            const pct = totalWords ? (actWords / totalWords) * 100 : 33;
            return (
              <div
                key={act}
                style={{
                  flex: `0 0 ${Math.max(pct, 5)}%`,
                  background: ACT_COLORS[act - 1] + "22",
                  borderLeft: `3px solid ${ACT_COLORS[act - 1]}`,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 700, color: ACT_COLORS[act - 1] }}>
                  {acts[act - 1]?.name || ACT_LABELS[act - 1]}
                </span>
                <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                  {(chaptersByAct[act] || []).length} ch · {actWords.toLocaleString()}w
                </span>
              </div>
            );
          })}
        </div>

        {/* Chapter flow */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, marginBottom: 32 }}>
          {chapters.map((ch, idx) => {
            const actColor = ACT_COLORS[(ch.act || 1) - 1];
            const chWords = wordCount.byChapter[ch.id] || 0;
            return (
              <div
                key={ch.id}
                style={{
                  minWidth: 140,
                  flex: "0 0 auto",
                  padding: 14,
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderTop: `3px solid ${actColor}`,
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: actColor, marginBottom: 6 }}>
                  Act {ch.act}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                  {ch.title}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>
                  {ch.scenes.length} scenes · {chWords.toLocaleString()}w
                </div>
                {/* Tension mini-chart */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 24 }}>
                  {ch.scenes.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        flex: 1,
                        height: `${(s.tensionLevel / 10) * 100}%`,
                        minHeight: 2,
                        background: s.tensionLevel <= 3 ? "var(--success)" : s.tensionLevel <= 6 ? "var(--warning)" : "var(--error)",
                        borderRadius: 1,
                      }}
                      title={`${s.title}: tension ${s.tensionLevel}/10`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Plotlines */}
        {plotlines.length > 0 && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>{t.storyMap.plotlines}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {plotlines.map((pl) => (
                <PlotlineRow key={pl.id} plotline={pl} chapters={chapters} />
              ))}
            </div>
          </>
        )}

        {/* Hero's Journey reference */}
        <div style={{ marginTop: 40, padding: 24, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>
            {t.storyMap.herosJourney}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              "Ordinary World", "Call to Adventure", "Refusal of the Call", "Meeting the Mentor",
              "Crossing the Threshold", "Tests, Allies, Enemies", "Approach to Inmost Cave", "The Ordeal",
              "Reward", "The Road Back", "Resurrection", "Return with Elixir",
            ].map((step, i) => (
              <div
                key={step}
                style={{
                  padding: "8px 10px",
                  background: i < 4 ? ACT_COLORS[0] + "11" : i < 8 ? ACT_COLORS[1] + "11" : ACT_COLORS[2] + "11",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  borderLeft: `2px solid ${i < 4 ? ACT_COLORS[0] : i < 8 ? ACT_COLORS[1] : ACT_COLORS[2]}`,
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{i + 1}.</span> {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlotlineRow({ plotline, chapters }: { plotline: Plotline; chapters: Chapter[] }) {
  const colors = ["#60a5fa", "#34d399", "#f59e0b", "#c084fc", "#fb7185", "#a3e635"];
  const color = colors[Math.abs(plotline.name.length) % colors.length];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-sm)",
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <div style={{ minWidth: 120 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{plotline.name}</div>
        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{plotline.description}</div>
      </div>
      {/* Plotline thread through chapters */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
        {chapters.map((ch) => {
          const inChapter = ch.scenes.some((s) => s.plotlines?.includes(plotline.id));
          return (
            <div
              key={ch.id}
              style={{
                flex: 1,
                height: inChapter ? 6 : 2,
                background: inChapter ? color : "var(--border-subtle)",
                borderRadius: 3,
                transition: "all 0.2s",
              }}
              title={`${ch.title}${inChapter ? " (active)" : ""}`}
            />
          );
        })}
      </div>
    </div>
  );
}
