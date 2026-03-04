"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Eye, EyeOff, Save, ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Info, Users, MapPin, Target, Hash, Clock, MessageSquare,
} from "lucide-react";
import { useNovelTeaStore } from "@/stores/noveltea-store";
import { getTranslations } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import type { Scene, BaseEntity, CharacterEntity } from "@/types";

export default function EditorView() {
  const {
    activeChapterId, activeSceneId, chapters, focusMode, contextPanelOpen,
    toggleFocusMode, toggleContextPanel, updateScene, settings,
    getActiveChapter, getActiveScene, getEntitiesInScene, entities, selectEntity,
    addScene, selectScene, wordCount, refreshWordCount,
    addDialogueAttribution,
  } = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");
  const { showToast } = useToast();

  const activeChapter = getActiveChapter();
  const activeScene = getActiveScene();
  const [localContent, setLocalContent] = useState(activeScene?.content ?? "");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when scene changes
  useEffect(() => {
    setLocalContent(activeScene?.content ?? "");
  }, [activeSceneId, activeScene?.content]);

  // Autosave
  const saveContent = useCallback(() => {
    if (!activeChapterId || !activeSceneId || !activeScene) return;
    if (localContent !== activeScene.content) {
      updateScene(activeChapterId, { ...activeScene, content: localContent });
      refreshWordCount();
      showToast(t.editor.saved, "success");
    }
  }, [activeChapterId, activeSceneId, activeScene, localContent, updateScene, refreshWordCount, showToast, t]);

  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(saveContent, settings.autosaveInterval || 30000);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [localContent, saveContent, settings.autosaveInterval]);

  // Manual save on Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveContent();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveContent]);

  // Entities mentioned in current scene
  const mentionedEntities = activeScene ? getEntitiesInScene(localContent) : [];

  // Scene word count
  const sceneWords = localContent.trim().split(/\s+/).filter(Boolean).length;

  // Characters for dialogue attribution
  const characters = useMemo(() => entities.filter((e) => e.entityType === "character"), [entities]);

  // Dialogue marking state
  const [showDialogueMenu, setShowDialogueMenu] = useState(false);
  const [dialogueMenuPos, setDialogueMenuPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState({ text: "", start: 0, end: 0 });

  const handleTextSelect = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      const text = localContent.slice(start, end);
      setSelectedText({ text, start, end });
    }
  }, [localContent]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      e.preventDefault();
      setSelectedText({ text: localContent.slice(start, end), start, end });
      setDialogueMenuPos({ x: e.clientX, y: e.clientY });
      setShowDialogueMenu(true);
    }
  }, [localContent]);

  const markAsDialogue = (characterId: string, type: "speech" | "mention") => {
    if (!activeChapterId || !activeSceneId || !selectedText.text) return;
    addDialogueAttribution({
      characterId,
      type,
      text: selectedText.text,
      chapterId: activeChapterId,
      sceneId: activeSceneId,
      startOffset: selectedText.start,
      endOffset: selectedText.end,
    });
    setShowDialogueMenu(false);
    showToast(`${type === "speech" ? t.editor.markAsSpeech : t.editor.markAsMention} ✓`, "success");
  };

  if (!activeChapter || !activeScene) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
        {t.editor.selectChapterScene}
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", overflow: "hidden" }}>
      {/* Scene tabs (left strip when not in focus mode) */}
      {!focusMode && (
        <div style={{
          width: 200,
          borderRight: "1px solid var(--border-subtle)",
          background: "var(--bg-secondary)",
          overflow: "auto",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{ padding: "12px 10px 8px", fontSize: 11, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1 }}>
            {activeChapter.title}
          </div>
          {activeChapter.scenes.map((scene, i) => (
            <button
              key={scene.id}
              onClick={() => selectScene(activeChapterId!, scene.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                background: scene.id === activeSceneId ? "var(--accent-muted)" : "transparent",
                border: "none",
                borderLeft: scene.id === activeSceneId ? "2px solid var(--accent)" : "2px solid transparent",
                color: scene.id === activeSceneId ? "var(--accent)" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: scene.id === activeSceneId ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.1s",
              }}
            >
              <div>{scene.title}</div>
              {scene.pov && (
                <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                  POV: {entities.find((c) => c.entityType === "character" && c.id === scene.pov)?.name || "—"}
                </div>
              )}
            </button>
          ))}
          <button
            onClick={() => addScene(activeChapterId!)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              color: "var(--text-dim)",
              fontSize: 11,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            + {t.editor.addScene.replace("+ ", "")}
          </button>
        </div>
      )}

      {/* Main editor area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-secondary)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
              {activeScene.title}
            </span>
            <span className="badge">{sceneWords} {t.editor.words}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ToolbarButton onClick={saveContent} title={t.editor.save}>
              <Save size={14} />
            </ToolbarButton>
            <ToolbarButton onClick={toggleFocusMode} title={t.editor.focusMode}>
              {focusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </ToolbarButton>
            <ToolbarButton onClick={toggleContextPanel} title={t.editor.storyContext}>
              {contextPanelOpen ? <EyeOff size={14} /> : <Eye size={14} />}
            </ToolbarButton>
          </div>
        </div>

        {/* Scene metadata bar */}
        {!focusMode && (
          <SceneMetadataBar scene={activeScene} chapterId={activeChapterId!} />
        )}

        {/* Editor */}
        <div style={{ flex: 1, overflow: "auto", background: "var(--bg-primary)" }}>
          <textarea
            ref={editorRef}
            className="novel-editor"
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            onSelect={handleTextSelect}
            onContextMenu={handleContextMenu}
            placeholder={t.editor.beginWriting}
            style={{
              width: "100%",
              minHeight: "100%",
              background: "transparent",
              border: "none",
              resize: "none",
              fontFamily: settings.editorFont || "Georgia, serif",
              fontSize: settings.editorFontSize || 16,
            }}
            spellCheck={settings.spellcheck}
          />
        </div>

        {/* Dialogue context menu */}
        {showDialogueMenu && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setShowDialogueMenu(false)} />
            <div style={{
              position: "fixed", left: dialogueMenuPos.x, top: dialogueMenuPos.y, zIndex: 100,
              background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
              padding: 8, minWidth: 220, boxShadow: "var(--shadow-lg)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dim)", padding: "4px 8px", marginBottom: 4 }}>
                <MessageSquare size={12} style={{ display: "inline", marginRight: 4 }} />
                {t.dialogue.title}
              </div>
              {characters.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 4, padding: "2px 4px" }}>
                  <button
                    className="btn-ghost"
                    style={{ flex: 1, justifyContent: "flex-start", fontSize: 12, padding: "4px 8px" }}
                    onClick={() => markAsDialogue(c.id, "speech")}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: (c as CharacterEntity).dialogueColor || "#60a5fa", display: "inline-block", marginRight: 6 }} />
                    {c.name} — {t.editor.markAsSpeech}
                  </button>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: 11, padding: "4px 6px", color: "var(--text-dim)" }}
                    onClick={() => markAsDialogue(c.id, "mention")}
                    title={t.editor.markAsMention}
                  >
                    @
                  </button>
                </div>
              ))}
              {characters.length === 0 && (
                <div style={{ padding: "8px", fontSize: 11, color: "var(--text-dim)" }}>
                  {t.dialogue.noAttributions}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Story Context Panel */}
      {contextPanelOpen && !focusMode && (
        <StoryContextPanel
          scene={activeScene}
          mentionedEntities={mentionedEntities}
          onSelectEntity={selectEntity}
        />
      )}
    </div>
  );
}

