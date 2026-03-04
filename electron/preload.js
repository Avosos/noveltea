const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Window controls
  minimize: () => ipcRenderer.invoke("window:minimize"),
  maximize: () => ipcRenderer.invoke("window:maximize"),
  close: () => ipcRenderer.invoke("window:close"),
  isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
  onMaximizedChange: (cb) => {
    const handler = (_event, val) => cb(val);
    ipcRenderer.on("maximized-change", handler);
    return () => ipcRenderer.removeListener("maximized-change", handler);
  },

  // Settings
  getSettings: () => ipcRenderer.invoke("settings:get"),
  setSettings: (settings) => ipcRenderer.invoke("settings:set", settings),
  patchSettings: (partial) => ipcRenderer.invoke("settings:patch", partial),

  // Recent projects
  getRecent: () => ipcRenderer.invoke("recent:get"),
  addRecent: (project) => ipcRenderer.invoke("recent:add", project),
  removeRecent: (path) => ipcRenderer.invoke("recent:remove", path),

  // Project operations
  createProject: (dirPath) => ipcRenderer.invoke("project:create", dirPath),
  openProject: (dirPath) => ipcRenderer.invoke("project:open", dirPath),
  saveChapter: (dirPath, chapter) => ipcRenderer.invoke("project:save-chapter", dirPath, chapter),
  deleteChapter: (dirPath, chapterId) => ipcRenderer.invoke("project:delete-chapter", dirPath, chapterId),
  saveStory: (dirPath, story) => ipcRenderer.invoke("project:save-story", dirPath, story),
  saveEntity: (dirPath, entity) => ipcRenderer.invoke("project:save-entity", dirPath, entity),
  deleteEntity: (dirPath, entityId) => ipcRenderer.invoke("project:delete-entity", dirPath, entityId),
  saveProject: (dirPath, project) => ipcRenderer.invoke("project:save-project", dirPath, project),

  // Snapshots
  createSnapshot: (dirPath, label) => ipcRenderer.invoke("project:create-snapshot", dirPath, label),
  listSnapshots: (dirPath) => ipcRenderer.invoke("project:list-snapshots", dirPath),

  // Word count
  getWordCount: (dirPath) => ipcRenderer.invoke("project:word-count", dirPath),

  // Search
  searchProject: (dirPath, query) => ipcRenderer.invoke("project:search", dirPath, query),

  // Dialogs
  openFolderDialog: () => ipcRenderer.invoke("dialog:openFolder"),
  saveFolderDialog: (name) => ipcRenderer.invoke("dialog:saveFolder", name),

  // Shell
  openExternal: (url) => ipcRenderer.invoke("shell:openExternal", url),
  openPath: (path) => ipcRenderer.invoke("shell:openPath", path),
});
