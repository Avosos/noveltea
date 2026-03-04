import { create } from "zustand";
import type {
  AppView, Project, StoryMeta, Chapter, Scene, Entity, EntityType,
  NovelTeaSettings, SearchResult, Snapshot, Conflict, Plotline,
  CharacterEntity, LocationEntity, BaseEntity,
} from "@/types";
import { v4 as uuid } from "uuid";

/* ══════════════════════════════════════════════════════════════════════════════
 * NovelTea Store
 * Central state for the entire application. Entities are stored as a flat array.
 * ══════════════════════════════════════════════════════════════════════════════ */

interface NovelTeaState {
  // ─── View & Navigation ──────────────────────────────────
  currentView: AppView;
  setView: (view: AppView) => void;

  // ─── Project ────────────────────────────────────────────
  projectPath: string | null;
  project: Project | null;
  story: StoryMeta | null;
  chapters: Chapter[];
  entities: BaseEntity[];
  settings: NovelTeaSettings;
  recentProjects: { name: string; path: string; openedAt: number }[];

  // ─── Editor state ───────────────────────────────────────
  activeChapterId: string | null;
  activeSceneId: string | null;
  selectedEntityId: string | null;
  focusMode: boolean;
  contextPanelOpen: boolean;
  unsavedChanges: boolean;

  // ─── Search ─────────────────────────────────────────────
  searchQuery: string;
  searchResults: SearchResult[];

  // ─── Word count cache ───────────────────────────────────
  wordCount: { total: number; byChapter: Record<string, number> };

  // ─── Snapshots ──────────────────────────────────────────
  snapshots: Snapshot[];

  // ─── Actions ────────────────────────────────────────────
  init: () => Promise<void>;
  createProject: (name: string) => Promise<void>;
  openProject: (dirPath: string) => Promise<void>;
  closeProject: () => void;

  // Chapter / Scene
  addChapter: (title?: string) => Promise<void>;
  updateChapter: (chapter: Chapter) => Promise<void>;
  deleteChapter: (chapterId: string) => Promise<void>;
  reorderChapters: (orderedIds: string[]) => Promise<void>;
  selectChapter: (chapterId: string) => void;
  addScene: (chapterId: string, title?: string) => Promise<void>;
  updateScene: (chapterId: string, scene: Scene) => Promise<void>;
  deleteScene: (chapterId: string, sceneId: string) => Promise<void>;
  selectScene: (chapterId: string, sceneId: string) => void;
  moveScene: (fromChapterId: string, toChapterId: string, sceneId: string, newOrder: number) => Promise<void>;

  // Entity (flat array — no type param needed)
  addEntity: (entityType: EntityType) => Promise<void>;
  updateEntity: (entity: BaseEntity) => Promise<void>;
  deleteEntity: (entityId: string) => Promise<void>;
  selectEntity: (entityId: string) => void;

  // Story metadata
  updateStory: (patch: Partial<StoryMeta>) => Promise<void>;

  // Settings
  updateSettings: (patch: Partial<NovelTeaSettings>) => Promise<void>;

  // Search
  setSearchQuery: (query: string) => void;
  performSearch: () => Promise<void>;

  // Snapshots
  createSnapshot: (label?: string) => Promise<void>;
  loadSnapshots: () => Promise<void>;

  // Utilities
  refreshWordCount: () => Promise<void>;
  toggleFocusMode: () => void;
  toggleContextPanel: () => void;
  autosave: () => Promise<void>;

  // Get helpers
  getActiveChapter: () => Chapter | null;
  getActiveScene: () => Scene | null;
  getScenesForEntity: (entityId: string) => Scene[];
  getEntitiesInScene: (content: string) => BaseEntity[];
}

const DEFAULT_SETTINGS: NovelTeaSettings = {
  theme: "dark",
  editorFont: "Inter, system-ui, sans-serif",
  editorFontSize: 16,
  editorLineHeight: 1.8,
  autosaveInterval: 30000,
  showWordCount: true,
  typewriterMode: false,
  focusMode: false,
  spellcheck: true,
};