/* ─── Scene Metadata Bar ─── */
function SceneMetadataBar({ scene, chapterId }: { scene: Scene; chapterId: string }) {
  const { updateScene, entities, settings } = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");
  const characters = entities.filter((e) => e.entityType === "character");
  const locations = entities.filter((e) => e.entityType === "location");

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "6px 16px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-tertiary)",
      fontSize: 12,
      flexShrink: 0,
      flexWrap: "wrap",
    }}>
      <MetaField
        icon={<Users size={12} />}
        label={t.editor.pov}
        value={characters.find((c) => c.id === scene.pov)?.name || "—"}
        options={characters.map((c) => ({ value: c.id, label: c.name }))}
        onChange={(val) => updateScene(chapterId, { ...scene, pov: val || null })}
      />
      <MetaField
        icon={<MapPin size={12} />}
        label={t.editor.location}
        value={locations.find((l) => l.id === scene.location)?.name || "—"}
        options={locations.map((l) => ({ value: l.id, label: l.name }))}
        onChange={(val) => updateScene(chapterId, { ...scene, location: val || null })}
      />
      <MetaField
        icon={<Clock size={12} />}
        label={t.editor.timelineLabel}
        value={scene.timeline || "—"}
        editable
        onChange={(val) => updateScene(chapterId, { ...scene, timeline: val || null })}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Target size={12} style={{ color: "var(--text-dim)" }} />
        <span style={{ color: "var(--text-dim)" }}>{t.editor.tension}:</span>
        <input
          type="range"
          min="0"
          max="10"
          value={scene.tensionLevel}
          onChange={(e) => updateScene(chapterId, { ...scene, tensionLevel: Number(e.target.value) })}
          style={{ width: 60, accentColor: "var(--accent)" }}
        />
        <span style={{
          color: scene.tensionLevel <= 3 ? "var(--success)" : scene.tensionLevel <= 6 ? "var(--warning)" : "var(--error)",
          fontWeight: 600, width: 16, textAlign: "center",
        }}>
          {scene.tensionLevel}
        </span>
      </div>
    </div>
  );
}

