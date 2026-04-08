# Minigame Builder

Ứng dụng dành cho máy tính (Electron) giúp giáo viên tiếng Anh không có kỹ thuật tạo các trò chơi nhỏ tùy chỉnh cho lớp học **mà không cần viết code**. Giáo viên nhập từ ngữ, câu hỏi, hình ảnh và nội dung khác qua trình soạn thảo trực quan, sau đó xuất ra một trò chơi độc lập có thể mở trực tiếp trên bất kỳ trình duyệt nào.

---

## Tài liệu

### Dành cho Nhà phát triển Mở rộng Builder

| Tài liệu                                                                      | Mô tả                                                                                            |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [README này](#readme)                                                         | **Bắt đầu từ đây** — Tổng quan dự án, yêu cầu game template, quy trình build, và CI/CD           |
| [Builder README](builder-projects/electron-app-mui/README.md)                 | Đi sâu vào codebase của ứng dụng Electron — Kiến trúc, hệ thống kiểu TypeScript, IPC, mẫu editor |
| [Builder README (Vietnamese)](builder-projects/electron-app-mui/README_vi.md) | Bản tiếng Việt của Builder README                                                                |

> 💡 **Ngữ cảnh Quy trình**: Ứng dụng builder chỉ là một phần của hệ thống. Để biết thông tin đầy đủ về quy trình (xây dựng game templates, CI/CD, đóng gói), hãy xem **README này**. Builder README tập trung vào kiến trúc nội bộ và mẫu code của ứng dụng Electron.

---

## Cấu trúc Dự án

```
minigame-builder/
├── build-templates.sh              # Công cụ build cục bộ — build tất cả game templates
├── .github/workflows/build-all.yml # CI: build templates rồi đóng gói ứng dụng Electron
│
├── template-projects/              # Các dự án game template (THÊM TRÒ CHƠI MỚI Ở ĐÂY)
│   ├── group-sort/                 # ⚡ KHUYẾN NGHỊ dùng làm template để copy (Vite + React Compiler)
│   └── ...                         # Các game template khác
│
└── builder-projects/
    └── electron-app-mui/           # Ứng dụng trình soạn thảo Electron
        ├── src/
        │   ├── main/               # Main process — file I/O, dialogs, IPC handlers
        │   ├── preload/            # Preload script — cầu nối IPC đã định kiểu
        │   ├── shared/             # ⭐ Shared types — nguồn sự thật duy nhất
        │   └── renderer/src/       # Ứng dụng React — editors, UI, quản lý dự án
        └── templates/              # Tài sản game đã build (tạo bởi build-templates.sh)
            └── <game-id>/
                ├── game/           # Đầu ra đã build (index.html + images)
                └── meta.json       # Metadata của template
```

> 💡 **Thêm trò chơi mới?** Tạo nó trong `template-projects/`, sau đó đăng ký trong builder. Xem [Thêm Trò chơi Mới](#thêm-trò-chơi-mới--khởi-động-nhanh) bên dưới.

---

## Cách Thức Hoạt Động

1. **Các dự án template** (`template-projects/`) là các ứng dụng web độc lập. Mỗi template được build thành một tệp `index.html` duy nhất (qua `vite-plugin-singlefile`) cùng với các tài sản hình ảnh.
2. **Trình soạn thảo (builder)** (`builder-projects/electron-app-mui/`) đọc các tệp đã build từ thư mục `templates/` của nó. Khi giáo viên xuất một dự án, trình soạn thảo sẽ chèn dữ liệu của giáo viên trực tiếp vào HTML (`window.APP_DATA`) và sao chép các tài sản hình ảnh đi kèm.
3. **Đầu ra cuối cùng** là một thư mục đơn giản (hoặc tệp ZIP) hoạt động ngoại tuyến trên bất kỳ trình duyệt nào — không cần máy chủ.

---

## Yêu cầu đối với Game Template

Một dự án game template có thể sử dụng **bất kỳ công cụ nào** miễn là đầu ra build đáp ứng các yêu cầu dưới đây.

### Điểm Bắt đầu Khuyến nghị

**Sử dụng `template-projects/group-sort` làm template.** Nó được cấu hình với:

- Vite + React 19
- React Compiler (tự động memoization)
- `vite-plugin-singlefile` cho đầu ra một tệp
- Tích hợp `window.APP_DATA` đúng cách

Bạn có thể copy:

```bash
cp -r template-projects/group-sort template-projects/my-new-game
```

**Tuy nhiên, công cụ không bị giới hạn.** Bạn có thể dùng Vue, Svelte, vanilla JS, hoặc bất cứ thứ gì — chỉ **đầu ra build** là quan trọng (xem bên dưới).

### Yêu cầu Đầu ra Build

Game template đã build phải tuân theo cấu trúc chính xác sau:

```
<game-id>/
├── index.html              # HTML một tệp ở root — tất cả JS và CSS phải được nhúng trực tiếp
└── assets/                 # Thư mục assets duy nhất bên cạnh index.html
    ├── sounds/             # Tệp âm thanh (tùy chọn)
    ├── images/             # Tài sản hình ảnh không thể nhúng trực tiếp
    │   ├── logo.png        # Bắt buộc: Logo game
    │   ├── banner.png      # Bắt buộc: Banner game
    │   └── icons/          # Bắt buộc: Icons nhiều kích thước
    │       ├── 16x16.png
    │       ├── 32x32.png
    │       ├── 48x48.png
    │       ├── 64x64.png
    │       ├── 128x128.png
    │       ├── 256x256.png
    │       ├── 512x512.png
    │       └── 1024x1024.png
```

> ⚠️ **Thư mục `assets/user/` KHÔNG được tồn tại trong game templates.** Thư mục này được tạo và điền bởi builder khi giáo viên xuất dự án. Tác giả template không nên tạo hoặc sử dụng thư mục này.

| Tệp/Thư mục              | Yêu cầu                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `index.html`             | **HTML một tệp** — tất cả JS và CSS phải được nhúng trực tiếp. Sử dụng `vite-plugin-singlefile` (hoặc tương đương).         |
| `assets/`                | **Thư mục bắt buộc** chứa tất cả assets. Phải được đặt tên chính xác là `assets`.                                           |
| `assets/sounds/`         | Tệp âm thanh tùy chọn. Có thể bỏ qua nếu game không có âm thanh.                                                            |
| `assets/images/`         | **Thư mục bắt buộc** cho tài sản hình ảnh không thể nhúng trực tiếp.                                                        |
| `assets/images/logo.png` | **Bắt buộc** — Ảnh logo game.                                                                                               |
| `assets/images/banner.png` | **Bắt buộc** — Ảnh banner game.                                                                                           |
| `assets/images/icons/`   | **Thư mục bắt buộc** chứa icons nhiều kích thước cho các ngữ cảnh hiển thị khác nhau.                                       |
| `assets/images/icons/*.png` | **Bắt buộc** — Icons ở các kích thước: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512, 1024x1024 (tất cả tính bằng pixel). |

> ⚠️ **Không được phát sinh các loại tài sản khác ở cấp root.** Font chữ, biểu tượng và SVG nhỏ nên được nhúng trực tiếp vào HTML. Tất cả các assets khác phải được tổ chức bên trong thư mục `assets/` theo loại.

### Hợp đồng Dữ liệu Runtime

Trình soạn thảo chèn nội dung do giáo viên tạo **trước thẻ `<script>` đầu tiên** như sau:

```html
<script>
  window.APP_DATA = {
    /* dữ liệu của giáo viên */
  };
  window.MY_APP_DATA = window.APP_DATA; // bí danh cũ
  window.win = { DATA: window.APP_DATA }; // bí danh cũ
</script>
```

Trò chơi của bạn đọc `window.APP_DATA` khi khởi động. Hình dạng của đối tượng đó tùy thuộc vào bạn — chỉ cần đảm bảo trình soạn thảo tạo ra dữ liệu phù hợp (xem `gameRegistry.ts` của builder nếu cần transform).

### `meta.json`

Mỗi thư mục template phải chứa `meta.json` ở cấp root (cạnh `vite.config.ts`, không phải trong `game/`):

```json
{
  "name": "Tên Trò Chơi Dễ Đọc",
  "description": "Một câu mô tả hiển thị trên màn hình chính.",
  "gameType": "your-game-id",
  "version": "0.0.1"
}
```

Có thể đặt tệp `thumbnail.png` (hoặc `.jpg`/`.webp`) bên cạnh `meta.json` để hiển thị hình ảnh xem trước trên màn hình chính.

---

## Cấu trúc Game đã Xuất

Khi giáo viên xuất một dự án game bằng trình soạn thảo, đầu ra tuân theo cấu trúc tương tự như game template đã build, với một điểm khác biệt chính: thư mục `assets/user/` được tạo và điền với các tài sản tùy chỉnh của giáo viên.

### Cấu trúc Thư mục Game đã Xuất

```
<ten-game-da-xuat>/
├── index.html              # HTML một tệp với dữ liệu của giáo viên được đưa vào (window.APP_DATA)
└── assets/
    ├── sounds/             # Sounds của template (nếu có)
    ├── images/             # Images của template (logo.png, banner.png, icons/)
    │   ├── logo.png
    │   ├── banner.png
    │   └── icons/
    │       ├── 16x16.png
    │       ├── 32x32.png
    │       ├── ...
    │       └── 1024x1024.png
    └── user/               # ⭐ Tài sản tùy chỉnh của giáo viên (cấu trúc phẳng, không thư mục con)
        ├── item-abc123-1712048532456-0.1234567.png
        ├── question-def456-1712048533789-0.9876543.jpg
        ├── group-ghi789-1712048534012-0.4567891.svg
        ├── word-jkl012-1712048535345-0.7891234.mp3
        ├── answer-mno345-1712048536678-0.2345678.ogg
        └── ...             # Bất kỳ loại tệp nào khác (png, jpg, svg, mp3, ogg, v.v.)
```

### Điểm Khác biệt Chính so với Cấu trúc Template

| Khía cạnh | Game Template | Game đã Xuất |
|-----------|---------------|--------------|
| `assets/user/` | **Không được tồn tại** — templates không nên tạo thư mục này | **Luôn xuất hiện** — được builder tạo, chứa các assets đã nhập của giáo viên |
| `index.html` | Chứa `window.APP_DATA` giữ chỗ/trống | Chứa **dữ liệu giáo viên được đưa vào** trong `window.APP_DATA` |
| Mục đích | Phát triển & phân phối | Game độc lập sẵn sàng sử dụng |

### Chi tiết Thư mục Assets Người dùng

Thư mục `assets/user/` có các đặc điểm sau:

- **Cấu trúc phẳng**: Tất cả tệp được lưu trực tiếp trong `assets/user/` không có thư mục con
- **Tên tệp tự động tạo**: Tệp được đổi tên theo mẫu `<loai-thuc-the>-<id>-<thoi-gian>-<ngau-nhien>`:
  - `loai-thuc-the`: Loại thực thể game (ví dụ: `item`, `question`, `group`, `word`, `answer`)
  - `id`: Định danh duy nhất cho thực thể
  - `thoi-gian`: Unix timestamp khi tệp được nhập
  - `ngau-nhien`: Số thập phân ngẫu nhiên để tăng tính duy nhất
- **Bất kỳ loại tệp nào**: Giáo viên có thể tải lên nhiều loại tệp bao gồm:
  - Ảnh: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.gif`
  - Âm thanh: `.mp3`, `.ogg`, `.wav`, `.aac`
  - Khác: Bất kỳ loại tệp nào được hỗ trợ bởi game template
- **Không phân loại theo thư mục**: Builder không tách các tệp thành thư mục con theo loại; tất cả assets người dùng được lưu phẳng trong `assets/user/`

### Cách Assets Người dùng Được Thêm vào

1. **Trong Trình soạn thảo**: Khi giáo viên tải lên một hình ảnh, âm thanh hoặc tài nguyên khác qua giao diện builder, tệp được sao chép vào thư mục assets của dự án với tên tệp được tạo.

2. **Khi Xuất**: Builder sao chép tất cả các tệp từ thư mục assets của dự án vào `assets/user/` trong thư mục đã xuất, giữ nguyên tên tệp đã tạo.

3. **Tại Runtime**: Game template tải các assets người dùng qua đường dẫn tương đối được lưu trong `window.APP_DATA`, ví dụ: `./assets/user/item-abc123-1712048532456-0.1234567.png`.

> 💡 **Lưu ý**: Game đã xuất là một **thư mục tự chứa** hoạt động ngoại tuyến trên bất kỳ trình duyệt hiện đại nào. Không cần máy chủ hoặc quy trình build — chỉ cần mở tệp `index.html`.

---

## Yêu cầu Hệ thống

- **Node.js** 20+
- **Yarn** 4 (`corepack enable && corepack prepare yarn@4.12.0 --activate`)

---

## Phát triển Cục bộ

```bash
# 1. Build tất cả game templates (bao gồm shared libraries)
./build-templates.sh

# 2. Khởi động trình soạn thảo ở chế độ dev
cd builder-projects/electron-app-mui
yarn install
yarn dev
```

Để chỉ build một game template đơn lẻ:

```bash
./build-templates.sh group-sort
```

> 💡 **Dành cho nhà phát triển game template:** Xem [template-projects README](template-projects/README_vi.md) để biết quy trình phát triển hoàn chỉnh, bao gồm cách sử dụng shared components và thêm template mới.

---

## Thêm Trò chơi Mới — Khởi động Nhanh

> 📚 **Để biết hướng dẫn chi tiết từng bước**, xem [template-projects README — Thêm Game Template Mới](template-projects/README_vi.md#thêm-game-template-mới).

### Tổng quan

**Trong template-projects/:**
1. **Tạo dự án template** — Copy `template-projects/group-sort`
2. **Cập nhật package.json** — Đổi tên trùng với tên thư mục
3. **Đăng ký trong workspace** — Thêm vào `template-projects/package.json` workspaces và scripts
4. **Tạo meta.json** — Thêm metadata của template
5. **Cài đặt dependencies** — Chạy `yarn install` từ `template-projects/`

**Trong builder-projects/electron-app-mui/:**
6. **Đăng ký trong `build-templates.sh`** — Thêm vào mảng `GAMES`
7. **Đăng ký trong CI workflow** — Workflow tự động phát hiện templates từ `build-templates.sh`
8. **Thêm kiểu TypeScript** — Trong `src/shared/types.ts`
9. **Tạo thành phần editor** — Trong `src/renderer/src/games/`
10. **Đăng ký editor** — Trong `src/renderer/src/games/registry.ts`
11. **Thêm data transform (nếu cần)** — Trong `src/main/gameRegistry.ts`

### Các Tệp Chính cần Sửa

| Tệp                                                                    | Mục đích                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------ |
| `template-projects/package.json`                                       | Thêm vào workspaces và build scripts             |
| `build-templates.sh`                                                   | Đăng ký game template mới cho builds cục bộ      |
| `.github/workflows/build-all.yml`                                      | Đăng ký cho CI builds                            |
| `builder-projects/electron-app-mui/src/shared/types.ts`                | Thêm các kiểu AppData                            |
| `builder-projects/electron-app-mui/src/renderer/src/games/registry.ts` | Đăng ký thành phần editor                        |
| `builder-projects/electron-app-mui/src/main/gameRegistry.ts`           | Thêm data transform (nếu hình dạng runtime khác) |

> 💡 **Hướng dẫn đầy đủ:** Xem [template-projects README](template-projects/README_vi.md#thêm-game-template-mới) để biết hướng dẫn chi tiết.

---

## Build & CI/CD

### Build Tất cả Templates

```bash
./build-templates.sh
```

Lệnh này build tất cả game templates và sao chép chúng vào `builder-projects/electron-app-mui/templates/`.

### Đóng gói Ứng dụng Electron

```bash
cd builder-projects/electron-app-mui

# Windows
yarn build:win

# Linux
yarn build:linux

# macOS
yarn build:mac
```

### Quy trình CI/CD

Quy trình GitHub Actions (`.github/workflows/build-all.yml`) chạy khi `workflow_dispatch`. Nó:

1. **Linux runner (build chính)**:
   - Chạy `./build-templates.sh` để build tất cả game templates
   - Tải lên tất cả templates dưới dạng artifacts
   - Build ứng dụng builder với `electron-vite build && electron-builder --dir`
   - Lưu đầu ra dưới dạng 7z (ghi đè cấu hình NSIS/DMG)
   - Tải lên file 7z dưới dạng artifact

2. **Windows runner**:
   - Tải templates đã build từ Linux runner
   - Chỉ build ứng dụng builder với target 7z
   - Tải lên file 7z dưới dạng artifact

3. **macOS runner**:
   - Tải templates đã build từ Linux runner
   - Chỉ build ứng dụng builder với target 7z
   - Tải lên file 7z dưới dạng artifact

Cách tiếp cận này giảm thiểu thời gian build trên Windows và macOS bằng cách tái sử dụng template artifacts được build trên Linux. Tất cả các nền tảng đều tạo ra file 7z thay vì các bộ cài đặt riêng của nền tảng (NSIS cho Windows, DMG cho macOS).

---

## Ngữ cảnh Dự án

Repository này chứa hai phần liên kết với nhau:

1. **Game Templates** (`template-projects/`) — Các ứng dụng web độc lập định nghĩa các trò chơi
2. **Builder App** (`builder-projects/electron-app-mui/`) — Trình soạn thảo Electron để tạo dự án game

Ứng dụng builder không thể hoạt động nếu không có game templates. Các templates được build riêng biệt và sao chép vào thư mục `templates/` của builder trong quá trình build.

Để hiểu **hệ thống hoàn chỉnh**, đọc README này trước. Để đi sâu vào **codebase của builder** (kiến trúc TypeScript, mẫu IPC, triển khai editor), xem [Builder README](builder-projects/electron-app-mui/README.md).

> ⚠️ **Lưu ý cho AI Chatbots**: Thư mục `templates/` bên trong `builder-projects/electron-app-mui/templates/` chỉ chứa **đầu ra đã build và thu gọn (minified)**. Mỗi thư mục con `<game-id>/game/` chỉ chứa một tệp `index.html` được bundle duy nhất (và tùy chọn là một thư mục `images/`). Không có tệp mã nguồn nào để đọc trong các thư mục đầu ra build này — chúng chỉ tồn tại để sử dụng runtime bởi ứng dụng Electron. Để hiểu logic trò chơi và mã nguồn, hãy đọc các tệp trong `template-projects/<game-id>/` thay thế.
