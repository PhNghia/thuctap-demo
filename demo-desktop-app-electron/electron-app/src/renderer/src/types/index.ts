// ── Template meta ─────────────────────────────────────────────────────────────
export interface GameTemplate {
  id: string
  name: string
  description: string
  thumbnail?: string
  gameType: 'group-sort' | string
  version: string
}

// ── Group Sort game data ──────────────────────────────────────────────────────
export interface GroupSortGroup {
  id: string
  name: string
  imagePath: string | null // relative to project dir, e.g. "assets/cat.png"
}

export interface GroupSortItem {
  id: string
  name: string
  imagePath: string | null
  groupId: string
}

export interface GroupSortAppData {
  groups: GroupSortGroup[]
  items: GroupSortItem[]
}

// ── Project file (saved as .mgproj) ──────────────────────────────────────────
export interface ProjectFile {
  version: string
  templateId: string
  name: string
  createdAt: string
  updatedAt: string
  appData: GroupSortAppData // will be union type as more games are added
}

// ── In-memory project state ───────────────────────────────────────────────────
export interface ProjectState {
  filePath: string       // absolute path to the .mgproj file
  projectDir: string     // directory containing the .mgproj file
  isDirty: boolean
  data: ProjectFile
}

// ── Electron API exposed via preload ─────────────────────────────────────────
export interface ElectronAPI {
  getTemplates: () => Promise<GameTemplate[]>
  chooseProjectFolder: () => Promise<string | null>
  openProjectFile: () => Promise<{ filePath: string; data: ProjectFile } | null>
  saveProject: (data: object, projectPath: string) => Promise<boolean>
  pickImage: () => Promise<string | null>
  importImage: (sourcePath: string, projectDir: string) => Promise<string>
  resolveAssetUrl: (projectDir: string, relativePath: string) => Promise<string>
  exportProject: (opts: {
    templateId: string
    appData: object
    projectDir: string
    mode: 'folder' | 'zip'
  }) => Promise<{ success?: boolean; canceled?: boolean; path?: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
