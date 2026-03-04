"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Save, Plus, Trash2, Link, User, MapPin, Building, Gem, ScrollText, Tag } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import type { BaseEntity, CharacterEntity, LocationEntity, EntityType, EntityLink, Relationship, StateChange } from "@/types";

const TYPE_COLORS: Record<EntityType, string> = {
  character: "#60a5fa",
  location: "#34d399",
  organization: "#f59e0b",
  artifact: "#c084fc",
  lore: "#fb7185",
};

const TYPE_ICONS: Record<EntityType, React.ReactNode> = {
  character: <User size={16} />,
  location: <MapPin size={16} />,
  organization: <Building size={16} />,
  artifact: <Gem size={16} />,
  lore: <ScrollText size={16} />,
};

export default function EntityDetailView() {
  const { entities, chapters, selectedEntityId, setView, updateEntity, deleteEntity, getScenesForEntity } = useNovelTeaStore();
  const entity = entities.find((e) => e.id === selectedEntityId);

  if (!entity) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "var(--text-dim)" }}>
        <p>No entity selected.</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setView("entities")}>
          Back to Entities
        </button>
      </div>
    );
  }

  return <EntityEditor entity={entity} />;
}

function EntityEditor({ entity }: { entity: BaseEntity }) {
  const { updateEntity, deleteEntity, setView, entities, getScenesForEntity, chapters } = useNovelTeaStore();
  const [draft, setDraft] = useState<BaseEntity>({ ...entity });
  const [tagInput, setTagInput] = useState("");

  const update = (partial: Partial<BaseEntity>) => setDraft((prev) => ({ ...prev, ...partial }));

  const linkedScenes = useMemo(() => getScenesForEntity(entity.id), [entity.id, chapters, getScenesForEntity]);

  const save = () => {
    updateEntity(draft);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !draft.tags.includes(t)) {
      update({ tags: [...draft.tags, t] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    update({ tags: draft.tags.filter((t) => t !== tag) });
  };

  const addLink = () => {
    const newLink: EntityLink = { targetId: "", label: "", bidirectional: true };
    update({ links: [...(draft.links || []), newLink] });
  };

  const updateLink = (idx: number, partial: Partial<EntityLink>) => {
    const links = [...(draft.links || [])];
    links[idx] = { ...links[idx], ...partial };
    update({ links });
  };

  const removeLink = (idx: number) => {
    update({ links: (draft.links || []).filter((_, i) => i !== idx) });
  };

  const color = TYPE_COLORS[entity.entityType];

  return (
    <div style={{ height: "100%", overflow: "auto", padding: 32 }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <button className="btn-ghost" onClick={() => setView("entities")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn-primary" onClick={save} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Save size={14} /> Save
          </button>
          <button
            className="btn-ghost"
            style={{ color: "var(--error)" }}
            onClick={() => {
              if (confirm(`Delete "${entity.name}"?`)) {
                deleteEntity(entity.id);
                setView("entities");
              }
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Entity type badge + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ color }}>{TYPE_ICONS[entity.entityType]}</span>
          <span className="badge" style={{ color, borderColor: color, fontSize: 11 }}>{entity.entityType}</span>
        </div>

        <input
          className="input"
          style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, width: "100%" }}
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Entity name"
        />

        {/* Description */}
        <Section title="Description">
          <textarea
            className="input"
            style={{ width: "100%", minHeight: 100, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
            value={draft.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Describe this entity..."
          />
        </Section>

        {/* Character-specific */}
        {entity.entityType === "character" && (
          <CharacterFields draft={draft as CharacterEntity} update={update} entities={entities} />
        )}

        {/* Location-specific */}
        {entity.entityType === "location" && (
          <LocationFields draft={draft as LocationEntity} update={update} />
        )}

        {/* Notes */}
        <Section title="Notes">
          <textarea
            className="input"
            style={{ width: "100%", minHeight: 80, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
            value={draft.notes || ""}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Internal notes..."
          />
        </Section>

        {/* Tags */}
        <Section title="Tags">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {draft.tags.map((tag) => (
              <span
                key={tag}
                className="badge"
                style={{ cursor: "pointer" }}
                onClick={() => removeTag(tag)}
                title="Click to remove"
              >
                {tag} ×
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="Add tag..."
            />
            <button className="btn-ghost" onClick={addTag}><Plus size={14} /></button>
          </div>
        </Section>

        {/* Links to other entities */}
        <Section title="Entity Links">
          {(draft.links || []).map((link, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <Link size={12} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
              <select
                className="input"
                style={{ flex: 1 }}
                value={link.targetId}
                onChange={(e) => updateLink(idx, { targetId: e.target.value })}
              >
                <option value="">Select entity...</option>
                {entities.filter((e) => e.id !== entity.id).map((e) => (
                  <option key={e.id} value={e.id}>{e.name} ({e.entityType})</option>
                ))}
              </select>
              <input
                className="input"
                style={{ width: 140 }}
                value={link.label}
                onChange={(e) => updateLink(idx, { label: e.target.value })}
                placeholder="Relationship..."
              />
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                <input
                  type="checkbox"
                  checked={link.bidirectional}
                  onChange={(e) => updateLink(idx, { bidirectional: e.target.checked })}
                />
                Bidir.
              </label>
              <button className="btn-ghost" style={{ color: "var(--error)", padding: 4 }} onClick={() => removeLink(idx)}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button className="btn-ghost" onClick={addLink} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <Plus size={12} /> Add Link
          </button>
        </Section>

        {/* Referenced in scenes */}
        <Section title={`Referenced in ${linkedScenes.length} scene(s)`}>
          {linkedScenes.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {linkedScenes.map((s) => (
                <div key={s.id} style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 8px", background: "var(--bg-hover)", borderRadius: "var(--radius-sm)" }}>
                  {s.title}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>Not referenced in any scenes yet.</p>
          )}
        </Section>
      </div>
    </div>
  );
}

function CharacterFields({ draft, update, entities }: { draft: CharacterEntity; update: (p: Partial<CharacterEntity>) => void; entities: BaseEntity[] }) {
  const updateRelationship = (idx: number, partial: Partial<Relationship>) => {
    const relationships = [...(draft.relationships || [])];
    relationships[idx] = { ...relationships[idx], ...partial };
    update({ relationships });
  };

  const addRelationship = () => {
    update({ relationships: [...(draft.relationships || []), { targetId: "", type: "", description: "" }] });
  };

  const addStateChange = () => {
    update({ stateChanges: [...(draft.stateChanges || []), { chapterId: "", description: "", property: "", from: "", to: "" }] });
  };

  return (
    <>
      {/* Core character fields */}
      <Section title="Character Details">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Role" value={draft.role || ""} onChange={(v) => update({ role: v })} placeholder="Protagonist, Antagonist..." />
          <Field label="Age" value={draft.age || ""} onChange={(v) => update({ age: v })} />
          <Field label="Occupation" value={draft.occupation || ""} onChange={(v) => update({ occupation: v })} />
          <div />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Motivation</label>
          <textarea
            className="input"
            style={{ width: "100%", minHeight: 60, resize: "vertical" }}
            value={draft.motivation || ""}
            onChange={(e) => update({ motivation: e.target.value })}
            placeholder="What drives this character?"
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Character Arc</label>
          <textarea
            className="input"
            style={{ width: "100%", minHeight: 60, resize: "vertical" }}
            value={draft.arc || ""}
            onChange={(e) => update({ arc: e.target.value })}
            placeholder="How does this character change throughout the story?"
          />
        </div>
      </Section>

      {/* Relationships */}
      <Section title="Relationships">
        {(draft.relationships || []).map((rel, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <select
              className="input"
              style={{ flex: 1 }}
              value={rel.targetId}
              onChange={(e) => updateRelationship(idx, { targetId: e.target.value })}
            >
              <option value="">Select character...</option>
              {entities.filter((e) => e.entityType === "character" && e.id !== draft.id).map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <input
              className="input"
              style={{ width: 120 }}
              value={rel.type}
              onChange={(e) => updateRelationship(idx, { type: e.target.value })}
              placeholder="Type"
            />
            <input
              className="input"
              style={{ flex: 1 }}
              value={rel.description}
              onChange={(e) => updateRelationship(idx, { description: e.target.value })}
              placeholder="Description"
            />
            <button className="btn-ghost" style={{ color: "var(--error)", padding: 4 }} onClick={() => update({ relationships: (draft.relationships || []).filter((_, i) => i !== idx) })}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button className="btn-ghost" onClick={addRelationship} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <Plus size={12} /> Add Relationship
        </button>
      </Section>

      {/* State changes */}
      <Section title="State Changes (Arc Points)">
        {(draft.stateChanges || []).map((sc, idx) => (
          <div key={idx} style={{ padding: 10, background: "var(--bg-hover)", borderRadius: "var(--radius-sm)", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input className="input" style={{ flex: 1 }} value={sc.property} onChange={(e) => {
                const changes = [...(draft.stateChanges || [])];
                changes[idx] = { ...changes[idx], property: e.target.value };
                update({ stateChanges: changes });
              }} placeholder="Property (e.g. Loyalty)" />
              <input className="input" style={{ width: 100 }} value={sc.from} onChange={(e) => {
                const changes = [...(draft.stateChanges || [])];
                changes[idx] = { ...changes[idx], from: e.target.value };
                update({ stateChanges: changes });
              }} placeholder="From" />
              <span style={{ color: "var(--text-dim)", alignSelf: "center" }}>→</span>
              <input className="input" style={{ width: 100 }} value={sc.to} onChange={(e) => {
                const changes = [...(draft.stateChanges || [])];
                changes[idx] = { ...changes[idx], to: e.target.value };
                update({ stateChanges: changes });
              }} placeholder="To" />
            </div>
            <input className="input" style={{ width: "100%" }} value={sc.description} onChange={(e) => {
              const changes = [...(draft.stateChanges || [])];
              changes[idx] = { ...changes[idx], description: e.target.value };
              update({ stateChanges: changes });
            }} placeholder="What triggers this change?" />
          </div>
        ))}
        <button className="btn-ghost" onClick={addStateChange} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <Plus size={12} /> Add State Change
        </button>
      </Section>
    </>
  );
}

function LocationFields({ draft, update }: { draft: LocationEntity; update: (p: Partial<LocationEntity>) => void }) {
  return (
    <Section title="Location Details">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Type" value={draft.locationType || ""} onChange={(v) => update({ locationType: v })} placeholder="City, Forest, Building..." />
        <Field label="Climate" value={draft.climate || ""} onChange={(v) => update({ climate: v })} placeholder="Temperate, Arid..." />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>Atmosphere / Sensory Details</label>
        <textarea
          className="input"
          style={{ width: "100%", minHeight: 80, resize: "vertical" }}
          value={draft.atmosphere || ""}
          onChange={(e) => update({ atmosphere: e.target.value })}
          placeholder="What does it look, sound, smell, and feel like?"
        />
      </div>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{label}</label>
      <input className="input" style={{ width: "100%" }} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
