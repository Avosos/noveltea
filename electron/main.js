const { app, BrowserWindow, ipcMain, dialog, shell, nativeImage } = require("electron");
const path = require("path");
const fs = require("fs");

// ─── Constants ───────────────────────────────────────────────────────────────
const IS_DEV = !app.isPackaged;
const DEV_PORT = 3300;
const DATA_DIR = path.join(app.getPath("userData"), "noveltea");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const RECENT_FILE = path.join(DATA_DIR, "recent-projects.json");

let mainWindow = null;

// Set app user model ID for Windows taskbar icon
if (process.platform === "win32") {
  app.setAppUserModelId("com.avosos.noveltea");
}

// ─── Icon path helper ────────────────────────────────────────────────────────
function getIconPath() {
  if (process.platform === "win32")
    return path.join(__dirname, "../public/icon.ico");
  return path.join(__dirname, "../public/icon.png");
}

// ─── Ensure data dirs exist ──────────────────────────────────────────────────
function ensureDataDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({
      theme: "dark",
      accentColor: "#a3e635",
      fontSize: 16,
      fontFamily: "Georgia, serif",
      editorWidth: 720,
      autosaveInterval: 30000,
      focusMode: false,
      showLineNumbers: false,
      spellcheck: true,
    }), "utf-8");
  }
  if (!fs.existsSync(RECENT_FILE)) {
    fs.writeFileSync(RECENT_FILE, "[]", "utf-8");
  }
}

// ─── JSON helpers ────────────────────────────────────────────────────────────
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Window Creation ────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 640,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#08080d",
    show: false,
    center: true,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.on("maximize", () => mainWindow.webContents.send("maximized-change", true));
  mainWindow.on("unmaximize", () => mainWindow.webContents.send("maximized-change", false));

  if (IS_DEV) {
    mainWindow.loadURL(`http://localhost:${DEV_PORT}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "out", "index.html"));
  }
}

// ─── IPC: Window Controls ───────────────────────────────────────────────────
ipcMain.handle("window:minimize", () => mainWindow?.minimize());
ipcMain.handle("window:maximize", () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.handle("window:close", () => mainWindow?.close());
ipcMain.handle("window:isMaximized", () => mainWindow?.isMaximized() ?? false);

// ─── IPC: Settings ──────────────────────────────────────────────────────────
ipcMain.handle("settings:get", () => readJSON(SETTINGS_FILE));
ipcMain.handle("settings:set", (_, settings) => {
  writeJSON(SETTINGS_FILE, settings);
  return true;
});
ipcMain.handle("settings:patch", (_, partial) => {
  const current = readJSON(SETTINGS_FILE) || {};
  const updated = { ...current, ...partial };
  writeJSON(SETTINGS_FILE, updated);
  return updated;
});

// ─── IPC: Recent Projects ───────────────────────────────────────────────────
ipcMain.handle("recent:get", () => readJSON(RECENT_FILE) || []);
ipcMain.handle("recent:add", (_, project) => {
  let recent = readJSON(RECENT_FILE) || [];
  recent = recent.filter((r) => r.path !== project.path);
  recent.unshift({ ...project, openedAt: Date.now() });
  recent = recent.slice(0, 20);
  writeJSON(RECENT_FILE, recent);
  return recent;
});
ipcMain.handle("recent:remove", (_, projectPath) => {
  let recent = readJSON(RECENT_FILE) || [];
  recent = recent.filter((r) => r.path !== projectPath);
  writeJSON(RECENT_FILE, recent);
  return recent;
});

// ─── IPC: Project file operations ────────────────────────────────────────────
ipcMain.handle("project:create", async (_, dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

  // Create project structure
  const projectFile = path.join(dirPath, "project.json");
  if (fs.existsSync(projectFile)) {
    throw new Error("A project already exists in this directory");
  }

  const project = {
    id: require("crypto").randomUUID(),
    name: path.basename(dirPath),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: "1.0.0",
  };

  // Create directories
  const dirs = ["chapters", "entities", "entities/characters", "entities/locations",
    "entities/organizations", "entities/artifacts", "entities/lore", "notes", "versions"];
  for (const dir of dirs) {
    const p = path.join(dirPath, dir);
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  }

  writeJSON(projectFile, project);

  // Create default chapter
  const ch1 = {
    id: require("crypto").randomUUID(),
    title: "Chapter 1",
    order: 0,
    act: 1,
    scenes: [
      {
        id: require("crypto").randomUUID(),
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
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  writeJSON(path.join(dirPath, "chapters", `${ch1.id}.json`), ch1);

  // Create story metadata
  const storyMeta = {
    title: project.name,
    subtitle: "",
    author: "",
    genre: [],
    synopsis: "",
    targetWordCount: 80000,
    structure: "three-act", // three-act | hero-journey | custom
    acts: [
      { id: "act-1", name: "Act I — Setup", chapters: [] },
      { id: "act-2", name: "Act II — Confrontation", chapters: [] },
      { id: "act-3", name: "Act III — Resolution", chapters: [] },
    ],
    plotlines: [],
    conflicts: [],
    themes: [],
  };
  writeJSON(path.join(dirPath, "story.json"), storyMeta);

  return { project, chapterId: ch1.id };
});

ipcMain.handle("project:open", async (_, dirPath) => {
  const projectFile = path.join(dirPath, "project.json");
  if (!fs.existsSync(projectFile)) {
    throw new Error("No project.json found in directory");
  }
  const project = readJSON(projectFile);
  const story = readJSON(path.join(dirPath, "story.json")) || {};

  // Load chapters
  const chaptersDir = path.join(dirPath, "chapters");
  const chapters = [];
  if (fs.existsSync(chaptersDir)) {
    const files = fs.readdirSync(chaptersDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const ch = readJSON(path.join(chaptersDir, file));
      if (ch) chapters.push(ch);
    }
  }
  chapters.sort((a, b) => a.order - b.order);

  // Load entities
  const entities = {};
  const entityTypes = ["characters", "locations", "organizations", "artifacts", "lore"];
  for (const type of entityTypes) {
    const dir = path.join(dirPath, "entities", type);
    entities[type] = [];
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
      for (const file of files) {
        const entity = readJSON(path.join(dir, file));
        if (entity) entities[type].push(entity);
      }
    }
  }

  return { project, story, chapters, entities };
});

ipcMain.handle("project:save-chapter", (_, dirPath, chapter) => {
  const chaptersDir = path.join(dirPath, "chapters");
  if (!fs.existsSync(chaptersDir)) fs.mkdirSync(chaptersDir, { recursive: true });
  chapter.updatedAt = Date.now();
  writeJSON(path.join(chaptersDir, `${chapter.id}.json`), chapter);
  return true;
});

ipcMain.handle("project:delete-chapter", (_, dirPath, chapterId) => {
  const filePath = path.join(dirPath, "chapters", `${chapterId}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return true;
});

