"use client";

import React, { useMemo } from "react";
import { BarChart3, BookOpen, Users, FileText, Pen } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations } from "@/lib/i18n";

export default function StatsView() {
  const { chapters, entities, wordCount, story, settings } = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");

  const stats = useMemo(() => {
    const totalScenes = chapters.reduce((a, c) => a + c.scenes.length, 0);
    const allScenes = chapters.flatMap((c) => c.scenes);
    const avgTension = allScenes.length > 0 ? allScenes.reduce((a, s) => a + s.tensionLevel, 0) / allScenes.length : 0;

    // Character screentime (how many scenes each character appears in)
    const characterScreentime: Record<string, number> = {};
    for (const ch of chapters) {
      for (const scene of ch.scenes) {
        for (const eid of scene.entityIds || []) {
          characterScreentime[eid] = (characterScreentime[eid] || 0) + 1;
        }
        if (scene.pov) characterScreentime[scene.pov] = (characterScreentime[scene.pov] || 0) + 1;
      }
    }

    // POV distribution
    const povCounts: Record<string, number> = {};
    for (const ch of chapters) {
      for (const scene of ch.scenes) {
        if (scene.pov) povCounts[scene.pov] = (povCounts[scene.pov] || 0) + 1;
      }
    }

    // Words per chapter
    const chapterStats = chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      act: ch.act,
      words: wordCount.byChapter[ch.id] || 0,
      scenes: ch.scenes.length,
    }));

    const avgChapterWords = chapters.length ? Math.round(wordCount.total / chapters.length) : 0;

    // Entity counts by type
    const entityCounts: Record<string, number> = {};
    for (const e of entities) {
      entityCounts[e.entityType] = (entityCounts[e.entityType] || 0) + 1;
    }

    const conflicts = story?.conflicts || [];
    const activeConflicts = conflicts.filter((c) => c.status === "active").length;
    const plantedConflicts = conflicts.filter((c) => c.status === "planted").length;

    return {
      totalScenes,
      avgTension,
      characterScreentime,
      povCounts,
      chapterStats,
      avgChapterWords,
      entityCounts,
      activeConflicts,
      plantedConflicts,
      totalConflicts: conflicts.length,
    };
  }, [chapters, entities, wordCount, story]);

  const getEntityName = (id: string) => entities.find((e) => e.id === id)?.name || id;
  const maxChapterWords = Math.max(...stats.chapterStats.map((c) => c.words), 1);

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 24 }}>{t.stats.title}</h1>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 32 }}>
          <StatCard icon={<Pen size={18} />} label={t.stats.totalWords} value={wordCount.total.toLocaleString()} />
          <StatCard icon={<BookOpen size={18} />} label={t.stats.chaptersLabel} value={String(chapters.length)} sub={`${stats.totalScenes} ${t.chapters.scenes}`} />
          <StatCard icon={<Users size={18} />} label={t.stats.entitiesLabel} value={String(entities.length)} sub={`${stats.entityCounts["character"] || 0} ${t.sidebar.characters}`} />
          <StatCard icon={<BarChart3 size={18} />} label={t.stats.avgTension} value={stats.avgTension.toFixed(1)} sub={t.stats.outOf10} />
        </div>

        {/* Words per chapter bar chart */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>{t.stats.wordsPerChapter}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stats.chapterStats.map((ch) => {
              const pct = (ch.words / maxChapterWords) * 100;
              const actColors = ["#60a5fa", "#f59e0b", "#ef4444"];
              return (
                <div key={ch.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 140, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {ch.title}
                  </span>
                  <div style={{ flex: 1, height: 20, background: "var(--bg-hover)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: actColors[(ch.act || 1) - 1] + "88",
                        borderRadius: "var(--radius-sm)",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-dim)", minWidth: 60, textAlign: "right" }}>
                    {ch.words.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
            {t.stats.average}: {stats.avgChapterWords.toLocaleString()} {t.stats.wordsChapter}
          </p>
        </div>

        {/* POV distribution & Character screentime side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>{t.stats.povDistribution}</h2>
            {Object.keys(stats.povCounts).length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(stats.povCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([id, count]) => {
                    const total = Object.values(stats.povCounts).reduce((a, b) => a + b, 0);
                    const pct = (count / total) * 100;
                    return (
                      <div key={id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {getEntityName(id)}
                        </span>
                        <div style={{ flex: 1, height: 14, background: "var(--bg-hover)", borderRadius: 7, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)", borderRadius: 7, opacity: 0.7 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-dim)", minWidth: 50, textAlign: "right" }}>
                          {count} ({Math.round(pct)}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "var(--text-dim)" }}>{t.stats.noPovData}</p>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>{t.stats.characterScreentime}</h2>
            {Object.keys(stats.characterScreentime).length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(stats.characterScreentime)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([id, count]) => {
                    const maxST = Math.max(...Object.values(stats.characterScreentime));
                    const pct = (count / maxST) * 100;
                    return (
                      <div key={id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", minWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {getEntityName(id)}
                        </span>
                        <div style={{ flex: 1, height: 14, background: "var(--bg-hover)", borderRadius: 7, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#c084fc", borderRadius: 7, opacity: 0.7 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-dim)", minWidth: 50, textAlign: "right" }}>
                          {count} scene{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: "var(--text-dim)" }}>{t.stats.noScreentime}</p>
            )}
          </div>
        </div>

        {/* Conflict summary */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>{t.stats.conflictTracking}</h2>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {t.stats.total}: <strong style={{ color: "var(--text-primary)" }}>{stats.totalConflicts}</strong>
            </span>
            <span style={{ fontSize: 13, color: "#f59e0b" }}>{t.stats.active}: {stats.activeConflicts}</span>
            <span style={{ fontSize: 13, color: "#60a5fa" }}>{t.stats.planted}: {stats.plantedConflicts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="card" style={{ padding: 20, textAlign: "center" }}>
      <div style={{ color: "var(--accent)", marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
