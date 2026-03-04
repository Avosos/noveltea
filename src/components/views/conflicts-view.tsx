"use client";

import React, { useState } from "react";
import { Plus, Trash2, AlertTriangle, CheckCircle, Clock, Crosshair, ChevronDown, ChevronRight } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import type { Conflict } from "@/types";

const STATUS_META: Record<Conflict["status"], { label: string; color: string; icon: React.ReactNode }> = {
  planted: { label: "Planted", color: "#60a5fa", icon: <Clock size={13} /> },
  active: { label: "Active", color: "#f59e0b", icon: <AlertTriangle size={13} /> },
  resolved: { label: "Resolved", color: "#34d399", icon: <CheckCircle size={13} /> },
};

export default function ConflictsView() {
  const { story, updateStory } = useNovelTeaStore();
  const conflicts = story?.conflicts || [];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const addConflict = () => {
    const newConflict: Conflict = {
      id: crypto.randomUUID(),
      name: "New Conflict",
      description: "",
      type: "interpersonal",
      status: "planted",
      plantedInChapter: "",
      resolvedInChapter: "",
      involvedEntityIds: [],
      notes: "",
    };
    updateStory({ conflicts: [...conflicts, newConflict] });
  };

  const updateConflict = (id: string, partial: Partial<Conflict>) => {
    updateStory({
      conflicts: conflicts.map((c) => (c.id === id ? { ...c, ...partial } : c)),
    });
  };

  const deleteConflict = (id: string) => {
    updateStory({ conflicts: conflicts.filter((c) => c.id !== id) });
  };

  const grouped = {
    planted: conflicts.filter((c) => c.status === "planted"),
    active: conflicts.filter((c) => c.status === "active"),
    resolved: conflicts.filter((c) => c.status === "resolved"),
  };

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
              Conflicts & Chekhov&apos;s Guns
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""} · {grouped.active.length} active · {grouped.planted.length} planted
            </p>
          </div>
          <button className="btn-primary" onClick={addConflict} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> New Conflict
          </button>
        </div>

        {/* Status summary */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {(["planted", "active", "resolved"] as const).map((status) => {
            const meta = STATUS_META[status];
            return (
              <div
                key={status}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: meta.color + "11",
                  border: `1px solid ${meta.color}33`,
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: meta.color }}>{meta.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: meta.color }}>{grouped[status].length}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{meta.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conflict list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {conflicts.map((conflict) => {
            const isOpen = expanded[conflict.id] ?? false;
            const meta = STATUS_META[conflict.status];

            return (
              <div key={conflict.id} className="card" style={{ overflow: "hidden" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", cursor: "pointer" }}
                  onClick={() => toggle(conflict.id)}
                >
                  {isOpen ? <ChevronDown size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />}
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>
                    {conflict.name}
                  </span>
                  <span className="badge" style={{ fontSize: 10, color: meta.color, borderColor: meta.color }}>
                    {meta.label}
                  </span>
                  <span className="badge" style={{ fontSize: 10 }}>{conflict.type}</span>
                  <button
                    className="btn-ghost"
                    style={{ padding: 4, color: "var(--error)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${conflict.name}"?`)) deleteConflict(conflict.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "16px 16px 16px 40px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Name</label>
                        <input
                          className="input"
                          style={{ width: "100%" }}
                          value={conflict.name}
                          onChange={(e) => updateConflict(conflict.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Type</label>
                        <select
                          className="input"
                          style={{ width: "100%" }}
                          value={conflict.type}
                          onChange={(e) => updateConflict(conflict.id, { type: e.target.value as Conflict["type"] })}
                        >
                          <option value="interpersonal">Interpersonal</option>
                          <option value="internal">Internal</option>
                          <option value="societal">Societal</option>
                          <option value="environmental">Environmental</option>
                          <option value="chekhovs-gun">Chekhov&apos;s Gun</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Description</label>
                      <textarea
                        className="input"
                        style={{ width: "100%", minHeight: 60, resize: "vertical" }}
                        value={conflict.description}
                        onChange={(e) => updateConflict(conflict.id, { description: e.target.value })}
                        placeholder="Describe this conflict..."
                      />
                    </div>

                    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Status</label>
                        <select
                          className="input"
                          style={{ width: "100%" }}
                          value={conflict.status}
                          onChange={(e) => updateConflict(conflict.id, { status: e.target.value as Conflict["status"] })}
                        >
                          <option value="planted">Planted</option>
                          <option value="active">Active</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Notes</label>
                      <textarea
                        className="input"
                        style={{ width: "100%", minHeight: 50, resize: "vertical" }}
                        value={conflict.notes || ""}
                        onChange={(e) => updateConflict(conflict.id, { notes: e.target.value })}
                        placeholder="Internal notes..."
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {conflicts.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "var(--text-dim)" }}>
            <Crosshair size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
            <p style={{ fontSize: 14 }}>No conflicts tracked yet.</p>
            <p style={{ fontSize: 12, marginTop: 4 }}>Track interpersonal tensions, Chekhov&apos;s guns, and plot threads.</p>
          </div>
        )}
      </div>
    </div>
  );
}
