"use client";

import React, { useState } from "react";
import {
  BookOpen, PenTool, Users, MapPin, Search, Settings, BarChart3,
  Plus, FolderOpen, ChevronDown, ChevronRight, Layers, Target,
  AlertTriangle, Clock, Building2, Gem, ScrollText, Home,
} from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import type { AppView, EntityType } from "@/types";

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "editor", label: "Editor", icon: <PenTool size={16} /> },
  { id: "chapters", label: "Chapters", icon: <BookOpen size={16} /> },
  { id: "timeline", label: "Timeline", icon: <Clock size={16} /> },
  { id: "story-map", label: "Story Map", icon: <Layers size={16} /> },
  { id: "conflicts", label: "Conflicts", icon: <Target size={16} /> },
  { id: "search", label: "Search", icon: <Search size={16} /> },
  { id: "stats", label: "Statistics", icon: <BarChart3 size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

const ENTITY_SECTIONS: { type: EntityType; label: string; icon: React.ReactNode }[] = [
  { type: "character", label: "Characters", icon: <Users size={14} /> },
  { type: "location", label: "Locations", icon: <MapPin size={14} /> },
  { type: "organization", label: "Organizations", icon: <Building2 size={14} /> },
  { type: "artifact", label: "Artifacts", icon: <Gem size={14} /> },
  { type: "lore", label: "Lore", icon: <ScrollText size={14} /> },
];

export default function Sidebar() {
  const currentView = useNovelTeaStore((s) => s.currentView);
  const setView = useNovelTeaStore((s) => s.setView);
  const project = useNovelTeaStore((s) => s.project);
  const entities = useNovelTeaStore((s) => s.entities);
  const addEntity = useNovelTeaStore((s) => s.addEntity);
  const selectEntity = useNovelTeaStore((s) => s.selectEntity);
  const closeProject = useNovelTeaStore((s) => s.closeProject);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    character: true,
    location: true,
    organization: false,
    artifact: false,
    lore: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!project) return null;

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        height: "100%",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Navigation */}
      <nav style={{ padding: "12px 8px", flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1.2, padding: "4px 10px", marginBottom: 4 }}>
          Navigation
        </div>
        {NAV_ITEMS.map((item) => (
          <SidebarButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={currentView === item.id}
            onClick={() => setView(item.id)}
          />
        ))}
      </nav>

      <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 12px" }} />

      {/* Worldbuilding Entities */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px 8px" }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1.2, padding: "4px 10px", marginBottom: 4 }}>
          Worldbuilding
        </div>
        {ENTITY_SECTIONS.map(({ type, label, icon }) => (
          <div key={type} style={{ marginBottom: 2 }}>
            <button
              onClick={() => toggleSection(type)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                borderRadius: "var(--radius-sm)",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {expandedSections[type] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {icon}
              <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
              <span style={{ fontSize: 11, color: "var(--text-dim)" }}>
                {entities.filter((e) => e.entityType === type).length}
              </span>
            </button>
            {expandedSections[type] && (
              <div style={{ paddingLeft: 20, marginTop: 2 }}>
                {entities.filter((e) => e.entityType === type).map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => selectEntity(entity.id)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "4px 10px",
                      background: "transparent",
                      border: "none",
                      color: "var(--text-muted)",
                      fontSize: 12,
                      cursor: "pointer",
                      borderRadius: 4,
                      transition: "all 0.1s",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-hover)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    {entity.name}
                  </button>
                ))}
                <button
                  onClick={() => addEntity(type)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    width: "100%",
                    padding: "4px 10px",
                    background: "transparent",
                    border: "none",
                    color: "var(--text-dim)",
                    fontSize: 11,
                    cursor: "pointer",
                    borderRadius: 4,
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-dim)";
                  }}
                >
                  <Plus size={10} />
                  Add {label.slice(0, -1)}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom: Project actions */}
      <div style={{ padding: "8px", borderTop: "1px solid var(--border-subtle)", flexShrink: 0 }}>
        <SidebarButton
          icon={<Home size={16} />}
          label="Close Project"
          active={false}
          onClick={closeProject}
        />
      </div>
    </aside>
  );
}

function SidebarButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 10px",
        background: active ? "var(--accent-muted)" : hovered ? "var(--bg-hover)" : "transparent",
        border: active ? "1px solid rgba(163,230,53,0.15)" : "1px solid transparent",
        color: active ? "var(--accent)" : hovered ? "var(--text-primary)" : "var(--text-secondary)",
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        borderRadius: "var(--radius-sm)",
        transition: "all 0.12s ease",
        textAlign: "left",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
