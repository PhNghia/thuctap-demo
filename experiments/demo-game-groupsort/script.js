// --- Dữ liệu Mockup (Thay vì load file DB offline, ta định nghĩa thẳng ở đây để demo) ---
// Mỗi hình ảnh là một chuỗi SVG code đơn giản.
const svgData = {
  // Hình vuông
  square: `<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#4CAF50" stroke="#333" stroke-width="5"/></svg>`,
  // Hình tròn
  circle: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#2196F3" stroke="#333" stroke-width="5"/></svg>`,
  // Hình tam giác
  triangle: `<svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" fill="#FFC107" stroke="#333" stroke-width="5"/></svg>`,
};

const gameConfig = {
  // Định nghĩa các nhóm
  groups: [
    { id: "g_square", name: "Nhóm Vuông", icon: svgData.square },
    { id: "g_circle", name: "Nhóm Tròn", icon: svgData.circle },
    { id: "g_triangle", name: "Nhóm Tam Giác", icon: svgData.triangle },
  ],
  // Định nghĩa các câu hỏi và đáp án đúng
  items: [
    { id: "i1", icon: svgData.square, correctGroup: "g_square" },
    { id: "i2", icon: svgData.circle, correctGroup: "g_circle" },
    { id: "i3", icon: svgData.triangle, correctGroup: "g_triangle" },
    { id: "i4", icon: svgData.square, correctGroup: "g_square" },
    { id: "i5", icon: svgData.circle, correctGroup: "g_circle" },
    { id: "i6", icon: svgData.circle, correctGroup: "g_circle" },
  ],
};

// --- DOM Elements ---
const sourcePool = document.getElementById("source-pool");
const groupsWrapper = document.getElementById("groups-wrapper");
const toast = document.getElementById("feedback-toast");

// Biến lưu trữ trạng thái kéo thả
let draggedItem = null;

// --- Khởi tạo Game ---
function initGame() {
  // 1. Gen các cột Group
  gameConfig.groups.forEach((group) => {
    const col = document.createElement("div");
    col.className = "group-column";
    col.innerHTML = `
            <div class="group-header" title="${group.name}">${group.icon}</div>
            <div class="group-items-dropzone" data-group-id="${group.id}"></div>
        `;
    groupsWrapper.appendChild(col);
  });

  // 2. Gen các Item câu hỏi (Answers pool)
  // Trộn ngẫu nhiên câu hỏi để tăng tính thực tế
  const shuffledItems = [...gameConfig.items].sort(() => Math.random() - 0.5);

  shuffledItems.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.className = "game-item";
    itemEl.id = item.id;
    itemEl.draggable = true; // Cho phép kéo
    itemEl.innerHTML = item.icon;

    // Lưu thông tin đáp án vào element để check
    itemEl.dataset.correctGroup = item.correctGroup;

    addDragEvents(itemEl);
    sourcePool.appendChild(itemEl);
  });

  // 3. Setup sự kiện cho các Dropzone (Cột group)
  const dropzones = document.querySelectorAll(".group-items-dropzone");
  dropzones.forEach((dz) => addDropzoneEvents(dz));
}

// --- Logic Kéo Thả (Drag and Drop API) ---

function addDragEvents(itemEl) {
  // Khi bắt đầu nắm kéo
  itemEl.addEventListener("dragstart", (e) => {
    draggedItem = itemEl;
    itemEl.classList.add("dragging");

    // Theo yêu cầu: Yêu cầu trình duyệt không ẩn item gốc khi kéo
    // (Đây là mặc định của API, nên ta không cần code thêm gì phức tạp)

    // Cần thiết cho Firefox chạy được drag&drop
    e.dataTransfer.setData("text/plain", itemEl.id);
  });

  // Khi buông chuột (dù thả trúng hay trượt)
  itemEl.addEventListener("dragend", () => {
    draggedItem = null;
    itemEl.classList.remove("dragging");

    // Sau khi buông, ta kiểm tra xem nó có nằm trong nhóm nào không
    // Nếu không (thả trượt), nó vẫn ở chỗ cũ trong sourcePool.
  });
}

function addDropzoneEvents(dropzone) {
  // Khi item được kéo đè lên vùng thả
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault(); // Bắt buộc để cho phép thả
    dropzone.classList.add("drag-over");
  });

  // Khi item kéo ra khỏi vùng thả mà không buông chuột
  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("drag-over");
  });

  // Khi buông chuột TRÊN vùng thả
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("drag-over");

    if (!draggedItem) return;

    const itemId = draggedItem.id;
    const correctGroupId = draggedItem.dataset.correctGroup;
    const targetGroupId = dropzone.dataset.groupId;

    // --- Check Đáp Án ---
    if (targetGroupId === correctGroupId) {
      // ĐÚNG
      showFeedback("Chính xác!", "correct");

      // Theo yêu cầu: Thả item mà nó không quay về nữa thì mới di chuyển
      // các item lên để lấp lại chỗ trống -> Logic lấp chỗ trống là mặc định của CSS Grid
      // khi ta remove item khỏi sourcePool.

      dropzone.appendChild(draggedItem); // Di chuyển item vào cột nhóm
      draggedItem.draggable = false; // Không cho kéo nữa sau khi đã trả lời đúng
      draggedItem.style.cursor = "default";
    } else {
      // SAI
      showFeedback("Sai rồi!", "wrong");
      // Theo yêu cầu: Nếu sai thì item quay về container câu trả lời ban đầu
      // Logic: Ta không làm gì cả, draggedItem sẽ tự động kích hoạt event dragend
      // và vẫn nằm ở vị trí cũ trong sourcePool.
    }
  });
}

// --- Hiển thị thông báo (Toast) ---
let toastTimer = null;
function showFeedback(message, type) {
  clearTimeout(toastTimer); // Xóa timer cũ nếu user drag liên tục

  toast.textContent = message;
  toast.className = `feedback-toast ${type}`; // Thêm class correct/wrong

  // Ẩn sau 1.5 giây
  toastTimer = setTimeout(() => {
    toast.className = "feedback-toast hidden";
  }, 1500);
}

// Khởi chạy
initGame();
