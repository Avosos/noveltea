"use client";

import React, { useState, useEffect } from "react";
import { Plus, FolderOpen, Clock, BookOpen, Trash2 } from "lucide-react";
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
          <NovelTeaWelcomeLogo />
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

function NovelTeaWelcomeLogo() {
  return (
    <svg width={72} height={72} viewBox="0 0 256 256" style={{ borderRadius: 14, margin: "0 auto", display: "block" }}>
      <defs>
        <linearGradient id="nt-w-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="48" fill="url(#nt-w-bg)" />
      {/* Minimalist fountain pen / feather quill */}
      <g transform="translate(128,128)" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
        {/* Quill body - diagonal line */}
        <line x1="-50" y1="50" x2="50" y2="-60" strokeWidth="10" />
        {/* Nib / pen tip */}
        <path d="M -50 50 L -60 65 L -45 55" fill="#fff" stroke="#fff" strokeWidth="4" />
        {/* Feather barbs left */}
        <path d="M -20 20 Q -55 5, -65 -30" strokeWidth="6" opacity="0.7" />
        <path d="M 0 0 Q -40 -15, -55 -50" strokeWidth="6" opacity="0.5" />
        {/* Feather barbs right */}
        <path d="M 10 -10 Q 45 -5, 60 -35" strokeWidth="6" opacity="0.7" />
        <path d="M 30 -30 Q 55 -30, 65 -55" strokeWidth="6" opacity="0.5" />
        {/* Small ink dot */}
        <circle cx="-55" cy="60" r="4" fill="#fff" opacity="0.6" stroke="none" />
      </g>
    </svg>
  );
}
