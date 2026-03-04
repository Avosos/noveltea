import { create } from "zustand";
import type {
  AppView, Project, StoryMeta, Chapter, Scene, Entity, EntityType,
  NovelTeaSettings, SearchResult, Snapshot, Conflict, Plotline,
  CharacterEntity, LocationEntity, BaseEntity,
} from "@/types";
import { v4 as uuid } from "uuid";

/* ══════════════════════════════════════════════════════════════════════════════
 * NovelTea Store
 * Central state for the entire application.
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
  entities: Record<EntityType, Entity[]>;
  settings: NovelTeaSettings;
  recentProjects: { name: string; path: string; openedAt: number }[];

  // ─── Editor state ───────────────────────────────────────
  activeChapterId: string | null;
  activeSceneId: string | null;
  activeEntityId: string | null;
  activeEntityType: EntityType | null;
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

  // Entity
  addEntity: (type: EntityType, name: string) => Promise<void>;
  updateEntity: (type: EntityType, entity: Entity) => Promise<void>;
  deleteEntity: (type: EntityType, entityId: string) => Promise<void>;
  selectEntity: (type: EntityType, entityId: string) => void;

  // Story metadata
  updateStory: (story: Partial<StoryMeta>) => Promise<void>;
  addConflict: (conflict: Omit<Conflict, "id">) => Promise<void>;
  updateConflict: (conflict: Conflict) => Promise<void>;
  addPlotline: (plotline: Omit<Plotline, "id">) => Promise<void>;

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
  getActiveEntity: () => Entity | null;
  getEntityById: (type: EntityType, id: string) => Entity | undefined;
  getScenesForEntity: (entityId: string) => { chapter: Chapter; scene: Scene }[];
  getEntitiesInScene: (content: string) => Entity[];
}

const DEFAULT_SETTINGS: NovelTeaSettings = {
  theme: "dark",
  accentColor: "#a3e635",
  fontSize: 16,
  fontFamily: "Georgia, serif",
  editorWidth: 720,
  autosaveInterval: 30000,
  focusMode: false,
  showLineNumbers: false,
  spellcheck: true,
};

export const useNovelTeaStore = create<NovelTeaState>((set, get) => ({
  // ─── Initial state ──────────────────────────────────────
  currentView: "welcome",
  projectPath: null,
  project: null,
  story: null,
  chapters: [],
  entities: {
    characters: [],
    locations: [],
    organizations: [],
    artifacts: [],
    lore: [],
  },
  settings: DEFAULT_SETTINGS,
  recentProjects: [],
  activeChapterId: null,
  activeSceneId: null,
  activeEntityId: null,
  activeEntityType: null,
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

  setView: (view) => set({ currentView: view }),

  createProject: async (name) => {
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
      entities: data.entities as Record<EntityType, Entity[]>,
      currentView: "editor",
      activeChapterId: chapterId,
      activeSceneId: data.chapters[0]?.scenes?.[0]?.id || null,
    });
    get().refreshWordCount();
  },

  openProject: async (dirPath) => {
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
      entities: data.entities as Record<EntityType, Entity[]>,
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
    entities: { characters: [], locations: [], organizations: [], artifacts: [], lore: [] },
    activeChapterId: null,
    activeSceneId: null,
    activeEntityId: null,
    activeEntityType: null,
    currentView: "welcome",
    unsavedChanges: false,
  }),

  // ── Chapter ─────────────────────────────────────────────
  addChapter: async (title) => {
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
        conflictLevel: 0,
        plotPoint: null,
        tensionLevel: 5,
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

  updateChapter: async (chapter) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const updated = chapters.map((c) => c.id === chapter.id ? chapter : c);
    await window.electronAPI?.saveChapter(projectPath, chapter);
    set({ chapters: updated, unsavedChanges: false });
  },

  deleteChapter: async (chapterId) => {
    const { chapters, projectPath, activeChapterId } = get();
    if (!projectPath) return;
    await window.electronAPI?.deleteChapter(projectPath, chapterId);
    const filtered = chapters.filter((c) => c.id !== chapterId);
    const newActive = activeChapterId === chapterId
      ? (filtered[0]?.id || null)
      : activeChapterId;
    set({
      chapters: filtered,
      activeChapterId: newActive,
      activeSceneId: filtered.find((c) => c.id === newActive)?.scenes?.[0]?.id || null,
    });
  },

  reorderChapters: async (orderedIds) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const reordered = orderedIds.map((id, i) => {
      const ch = chapters.find((c) => c.id === id)!;
      return { ...ch, order: i };
    });
    for (const ch of reordered) {
      await window.electronAPI?.saveChapter(projectPath, ch);
    }
    set({ chapters: reordered });
  },

  selectChapter: (chapterId) => {
    const ch = get().chapters.find((c) => c.id === chapterId);
    set({
      activeChapterId: chapterId,
      activeSceneId: ch?.scenes?.[0]?.id || null,
      currentView: "editor",
    });
  },

  addScene: async (chapterId, title) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    const scene: Scene = {
      id: uuid(),
      title: title || `Scene ${ch.scenes.length + 1}`,
      order: ch.scenes.length,
      content: "",
      pov: null,
      location: null,
      timeline: null,
      conflictLevel: 0,
      plotPoint: null,
      tensionLevel: 5,
      metadata: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = { ...ch, scenes: [...ch.scenes, scene], updatedAt: Date.now() };
    await window.electronAPI?.saveChapter(projectPath, updated);
    set({
      chapters: chapters.map((c) => c.id === chapterId ? updated : c),
      activeSceneId: scene.id,
    });
  },

  updateScene: async (chapterId, scene) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    const updatedScenes = ch.scenes.map((s) => s.id === scene.id ? { ...scene, updatedAt: Date.now() } : s);
    const updated = { ...ch, scenes: updatedScenes, updatedAt: Date.now() };
    await window.electronAPI?.saveChapter(projectPath, updated);
    set({
      chapters: chapters.map((c) => c.id === chapterId ? updated : c),
      unsavedChanges: false,
    });
  },

  deleteScene: async (chapterId, sceneId) => {
    const { chapters, projectPath, activeSceneId } = get();
    if (!projectPath) return;
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch || ch.scenes.length <= 1) return; // keep at least 1 scene
    const filtered = ch.scenes.filter((s) => s.id !== sceneId);
    const updated = { ...ch, scenes: filtered, updatedAt: Date.now() };
    await window.electronAPI?.saveChapter(projectPath, updated);
    set({
      chapters: chapters.map((c) => c.id === chapterId ? updated : c),
      activeSceneId: activeSceneId === sceneId ? (filtered[0]?.id || null) : activeSceneId,
    });
  },

  selectScene: (chapterId, sceneId) => {
    set({ activeChapterId: chapterId, activeSceneId: sceneId, currentView: "editor" });
  },

  moveScene: async (fromChapterId, toChapterId, sceneId, newOrder) => {
    const { chapters, projectPath } = get();
    if (!projectPath) return;
    const fromCh = chapters.find((c) => c.id === fromChapterId);
    const toCh = chapters.find((c) => c.id === toChapterId);
    if (!fromCh || !toCh) return;
    const scene = fromCh.scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    const fromScenes = fromCh.scenes.filter((s) => s.id !== sceneId);
    const toScenes = [...(fromChapterId === toChapterId ? fromScenes : toCh.scenes)];
    toScenes.splice(newOrder, 0, { ...scene, order: newOrder });
    const reindexed = toScenes.map((s, i) => ({ ...s, order: i }));

    const updatedFrom = { ...fromCh, scenes: fromChapterId === toChapterId ? reindexed : fromScenes };
    const updatedTo = fromChapterId === toChapterId ? updatedFrom : { ...toCh, scenes: reindexed };

    await window.electronAPI?.saveChapter(projectPath, updatedFrom);
    if (fromChapterId !== toChapterId) {
      await window.electronAPI?.saveChapter(projectPath, updatedTo);
    }

    set({
      chapters: chapters.map((c) => {
        if (c.id === fromChapterId) return updatedFrom;
        if (c.id === toChapterId) return updatedTo;
        return c;
      }),
    });
  },

  // ── Entity ──────────────────────────────────────────────
  addEntity: async (type, name) => {
    const { entities, projectPath } = get();
    if (!projectPath) return;
    const base: BaseEntity = {
      id: uuid(),
      name,
      type,
      description: "",
      tags: [],
      links: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    let entity: Entity;
    if (type === "characters") {
      entity = { ...base, type: "characters", relationships: [], stateChanges: [] } as CharacterEntity;
    } else if (type === "locations") {
      entity = { ...base, type: "locations" } as LocationEntity;
    } else {
      entity = base as Entity;
    }
    await window.electronAPI?.saveEntity(projectPath, type, entity);
    set({
      entities: { ...entities, [type]: [...entities[type], entity] },
      activeEntityId: entity.id,
      activeEntityType: type,
      currentView: "entity-detail",
    });
  },

  updateEntity: async (type, entity) => {
    const { entities, projectPath } = get();
    if (!projectPath) return;
    await window.electronAPI?.saveEntity(projectPath, type, entity);
    set({
      entities: {
        ...entities,
        [type]: entities[type].map((e) => e.id === entity.id ? entity : e),
      },
    });
  },

  deleteEntity: async (type, entityId) => {
    const { entities, projectPath } = get();
    if (!projectPath) return;
    await window.electronAPI?.deleteEntity(projectPath, type, entityId);
    set({
      entities: {
        ...entities,
        [type]: entities[type].filter((e) => e.id !== entityId),
      },
      activeEntityId: null,
      activeEntityType: null,
    });
  },

  selectEntity: (type, entityId) => {
    set({ activeEntityType: type, activeEntityId: entityId, currentView: "entity-detail" });
  },

  // ── Story metadata ──────────────────────────────────────
  updateStory: async (patch) => {
    const { story, projectPath } = get();
    if (!projectPath || !story) return;
    const updated = { ...story, ...patch };
    await window.electronAPI?.saveStory(projectPath, updated);
    set({ story: updated });
  },

  addConflict: async (conflict) => {
    const { story } = get();
    if (!story) return;
    const newConflict: Conflict = { ...conflict, id: uuid() };
    await get().updateStory({ conflicts: [...story.conflicts, newConflict] });
  },

  updateConflict: async (conflict) => {
    const { story } = get();
    if (!story) return;
    const updated = story.conflicts.map((c) => c.id === conflict.id ? conflict : c);
    await get().updateStory({ conflicts: updated });
  },

  addPlotline: async (plotline) => {
    const { story } = get();
    if (!story) return;
    const newPlotline: Plotline = { ...plotline, id: uuid() };
    await get().updateStory({ plotlines: [...story.plotlines, newPlotline] });
  },

  // ── Settings ────────────────────────────────────────────
  updateSettings: async (patch) => {
    const api = window.electronAPI;
    if (!api) return;
    const updated = await api.patchSettings(patch);
    set({ settings: updated });
  },

  // ── Search ──────────────────────────────────────────────
  setSearchQuery: (query) => set({ searchQuery: query }),
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
  createSnapshot: async (label) => {
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
    // This is called by a timer — saves the active scene
    const { activeChapterId, activeSceneId, chapters, projectPath } = get();
    if (!projectPath || !activeChapterId || !activeSceneId) return;
    const ch = chapters.find((c) => c.id === activeChapterId);
    if (ch) {
      await window.electronAPI?.saveChapter(projectPath, ch);
      set({ unsavedChanges: false });
    }
  },

  // ── Getters ─────────────────────────────────────────────
  getActiveChapter: () => {
    const { chapters, activeChapterId } = get();
    return chapters.find((c) => c.id === activeChapterId) ?? null;
  },

  getActiveScene: () => {
    const ch = get().getActiveChapter();
    if (!ch) return null;
    return ch.scenes.find((s) => s.id === get().activeSceneId) ?? null;
  },

  getActiveEntity: () => {
    const { entities, activeEntityId, activeEntityType } = get();
    if (!activeEntityType || !activeEntityId) return null;
    return entities[activeEntityType]?.find((e) => e.id === activeEntityId) ?? null;
  },

  getEntityById: (type, id) => {
    return get().entities[type]?.find((e) => e.id === id);
  },

  getScenesForEntity: (entityId) => {
    const results: { chapter: Chapter; scene: Scene }[] = [];
    for (const ch of get().chapters) {
      for (const scene of ch.scenes) {
        if (scene.pov === entityId || scene.location === entityId ||
            scene.content.includes(`[[${entityId}]]`)) {
          results.push({ chapter: ch, scene });
        }
      }
    }
    return results;
  },

  getEntitiesInScene: (content) => {
    const allEntities: Entity[] = [];
    for (const type of Object.keys(get().entities) as EntityType[]) {
      allEntities.push(...get().entities[type]);
    }
    // Look for [[EntityName]] or [[entity-id]] patterns, and simple name mentions
    return allEntities.filter((e) =>
      content.includes(`[[${e.name}]]`) ||
      content.includes(`[[${e.id}]]`) ||
      content.toLowerCase().includes(e.name.toLowerCase())
    );
  },
}));
