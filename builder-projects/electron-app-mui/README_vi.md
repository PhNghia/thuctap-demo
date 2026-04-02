# Minigame Builder (Ứng dụng Electron)

**Minigame Builder** là một ứng dụng desktop dựa trên Electron giúp giáo viên tiếng Anh không có kỹ thuật tạo các trò chơi nhỏ tùy chỉnh cho lớp học **mà không cần viết code**. Giáo viên nhập từ ngữ, câu hỏi, hình ảnh và nội dung khác qua trình soạn thảo trực quan, sau đó xuất ra một trò chơi độc lập có thể mở trực tiếp trên bất kỳ trình duyệt nào.

Tài liệu này cung cấp hướng dẫn toàn diện về **kiến trúc, cấu trúc code, hệ thống kiểu TypeScript, mẫu IPC, và triển khai editor** của builder.

---

## ⚠️ Quan trọng: Đọc Trước

**README này tập trung vào codebase nội bộ của ứng dụng Electron.** Để biết quy trình dự án hoàn chỉnh, xem:

| Tài liệu                                 | Mục đích                                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [Root README](../../README_vi.md)        | **Bắt đầu từ đây** — Tổng quan hệ thống hoàn chỉnh, yêu cầu game template, quy trình build, CI/CD, đóng gói |
| README này                               | Đi sâu vào codebase của ứng dụng Electron — Kiến trúc, kiểu, IPC, mẫu editor                                |
| [Root README (English)](../../README.md) | English version of Root README                                                                              |

> 💡 **Tại sao hai README?** Ứng dụng builder chỉ là một phần của hệ thống. Các game templates sống riêng trong `template-projects/` và có quy trình build riêng. Root README bao phủ **quy trình hoàn chỉnh** (xây dựng templates, CI/CD, đóng gói). README này bao phủ **codebase của ứng dụng builder** (kiến trúc TypeScript, hệ thống IPC, triển khai editor).

---

## Trạng thái Hiện tại

### Các Trò chơi Có sẵn

Builder hiện hỗ trợ **6 game templates**:

| Game ID                 | Tên                   | Mô tả                                            |
| ----------------------- | --------------------- | ------------------------------------------------ |
| `group-sort`            | Group Sort            | Sắp xếp các mục vào các nhóm được phân loại      |
| `plane-quiz`            | Plane Quiz            | Trắc nghiệm với hình ảnh và nhiều đáp án đúng    |
| `balloon-letter-picker` | Balloon Letter Picker | Bắn bóng để ghép từ từ gợi ý                     |
| `pair-matching`         | Pair Matching         | Nối từ khóa với hình ảnh trong game kiểu ghi nhớ |
| `word-search`           | Word Search           | Tìm từ ẩn trong lưới với gợi ý hình ảnh          |
| `whack-a-mole`          | Whack-a-Mole          | Đập chuột để chọn đáp án đúng cho câu hỏi        |

### Công nghệ Sử dụng

- **Runtime**: Electron 41, Node.js 20+
- **Frontend**: React 19, TypeScript 5, Material-UI 7, Framer Motion
- **Quản lý State**: Zustand 5 với Zustand-Travel cho gỡ lỗi time-travel (undo/redo)
- **Styling**: Tailwind CSS 4, Emotion
- **Build Tooling**: Vite 8, Electron-Vite, Electron Builder 26
- **Package Manager**: Yarn 4.13+

---

## Mục lục

