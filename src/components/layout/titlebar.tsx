"use client";

import { useEffect, useState } from "react";
import { Minus, Square, Copy, X } from "lucide-react";
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
        <NovelTeaLogo size={20} />
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

function NovelTeaLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" style={{ borderRadius: size * 0.19, flexShrink: 0 }}>
      <defs>
        <linearGradient id="nt-tb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="48" fill="url(#nt-tb-bg)" />
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
