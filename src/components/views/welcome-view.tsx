"use client";

import React, { useState, useEffect } from "react";
import { Plus, FolderOpen, Clock, BookOpen, Trash2, PenTool } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations } from "@/lib/i18n";

export default function WelcomeView() {
  const recentProjects = useNovelTeaStore((s) => s.recentProjects);
  const createProject = useNovelTeaStore((s) => s.createProject);
  const openProject = useNovelTeaStore((s) => s.openProject);
  const settings = useNovelTeaStore((s) => s.settings);
  const t = getTranslations(settings.language || "de");
  const [projectName, setProjectName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = () => {
    if (projectName.trim()) {
      createProject(projectName.trim());
    }
  };

  const handleOpen = async () => {
    const dirPath = await window.electronAPI?.openFolderDialog();
    if (dirPath) openProject(dirPath);
  };

  return (
    <div style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    }}>
      <div style={{ width: "100%", maxWidth: 640 }} className="animate-fadeIn">
        {/* Logo + Title */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ width: 72, height: 72, borderRadius: 14, background: "linear-gradient(135deg, #a3e635, #4ade80)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
            <PenTool size={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", marginTop: 20, letterSpacing: -0.5 }}>
            NovelTea
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 8 }}>
            {t.welcome.subtitle}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 40 }}>
          <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 14 }}
            onClick={() => setShowCreate(true)}>
            <Plus size={18} />
            {t.welcome.newProject}
          </button>
          <button className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 14 }}
            onClick={handleOpen}>
            <FolderOpen size={18} />
            {t.welcome.openProject}
          </button>
        </div>

        {/* Create project form */}
        {showCreate && (
          <div className="card animate-fadeIn" style={{ padding: 20, marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>
              {t.welcome.createNewProject}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                placeholder={t.welcome.projectName}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
              <button className="btn-primary" onClick={handleCreate}>{t.welcome.create}</button>
              <button className="btn-ghost" onClick={() => setShowCreate(false)}>{t.welcome.cancel}</button>
            </div>
          </div>
        )}

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Clock size={14} style={{ color: "var(--text-dim)" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>
                {t.welcome.recentProjects}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {recentProjects.map((rp) => (
                <button
                  key={rp.path}
                  onClick={() => openProject(rp.path)}
                  className="card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                    width: "100%",
                    borderRadius: "var(--radius-sm)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-elevated)";
                    e.currentTarget.style.borderColor = "var(--border-default)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <BookOpen size={18} style={{ color: "var(--accent)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                      {rp.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {rp.path}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-dim)", flexShrink: 0 }}>
                    {new Date(rp.openedAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


