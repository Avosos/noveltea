/* ══════════════════════════════════════════════════════════════════════════════
 * NovelTea — Type Definitions
 * ══════════════════════════════════════════════════════════════════════════════ */

import type { Language } from "@/lib/i18n";

/* ─── Project ────────────────────────────────────────────── */
export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  version: string;
}

/* ─── Story Metadata ─────────────────────────────────────── */
export interface StoryMeta {
  title: string;
  subtitle: string;
  author: string;
  genre: string[];
  synopsis: string;
  targetWordCount: number;
  structure: "three-act" | "hero-journey" | "custom";
  acts: Act[];
  plotlines: Plotline[];
  conflicts: Conflict[];
  themes: string[];
}

export interface Act {
  id: string;
  name: string;
  chapters: string[];
}

export interface Plotline {
  id: string;
  name: string;
  color: string;
  description: string;
  scenes: string[];
}

export interface Conflict {
  id: string;
  name: string;
  type: "interpersonal" | "internal" | "societal" | "environmental" | "chekhovs-gun";
  status: "planted" | "active" | "resolved";
  plantedInChapter: string;
  resolvedInChapter: string;
  description: string;
  involvedEntityIds: string[];
  notes: string;
}

/* ─── Chapters & Scenes ──────────────────────────────────── */
export interface Chapter {
  id: string;
  title: string;
  order: number;
  act: number;
  scenes: Scene[];
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface Scene {
  id: string;
  title: string;
  order: number;
  content: string;
  pov: string | null;
  location: string | null;
  timeline: string | null;
  tensionLevel: number;
  entityIds: string[];
  plotlines?: string[];
  tags?: string[];
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

/* ─── Entities ───────────────────────────────────────────── */
export type EntityType = "character" | "location" | "organization" | "artifact" | "lore";

export interface BaseEntity {
  id: string;
  name: string;
  entityType: EntityType;
  description: string;
  tags: string[];
  links: EntityLink[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CharacterEntity extends BaseEntity {
  entityType: "character";
  age?: string;
  role?: string;
  occupation?: string;
  motivation?: string;
  background?: string;
  appearance?: string;
  personality?: string;
  arc?: string;
  nationality?: string;
  languages?: string[];
  skills?: string[];
  customFields?: CustomField[];
  dialogueColor?: string;
  mentionColor?: string;
  relationships: Relationship[];
  stateChanges: StateChange[];
}

export interface CustomField {
  key: string;
  value: string;
}

export interface LocationEntity extends BaseEntity {
  entityType: "location";
  locationType?: string;
  climate?: string;
  atmosphere?: string;
  significance?: string;
  features?: string;
}

export interface OrganizationEntity extends BaseEntity {
  entityType: "organization";
  purpose?: string;
  leader?: string;
  members?: string[];
  influence?: string;
}

export interface ArtifactEntity extends BaseEntity {
  entityType: "artifact";
  origin?: string;
  powers?: string;
  currentHolder?: string;
  significance?: string;
}

export interface LoreEntity extends BaseEntity {
  entityType: "lore";
  category?: string;
  rules?: string;
  exceptions?: string;
}

export type Entity = CharacterEntity | LocationEntity | OrganizationEntity | ArtifactEntity | LoreEntity;

export interface EntityLink {
  targetId: string;
  label: string;
  bidirectional: boolean;
}

export interface Relationship {
  targetId: string;
  type: string;
  description: string;
}

export interface StateChange {
  chapterId: string;
  description: string;
  property: string;
  from: string;
  to: string;
}

/* ─── Search ─────────────────────────────────────────────── */
export interface SearchResult {
  type: "scene" | "entity";
  chapterId?: string;
  chapterTitle?: string;
  sceneId?: string;
  sceneTitle?: string;
  entityType?: EntityType;
  entityId?: string;
  entityName?: string;
  snippet: string;
}

/* ─── Version Snapshots ──────────────────────────────────── */
export interface Snapshot {
  id: string;
  label: string;
  createdAt: number;
}

/* ─── Sources & Citations ────────────────────────────────── */
export interface Source {
  id: string;
  title: string;
  author: string;
  year: string;
  url?: string;
  publisher?: string;
  pages?: string;
  type: "book" | "article" | "website" | "journal" | "other";
  notes?: string;
  createdAt: number;
}

export interface Footnote {
  id: string;
  sourceId?: string;
  text: string;
  chapterId?: string;
  sceneId?: string;
  position?: number;
  createdAt: number;
}

/* ─── Dialogue Attribution ───────────────────────────────── */
export interface DialogueAttribution {
  id: string;
  characterId: string;
  type: "speech" | "mention";
  text: string;
  chapterId: string;
  sceneId: string;
  startOffset: number;
  endOffset: number;
  createdAt: number;
}

/* ─── Settings ───────────────────────────────────────────── */
export interface NovelTeaSettings {
  theme: "dark" | "grey" | "light";
  editorFont: string;
  editorFontSize: number;
  editorLineHeight: number;
  autosaveInterval: number;
  showWordCount: boolean;
  typewriterMode: boolean;
  focusMode: boolean;
  spellcheck: boolean;
  language: Language;
  highlightDates: boolean;
  highlightNames: boolean;
}

/* ─── Application Views ──────────────────────────────────── */
export type AppView =
  | "welcome"
  | "editor"
  | "chapters"
  | "entities"
  | "entity-detail"
  | "story-map"
  | "timeline"
  | "conflicts"
  | "search"
  | "settings"
  | "stats"
  | "graph"
  | "sources"
  | "dialogue";

/* ─── Electron API (window.electronAPI) ──────────────────── */
export interface ElectronAPI {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  onMaximizedChange: (cb: (val: boolean) => void) => () => void;
  getSettings: () => Promise<NovelTeaSettings>;
  setSettings: (settings: NovelTeaSettings) => Promise<boolean>;
  patchSettings: (partial: Partial<NovelTeaSettings>) => Promise<NovelTeaSettings>;
  getRecent: () => Promise<{ name: string; path: string; openedAt: number }[]>;
  addRecent: (project: { name: string; path: string }) => Promise<unknown>;
  removeRecent: (path: string) => Promise<unknown>;
  createProject: (dirPath: string) => Promise<{ project: Project; chapterId: string }>;
  openProject: (dirPath: string) => Promise<{
    project: Project;
    story: StoryMeta;
    chapters: Chapter[];
    entities: Entity[];
  }>;
  saveChapter: (dirPath: string, chapter: Chapter) => Promise<boolean>;
  deleteChapter: (dirPath: string, chapterId: string) => Promise<boolean>;
  saveStory: (dirPath: string, story: StoryMeta) => Promise<boolean>;
  saveEntity: (dirPath: string, entity: Entity) => Promise<boolean>;
  deleteEntity: (dirPath: string, entityId: string) => Promise<boolean>;
  saveProject: (dirPath: string, project: Project) => Promise<boolean>;
  createSnapshot: (dirPath: string, label?: string) => Promise<Snapshot>;
  listSnapshots: (dirPath: string) => Promise<Snapshot[]>;
  getWordCount: (dirPath: string) => Promise<{ total: number; byChapter: Record<string, number> }>;
  searchProject: (dirPath: string, query: string) => Promise<SearchResult[]>;
  openFolderDialog: () => Promise<string | null>;
  saveFolderDialog: (name: string) => Promise<string | null>;
  openExternal: (url: string) => Promise<void>;
  openPath: (path: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
