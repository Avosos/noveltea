"use client";

import React, { useState } from "react";
import {
  BookOpen, PenTool, Users, MapPin, Search, Settings, BarChart3,
  Plus, FolderOpen, ChevronDown, ChevronRight, Layers, Target,
  AlertTriangle, Clock, Building2, Gem, ScrollText, Home,
  Share2, BookMarked, MessageSquare,
} from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations } from "@/lib/i18n";
import type { AppView, EntityType } from "@/types";

export default function Sidebar() {
  const currentView = useNovelTeaStore((s) => s.currentView);
  const setView = useNovelTeaStore((s) => s.setView);
  const project = useNovelTeaStore((s) => s.project);
  const entities = useNovelTeaStore((s) => s.entities);
  const addEntity = useNovelTeaStore((s) => s.addEntity);
  const selectEntity = useNovelTeaStore((s) => s.selectEntity);
  const closeProject = useNovelTeaStore((s) => s.closeProject);
  const settings = useNovelTeaStore((s) => s.settings);
  const t = getTranslations(settings.language || "de");

  const NAV_ITEMS: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: "editor", label: t.nav.editor, icon: <PenTool size={16} /> },
    { id: "chapters", label: t.nav.chapters, icon: <BookOpen size={16} /> },
    { id: "timeline", label: t.nav.timeline, icon: <Clock size={16} /> },
    { id: "story-map", label: t.nav.storyMap, icon: <Layers size={16} /> },
    { id: "graph", label: t.nav.graph, icon: <Share2 size={16} /> },
    { id: "conflicts", label: t.nav.conflicts, icon: <Target size={16} /> },
    { id: "dialogue", label: t.nav.dialogue, icon: <MessageSquare size={16} /> },
    { id: "sources", label: t.nav.sources, icon: <BookMarked size={16} /> },
    { id: "search", label: t.nav.search, icon: <Search size={16} /> },
    { id: "stats", label: t.nav.statistics, icon: <BarChart3 size={16} /> },
    { id: "settings", label: t.nav.settings, icon: <Settings size={16} /> },
  ];

  const ENTITY_SECTIONS: { type: EntityType; label: string; icon: React.ReactNode; addLabel: string }[] = [
    { type: "character", label: t.sidebar.characters, icon: <Users size={14} />, addLabel: t.sidebar.addCharacter },
    { type: "location", label: t.sidebar.locations, icon: <MapPin size={14} />, addLabel: t.sidebar.addLocation },
    { type: "organization", label: t.sidebar.organizations, icon: <Building2 size={14} />, addLabel: t.sidebar.addOrganization },
    { type: "artifact", label: t.sidebar.artifacts, icon: <Gem size={14} />, addLabel: t.sidebar.addArtifact },
    { type: "lore", label: t.sidebar.lore, icon: <ScrollText size={14} />, addLabel: t.sidebar.addLore },
  ];

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
          {t.sidebar.navigation}
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
          {t.sidebar.worldbuilding}
        </div>
        {ENTITY_SECTIONS.map(({ type, label, icon, addLabel }) => (
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
                  {addLabel}
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
          label={t.sidebar.closeProject}
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