ipcMain.handle("project:save-story", (_, dirPath, story) => {
  writeJSON(path.join(dirPath, "story.json"), story);
  return true;
});

ipcMain.handle("project:save-entity", (_, dirPath, entityType, entity) => {
  const dir = path.join(dirPath, "entities", entityType);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  entity.updatedAt = Date.now();
  writeJSON(path.join(dir, `${entity.id}.json`), entity);
  return true;
});

ipcMain.handle("project:delete-entity", (_, dirPath, entityType, entityId) => {
  const filePath = path.join(dirPath, "entities", entityType, `${entityId}.json`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return true;
});

ipcMain.handle("project:save-project", (_, dirPath, project) => {
  project.updatedAt = Date.now();
  writeJSON(path.join(dirPath, "project.json"), project);
  return true;
});

// ─── IPC: Version snapshots ─────────────────────────────────────────────────
ipcMain.handle("project:create-snapshot", (_, dirPath, label) => {
  const snapshotId = require("crypto").randomUUID();
  const snapshotDir = path.join(dirPath, "versions", snapshotId);
  fs.mkdirSync(snapshotDir, { recursive: true });

  // Copy chapters
  const chaptersDir = path.join(dirPath, "chapters");
  if (fs.existsSync(chaptersDir)) {
    const destChapters = path.join(snapshotDir, "chapters");
    fs.mkdirSync(destChapters, { recursive: true });
    for (const file of fs.readdirSync(chaptersDir).filter((f) => f.endsWith(".json"))) {
      fs.copyFileSync(path.join(chaptersDir, file), path.join(destChapters, file));
    }
  }

  // Copy story.json
  const storyFile = path.join(dirPath, "story.json");
  if (fs.existsSync(storyFile)) {
    fs.copyFileSync(storyFile, path.join(snapshotDir, "story.json"));
  }

  // Save snapshot metadata
  const meta = {
    id: snapshotId,
    label: label || `Snapshot ${new Date().toLocaleString()}`,
    createdAt: Date.now(),
  };
  writeJSON(path.join(snapshotDir, "meta.json"), meta);

  return meta;
});

ipcMain.handle("project:list-snapshots", (_, dirPath) => {
  const versionsDir = path.join(dirPath, "versions");
  if (!fs.existsSync(versionsDir)) return [];
  const snapshots = [];
  for (const dir of fs.readdirSync(versionsDir)) {
    const metaPath = path.join(versionsDir, dir, "meta.json");
    if (fs.existsSync(metaPath)) {
      snapshots.push(readJSON(metaPath));
    }
  }
  return snapshots.sort((a, b) => b.createdAt - a.createdAt);
});

// ─── IPC: Word count ────────────────────────────────────────────────────────
ipcMain.handle("project:word-count", (_, dirPath) => {
  const chaptersDir = path.join(dirPath, "chapters");
  if (!fs.existsSync(chaptersDir)) return { total: 0, byChapter: {} };
  const byChapter = {};
  let total = 0;
  for (const file of fs.readdirSync(chaptersDir).filter((f) => f.endsWith(".json"))) {
    const ch = readJSON(path.join(chaptersDir, file));
    if (!ch) continue;
    let chWords = 0;
    for (const scene of ch.scenes || []) {
      const words = (scene.content || "").trim().split(/\s+/).filter(Boolean).length;
      chWords += words;
    }
    byChapter[ch.id] = chWords;
    total += chWords;
  }
  return { total, byChapter };
});

// ─── IPC: Dialogs ───────────────────────────────────────────────────────────
ipcMain.handle("dialog:openFolder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("dialog:saveFolder", async (_, defaultName) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
    title: `Choose location for "${defaultName}"`,
  });
  return result.canceled ? null : result.filePaths[0];
});

