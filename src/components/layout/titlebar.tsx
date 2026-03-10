"use client";

import { useEffect, useState } from "react";
import { Minus, Square, Copy, X, PenTool } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";

export default function Titlebar() {
  const [maximized, setMaximized] = useState(false);
  const project = useNovelTeaStore((s) => s.project);
  const wordCount = useNovelTeaStore((s) => s.wordCount);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;
    api.isMaximized().then(setMaximized);
    const unsub = api.onMaximizedChange(setMaximized);
    return unsub;
  }, []);

  const onMinimize = () => window.electronAPI?.minimize();
  const onMaximize = () => window.electronAPI?.maximize();
  const onClose = () => window.electronAPI?.close();

  return (
    <header
      className="titlebar-drag"
      style={{
        height: "var(--titlebar-height)",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        zIndex: 1000,
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 14 }}>
        <div style={{ width: 20, height: 20, borderRadius: 4, background: "linear-gradient(135deg, #a3e635, #65a30d)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <PenTool size={12} color="#fff" />
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", letterSpacing: 0.5 }}>
            NOVELTEA
          </span>
          {project && (
            <>
              <span style={{ fontSize: 10, color: "var(--text-dim)", margin: "0 4px" }}>·</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-muted)" }}>
                {project.name}
              </span>
              <span style={{ fontSize: 10, color: "var(--text-dim)", margin: "0 4px" }}>·</span>
              <span style={{ fontSize: 10, color: "var(--text-dim)" }}>
                {wordCount.total.toLocaleString()} words
              </span>
            </>
          )}
        </div>
      </div>

      {/* Window Controls */}
      <div className="titlebar-no-drag" style={{ display: "flex", height: "100%" }}>
        <WindowButton onClick={onMinimize} hoverBg="rgba(255,255,255,0.06)">
          <Minus size={16} />
        </WindowButton>
        <WindowButton onClick={onMaximize} hoverBg="rgba(255,255,255,0.06)">
          {maximized ? <Copy size={14} /> : <Square size={14} />}
        </WindowButton>
        <WindowButton onClick={onClose} hoverBg="#e81123" hoverColor="#fff">
          <X size={16} />
        </WindowButton>
      </div>
    </header>
  );
}



function WindowButton({
  children,
  onClick,
  hoverBg,
  hoverColor,
}: {
  children: React.ReactNode;
  onClick: () => void;
  hoverBg: string;
  hoverColor?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 46,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: hovered ? hoverBg : "transparent",
        color: hovered && hoverColor ? hoverColor : "var(--text-secondary)",
        border: "none",
        cursor: "pointer",
        transition: "all 0.1s ease",
      }}
    >
      {children}
    </button>
  );
}
