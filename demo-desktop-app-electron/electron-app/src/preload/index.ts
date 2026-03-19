import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Templates
  getTemplates: () => ipcRenderer.invoke('get-templates'),

  // Project management
  chooseProjectFolder: () => ipcRenderer.invoke('choose-project-folder'),
  openProjectFile: () => ipcRenderer.invoke('open-project-file'),
  saveProject: (data: object, projectPath: string) =>
    ipcRenderer.invoke('save-project', data, projectPath),

  // Assets
  pickImage: () => ipcRenderer.invoke('pick-image'),
  importImage: (sourcePath: string, projectDir: string) =>
    ipcRenderer.invoke('import-image', sourcePath, projectDir),
  resolveAssetUrl: (projectDir: string, relativePath: string) =>
    ipcRenderer.invoke('resolve-asset-url', projectDir, relativePath),

  // Export
  exportProject: (opts: {
    templateId: string
    appData: object
    projectDir: string
    mode: 'folder' | 'zip'
  }) => ipcRenderer.invoke('export-project', opts)
})
