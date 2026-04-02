# Minigame Builder (Electron App)

The **Minigame Builder** is an Electron-based desktop application that allows non-technical English teachers to create custom classroom minigames without writing any code. Teachers fill in words, questions, images, and other content through a visual editor, then export a self-contained game they can open directly in any browser.

This document provides a comprehensive guide to the builder's **architecture, code structure, TypeScript type system, IPC patterns, and editor implementation**.

---

## ⚠️ Important: Read This First

**This README focuses on the Electron app's internal codebase.** For the complete project workflow, see:

| Document                                       | Purpose                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [Root README](../../README.md)                 | **Start here** — Complete system overview, game template requirements, build workflow, CI/CD, packaging |
| This README                                    | Deep dive into the Electron app codebase — Architecture, types, IPC, editor patterns                    |
| [Root README (Vietnamese)](../../README_vi.md) | Bản tiếng Việt của Root README                                                                          |

> 💡 **Why two READMEs?** The builder app is only one part of the system. Game templates live separately in `template-projects/` and have their own build process. The root README covers the **complete workflow** (building templates, CI/CD, packaging). This README covers the **builder app's codebase** (TypeScript architecture, IPC system, editor implementation).

---

## Current Status

### Available Games

The builder currently supports **6 game templates**:

| Game ID                 | Name                  | Description                                                   |
| ----------------------- | --------------------- | ------------------------------------------------------------- |
| `group-sort`            | Group Sort            | Sort items into categorized groups                            |
| `plane-quiz`            | Plane Quiz            | Multiple-choice quiz with images and multiple correct answers |
| `balloon-letter-picker` | Balloon Letter Picker | Pop balloons to spell words from hints                        |
| `pair-matching`         | Pair Matching         | Match keywords with images in a memory-style game             |
| `word-search`           | Word Search           | Find hidden words in a grid with image clues                  |
| `whack-a-mole`          | Whack-a-Mole          | Hit the correct answer to questions in a mole-hitting game    |

### Tech Stack