function MetaField({
  icon, label, value, options, editable, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options?: { value: string; label: string }[];
  editable?: boolean;
  onChange: (val: string) => void;
}) {
  if (options) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {icon}
        <span style={{ color: "var(--text-dim)" }}>{label}:</span>
        <select
          value={value === "—" ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            fontSize: 12,
            cursor: "pointer",
            maxWidth: 120,
          }}
        >
          <option value="">—</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    );
  }

  const [editing, setEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value);

  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {icon}
        <span style={{ color: "var(--text-dim)" }}>{label}:</span>
        <input
          className="input"
          style={{ width: 120, padding: "2px 6px", fontSize: 12 }}
          value={tempVal === "—" ? "" : tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onBlur={() => { onChange(tempVal); setEditing(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") { onChange(tempVal); setEditing(false); } }}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 4, cursor: editable ? "pointer" : "default" }}
      onClick={() => editable && setEditing(true)}
    >
      {icon}
      <span style={{ color: "var(--text-dim)" }}>{label}:</span>
      <span style={{ color: "var(--text-secondary)" }}>{value}</span>
    </div>
  );
}

/* ─── Story Context Panel ─── */
function StoryContextPanel({
  scene, mentionedEntities, onSelectEntity,
}: {
  scene: Scene;
  mentionedEntities: BaseEntity[];
  onSelectEntity: (id: string) => void;
}) {
  const { entities, chapters, story, settings } = useNovelTeaStore();
  const t = getTranslations(settings.language || "de");

  // Active conflicts
  const activeConflicts = story?.conflicts.filter((c) => c.status !== "resolved") || [];

  return (
    <div
      className="animate-slideInRight"
      style={{
        width: "var(--context-panel-width)",
        borderLeft: "1px solid var(--border-subtle)",
        background: "var(--bg-secondary)",
        overflow: "auto",
        flexShrink: 0,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
        {t.editor.storyContext}
      </div>

      {/* Referenced Entities */}
      {mentionedEntities.length > 0 && (
        <ContextSection title={t.editor.referencedEntities} icon={<Users size={13} />}>
          {mentionedEntities.map((e) => (
            <button
              key={e.id}
              onClick={() => onSelectEntity(e.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "6px 8px",
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                fontSize: 12,
                cursor: "pointer",
                borderRadius: 4,
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <EntityTypeBadge type={e.entityType} />
              <span>{e.name}</span>
            </button>
          ))}
        </ContextSection>
      )}

      {/* POV Character details */}
      {scene.pov && (
        <ContextSection title={t.editor.povCharacter} icon={<Users size={13} />}>
          {(() => {
            const char = entities.find((c) => c.entityType === "character" && c.id === scene.pov) as CharacterEntity | undefined;
            if (!char) return <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Unknown</span>;
            return (
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{char.name}</div>
                {char.motivation && <div style={{ color: "var(--text-muted)", marginBottom: 2 }}>Motivation: {char.motivation}</div>}
                {char.arc && <div style={{ color: "var(--text-muted)" }}>Arc: {char.arc}</div>}
              </div>
            );
          })()}
        </ContextSection>
      )}

      {/* Location */}
      {scene.location && (
        <ContextSection title={t.editor.location} icon={<MapPin size={13} />}>
          {(() => {
            const loc = entities.find((l) => l.entityType === "location" && l.id === scene.location);
            if (!loc) return null;
            return (
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{loc.name}</div>
                {loc.description && <div style={{ color: "var(--text-muted)" }}>{loc.description.slice(0, 200)}</div>}
              </div>
            );
          })()}
        </ContextSection>
      )}

      {/* Active Conflicts */}
      {activeConflicts.length > 0 && (
        <ContextSection title={t.editor.openConflicts} icon={<Target size={13} />}>
          {activeConflicts.slice(0, 5).map((c) => (
            <div key={c.id} style={{ padding: "4px 0", fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                  background: c.status === "planted" ? "var(--warning)" : "var(--info)",
                }} />
                <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{c.name}</span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", paddingLeft: 12 }}>
                {c.type} · {c.status}
              </div>
            </div>
          ))}
        </ContextSection>
      )}

      {/* Scene tension visualization */}
      <ContextSection title={t.editor.tensionCurve} icon={<Hash size={13} />}>
        <div style={{ display: "flex", alignItems: "end", gap: 2, height: 40, padding: "4px 0" }}>
          {chapters.flatMap((ch) => ch.scenes).map((s, i) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                height: `${Math.max(4, s.tensionLevel * 10)}%`,
                background: s.id === scene.id ? "var(--accent)" : "var(--bg-surface)",
                borderRadius: 2,
                maxWidth: 12,
                transition: "height 0.2s ease",
              }}
              title={`${s.title}: ${s.tensionLevel}/10`}
            />
          ))}
        </div>
      </ContextSection>
    </div>
  );
}

function ContextSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 11, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: 0.8 }}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

function EntityTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    character: "#60a5fa",
    location: "#4ade80",
    organization: "#fbbf24",
    artifact: "#e879f9",
    lore: "#f97316",
  };
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 700,
      color: colors[type] || "var(--text-dim)",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      flexShrink: 0,
    }}>
      {type.slice(0, 3)}
    </span>
  );
}

function ToolbarButton({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="btn-ghost"
      style={{ padding: "4px 8px", display: "flex", alignItems: "center" }}
    >
      {children}
    </button>
  );
}