// ─── IPC: Shell ─────────────────────────────────────────────────────────────
ipcMain.handle("shell:openExternal", (_, url) => shell.openExternal(url));
ipcMain.handle("shell:openPath", (_, filePath) => shell.openPath(filePath));

// ─── IPC: Search across project files ────────────────────────────────────────
ipcMain.handle("project:search", (_, dirPath, query) => {
  const results = [];
  const q = query.toLowerCase();

  // Search chapters
  const chaptersDir = path.join(dirPath, "chapters");
  if (fs.existsSync(chaptersDir)) {
    for (const file of fs.readdirSync(chaptersDir).filter((f) => f.endsWith(".json"))) {
      const ch = readJSON(path.join(chaptersDir, file));
      if (!ch) continue;
      for (const scene of ch.scenes || []) {
        if ((scene.content || "").toLowerCase().includes(q) ||
            (scene.title || "").toLowerCase().includes(q)) {
          results.push({
            type: "scene",
            chapterId: ch.id,
            chapterTitle: ch.title,
            sceneId: scene.id,
            sceneTitle: scene.title,
            snippet: extractSnippet(scene.content || "", q),
          });
        }
      }
    }
  }

  // Search entities
  const entityTypes = ["characters", "locations", "organizations", "artifacts", "lore"];
  for (const type of entityTypes) {
    const dir = path.join(dirPath, "entities", type);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const entity = readJSON(path.join(dir, file));
      if (!entity) continue;
      const text = JSON.stringify(entity).toLowerCase();
      if (text.includes(q)) {
        results.push({
          type: "entity",
          entityType: type,
          entityId: entity.id,
          entityName: entity.name,
          snippet: extractSnippet(entity.description || entity.background || "", q),
        });
      }
    }
  }

  return results;
});

function extractSnippet(text, query) {
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text.slice(0, 120);
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + query.length + 80);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

// ─── App Lifecycle ──────────────────────────────────────────────────────────
app.whenReady().then(() => {
  ensureDataDirs();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