- **Runtime**: Electron 41, Node.js 20+
- **Frontend**: React 19, TypeScript 5, Material-UI 7, Framer Motion
- **State Management**: Zustand 5 with Zustand-Travel for time-travel debugging (undo/redo)
- **Styling**: Tailwind CSS 4, Emotion
- **Build Tooling**: Vite 8, Electron-Vite, Electron Builder 26
- **Package Manager**: Yarn 4

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [TypeScript Type System](#typescript-type-system)
- [IPC Communication (Type-Safe)](#ipc-communication-type-safe)
- [Data Flow](#data-flow)
- [Adding a New Game](#adding-a-new-game)
- [Development Workflow](#development-workflow)
- [Common Patterns and Best Practices](#common-patterns-and-best-practices)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

The builder follows the standard Electron three-process architecture:

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Main Process   │◄───────►│  Preload Script │◄───────►│  Renderer       │
│  (Node.js)      │  IPC    │  (Context       │  IPC    │  (React App)    │
│                 │         │   Isolation)    │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Main Process

- Electron's main entry point
- Handles file system operations, dialogs, and native OS features
- Manages IPC handlers for all renderer requests
- Performs data transforms for game templates

### Preload Script

- Runs in a privileged context with access to both Node.js and renderer APIs
- Exposes a typed `electronAPI` to the renderer via `contextBridge`
- **Does not** contain business logic—only IPC invocation wrappers

### Renderer Process

- React + TypeScript application with Material-UI components
- Provides the visual editor UI for each game type
- Invokes IPC methods via `window.electronAPI`
- Manages project state, undo/redo, and auto-save

---

## Project Structure

```
electron-app-mui/
├── src/
│   ├── main/                          # Main process code
│   │   ├── index.ts                   # Entry point + IPC handler registrations
│   │   ├── gameRegistry.ts            # Data transforms for game templates
│   │   └── ipc-handlers.ts            # Typed IPC handler utilities
│   │
│   ├── preload/                       # Preload script (context isolation)
│   │   ├── index.ts                   # Exposes electronAPI to renderer
│   │   └── index.d.ts                 # TypeScript declarations for electronAPI
│   │
│   ├── shared/                        # ⭐ SHARED TYPES (single source of truth)
│   │   ├── types.ts                   # All AppData types + IPC channel definitions
│   │   └── index.ts                   # Re-exports for convenient importing
│   │
│   └── renderer/src/                  # React application
│       ├── games/
│       │   ├── registry.ts            # Game editor registry (6 games)
│       │   ├── group-sort/            # Group Sort editor
│       │   ├── plane-quiz/            # Plane Quiz editor
│       │   ├── balloon-letter-picker/ # Balloon Letter Picker editor
│       │   ├── pair-matching/         # Pair Matching editor
│       │   ├── word-search/           # Word Search editor
│       │   └── whack-a-mole/          # Whack-a-Mole editor
│       ├── components/                # Shared UI components
│       │   ├── EditorShared/          # Shared editor components (tabs, lists, counters)
│       │   ├── ImagePicker/           # Image selection and preview
│       │   └── ...                    # Other reusable components
│       ├── context/                   # React contexts (Settings, Project)
│       ├── hooks/                     # Custom React hooks
│       │   ├── useEntityCreateShortcut/ # Keyboard shortcuts for adding entities
│       │   └── ...                    # Other hooks
│       ├── pages/                     # Route pages (Home, Project)
│       ├── types/                     # Re-exports from ../../shared
│       └── utils/                     # Utility functions
│
├── resources/                         # App resources (icons, etc.)
├── templates/                         # Built game templates (git-ignored, generated at build)
│   └── <game-id>/
│       ├── game/                      # Built game output (index.html + assets/)
│       └── meta.json                  # Template metadata
│
├── tsconfig.json                      # Root TypeScript config
├── tsconfig.node.json                 # TypeScript config for main/preload
├── tsconfig.web.json                  # TypeScript config for renderer
└── electron.vite.config.ts            # Vite config for Electron builds
```

> 💡 **Note**: The `templates/` folder is git-ignored and generated by running `./build-templates.sh` from the repository root. It contains the built output of all game templates from `template-projects/`.

### Key Design Principle: Single Source of Truth

All type definitions flow from `src/shared/types.ts`. This eliminates duplication and ensures type safety across all three Electron layers.

---

## TypeScript Type System

### Shared Types Module (`src/shared/types.ts`)

This file is the **single source of truth** for all types used across the application:

1. **AppData Types**: Define the shape of project data for each game
   - `GroupSortAppData`, `QuizAppData`, `BalloonLetterPickerAppData`, etc.
   - Used by both main process (transforms) and renderer (editors)

2. **IPC Channel Definitions**: Define all IPC channels with their handler signatures
   - `IPCChannelDefinitions` interface maps channel names to handler types
   - Includes the `IpcMainInvokeEvent` parameter for main process handlers

3. **Common Types**: `GameTemplate`, `ProjectFile`, `GlobalSettings`, etc.

### Type Helpers

```typescript
// Extract the handler function type for a channel
export type IPCHandler<T extends keyof IPCChannelDefinitions> = IPCChannelDefinitions[T]['handler']

// Extract renderer-side invoke arguments (excludes IpcMainInvokeEvent)
export type RendererInvokeArgs<T extends keyof IPCChannelDefinitions> =
  IPCChannelDefinitions[T]['handler'] extends (
    event: IpcMainInvokeEvent,
    ...args: infer U
  ) => unknown
    ? U
    : IPCChannelDefinitions[T]['handler'] extends () => unknown
      ? []
      : Parameters<IPCChannelDefinitions[T]['handler']>

// Extract the return type of an IPC handler
export type IPCReturn<T extends keyof IPCChannelDefinitions> = ReturnType<IPCHandler<T>>
```

### Import Paths

```typescript
// ✅ Recommended: Import directly from shared
import type { GroupSortAppData, IPCChannels } from '../../shared'

// ✅ Also works: Import via renderer/types (re-exports shared)
import type { GroupSortAppData } from '../types'

// ❌ Avoid: Importing from main or preload (breaks layer isolation)
import type { ... } from '../../main/...'
```

---

## IPC Communication (Type-Safe)

### Overview

The IPC system is fully type-safe thanks to centralized channel definitions. When you add or modify an IPC channel, types are automatically enforced in:

- Main process handler implementation
- Preload script invocation
- Renderer usage

### Channel Definition Format

Each channel is defined in `IPCChannelDefinitions` with its **main process handler signature**:

```typescript
export interface IPCChannelDefinitions {
  'check-folder-status': {
    handler: (event: IpcMainInvokeEvent, folderPath: string) => Promise<FolderStatus>
  }
}
```

**Important**: The first parameter is always `IpcMainInvokeEvent` (automatically provided by Electron). The renderer does NOT pass this event.

### Main Process: Registering a Handler

```typescript
// src/main/index.ts
import { createHandler } from './ipc-handlers'

createHandler('check-folder-status', async (_event, folderPath: string) => {
  return checkFolderStatus(folderPath)
})
```

**Key points**:

- Use `createHandler(channel, handler)` for type inference
- The handler signature must match the definition in `IPCChannelDefinitions`
- TypeScript will enforce correct parameter types and return type

### Preload Script: Exposing the API

```typescript
// src/preload/index.ts
contextBridge.exposeInMainWorld('electronAPI', {
  checkFolderStatus: (folderPath: string) =>
    typedIpcRenderer.invoke('check-folder-status', folderPath)
})
```

**Key points**:

- `typedIpcRenderer.invoke` automatically excludes the `IpcMainInvokeEvent` parameter
- Arguments and return type are inferred from the channel definition

### Renderer: Using the API

```typescript
// In a React component
const status = await window.electronAPI.checkFolderStatus('/some/path')
// status is typed as FolderStatus ('empty' | 'has-project' | 'non-empty')
```

**Key points**:

- Full autocomplete and type checking
- No need to remember channel strings (use `IPCChannels` constant if needed)

### Available IPC Channels

| Channel                 | Purpose                                     | Parameters                                                  | Returns                  |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------------- | ------------------------ |
| `get-templates`         | List available game templates               | none                                                        | `GameTemplate[]`         |
| `check-folder-status`   | Check if folder is suitable for new project | `folderPath: string`                                        | `FolderStatus`           |
| `choose-project-folder` | Open folder picker dialog                   | none                                                        | `string \| null`         |
| `open-project-file`     | Load a `.mgproj` file                       | `filePath?: string`                                         | `ProjectFile \| null`    |
| `save-project`          | Save project to disk                        | `data: object, projectPath: string, history?: object[]`     | `boolean`                |
| `save-project-as`       | Save project to a new location              | `opts: { projectData: object, oldProjectDir: string }`      | `object \| null`         |
| `do-save-as`            | Execute save-as operation                   | `opts: { projectData, oldProjectDir, newFolder, history? }` | `object`                 |
| `pick-image`            | Open image picker dialog                    | none                                                        | `string \| null`         |
| `import-image`          | Copy image to project assets                | `sourcePath, projectDir, desiredNamePrefix`                 | `string` (relative path) |
| `resolve-asset-url`     | Get file:// URL for an asset                | `projectDir, relativePath`                                  | `string` (file URL)      |
| `settings-read-global`  | Load global settings                        | none                                                        | `GlobalSettings`         |
| `settings-write-global` | Save global settings                        | `data: GlobalSettings`                                      | `boolean`                |
| `set-title`             | Set the main window title                   | `title: string`                                             | `void`                   |
| `preview-project`       | Open game preview window                    | `opts: { templateId, appData, projectDir }`                 | `{ success: boolean }`   |
| `export-project`        | Export standalone game                      | `opts: { templateId, appData, projectDir, mode }`           | Export result            |

---

## Data Flow

### Project Data Lifecycle

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Editor (UI)    │─────►│  Project State  │─────►│  Save to Disk   │
│  (onChange)     │      │  (Context)      │      │  (IPC: save)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Preview/Export │
                       │  (Data Transform)│
                       └─────────────────┘
```

### Data Transforms (`src/main/gameRegistry.ts`)

Some games require data transformation before runtime injection. For example:

- `balloon-letter-picker`: Flattens `{ words: [...] }` to a plain array
- `pair-matching`: Renames `imagePath` → `image`
- `whack-a-mole`: Renames `id` → `groupId`

**Adding a transform**:

```typescript
export const GAME_DATA_TRANSFORMS: Record<string, DataTransform> = {
  'my-new-game': (appData) => {
    const data = appData as MyNewGameAppData
    // Transform to runtime shape
    return { items: data.items.map(({ text }) => ({ text })) }
  }
}
```

**Important**: The transform function receives the **internal** `AnyAppData` type and returns the **runtime** shape expected by the game template.

---

## Adding a New Game

This is the most common extension task.

> 📚 **For complete workflow instructions** (including build script registration, CI configuration, and testing), see [Root README — Adding a New Game](../../README.md#adding-a-new-game---quick-start).

This section focuses on the **builder app code changes** required when adding a new game.

### Overview

| Step | Task                               | Location                                                  |
| ---- | ---------------------------------- | --------------------------------------------------------- |
| 1    | Create game template               | `template-projects/` (see Root README)                    |
| 2    | Register in build script           | `build-templates.sh` (see Root README)                    |
| 3    | Register in CI                     | Auto-detected from `build-templates.sh` (see Root README) |
| 4    | **Define AppData types**           | `src/shared/types.ts` (this README)                       |
| 5    | **Create editor component**        | `src/renderer/src/games/<game-id>/` (this README)         |
| 6    | **Register editor**                | `src/renderer/src/games/registry.ts` (this README)        |
| 7    | **Add data transform (if needed)** | `src/main/gameRegistry.ts` (this README)                  |

### Current Game Implementations

The builder currently has **6 game editors** implemented:

1. **Group Sort** (`group-sort/`) — Categorize items into groups with images
2. **Plane Quiz** (`plane-quiz/`) — Multiple-choice questions with image support
3. **Balloon Letter Picker** (`balloon-letter-picker/`) — Word spelling game
4. **Pair Matching** (`pair-matching/`) — Memory-style card matching
5. **Word Search** (`word-search/`) — Find words in a grid
6. **Whack-a-Mole** (`whack-a-mole/`) — Hit-the-answer quiz game

Study these existing editors for implementation patterns and best practices.

### Step 4: Define AppData Types

Edit `src/shared/types.ts`:

```typescript
// ── My New Game ───────────────────────────────────────────────────────────────
export interface MyNewGameItem {
  id: string
  text: string
}
export interface MyNewGameAppData {
  items: MyNewGameItem[]
  _itemCounter: number
}

// Add to AnyAppData union:
export type AnyAppData =
  | GroupSortAppData
  | QuizAppData
  // ... existing types ...
  | MyNewGameAppData // ← Add this line
```

### Step 5: Create the Editor Component

Create `src/renderer/src/games/my-new-game/MyNewGameEditor.tsx`:

```typescript
import type { MyNewGameAppData } from '../../types'

interface Props {
  appData: MyNewGameAppData
  projectDir: string
  onChange: (data: MyNewGameAppData) => void
}

export default function MyNewGameEditor({ appData, projectDir, onChange }: Props) {
  // Your editor UI here
  // Call onChange with new data when user makes changes

  return (
    <div>
      {/* Editor UI */}
    </div>
  )
}
```

**Key requirements**:

- Accept `appData`, `projectDir`, and `onChange` props
- Call `onChange` with a **new immutable copy** of `appData` on every change
- Use shared components from `src/renderer/src/components/EditorShared`
- Use `ImagePicker` for image selection

### Step 6: Register the Editor

Edit `src/renderer/src/games/registry.ts`:

```typescript
import MyNewGameEditor from './my-new-game/MyNewGameEditor'

export const GAME_REGISTRY: Record<string, GameRegistryEntry> = {
  // ... existing entries ...

  'my-new-game': {
    Editor: MyNewGameEditor as GameRegistryEntry['Editor'],
    createInitialData: () => ({
      items: [],
      _itemCounter: 0
    })
  }
}
```

**Important**: `createInitialData` must return a valid **empty** `MyNewGameAppData` that your editor can render without crashing.

### Step 7: Add Data Transform (If Needed)

If your game's runtime shape differs from the stored shape, edit `src/main/gameRegistry.ts`:

```typescript
export const GAME_DATA_TRANSFORMS: Record<string, DataTransform> = {
  // ... existing transforms ...

  'my-new-game': (appData) => {
    const data = appData as MyNewGameAppData
    // Return runtime shape
    return data.items.map(({ text }) => ({ text }))
  }
}
```

If the shapes are identical, skip this step.

### Step 8: Test Locally

```bash
# Build the template
./build-templates.sh my-new-game

# Run the builder
cd builder-projects/electron-app-mui
yarn dev
```

**Checklist**:

- [ ] Game appears on home screen with correct name/description
- [ ] Creating a new project opens the editor without errors
- [ ] Editing content, saving, closing, and re-opening works correctly
- [ ] Preview opens the game with data loaded
- [ ] Export (folder and ZIP) produces a working standalone game

---

## Development Workflow

### Prerequisites

- **Node.js** 20+
- **Yarn** 4.13+ (`corepack enable && corepack prepare yarn@4.13.0 --activate`)

### Initial Setup

```bash
# Install dependencies
cd builder-projects/electron-app-mui
yarn install

# Build all game templates (from repo root)
./build-templates.sh
```

### Development Mode

```bash
# Terminal 1: Run the builder in dev mode
cd builder-projects/electron-app-mui
yarn dev

# Terminal 2 (optional): Watch a specific game template
cd template-projects/group-sort
yarn dev
```

The builder will hot-reload when you change renderer code. Game template changes require rebuilding:

```bash
./build-templates.sh group-sort
```

### Using Context from Existing Editors

When creating a new editor, study existing ones for patterns:

1. **State Management**: Use controlled components with `onChange` callbacks
2. **Shared Components**: Reuse `EditorShared` for tabs, counters, list editors
3. **Image Handling**: Use `ImagePicker` and the `importImage` IPC method
4. **Undo/Redo**: The project context handles this automatically—just call `onChange` with new data
5. **Keyboard Shortcuts**: Use `useEntityCreateShortcut` for entity creation hotkeys

Example pattern:

```typescript
function handleAddItem() {
  const newItem: MyNewGameItem = {
    id: crypto.randomUUID(),
    text: ''
  }
  onChange({
    ...appData,
    items: [...appData.items, newItem],
    _itemCounter: appData._itemCounter + 1
  })
}
```

### Keyboard Shortcuts

The builder uses a tiered keyboard shortcut system for efficient content creation:

#### Entity Creation (in Editors)

Use the `useEntityCreateShortcut` hook to register keyboard shortcuts for adding entities:

```typescript
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'

export default function MyGameEditor({ appData, onChange }: Props) {
  // Register shortcuts for adding items (tier 1) and groups (tier 2)
  useEntityCreateShortcut({
    onTier1: addItem, // Ctrl+N
    onTier2: addGroup // Ctrl+Shift+N
  })

  // ... editor UI
}
```

**Tier System:**
| Tier | Shortcut | Purpose | Example |
|------|----------|---------|---------|
| 1 | `Ctrl+N` | Smallest unit | Item, word, question |
| 2 | `Ctrl+Shift+N` | Medium unit | Group, category |
| 3 | `Ctrl+Alt+N` | Large unit | Section, block |
| 4 | `Ctrl+Shift+Alt+N` | Complex unit | Complex category |

#### Project-Level Shortcuts

The Project page automatically handles these shortcuts:

| Action           | Shortcut                   |
| ---------------- | -------------------------- |
| Undo             | `Ctrl+Z`                   |
| Redo             | `Ctrl+Y` or `Ctrl+Shift+Z` |
| Save             | `Ctrl+S`                   |
| Save As          | `Ctrl+Shift+S`             |
| Preview          | `Ctrl+P`                   |
| Export to folder | `Ctrl+Shift+P`             |
| Export as ZIP    | `Ctrl+Alt+P`               |

### Debugging

**Main Process**:

- Logs appear in the terminal running `yarn dev`
- Use `console.log()` in `src/main/index.ts`

**Renderer**:

- Open DevTools (automatically opens in dev mode)
- Use React DevTools for component inspection
- **Zustand-Travel**: Access time-travel debugging UI for undo/redo state inspection

**Preview Window**:

- DevTools open automatically for preview windows
- `window.__PREVIEW_DEBUG__` contains session info in dev mode

**State Debugging**:

The app uses Zustand with Zustand-Travel for state management. In development mode:

- Access the time-travel debugging panel via the project context
- Inspect state history for undo/redo operations
- View state snapshots at any point in the edit history

---

## Building and Distribution

### Build Commands

```bash
# Typecheck first
yarn typecheck

# Build for current platform
yarn build

# Build for specific platforms (local development)
yarn build:win      # Windows (NSIS installer)
yarn build:mac      # macOS (DMG)
yarn build:linux    # Linux (AppImage)

# Build unpacked directory (for testing)
yarn build:unpack
```

> 💡 **Note**: The CI/CD workflow builds with 7z target for distribution. Run `electron-builder --dir --config.target=7z` manually if you need 7z archives locally.

### Build Process

1. TypeScript compilation (main, preload, renderer)
2. Vite bundles the renderer with inlined assets
3. Electron Builder packages the app
4. Game templates from `templates/` are included as extra resources

### Distribution

**Local builds** (using `yarn build:*` commands):

- Windows: NSIS installer (`.exe`)
- macOS: DMG image (`.dmg`)
- Linux: AppImage (`.AppImage`)

**CI/CD builds** (GitHub Actions):

- All platforms: 7z archives (`.7z`)
- Windows: `I-CLC-Game-maker-win-x64.7z`
- macOS: `I-CLC-Game-maker-mac-x64.7z`
- Linux: `I-CLC-Game-maker-linux-x64.7z`

### App Icons

App icons are stored in `resources/` and generated using `electron-icon-builder`:

```bash
# Generate icons from resources/icon.png
npx electron-icon-builder --input=resources/icon.png --output=resources --flatten
```

---

## Common Patterns and Best Practices

### Immutable State Updates

Always create new objects when calling `onChange`:

```typescript
// ✅ Correct
onChange({
  ...appData,
  items: [...appData.items, newItem]
})

// ❌ Wrong (mutates existing state)
appData.items.push(newItem)
onChange(appData)
```

### Counter Pattern

Use `_itemCounter` (or similar) to generate unique IDs:

```typescript
const newItem = {
  id: `item-${appData._itemCounter}`
  // ...
}
onChange({
  ...appData,
  items: [...appData.items, newItem],
  _itemCounter: appData._itemCounter + 1
})
```

### Asset Path Resolution

Images are stored relative to the project directory:

```typescript
// In editor
const relativePath = await window.electronAPI.importImage(sourcePath, projectDir, 'item-image')

// In game template (runtime)
const imagePath = `./assets/user/${relativePath}`
```

### Settings Storage

Global settings are stored in Electron's `userData` directory:

```typescript
// Read
const settings = await window.electronAPI.settingsReadGlobal()

// Write
await window.electronAPI.settingsWriteGlobal({
  ...settings,
  autoSave: { mode: 'on-edit', intervalSeconds: 30 }
})
```

### Component Patterns

**Shared Editor Components** (`src/renderer/src/components/EditorShared/`):

- `TabbedEditor` — Tab container for multi-section editors
- `ListEditor` — Reusable list editing with add/remove/reorder
- `CounterBadge` — Display counters with Material-UI badges
- `ImageCard` — Card component with image preview

**Image Handling**:

- Use `ImagePicker` component for selecting images
- Images are copied to project's `assets/` folder via IPC
- Asset URLs are resolved via `resolve-asset-url` IPC channel

### Keyboard Shortcuts

The app uses a comprehensive keyboard shortcut system:

**Entity Creation** (in editors):

- `Ctrl+N` — Add primary entity (item, question, word)
- `Ctrl+Shift+N` — Add secondary entity (group, category)

**Project-Level**:

- `Ctrl+Z` — Undo
- `Ctrl+Y` / `Ctrl+Shift+Z` — Redo
- `Ctrl+S` — Save
- `Ctrl+Shift+S` — Save As
- `Ctrl+P` — Preview
- `Ctrl+Shift+P` — Export to folder
- `Ctrl+Alt+P` — Export as ZIP

Use the `useEntityCreateShortcut` hook to register shortcuts in your editor.

---

> ⚠️ **Note for AI Chatbots**: The `templates/` folder in this project contains **built and minified output** only. Each `<game-id>/game/` subfolder contains a single bundled `index.html` file (and optionally an `images/` folder). There are no source code files to read in these build output folders — they exist solely for runtime use by the Electron app. For understanding the game logic and source code, read the files in `template-projects/<game-id>/` instead. Reading the `game/` folder contents will waste your context window with minified/bundled code.

## Troubleshooting

### "Module not found" Errors

Ensure you're importing from the correct path:

- Renderer → `../../shared` or `../types`
- Main → `../shared`
- Preload → `../shared`

### Type Errors After Adding a Game

1. Run `yarn typecheck` to see specific errors
2. Ensure your `AnyAppData` union includes the new type
3. Check that `createInitialData` returns the correct shape
4. Verify all required properties are present in the AppData interface

### Preview Window Shows Blank

1. Check the DevTools console for errors
2. Verify `window.APP_DATA` is injected (check HTML source)
3. Ensure the game template's build output is in `templates/<game-id>/game/`
4. Run `../../build-templates.sh <game-id>` to rebuild the template

### IPC Handler Not Being Called

1. Verify the channel name matches exactly (use `IPCChannels` constant)
2. Check that `createHandler` is called in `src/main/index.ts`
3. Ensure the preload script exposes the method
4. Check TypeScript types match between main and preload

### Build Fails with "Template not found"

Run `../../build-templates.sh` from the repo root to ensure all templates are built and copied.

### State Not Persisting After Save

1. Ensure `onChange` is called with a new immutable object
2. Check that the project context is properly wired
3. Verify auto-save settings in global settings
4. Check the main process logs for save errors

### Images Not Loading in Preview/Export

1. Verify images are imported via `import-image` IPC channel
2. Check that asset paths are relative to project directory
3. Ensure `resolve-asset-url` is used for preview
4. Verify images are copied to `assets/user/` during export

---

## Architecture Decision Records (ADRs)

### ADR-001: Centralized Type Definitions

**Decision**: All types are defined in `src/shared/types.ts` and imported by main, preload, and renderer.

**Rationale**:

- Eliminates duplication (previously AppData types were defined twice)
- Ensures type safety across IPC boundaries
- Single source of truth makes refactoring easier

### ADR-002: Typed IPC Handlers

**Decision**: Use `createHandler(channel, handler)` with inferred types from `IPCChannelDefinitions`.

**Rationale**:

- Prevents channel name typos
- Enforces correct handler signatures
- Autocomplete in IDE
- Changing a channel definition automatically updates all usages

### ADR-003: Data Transforms in Main Process

**Decision**: Game-specific data transforms live in `src/main/gameRegistry.ts`.

**Rationale**:

- Keeps renderer code clean and game-agnostic
- Transforms are applied consistently for preview and export
- Game templates can evolve independently of editor structure

---

## License

[Your License Here]