export const useNovelTeaStore = create<NovelTeaState>((set, get) => ({
  // ─── Initial state ──────────────────────────────────────
  currentView: "welcome",
  projectPath: null,
  project: null,
  story: null,
  chapters: [],
  entities: [],
  settings: DEFAULT_SETTINGS,
  recentProjects: [],
  activeChapterId: null,
  activeSceneId: null,
  selectedEntityId: null,
  focusMode: false,
  contextPanelOpen: true,
  unsavedChanges: false,
  searchQuery: "",
  searchResults: [],
  wordCount: { total: 0, byChapter: {} },
  snapshots: [],

  // ─── Actions ────────────────────────────────────────────
  init: async () => {
    const api = window.electronAPI;
    if (!api) return;
    const [settings, recent] = await Promise.all([
      api.getSettings(),
      api.getRecent(),
    ]);
    set({
      settings: settings || DEFAULT_SETTINGS,
      recentProjects: recent || [],
    });
  },

  setView: (view: AppView) => set({ currentView: view }),

  createProject: async (name: string) => {
    const api = window.electronAPI;
    if (!api) return;
    const dirPath = await api.saveFolderDialog(name);
    if (!dirPath) return;
    const fullPath = dirPath.endsWith(name) ? dirPath : `${dirPath}\\${name}`;
    const { project, chapterId } = await api.createProject(fullPath);
    await api.addRecent({ name: project.name, path: fullPath });
    const data = await api.openProject(fullPath);
    set({
      projectPath: fullPath,
      project: data.project,
      story: data.story,
      chapters: data.chapters,
      entities: data.entities || [],
      currentView: "editor",
      activeChapterId: chapterId,
      activeSceneId: data.chapters[0]?.scenes?.[0]?.id || null,
    });
    get().refreshWordCount();
  },

  openProject: async (dirPath: string) => {
    const api = window.electronAPI;
    if (!api) return;
    const data = await api.openProject(dirPath);
    await api.addRecent({ name: data.project.name, path: dirPath });
    const recent = await api.getRecent();
    const firstChapter = data.chapters[0];
    set({
      projectPath: dirPath,
      project: data.project,
      story: data.story,
      chapters: data.chapters,
      entities: data.entities || [],
      recentProjects: recent || [],
      currentView: "editor",
      activeChapterId: firstChapter?.id || null,
      activeSceneId: firstChapter?.scenes?.[0]?.id || null,
    });
    get().refreshWordCount();
    get().loadSnapshots();
  },

  closeProject: () => set({
    projectPath: null,
    project: null,
    story: null,
    chapters: [],
    entities: [],
    activeChapterId: null,
    activeSceneId: null,
    selectedEntityId: null,
    currentView: "welcome",
    unsavedChanges: false,
  }),

  // ── Chapter ─────────────────────────────────────────────
  addChapter: async (title?: string) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const ch: Chapter = {
      id: uuid(),
      title: title || `Chapter ${chapters.length + 1}`,
      order: chapters.length,
      act: 1,
      scenes: [{
        id: uuid(),
        title: "Scene 1",
        order: 0,
        content: "",
        pov: null,
        location: null,
        timeline: null,
        tensionLevel: 5,
        entityIds: [],
        metadata: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await window.electronAPI?.saveChapter(projectPath, ch);
    set({ chapters: [...chapters, ch], activeChapterId: ch.id, activeSceneId: ch.scenes[0].id });
  },

  updateChapter: async (chapter: Chapter) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const updated = chapters.map((c: Chapter) => c.id === chapter.id ? chapter : c);
    await window.electronAPI?.saveChapter(projectPath, chapter);
    set({ chapters: updated, unsavedChanges: false });
  },

  deleteChapter: async (chapterId: string) => {
    const { chapters, projectPath, activeChapterId } = get();
    if (!projectPath) return;
    await window.electronAPI?.deleteChapter(projectPath, chapterId);
    const filtered = chapters.filter((c: Chapter) => c.id !== chapterId);
    const newActive = activeChapterId === chapterId
      ? (filtered[0]?.id || null)
      : activeChapterId;
    set({
      chapters: filtered,
      activeChapterId: newActive,
      activeSceneId: filtered.find((c: Chapter) => c.id === newActive)?.scenes?.[0]?.id || null,
    });
  },

  reorderChapters: async (orderedIds: string[]) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const reordered = orderedIds.map((id: string, i: number) => {
      const ch = chapters.find((c: Chapter) => c.id === id)!;
      return { ...ch, order: i };
    });
    for (const ch of reordered) {
      await window.electronAPI?.saveChapter(projectPath, ch);
    }
    set({ chapters: reordered });
  },

  selectChapter: (chapterId: string) => {
    const ch = get().chapters.find((c: Chapter) => c.id === chapterId);
    set({
      activeChapterId: chapterId,
      activeSceneId: ch?.scenes?.[0]?.id || null,
      currentView: "editor",
    });
  },

  addScene: async (chapterId: string, title?: string) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const ch = chapters.find((c: Chapter) => c.id === chapterId);
    if (!ch) return;
    const scene: Scene = {
      id: uuid(),
      title: title || `Scene ${ch.scenes.length + 1}`,
      order: ch.scenes.length,
      content: "",
      pov: null,
      location: null,
      timeline: null,
      tensionLevel: 5,
      entityIds: [],
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = { ...ch, scenes: [...ch.scenes, scene], updatedAt: Date.now() };
    await window.electronAPI?.saveChapter(projectPath, updated);
    set({
      chapters: chapters.map((c: Chapter) => c.id === chapterId ? updated : c),
      activeSceneId: scene.id,
    });
  },

  updateScene: async (chapterId: string, scene: Scene) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const ch = chapters.find((c: Chapter) => c.id === chapterId);
    if (!ch) return;
    const updatedScenes = ch.scenes.map((s: Scene) => s.id === scene.id ? { ...scene, updatedAt: Date.now() } : s);
    const updated = { ...ch, scenes: updatedScenes, updatedAt: Date.now() };
    await window.electronAPI?.saveChapter(projectPath, updated);
    set({
      chapters: chapters.map((c: Chapter) => c.id === chapterId ? updated : c),
      unsavedChanges: false,
    });
  },

  deleteScene: async (chapterId: string, sceneId: string) => {
    const { chapters, projectPath, activeSceneId } = get();
    if (!projectPath) return;
    const ch = chapters.find((c: Chapter) => c.id === chapterId);
    if (!ch || ch.scenes.length <= 1) return;
    const filtered = ch.scenes.filter((s: Scene) => s.id !== sceneId);
    const updated = { ...ch, scenes: filtered, updatedAt: Date.now() };
    await window.electronAPI?.saveChapter(projectPath, updated);
    set({
      chapters: chapters.map((c: Chapter) => c.id === chapterId ? updated : c),
      activeSceneId: activeSceneId === sceneId ? (filtered[0]?.id || null) : activeSceneId,
    });
  },

  selectScene: (chapterId: string, sceneId: string) => {
    set({ activeChapterId: chapterId, activeSceneId: sceneId, currentView: "editor" });
  },

  moveScene: async (fromChapterId: string, toChapterId: string, sceneId: string, newOrder: number) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const fromCh = chapters.find((c: Chapter) => c.id === fromChapterId);
    const toCh = chapters.find((c: Chapter) => c.id === toChapterId);
    if (!fromCh || !toCh) return;
    const scene = fromCh.scenes.find((s: Scene) => s.id === sceneId);
    if (!scene) return;

    const fromScenes = fromCh.scenes.filter((s: Scene) => s.id !== sceneId);
    const toScenes = [...(fromChapterId === toChapterId ? fromScenes : toCh.scenes)];
    toScenes.splice(newOrder, 0, { ...scene, order: newOrder });
    const reindexed = toScenes.map((s: Scene, i: number) => ({ ...s, order: i }));

    const updatedFrom = { ...fromCh, scenes: fromChapterId === toChapterId ? reindexed : fromScenes };
    const updatedTo = fromChapterId === toChapterId ? updatedFrom : { ...toCh, scenes: reindexed };

    await window.electronAPI?.saveChapter(projectPath, updatedFrom);
    if (fromChapterId !== toChapterId) {
      await window.electronAPI?.saveChapter(projectPath, updatedTo);
    }

    set({
      chapters: chapters.map((c: Chapter) => {
        if (c.id === fromChapterId) return updatedFrom;
        if (c.id === toChapterId) return updatedTo;
        return c;
      }),
    });
  },

  // ── Entity (flat array) ─────────────────────────────────
  addEntity: async (entityType: EntityType) => {
    const { entities, projectPath } = get();
    if (!projectPath) return;
    const base: BaseEntity = {
      id: uuid(),
      name: `New ${entityType}`,
      entityType,
      description: "",
      tags: [],
      links: [],
      notes: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    let entity: Entity;
    if (entityType === "character") {
      entity = { ...base, entityType: "character", relationships: [], stateChanges: [] } as CharacterEntity;
    } else if (entityType === "location") {
      entity = { ...base, entityType: "location" } as LocationEntity;
    } else {
      entity = base as Entity;
    }
    await window.electronAPI?.saveEntity(projectPath, entity);
    set({
      entities: [...entities, entity],
      selectedEntityId: entity.id,
      currentView: "entity-detail",
    });
  },

  updateEntity: async (entity: BaseEntity) => {
    const { entities, projectPath } = get();
    if (!projectPath) return;
    await window.electronAPI?.saveEntity(projectPath, entity as Entity);
    set({
      entities: entities.map((e: BaseEntity) => e.id === entity.id ? entity : e),
    });
  },

  deleteEntity: async (entityId: string) => {
    const { entities, projectPath } = get();
    if (!projectPath) return;
    await window.electronAPI?.deleteEntity(projectPath, entityId);
    set({
      entities: entities.filter((e: BaseEntity) => e.id !== entityId),
      selectedEntityId: null,
    });
  },

  selectEntity: (entityId: string) => {
    set({ selectedEntityId: entityId, currentView: "entity-detail" });
  },

  // ── Story metadata ──────────────────────────────────────
  updateStory: async (patch: Partial<StoryMeta>) => {
    const { story, projectPath } = get();
    if (!projectPath || !story) return;
    const updated = { ...story, ...patch };
    await window.electronAPI?.saveStory(projectPath, updated);
    set({ story: updated });
  },

  // ── Settings ────────────────────────────────────────────
  updateSettings: async (patch: Partial<NovelTeaSettings>) => {
    const api = window.electronAPI;
    if (!api) return;
    const updated = await api.patchSettings(patch);
    set({ settings: updated });
  },

  // ── Search ──────────────────────────────────────────────
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  performSearch: async () => {
    const { searchQuery, projectPath } = get();
    if (!projectPath || !searchQuery.trim()) {
      set({ searchResults: [] });
      return;
    }
    const results = await window.electronAPI?.searchProject(projectPath, searchQuery) || [];
    set({ searchResults: results });
  },

  // ── Snapshots ───────────────────────────────────────────
  createSnapshot: async (label?: string) => {
    const { projectPath } = get();
    if (!projectPath) return;
    await window.electronAPI?.createSnapshot(projectPath, label);
    get().loadSnapshots();
  },

  loadSnapshots: async () => {
    const { projectPath } = get();
    if (!projectPath) return;
    const snapshots = await window.electronAPI?.listSnapshots(projectPath) || [];
    set({ snapshots });
  },

  // ── Utilities ───────────────────────────────────────────
  refreshWordCount: async () => {
    const { projectPath } = get();
    if (!projectPath) return;
    const wc = await window.electronAPI?.getWordCount(projectPath) || { total: 0, byChapter: {} };
    set({ wordCount: wc });
  },

  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),
  toggleContextPanel: () => set((s) => ({ contextPanelOpen: !s.contextPanelOpen })),

  autosave: async () => {
    const { activeChapterId, chapters, projectPath } = get();
    if (!projectPath || !activeChapterId) return;
    const ch = chapters.find((c: Chapter) => c.id === activeChapterId);
    if (ch) {
      await window.electronAPI?.saveChapter(projectPath, ch);
      set({ unsavedChanges: false });
    }
  },

  // ── Getters ─────────────────────────────────────────────
  getActiveChapter: () => {
    const { chapters, activeChapterId } = get();
    return chapters.find((c: Chapter) => c.id === activeChapterId) ?? null;
  },

  getActiveScene: () => {
    const ch = get().getActiveChapter();
    if (!ch) return null;
    return ch.scenes.find((s: Scene) => s.id === get().activeSceneId) ?? null;
  },

  getScenesForEntity: (entityId: string): Scene[] => {
    const results: Scene[] = [];
    for (const ch of get().chapters) {
      for (const scene of ch.scenes) {
        if (
          scene.pov === entityId ||
          scene.location === entityId ||
          (scene.entityIds || []).includes(entityId) ||
          scene.content.includes(`[[${entityId}]]`)
        ) {
          results.push(scene);
        }
      }
    }
    return results;
  },

  getEntitiesInScene: (content: string): BaseEntity[] => {
    return get().entities.filter((e: BaseEntity) =>
      content.includes(`[[${e.name}]]`) ||
      content.includes(`[[${e.id}]]`) ||
      content.toLowerCase().includes(e.name.toLowerCase())
    );
  },
}));