- [Tổng quan Kiến trúc](#tổng-quan-kiến-trúc)
- [Cấu trúc Dự án](#cấu-trúc-dự-án)
- [Hệ thống Kiểu TypeScript](#hệ-thống-kiểu-typescript)
- [Giao tiếp IPC (Type-Safe)](#giao-tiếp-ipc-type-safe)
- [Luồng Dữ liệu](#luồng-dữ-liệu)
- [Thêm một Trò chơi Mới](#thêm-một-trò-chơi-mới)
- [Quy trình Phát triển](#quy-trình-phát-triển)
- [Build và Phân phối](#build-và-phân-phối)
- [Các Mẫu và Thực hành Tốt nhất](#các-mẫu-và-thực-hành-tốt-nhất)
- [Xử lý Sự cố](#xử-lý-sự-cố)

---

## Tổng quan Kiến trúc

Builder tuân theo kiến trúc ba tiến trình Electron tiêu chuẩn:

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  Main Process   │◄───────►│  Preload Script │◄───────►│  Renderer       │
│  (Node.js)      │  IPC    │  (Context       │  IPC    │  (React App)    │
│                 │         │   Isolation)    │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Main Process (Tiến trình chính)

- Điểm nhập chính của Electron
- Xử lý các thao tác hệ thống tệp, hộp thoại và các tính năng OS native
- Quản lý các IPC handlers cho tất cả yêu cầu từ renderer
- Thực hiện các biến đổi dữ liệu cho game templates

### Preload Script

- Chạy trong ngữ cảnh đặc quyền với quyền truy cập cả Node.js và renderer APIs
- Tiếp xúc một `electronAPI` đã được định kiểu cho renderer qua `contextBridge`
- **Không** chứa logic nghiệp vụ—chỉ là các wrapper gọi IPC

### Renderer Process

- Ứng dụng React + TypeScript với các thành phần Material-UI
- Cung cấp giao diện trình soạn thảo trực quan cho mỗi loại trò chơi
- Gọi các phương thức IPC qua `window.electronAPI`
- Quản lý trạng thái dự án, undo/redo, và tự động lưu

---

## Cấu trúc Dự án

```
electron-app-mui/
├── src/
│   ├── main/                          # Code của tiến trình chính
│   │   ├── index.ts                   # Điểm nhập + đăng ký IPC handlers
│   │   ├── gameRegistry.ts            # Biến đổi dữ liệu cho game templates
│   │   └── ipc-handlers.ts            # Utilities cho IPC handlers đã định kiểu
│   │
│   ├── preload/                       # Preload script (context isolation)
│   │   ├── index.ts                   # Tiếp xúc electronAPI cho renderer
│   │   └── index.d.ts                 # Khai báo TypeScript cho electronAPI
│   │
│   ├── shared/                        # ⭐ KIỂU DÙNG CHUNG (nguồn sự thật duy nhất)
│   │   ├── types.ts                   # Tất cả kiểu AppData + định nghĩa kênh IPC
│   │   └── index.ts                   # Re-exports để nhập tiện lợi
│   │
│   └── renderer/src/                  # Ứng dụng React
│       ├── games/
│       │   ├── registry.ts            # Registry của trình soạn thảo game (6 games)
│       │   ├── group-sort/            # Trình soạn thảo Group Sort
│       │   ├── plane-quiz/            # Trình soạn thảo Plane Quiz
│       │   ├── balloon-letter-picker/ # Trình soạn thảo Balloon Letter Picker
│       │   ├── pair-matching/         # Trình soạn thảo Pair Matching
│       │   ├── word-search/           # Trình soạn thảo Word Search
│       │   └── whack-a-mole/          # Trình soạn thảo Whack-a-Mole
│       ├── components/                # Các thành phần UI dùng chung
│       │   ├── EditorShared/          # Thành phần editor dùng chung (tabs, lists, counters)
│       │   ├── ImagePicker/           # Chọn và xem trước hình ảnh
│       │   └── ...                    # Các thành phần khác
│       ├── context/                   # React contexts (Settings, Project)
│       ├── hooks/                     # Custom React hooks
│       │   ├── useEntityCreateShortcut/ # Keyboard shortcuts cho việc thêm entities
│       │   └── ...                    # Các hooks khác
│       ├── pages/                     # Các trang route (Home, Project)
│       ├── types/                     # Re-exports từ ../../shared
│       └── utils/                     # Các hàm tiện ích
│
├── resources/                         # Tài nguyên ứng dụng (icons, etc.)
├── templates/                         # Game templates đã build (git-ignored, sinh ra khi build)
│   └── <game-id>/
│       ├── game/                      # Đầu ra game đã build (index.html + assets/)
│       └── meta.json                  # Metadata của template
│
├── tsconfig.json                      # Cấu hình TypeScript gốc
├── tsconfig.node.json                 # Cấu hình TypeScript cho main/preload
├── tsconfig.web.json                  # Cấu hình TypeScript cho renderer
└── electron.vite.config.ts            # Cấu hình Vite cho build Electron
```

> 💡 **Lưu ý**: Thư mục `templates/` được git-ignored và được sinh ra bằng cách chạy `./build-templates.sh` từ gốc repository. Nó chứa đầu ra đã build của tất cả game templates từ `template-projects/`.

### Nguyên tắc Thiết kế Chính: Nguồn Sự thật Duy nhất

Tất cả định nghĩa kiểu đều bắt nguồn từ `src/shared/types.ts`. Điều này loại bỏ việc lặp lại và đảm bảo an toàn kiểu trên cả ba lớp Electron.

---

## Hệ thống Kiểu TypeScript

### Module Kiểu Dùng chung (`src/shared/types.ts`)

Tệp này là **nguồn sự thật duy nhất** cho tất cả các kiểu được sử dụng trong toàn ứng dụng:

1. **Kiểu AppData**: Định nghĩa hình dạng dữ liệu dự án cho mỗi trò chơi
   - `GroupSortAppData`, `QuizAppData`, `BalloonLetterPickerAppData`, v.v.
   - Được sử dụng bởi cả main process (transforms) và renderer (editors)

2. **Định nghĩa Kênh IPC**: Định nghĩa tất cả các kênh IPC với chữ ký handler của chúng
   - Interface `IPCChannelDefinitions` ánh xạ tên kênh đến các kiểu handler
   - Bao gồm tham số `IpcMainInvokeEvent` cho các handler của tiến trình chính

3. **Kiểu Chung**: `GameTemplate`, `ProjectFile`, `GlobalSettings`, v.v.

### Các Helper Kiểu

```typescript
// Rút ra kiểu hàm handler cho một kênh
export type IPCHandler<T extends keyof IPCChannelDefinitions> = IPCChannelDefinitions[T]['handler']

// Rút ra các tham số gọi từ renderer (loại trừ IpcMainInvokeEvent)
export type RendererInvokeArgs<T extends keyof IPCChannelDefinitions> =
  IPCChannelDefinitions[T]['handler'] extends (
    event: IpcMainInvokeEvent,
    ...args: infer U
  ) => unknown
    ? U
    : IPCChannelDefinitions[T]['handler'] extends () => unknown
      ? []
      : Parameters<IPCChannelDefinitions[T]['handler']>

// Rút ra kiểu trả về của một IPC handler
export type IPCReturn<T extends keyof IPCChannelDefinitions> = ReturnType<IPCHandler<T>>
```

### Đường dẫn Nhập

```typescript
// ✅ Được khuyến nghị: Nhập trực tiếp từ shared
import type { GroupSortAppData, IPCChannels } from '../../shared'

// ✅ Cũng hoạt động: Nhập qua renderer/types (re-exports shared)
import type { GroupSortAppData } from '../types'

// ❌ Tránh: Nhập từ main hoặc preload (phá vỡ sự phân tách lớp)
import type { ... } from '../../main/...'
```

---

## Giao tiếp IPC (Type-Safe)

### Tổng quan

Hệ thống IPC hoàn toàn type-safe nhờ các định nghĩa kênh tập trung. Khi bạn thêm hoặc sửa đổi một kênh IPC, các kiểu được tự động thực thi trong:

- Triển khai handler của tiến trình chính
- Gọi script preload
- Sử dụng renderer

### Định dạng Định nghĩa Kênh

Mỗi kênh được định nghĩa trong `IPCChannelDefinitions` với **chữ ký handler của tiến trình chính**:

```typescript
export interface IPCChannelDefinitions {
  'check-folder-status': {
    handler: (event: IpcMainInvokeEvent, folderPath: string) => Promise<FolderStatus>
  }
}
```

**Quan trọng**: Tham số đầu tiên luôn là `IpcMainInvokeEvent` (được cung cấp tự động bởi Electron). Renderer KHÔNG truyền tham số này.

### Tiến trình chính: Đăng ký một Handler

```typescript
// src/main/index.ts
import { createHandler } from './ipc-handlers'

createHandler('check-folder-status', async (_event, folderPath: string) => {
  return checkFolderStatus(folderPath)
})
```

**Điểm chính**:

- Sử dụng `createHandler(channel, handler)` để suy luận kiểu
- Chữ ký handler phải khớp với định nghĩa trong `IPCChannelDefinitions`
- TypeScript sẽ thực thi các kiểu tham số và kiểu trả về chính xác

### Preload Script: Tiếp xúc API

```typescript
// src/preload/index.ts
contextBridge.exposeInMainWorld('electronAPI', {
  checkFolderStatus: (folderPath: string) =>
    typedIpcRenderer.invoke('check-folder-status', folderPath)
})
```

**Điểm chính**:

- `typedIpcRenderer.invoke` tự động loại trừ tham số `IpcMainInvokeEvent`
- Các tham số và kiểu trả về được suy luận từ định nghĩa kênh

### Renderer: Sử dụng API

```typescript
// Trong một React component
const status = await window.electronAPI.checkFolderStatus('/some/path')
// status được định kiểu là FolderStatus ('empty' | 'has-project' | 'non-empty')
```

**Điểm chính**:

- Tự động hoàn thành và kiểm tra kiểu đầy đủ
- Không cần nhớ chuỗi kênh (sử dụng hằng số `IPCChannels` nếu cần)

### Các Kênh IPC Có sẵn

| Kênh                    | Mục đích                                       | Tham số                                                     | Trả về                         |
| ----------------------- | ---------------------------------------------- | ----------------------------------------------------------- | ------------------------------ |
| `get-templates`         | Liệt kê các game templates có sẵn              | none                                                        | `GameTemplate[]`               |
| `check-folder-status`   | Kiểm tra folder có phù hợp cho dự án mới không | `folderPath: string`                                        | `FolderStatus`                 |
| `choose-project-folder` | Mở hộp thoại chọn folder                       | none                                                        | `string \| null`               |
| `open-project-file`     | Tải một tệp `.mgproj`                          | `filePath?: string`                                         | `ProjectFile \| null`          |
| `save-project`          | Lưu dự án vào disk                             | `data: object, projectPath: string, history?: object[]`     | `boolean`                      |
| `save-project-as`       | Lưu dự án vào vị trí mới                       | `opts: { projectData: object, oldProjectDir: string }`      | `object \| null`               |
| `do-save-as`            | Thực hiện thao tác save-as                     | `opts: { projectData, oldProjectDir, newFolder, history? }` | `object`                       |
| `pick-image`            | Mở hộp thoại chọn ảnh                          | none                                                        | `string \| null`               |
| `import-image`          | Sao chép ảnh vào assets của dự án              | `sourcePath, projectDir, desiredNamePrefix`                 | `string` (đường dẫn tương đối) |
| `resolve-asset-url`     | Lấy URL file:// cho một asset                  | `projectDir, relativePath`                                  | `string` (file URL)            |
| `settings-read-global`  | Tải cài đặt toàn cục                           | none                                                        | `GlobalSettings`               |
| `settings-write-global` | Lưu cài đặt toàn cục                           | `data: GlobalSettings`                                      | `boolean`                      |
| `set-title`             | Đặt tiêu đề cửa sổ chính                       | `title: string`                                             | `void`                         |
| `preview-project`       | Mở cửa sổ xem trước game                       | `opts: { templateId, appData, projectDir }`                 | `{ success: boolean }`         |
| `export-project`        | Xuất game độc lập                              | `opts: { templateId, appData, projectDir, mode }`           | Kết quả export                 |

---

## Luồng Dữ liệu

### Vòng đời Dữ liệu Dự án

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

### Biến đổi Dữ liệu (`src/main/gameRegistry.ts`)

Một số trò chơi yêu cầu biến đổi dữ liệu trước khi đưa vào runtime. Ví dụ:

- `balloon-letter-picker`: Làm phẳng `{ words: [...] }` thành mảng thường
- `pair-matching`: Đổi tên `imagePath` → `image`
- `whack-a-mole`: Đổi tên `id` → `groupId`

**Thêm một transform**:

```typescript
export const GAME_DATA_TRANSFORMS: Record<string, DataTransform> = {
  'my-new-game': (appData) => {
    const data = appData as MyNewGameAppData
    // Biến đổi thành hình dạng runtime
    return { items: data.items.map(({ text }) => ({ text })) }
  }
}
```

**Quan trọng**: Hàm transform nhận kiểu `AnyAppData` **nội bộ** và trả về hình dạng **runtime** mà game template mong đợi.

---

## Thêm một Trò chơi Mới

Đây là tác vụ mở rộng phổ biến nhất.

> 📚 **Để biết hướng dẫn quy trình đầy đủ** (bao gồm đăng ký script build, cấu hình CI, và kiểm tra), xem [Root README — Thêm Trò chơi Mới](../../README_vi.md#thêm-trò-chơi-mới--khởi-động-nhanh).

Phần này tập trung vào **các thay đổi code trong ứng dụng builder** khi thêm một trò chơi mới.

### Tổng quan

| Bước | Nhiệm vụ                          | Vị trí                                                      |
| ---- | --------------------------------- | ----------------------------------------------------------- |
| 1    | Tạo game template                 | `template-projects/` (xem Root README)                      |
| 2    | Đăng ký trong build script        | `build-templates.sh` (xem Root README)                      |
| 3    | Đăng ký trong CI                  | Tự động phát hiện từ `build-templates.sh` (xem Root README) |
| 4    | **Định nghĩa kiểu AppData**       | `src/shared/types.ts` (README này)                          |
| 5    | **Tạo thành phần editor**         | `src/renderer/src/games/<game-id>/` (README này)            |
| 6    | **Đăng ký editor**                | `src/renderer/src/games/registry.ts` (README này)           |
| 7    | **Thêm data transform (nếu cần)** | `src/main/gameRegistry.ts` (README này)                     |

### Các Trò chơi Hiện có

Builder hiện có **6 trình soạn thảo game** được triển khai:

1. **Group Sort** (`group-sort/`) — Phân loại mục vào các nhóm với hình ảnh
2. **Plane Quiz** (`plane-quiz/`) — Câu hỏi trắc nghiệm với hỗ trợ hình ảnh
3. **Balloon Letter Picker** (`balloon-letter-picker/`) — Game đánh vần từ
4. **Pair Matching** (`pair-matching/`) — Nối thẻ kiểu ghi nhớ
5. **Word Search** (`word-search/`) — Tìm từ trong lưới
6. **Whack-a-Mole** (`whack-a-mole/`) — Game đập chuột trả lời câu hỏi

Nghiên cứu các trình soạn thảo hiện có này để biết các mẫu triển khai và thực hành tốt nhất.

### Bước 4: Định nghĩa Kiểu AppData

Chỉnh sửa `src/shared/types.ts`:

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

// Thêm vào union AnyAppData:
export type AnyAppData =
  | GroupSortAppData
  | QuizAppData
  // ... các kiểu hiện có ...
  | MyNewGameAppData // ← Thêm dòng này
```

### Bước 5: Tạo Thành phần Editor

Tạo `src/renderer/src/games/my-new-game/MyNewGameEditor.tsx`:

```typescript
import type { MyNewGameAppData } from '../../types'

interface Props {
  appData: MyNewGameAppData
  projectDir: string
  onChange: (data: MyNewGameAppData) => void
}

export default function MyNewGameEditor({ appData, projectDir, onChange }: Props) {
  // Giao diện editor của bạn ở đây
  // Gọi onChange với dữ liệu mới khi người dùng thực hiện thay đổi

  return (
    <div>
      {/* Giao diện Editor */}
    </div>
  )
}
```

**Yêu cầu chính**:

- Chấp nhận các props `appData`, `projectDir`, và `onChange`
- Gọi `onChange` với một bản sao **bất biến mới** của `appData` mỗi khi có thay đổi
- Sử dụng các thành phần dùng chung từ `src/renderer/src/components/EditorShared`
- Sử dụng `ImagePicker` để chọn hình ảnh

### Bước 6: Đăng ký Editor

Chỉnh sửa `src/renderer/src/games/registry.ts`:

```typescript
import MyNewGameEditor from './my-new-game/MyNewGameEditor'

export const GAME_REGISTRY: Record<string, GameRegistryEntry> = {
  // ... các mục hiện có ...

  'my-new-game': {
    Editor: MyNewGameEditor as GameRegistryEntry['Editor'],
    createInitialData: () => ({
      items: [],
      _itemCounter: 0
    })
  }
}
```

**Quan trọng**: `createInitialData` phải trả về một `MyNewGameAppData` trống **hợp lệ** mà editor của bạn có thể render mà không bị lỗi.

### Bước 7: Thêm Data Transform (Nếu cần)

Nếu hình dạng runtime của game bạn khác với hình dạng được lưu, chỉnh sửa `src/main/gameRegistry.ts`:

```typescript
export const GAME_DATA_TRANSFORMS: Record<string, DataTransform> = {
  // ... các transforms hiện có ...

  'my-new-game': (appData) => {
    const data = appData as MyNewGameAppData
    // Trả về hình dạng runtime
    return data.items.map(({ text }) => ({ text }))
  }
}
```

Nếu các hình dạng giống hệt nhau, bỏ qua bước này.

### Bước 8: Kiểm tra Cục bộ

```bash
# Build template
./build-templates.sh my-new-game

# Chạy builder
cd builder-projects/electron-app-mui
yarn dev
```

**Danh sách kiểm tra**:

- [ ] Game xuất hiện trên màn hình chính với tên/mô tả chính xác
- [ ] Tạo dự án mới mở editor mà không có lỗi
- [ ] Chỉnh sửa nội dung, lưu, đóng và mở lại hoạt động chính xác
- [ ] Xem trước mở game với dữ liệu đã được tải
- [ ] Export (folder và ZIP) tạo ra một game độc lập hoạt động được

---

## Quy trình Phát triển

### Yêu cầu Hệ thống

- **Node.js** 20+
- **Yarn** 4.13+ (`corepack enable && corepack prepare yarn@4.13.0 --activate`)

### Thiết lập Ban đầu

```bash
# Cài đặt dependencies
cd builder-projects/electron-app-mui
yarn install

# Build tất cả game templates (từ gốc repo)
./build-templates.sh
```

### Chế độ Phát triển

```bash
# Terminal 1: Chạy builder ở chế độ dev
cd builder-projects/electron-app-mui
yarn dev

# Terminal 2 (tùy chọn): Watch một game template cụ thể
cd template-projects/group-sort
yarn dev
```

Builder sẽ hot-reload khi bạn thay đổi code renderer. Các thay đổi game template yêu cầu build lại:

```bash
./build-templates.sh group-sort
```

### Sử dụng Context từ các Editors Hiện có

Khi tạo một editor mới, hãy nghiên cứu các editor hiện có để biết các mẫu:

1. **Quản lý State**: Sử dụng controlled components với callbacks `onChange`
2. **Shared Components**: Tái sử dụng `EditorShared` cho tabs, counters, list editors
3. **Xử lý Hình ảnh**: Sử dụng `ImagePicker` và phương thức IPC `importImage`
4. **Undo/Redo**: Project context xử lý việc này tự động—chỉ cần gọi `onChange` với dữ liệu mới
5. **Keyboard Shortcuts**: Sử dụng `useEntityCreateShortcut` cho hotkey tạo entity

Mẫu ví dụ:

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

Builder sử dụng hệ thống keyboard shortcut phân tầng để tạo nội dung hiệu quả:

#### Entity Creation (trong Editors)

Sử dụng hook `useEntityCreateShortcut` để đăng ký keyboard shortcuts cho việc thêm entities:

```typescript
import { useEntityCreateShortcut } from '@renderer/hooks/useEntityCreateShortcut'

export default function MyGameEditor({ appData, onChange }: Props) {
  // Đăng ký shortcuts cho việc thêm items (tier 1) và groups (tier 2)
  useEntityCreateShortcut({
    onTier1: addItem, // Ctrl+N
    onTier2: addGroup // Ctrl+Shift+N
  })

  // ... editor UI
}
```

**Hệ thống Tier:**
| Tier | Shortcut | Mục đích | Ví dụ |
|------|----------|---------|-------|
| 1 | `Ctrl+N` | Đơn vị nhỏ nhất | Item, word, question |
| 2 | `Ctrl+Shift+N` | Đơn vị trung bình | Group, category |
| 3 | `Ctrl+Alt+N` | Đơn vị lớn | Section, block |
| 4 | `Ctrl+Shift+Alt+N` | Đơn vị phức tạp | Complex category |

#### Project-Level Shortcuts

Trang Project tự động xử lý các shortcuts sau:

| Action           | Shortcut                     |
| ---------------- | ---------------------------- |
| Undo             | `Ctrl+Z`                     |
| Redo             | `Ctrl+Y` hoặc `Ctrl+Shift+Z` |
| Save             | `Ctrl+S`                     |
| Save As          | `Ctrl+Shift+S`               |
| Preview          | `Ctrl+P`                     |
| Export to folder | `Ctrl+Shift+P`               |
| Export as ZIP    | `Ctrl+Alt+P`                 |

### Gỡ lỗi

**Main Process**:

- Logs xuất hiện trong terminal đang chạy `yarn dev`
- Sử dụng `console.log()` trong `src/main/index.ts`

**Renderer**:

- Mở DevTools (tự động mở trong chế độ dev)
- Sử dụng React DevTools để kiểm tra thành phần
- **Zustand-Travel**: Truy cập giao diện gỡ lỗi time-travel cho undo/redo

**Cửa sổ Preview**:

- DevTools mở tự động cho các cửa sổ preview
- `window.__PREVIEW_DEBUG__` chứa thông tin session trong chế độ dev

**Gỡ lỗi State**:

Ứng dụng sử dụng Zustand với Zustand-Travel cho quản lý state. Trong chế độ phát triển:

- Truy cập bảng gỡ lỗi time-travel qua project context
- Kiểm tra lịch sử state cho các thao tác undo/redo
- Xem snapshot state tại bất kỳ thời điểm nào trong lịch sử chỉnh sửa

---

## Build và Phân phối

### Các Lệnh Build

```bash
# Typecheck trước
yarn typecheck

# Build cho nền tảng hiện tại
yarn build

# Build cho các nền tảng cụ thể (phát triển cục bộ)
yarn build:win      # Windows (bộ cài đặt NSIS)
yarn build:mac      # macOS (DMG)
yarn build:linux    # Linux (AppImage)

# Build thư mục unpacked (để kiểm tra)
yarn build:unpack
```

> 💡 **Lưu ý**: Quy trình CI/CD build với target 7z để phân phối. Chạy `electron-builder --dir --config.target=7z` thủ công nếu bạn cần file 7z cục bộ.

### Quy trình Build

1. Biên dịch TypeScript (main, preload, renderer)
2. Vite bundle renderer với các assets được inlined
3. Electron Builder đóng gói ứng dụng
4. Các game templates từ `templates/` được bao gồm như các resources bổ sung

### Phân phối

**Build cục bộ** (sử dụng lệnh `yarn build:*`):

- Windows: Bộ cài đặt NSIS (`.exe`)
- macOS: Ảnh DMG (`.dmg`)
- Linux: AppImage (`.AppImage`)

**Build CI/CD** (GitHub Actions):

- Tất cả nền tảng: File 7z (`.7z`)
- Windows: `I-CLC-Game-maker-win-x64.7z`
- macOS: `I-CLC-Game-maker-mac-x64.7z`
- Linux: `I-CLC-Game-maker-linux-x64.7z`

### App Icons

App icons được lưu trữ trong `resources/` và được sinh ra bằng `electron-icon-builder`:

```bash
# Generate icons from resources/icon.png
npx electron-icon-builder --input=resources/icon.png --output=resources --flatten
```

---

## Các Mẫu và Thực hành Tốt nhất

### Cập nhật State Bất biến

Luôn tạo đối tượng mới khi gọi `onChange`:

```typescript
// ✅ Đúng
onChange({
  ...appData,
  items: [...appData.items, newItem]
})

// ❌ Sai (đột biến state hiện có)
appData.items.push(newItem)
onChange(appData)
```

> 💡 **Mẹo**: Ứng dụng sử dụng thư viện `mutative` cho một số thao tác bất biến. Xem các trình soạn thảo hiện có để biết ví dụ.

### Mẫu Counter

Sử dụng `_itemCounter` (hoặc tương tự) để tạo IDs duy nhất:

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

### Phân giải Đường dẫn Asset

Hình ảnh được lưu tương đối với thư mục dự án:

```typescript
// Trong editor
const relativePath = await window.electronAPI.importImage(sourcePath, projectDir, 'item-image')

// Trong game template (runtime)
const imagePath = `./assets/user/${relativePath}`
```

### Lưu trữ Cài đặt

Cài đặt toàn cục được lưu trữ trong thư mục `userData` của Electron:

```typescript
// Đọc
const settings = await window.electronAPI.settingsReadGlobal()

// Ghi
await window.electronAPI.settingsWriteGlobal({
  ...settings,
  autoSave: { mode: 'on-edit', intervalSeconds: 30 }
})
```

### Các Mẫu Component

**Shared Editor Components** (`src/renderer/src/components/EditorShared/`):

- `TabbedEditor` — Container tab cho editors nhiều phần
- `ListEditor` — Chỉnh sửa danh sách với add/remove/reorder
- `CounterBadge` — Hiển thị counters với Material-UI badges
- `ImageCard` — Card component với xem trước hình ảnh

**Xử lý Hình ảnh**:

- Sử dụng `ImagePicker` component để chọn hình ảnh
- Hình ảnh được sao chép vào folder `assets/` của dự án qua IPC
- Asset URLs được phân giải qua kênh IPC `resolve-asset-url`

### Keyboard Shortcuts

Ứng dụng sử dụng hệ thống keyboard shortcut toàn diện:

**Entity Creation** (trong editors):

- `Ctrl+N` — Thêm entity chính (item, question, word)
- `Ctrl+Shift+N` — Thêm entity phụ (group, category)

**Project-Level**:

- `Ctrl+Z` — Undo
- `Ctrl+Y` / `Ctrl+Shift+Z` — Redo
- `Ctrl+S` — Save
- `Ctrl+Shift+S` — Save As
- `Ctrl+P` — Preview
- `Ctrl+Shift+P` — Export to folder
- `Ctrl+Alt+P` — Export as ZIP

Sử dụng hook `useEntityCreateShortcut` để đăng ký shortcuts trong editor của bạn.

---

> ⚠️ **Lưu ý cho AI Chatbots**: Thư mục `templates/` trong dự án này chỉ chứa **đầu ra đã build và thu gọn (minified)**. Mỗi thư mục con `<game-id>/game/` chỉ chứa một tệp `index.html` được bundle duy nhất (và tùy chọn là một thư mục `images/`). Không có tệp mã nguồn nào để đọc trong các thư mục đầu ra build này — chúng chỉ tồn tại để sử dụng runtime bởi ứng dụng Electron. Để hiểu logic trò chơi và mã nguồn, hãy đọc các tệp trong `template-projects/<game-id>/` thay thế. Đọc nội dung thư mục `game/` sẽ lãng phí bộ nhớ context của bạn với mã đã thu gọn/bundle.

## Xử lý Sự cố

### Lỗi "Module not found"

Đảm bảo bạn đang nhập từ đường dẫn chính xác:

- Renderer → `../../shared` hoặc `../types`
- Main → `../shared`
- Preload → `../shared`

### Lỗi Kiểu sau khi Thêm Game

1. Chạy `yarn typecheck` để xem các lỗi cụ thể
2. Đảm bảo union `AnyAppData` của bạn bao gồm kiểu mới
3. Kiểm tra rằng `createInitialData` trả về hình dạng chính xác
4. Xác minh tất cả các thuộc tính bắt buộc có trong interface AppData

### Cửa sổ Preview Hiển thị Trắng

1. Kiểm tra console DevTools để biết lỗi
2. Xác minh `window.APP_DATA` được đưa vào (kiểm tra nguồn HTML)
3. Đảm bảo đầu ra build của game template nằm trong `templates/<game-id>/game/`
4. Chạy `../../build-templates.sh <game-id>` để build lại template

### IPC Handler Không được Gọi

1. Xác minh tên kênh khớp chính xác (sử dụng hằng số `IPCChannels`)
2. Kiểm tra rằng `createHandler` được gọi trong `src/main/index.ts`
3. Đảm bảo preload script tiếp xúc phương thức
4. Kiểm tra các kiểu TypeScript khớp giữa main và preload

### Build Thất bại với "Template not found"

Chạy `../../build-templates.sh` từ gốc repo để đảm bảo tất cả templates được build và sao chép.

### State Không Được Lưu Sau Khi Save

1. Đảm bảo `onChange` được gọi với một đối tượng bất biến mới
2. Kiểm tra rằng project context được kết nối đúng
3. Xác minh cài đặt auto-save trong global settings
4. Kiểm tra logs của main process để biết lỗi save

### Hình ảnh Không Tải trong Preview/Export

1. Xác minh hình ảnh được nhập qua kênh IPC `import-image`
2. Kiểm tra rằng đường dẫn asset tương đối với thư mục dự án
3. Đảm bảo `resolve-asset-url` được sử dụng cho preview
4. Xác minh hình ảnh được sao chép vào `assets/user/` trong khi export

---

## Hồ sơ Quyết định Kiến trúc (ADRs)

### ADR-001: Định nghĩa Kiểu Tập trung

**Quyết định**: Tất cả các kiểu được định nghĩa trong `src/shared/types.ts` và được nhập bởi main, preload, và renderer.

**Lý do**:

- Loại bỏ việc lặp lại (trước đây các kiểu AppData được định nghĩa hai lần)
- Đảm bảo an toàn kiểu trên các ranh giới IPC
- Nguồn sự thật duy nhất giúp việc refactoring dễ dàng hơn

### ADR-002: IPC Handlers đã định kiểu

**Quyết định**: Sử dụng `createHandler(channel, handler)` với các kiểu được suy luận từ `IPCChannelDefinitions`.

**Lý do**:

- Ngăn ngừa lỗi chính tả tên kênh
- Thực thi chữ ký handler chính xác
- Tự động hoàn thành trong IDE
- Thay đổi định nghĩa kênh tự động cập nhật tất cả các cách sử dụng

### ADR-003: Data Transforms trong Main Process

**Quyết định**: Các transforms dữ liệu cụ thể của game nằm trong `src/main/gameRegistry.ts`.

**Lý do**:

- Giữ code renderer sạch và không phụ thuộc vào game
- Transforms được áp dụng nhất quán cho preview và export
- Các game templates có thể phát triển độc lập với cấu trúc editor

### ADR-004: Zustand cho Quản lý State

**Quyết định**: Sử dụng Zustand với Zustand-Travel cho quản lý state dự án.

**Lý do**:

- API đơn giản với boilerplate tối thiểu
- Gỡ lỗi time-travel tích hợp cho undo/redo
- Tích hợp TypeScript tốt hơn Redux
- Kích thước bundle nhỏ hơn so với các lựa chọn thay thế

---

## Giấy phép

[Giấy phép của Bạn ở Đây]
