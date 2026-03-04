/* ══════════════════════════════════════════════════════════════════════════════
 * NovelTea — Type Definitions
 * ══════════════════════════════════════════════════════════════════════════════ */

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
  chapters: string[]; // chapter IDs
}

export interface Plotline {
  id: string;
  name: string;
  color: string;
  description: string;
  scenes: string[]; // scene IDs
}

export interface Conflict {
  id: string;
  name: string;
  type: "chekhov" | "foreshadow" | "question" | "subplot" | "custom";
  status: "open" | "in-progress" | "resolved";
  introducedIn: string; // scene ID
  resolvedIn?: string; // scene ID
  description: string;
  relatedEntities: string[]; // entity IDs
}

/* ─── Chapters & Scenes ──────────────────────────────────── */
export interface Chapter {
  id: string;
  title: string;
  order: number;
  act: number; // act index (1-based)
  scenes: Scene[];
  createdAt: number;
  updatedAt: number;
  notes?: string;
  plotlineId?: string;
}

export interface Scene {
  id: string;
  title: string;
  order: number;
  content: string;
  pov: string | null; // character entity ID
  location: string | null; // location entity ID
  timeline: string | null; // e.g. "Day 3, Evening"
  conflictLevel: number; // 0–10
  plotPoint: string | null; // inciting incident, climax, etc.
  tensionLevel: number; // 0–10
  plotlineId?: string;
  tags?: string[];
  metadata: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

/* ─── Entities ───────────────────────────────────────────── */
export type EntityType = "characters" | "locations" | "organizations" | "artifacts" | "lore";

export interface BaseEntity {
  id: string;
  name: string;
  type: EntityType;
  description: string;
  tags: string[];
  links: EntityLink[];
  createdAt: number;
  updatedAt: number;
}

export interface CharacterEntity extends BaseEntity {
  type: "characters";
  age?: string;
  role?: string; // protagonist, antagonist, supporting, minor
  motivation?: string;
  background?: string;
  appearance?: string;
  personality?: string;
  arc?: string;
  relationships: Relationship[];
  stateChanges: StateChange[];
}

export interface LocationEntity extends BaseEntity {
  type: "locations";
  region?: string;
  climate?: string;
  significance?: string;
  features?: string;
}

export interface OrganizationEntity extends BaseEntity {
  type: "organizations";
  purpose?: string;
  leader?: string; // character ID
  members?: string[]; // character IDs
  influence?: string;
}

export interface ArtifactEntity extends BaseEntity {
  type: "artifacts";
  origin?: string;
  powers?: string;
  currentHolder?: string; // character ID
  significance?: string;
}

export interface LoreEntity extends BaseEntity {
  type: "lore";
  category?: string; // magic system, history, culture, religion, etc.
  rules?: string;
  exceptions?: string;
}

export type Entity = CharacterEntity | LocationEntity | OrganizationEntity | ArtifactEntity | LoreEntity;

export interface EntityLink {
  targetId: string;
  targetType: EntityType;
  label: string;
}

export interface Relationship {
  targetId: string;
  label: string; // e.g. "Trusts", "Enemies with", "Mentor to"
  strength: number; // -10 to 10
  changes: { chapterId: string; description: string; newStrength: number }[];
}

export interface StateChange {
  chapterId: string;
  description: string;
  attribute: string; // what changed
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

/* ─── Settings ───────────────────────────────────────────── */
export interface NovelTeaSettings {
  theme: "dark" | "grey" | "light";
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  editorWidth: number;
  autosaveInterval: number;
  focusMode: boolean;
  showLineNumbers: boolean;
  spellcheck: boolean;
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
  | "stats";

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
    entities: Record<EntityType, Entity[]>;
  }>;
  saveChapter: (dirPath: string, chapter: Chapter) => Promise<boolean>;
  deleteChapter: (dirPath: string, chapterId: string) => Promise<boolean>;
  saveStory: (dirPath: string, story: StoryMeta) => Promise<boolean>;
  saveEntity: (dirPath: string, type: EntityType, entity: Entity) => Promise<boolean>;
  deleteEntity: (dirPath: string, type: EntityType, entityId: string) => Promise<boolean>;
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
