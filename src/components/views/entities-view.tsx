"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, Grid, List, User, MapPin, Building, Gem, ScrollText } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import type { EntityType, BaseEntity } from "@/types";

const ENTITY_TYPES: { type: EntityType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "character", label: "Characters", icon: <User size={14} />, color: "#60a5fa" },
  { type: "location", label: "Locations", icon: <MapPin size={14} />, color: "#34d399" },
  { type: "organization", label: "Organizations", icon: <Building size={14} />, color: "#f59e0b" },
  { type: "artifact", label: "Artifacts", icon: <Gem size={14} />, color: "#c084fc" },
  { type: "lore", label: "Lore", icon: <ScrollText size={14} />, color: "#fb7185" },
];

export default function EntitiesView() {
  const { entities, addEntity, setView } = useNovelTeaStore();
  const [filterType, setFilterType] = useState<EntityType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let result = entities;
    if (filterType !== "all") result = result.filter((e) => e.entityType === filterType);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    return result;
  }, [entities, filterType, searchQuery]);

  const openEntity = (id: string) => {
    useNovelTeaStore.getState().selectEntity(id);
  };

  const getTypeInfo = (type: EntityType) => ENTITY_TYPES.find((t) => t.type === type)!;

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Worldbuilding</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{entities.length} entities</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {ENTITY_TYPES.map((et) => (
              <button
                key={et.type}
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}
                onClick={() => addEntity(et.type)}
              >
                <Plus size={13} /> {et.label.slice(0, -1)}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} />
            <input
              className="input"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 32, width: "100%" }}
            />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <FilterBtn active={filterType === "all"} onClick={() => setFilterType("all")}>All</FilterBtn>
            {ENTITY_TYPES.map((et) => (
              <FilterBtn key={et.type} active={filterType === et.type} onClick={() => setFilterType(et.type)}>
                {et.icon} {et.label}
              </FilterBtn>
            ))}
          </div>
          <div style={{ display: "flex", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{ padding: "6px 8px", background: viewMode === "grid" ? "var(--bg-hover)" : "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{ padding: "6px 8px", background: viewMode === "list" ? "var(--bg-hover)" : "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        {/* Entity grid/list */}
        {viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {filtered.map((entity) => {
              const info = getTypeInfo(entity.entityType);
              return (
                <div
                  key={entity.id}
                  className="card"
                  style={{ padding: 16, cursor: "pointer", transition: "border-color 0.15s" }}
                  onClick={() => openEntity(entity.id)}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = info.color)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ color: info.color }}>{info.icon}</span>
                    <span style={{ fontSize: 10, color: info.color, textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.6 }}>
                      {entity.entityType}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>{entity.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {entity.description || "No description"}
                  </div>
                  {entity.tags.length > 0 && (
                    <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                      {entity.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="badge" style={{ fontSize: 10 }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filtered.map((entity) => {
              const info = getTypeInfo(entity.entityType);
              return (
                <div
                  key={entity.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onClick={() => openEntity(entity.id)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: info.color }}>{info.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", minWidth: 160 }}>{entity.name}</span>
                  <span className="badge" style={{ fontSize: 10, color: info.color, borderColor: info.color }}>{entity.entityType}</span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entity.description || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-dim)" }}>
            <p style={{ fontSize: 14 }}>{searchQuery ? "No entities match your search." : "No entities yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 10px",
        fontSize: 11,
        fontWeight: 600,
        border: "1px solid",
        borderColor: active ? "var(--accent)" : "var(--border-subtle)",
        background: active ? "var(--accent-dim)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-muted)",
        borderRadius: "var(--radius-sm)",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}
