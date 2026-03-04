"use client";

import React, { useMemo } from "react";
import { Clock, Eye } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations } from "@/lib/i18n";

export default function TimelineView() {
  const { chapters, entities, settings } = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");

  // Flatten scenes in order with chapter context
  const timelineItems = useMemo(() => {
    const items: { chapterId: string; chapterTitle: string; act: number; sceneId: string; sceneTitle: string; pov: string | null; location: string | null; timeline: string; tensionLevel: number; order: number; entityIds: string[] }[] = [];
    let order = 0;
    for (const ch of chapters) {
      for (const scene of ch.scenes) {
        items.push({
          chapterId: ch.id,
          chapterTitle: ch.title,
          act: ch.act,
          sceneId: scene.id,
          sceneTitle: scene.title,
          pov: scene.pov,
          location: scene.location,
          timeline: scene.timeline || "",
          tensionLevel: scene.tensionLevel,
          order: order++,
          entityIds: scene.entityIds || [],
        });
      }
    }
    return items;
  }, [chapters]);

  const getEntityName = (id: string) => entities.find((e) => e.id === id)?.name || id;

  const actColors = ["#60a5fa", "#f59e0b", "#ef4444"];

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>{t.timeline.title}</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
          {t.timeline.subtitle} · {timelineItems.length} {t.chapters.scenes}
        </p>

        {/* Tension curve overview */}
        <div style={{ height: 60, display: "flex", alignItems: "flex-end", gap: 1, marginBottom: 32, padding: "0 2px" }}>
          {timelineItems.map((item, i) => {
            const h = (item.tensionLevel / 10) * 100;
            const color = item.tensionLevel <= 3 ? "var(--success)" : item.tensionLevel <= 6 ? "var(--warning)" : "var(--error)";
            return (
              <div
                key={item.sceneId}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  minHeight: 2,
                  background: color,
                  borderRadius: "2px 2px 0 0",
                  opacity: 0.8,
                }}
                title={`${item.sceneTitle} — Tension ${item.tensionLevel}/10`}
              />
            );
          })}
        </div>

        {/* Timeline track */}
        <div style={{ position: "relative", paddingLeft: 32 }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute", left: 11, top: 0, bottom: 0, width: 2,
            background: "var(--border-subtle)",
          }} />

          {timelineItems.map((item, idx) => {
            const prevChapter = idx > 0 ? timelineItems[idx - 1].chapterId : null;
            const isNewChapter = item.chapterId !== prevChapter;
            const actColor = actColors[(item.act || 1) - 1];

            return (
              <React.Fragment key={item.sceneId}>
                {/* Chapter separator */}
                {isNewChapter && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    marginBottom: 8, marginTop: idx > 0 ? 20 : 0,
                    marginLeft: -32,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: actColor, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: "#fff",
                    }}>
                      {item.act}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                      {item.chapterTitle}
                    </span>
                  </div>
                )}

                {/* Scene node */}
                <div style={{ display: "flex", gap: 12, marginBottom: 12, position: "relative" }}>
                  {/* Dot */}
                  <div style={{
                    position: "absolute", left: -27, top: 8, width: 10, height: 10,
                    borderRadius: "50%", border: "2px solid var(--border-subtle)",
                    background: "var(--bg-primary)",
                  }} />

                  <div
                    className="card"
                    style={{ flex: 1, padding: "12px 16px" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {item.sceneTitle}
                      </span>
                      <TensionBadge level={item.tensionLevel} />
                    </div>

                    <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--text-muted)" }}>
                      {item.timeline && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Clock size={11} /> {item.timeline}
                        </span>
                      )}
                      {item.pov && (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Eye size={11} /> {getEntityName(item.pov)}
                        </span>
                      )}
                      {item.location && (
                        <span>{getEntityName(item.location)}</span>
                      )}
                    </div>

                    {item.entityIds.length > 0 && (
                      <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                        {item.entityIds.map((eid) => (
                          <span key={eid} className="badge" style={{ fontSize: 10 }}>
                            {getEntityName(eid)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {timelineItems.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-dim)" }}>
            {t.timeline.noScenes}
          </div>
        )}
      </div>
    </div>
  );
}

function TensionBadge({ level }: { level: number }) {
  const color = level <= 3 ? "var(--success)" : level <= 6 ? "var(--warning)" : "var(--error)";
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color,
      padding: "1px 6px", border: `1px solid ${color}`, borderRadius: 10,
    }}>
      {level}/10
    </span>
  );
}
