"use client";

import React, { useState, useMemo } from "react";
import { ArrowLeft, Save, Plus, Trash2, Link, User, MapPin, Building, Gem, ScrollText, Tag, CheckCircle } from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import type { BaseEntity, CharacterEntity, LocationEntity, EntityType, EntityLink, Relationship, StateChange, CustomField } from "@/types";

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
  const { entities, selectedEntityId, setView } = useNovelTeaStore();
  const settings = useNovelTeaStore((s) => s.settings);
  const t = getTranslations(settings.language || "de");
  const entity = entities.find((e) => e.id === selectedEntityId);

  if (!entity) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "var(--text-dim)" }}>
        <p>{t.entities.noEntitySelected}</p>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setView("entities")}>
          {t.entities.backToEntities}
        </button>
      </div>
    );
  }

  /* key={entity.id} forces remount when switching entities — fixes the navigation bug */
  return <EntityEditor key={entity.id} entity={entity} />;
}

function EntityEditor({ entity }: { entity: BaseEntity }) {
  const { updateEntity, deleteEntity, setView, entities, getScenesForEntity, chapters, settings } = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");
  const { showToast } = useToast();
  const [draft, setDraft] = useState<BaseEntity>({ ...entity });
  const [tagInput, setTagInput] = useState("");

  const update = (partial: Partial<BaseEntity>) => setDraft((prev) => ({ ...prev, ...partial }));

  const linkedScenes = useMemo(() => getScenesForEntity(entity.id), [entity.id, chapters, getScenesForEntity]);

  const save = () => {
    updateEntity(draft);
    showToast(t.common.saved, "success");
  };

  const addTag = () => {
    const tVal = tagInput.trim();
    if (tVal && !draft.tags.includes(tVal)) {
      update({ tags: [...draft.tags, tVal] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    update({ tags: draft.tags.filter((tg) => tg !== tag) });
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
            <ArrowLeft size={16} /> {t.entities.back}
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn-primary" onClick={save} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Save size={14} /> {t.entities.save}
          </button>
          <button
            className="btn-ghost"
            style={{ color: "var(--error)" }}
            onClick={() => {
              if (confirm(t.common.confirmDelete.replace("{name}", entity.name))) {
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
          placeholder={t.entities.entityName}
        />

        {/* Description */}
        <Section title={t.entities.description}>
          <textarea
            className="input"
            style={{ width: "100%", minHeight: 100, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
            value={draft.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder={t.entities.descriptionPlaceholder}
          />
        </Section>

        {/* Character-specific */}
        {entity.entityType === "character" && (
          <CharacterFields draft={draft as CharacterEntity} update={update} entities={entities} t={t} />
        )}

        {/* Location-specific */}
        {entity.entityType === "location" && (
          <LocationFields draft={draft as LocationEntity} update={update} t={t} />
        )}

        {/* Notes */}
        <Section title={t.entities.notes}>
          <textarea
            className="input"
            style={{ width: "100%", minHeight: 80, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
            value={draft.notes || ""}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder={t.entities.notesPlaceholder}
          />
        </Section>

        {/* Tags */}
        <Section title={t.entities.tags}>
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
              placeholder={t.entities.addTag}
            />
            <button className="btn-ghost" onClick={addTag}><Plus size={14} /></button>
          </div>
        </Section>

        {/* Links to other entities */}
        <Section title={t.entities.entityLinks}>
          {(draft.links || []).map((link, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <Link size={12} style={{ color: "var(--text-dim)", flexShrink: 0 }} />
              <select
                className="input"
                style={{ flex: 1 }}
                value={link.targetId}
                onChange={(e) => updateLink(idx, { targetId: e.target.value })}
              >
                <option value="">{t.entities.selectEntity}</option>
                {entities.filter((e) => e.id !== entity.id).map((e) => (
                  <option key={e.id} value={e.id}>{e.name} ({e.entityType})</option>
                ))}
              </select>
              <input
                className="input"
                style={{ width: 140 }}
                value={link.label}
                onChange={(e) => updateLink(idx, { label: e.target.value })}
                placeholder={t.entities.relationship}
              />
              <label style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                <input
                  type="checkbox"
                  checked={link.bidirectional}
                  onChange={(e) => updateLink(idx, { bidirectional: e.target.checked })}
                />
                {t.entities.bidirectional}
              </label>
              <button className="btn-ghost" style={{ color: "var(--error)", padding: 4 }} onClick={() => removeLink(idx)}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button className="btn-ghost" onClick={addLink} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <Plus size={12} /> {t.entities.addLink}
          </button>
        </Section>

        {/* Referenced in scenes */}
        <Section title={t.entities.referencedIn.replace("{count}", String(linkedScenes.length))}>
          {linkedScenes.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {linkedScenes.map((s) => (
                <div key={s.id} style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 8px", background: "var(--bg-hover)", borderRadius: "var(--radius-sm)" }}>
                  {s.title}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>{t.entities.notReferenced}</p>
          )}
        </Section>
      </div>
    </div>
  );
}

function CharacterFields({ draft, update, entities, t }: { draft: CharacterEntity; update: (p: Partial<CharacterEntity>) => void; entities: BaseEntity[]; t: ReturnType<typeof getTranslations> }) {
  const [langInput, setLangInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

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

  const addLanguage = () => {
    const l = langInput.trim();
    if (l && !(draft.languages || []).includes(l)) {
      update({ languages: [...(draft.languages || []), l] });
      setLangInput("");
    }
  };

  const removeLanguage = (lang: string) => {
    update({ languages: (draft.languages || []).filter((l) => l !== lang) });
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !(draft.skills || []).includes(s)) {
      update({ skills: [...(draft.skills || []), s] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    update({ skills: (draft.skills || []).filter((s) => s !== skill) });
  };

  const addCustomField = () => {
    update({ customFields: [...(draft.customFields || []), { key: "", value: "" }] });
  };

  const updateCustomField = (idx: number, partial: Partial<CustomField>) => {
    const fields = [...(draft.customFields || [])];
    fields[idx] = { ...fields[idx], ...partial };
    update({ customFields: fields });
  };

  const removeCustomField = (idx: number) => {
    update({ customFields: (draft.customFields || []).filter((_, i) => i !== idx) });
  };

  return (
    <>
      {/* Core character fields */}
      <Section title={t.character.details}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label={t.character.role} value={draft.role || ""} onChange={(v) => update({ role: v })} placeholder={t.character.rolePlaceholder} />
          <Field label={t.character.age} value={draft.age || ""} onChange={(v) => update({ age: v })} />
          <Field label={t.character.occupation} value={draft.occupation || ""} onChange={(v) => update({ occupation: v })} />
          <Field label={t.character.nationality} value={draft.nationality || ""} onChange={(v) => update({ nationality: v })} placeholder={t.character.nationalityPlaceholder} />
        </div>

        {/* Languages */}
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{t.character.languages}</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {(draft.languages || []).map((lang) => (
              <span key={lang} className="badge" style={{ cursor: "pointer" }} onClick={() => removeLanguage(lang)}>
                {lang} ×
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLanguage()}
              placeholder={t.character.languagesPlaceholder}
            />
            <button className="btn-ghost" onClick={addLanguage}><Plus size={14} /></button>
          </div>
        </div>

        {/* Skills */}
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{t.character.skills}</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {(draft.skills || []).map((skill) => (
              <span key={skill} className="badge" style={{ cursor: "pointer", background: "rgba(96,165,250,0.12)", color: "#60a5fa" }} onClick={() => removeSkill(skill)}>
                {skill} ×
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              className="input"
              style={{ flex: 1 }}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill()}
              placeholder={t.character.skillsPlaceholder}
            />
            <button className="btn-ghost" onClick={addSkill}><Plus size={14} /></button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{t.character.appearance}</label>
          <textarea className="input" style={{ width: "100%", minHeight: 60, resize: "vertical" }} value={draft.appearance || ""} onChange={(e) => update({ appearance: e.target.value })} placeholder={t.character.appearancePlaceholder} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{t.character.personality}</label>
          <textarea className="input" style={{ width: "100%", minHeight: 60, resize: "vertical" }} value={draft.personality || ""} onChange={(e) => update({ personality: e.target.value })} placeholder={t.character.personalityPlaceholder} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{t.character.background}</label>
          <textarea className="input" style={{ width: "100%", minHeight: 60, resize: "vertical" }} value={draft.background || ""} onChange={(e) => update({ background: e.target.value })} placeholder={t.character.backgroundPlaceholder} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{t.character.motivation}</label>
          <textarea className="input" style={{ width: "100%", minHeight: 60, resize: "vertical" }} value={draft.motivation || ""} onChange={(e) => update({ motivation: e.target.value })} placeholder={t.character.motivationPlaceholder} />
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{t.character.characterArc}</label>
          <textarea className="input" style={{ width: "100%", minHeight: 60, resize: "vertical" }} value={draft.arc || ""} onChange={(e) => update({ arc: e.target.value })} placeholder={t.character.arcPlaceholder} />
        </div>
      </Section>

      {/* Custom fields */}
      <Section title={t.character.customFields}>
        {(draft.customFields || []).map((field, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <input className="input" style={{ width: 160 }} value={field.key} onChange={(e) => updateCustomField(idx, { key: e.target.value })} placeholder={t.character.fieldName} />
            <input className="input" style={{ flex: 1 }} value={field.value} onChange={(e) => updateCustomField(idx, { value: e.target.value })} placeholder={t.character.fieldValue} />
            <button className="btn-ghost" style={{ color: "var(--error)", padding: 4 }} onClick={() => removeCustomField(idx)}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button className="btn-ghost" onClick={addCustomField} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <Plus size={12} /> {t.character.addCustomField}
        </button>
      </Section>

      {/* Relationships */}
      <Section title={t.character.relationships}>
        {(draft.relationships || []).map((rel, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <select className="input" style={{ flex: 1 }} value={rel.targetId} onChange={(e) => updateRelationship(idx, { targetId: e.target.value })}>
              <option value="">{t.character.selectCharacter}</option>
              {entities.filter((e) => e.entityType === "character" && e.id !== draft.id).map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <input className="input" style={{ width: 120 }} value={rel.type} onChange={(e) => updateRelationship(idx, { type: e.target.value })} placeholder={t.character.type} />
            <input className="input" style={{ flex: 1 }} value={rel.description} onChange={(e) => updateRelationship(idx, { description: e.target.value })} placeholder={t.character.descriptionField} />
            <button className="btn-ghost" style={{ color: "var(--error)", padding: 4 }} onClick={() => update({ relationships: (draft.relationships || []).filter((_, i) => i !== idx) })}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button className="btn-ghost" onClick={addRelationship} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <Plus size={12} /> {t.character.addRelationship}
        </button>
      </Section>

      {/* State changes */}
      <Section title={t.character.stateChanges}>
        {(draft.stateChanges || []).map((sc, idx) => (
          <div key={idx} style={{ padding: 10, background: "var(--bg-hover)", borderRadius: "var(--radius-sm)", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <input className="input" style={{ flex: 1 }} value={sc.property} onChange={(e) => {
                const changes = [...(draft.stateChanges || [])];
                changes[idx] = { ...changes[idx], property: e.target.value };
                update({ stateChanges: changes });
              }} placeholder={t.character.property} />
              <input className="input" style={{ width: 100 }} value={sc.from} onChange={(e) => {
                const changes = [...(draft.stateChanges || [])];
                changes[idx] = { ...changes[idx], from: e.target.value };
                update({ stateChanges: changes });
              }} placeholder={t.character.from} />
              <span style={{ color: "var(--text-dim)", alignSelf: "center" }}>→</span>
              <input className="input" style={{ width: 100 }} value={sc.to} onChange={(e) => {
                const changes = [...(draft.stateChanges || [])];
                changes[idx] = { ...changes[idx], to: e.target.value };
                update({ stateChanges: changes });
              }} placeholder={t.character.to} />
            </div>
            <input className="input" style={{ width: "100%" }} value={sc.description} onChange={(e) => {
              const changes = [...(draft.stateChanges || [])];
              changes[idx] = { ...changes[idx], description: e.target.value };
              update({ stateChanges: changes });
            }} placeholder={t.character.whatTriggers} />
          </div>
        ))}
        <button className="btn-ghost" onClick={addStateChange} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <Plus size={12} /> {t.character.addStateChange}
        </button>
      </Section>
    </>
  );
}

function LocationFields({ draft, update, t }: { draft: LocationEntity; update: (p: Partial<LocationEntity>) => void; t: ReturnType<typeof getTranslations> }) {
  return (
    <Section title={t.location.details}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label={t.location.type} value={draft.locationType || ""} onChange={(v) => update({ locationType: v })} placeholder={t.location.typePlaceholder} />
        <Field label={t.location.climate} value={draft.climate || ""} onChange={(v) => update({ climate: v })} placeholder={t.location.climatePlaceholder} />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", display: "block", marginBottom: 4 }}>{t.location.atmosphere}</label>
        <textarea
          className="input"
          style={{ width: "100%", minHeight: 80, resize: "vertical" }}
          value={draft.atmosphere || ""}
          onChange={(e) => update({ atmosphere: e.target.value })}
          placeholder={t.location.atmospherePlaceholder}
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
