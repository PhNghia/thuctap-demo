const itemsData = [
  { id: 1, group: "A", color: "red" },
  { id: 2, group: "B", color: "blue" },
  { id: 3, group: "A", color: "darkred" },
  { id: 4, group: "B", color: "darkblue" },
];

const groupsData = [
  { id: "A", label: "Group Đỏ" },
  { id: "B", label: "Group Xanh" },
];

// Khởi tạo Game
function init() {
  const pool = document.getElementById("item-pool");
  const groupContainer = document.getElementById("groups-container");

  // Tạo các Group
  groupsData.forEach((g) => {
    groupContainer.innerHTML += `
            <div class="group-column" data-group-id="${g.id}">
                <div class="group-header">SVG ${g.id}</div>
                <div class="group-slots"></div>
            </div>
        `;
  });

  // Tạo các Item
  itemsData.forEach((item) => {
    const div = document.createElement("div");
    div.className = "item";
    div.dataset.id = item.id;
    div.dataset.groupId = item.group;
    div.style.background = item.color; // Demo bằng màu thay cho SVG
    div.innerHTML = `SVG ${item.id}`;

    pool.appendChild(div);
    setupDragEvents(div);
  });
}

function setupDragEvents(el) {
  let startX, startY, initialRect, placeholder;

  el.onpointerdown = (e) => {
    startX = e.clientX;
    startY = e.clientY;
    initialRect = el.getBoundingClientRect();

    // Tạo placeholder giữ chỗ
    placeholder = document.createElement("div");
    placeholder.className = "placeholder";
    el.parentNode.insertBefore(placeholder, el);

    // Thiết lập trạng thái kéo
    el.classList.add("dragging");
    el.style.left = initialRect.left + "px";
    el.style.top = initialRect.top + "px";

    document.onpointermove = (moveEvent) => {
      el.style.left = initialRect.left + (moveEvent.clientX - startX) + "px";
      el.style.top = initialRect.top + (moveEvent.clientY - startY) + "px";
    };

    document.onpointerup = (upEvent) => {
      document.onpointermove = null;
      document.onpointerup = null;

      // Kiểm tra xem có nằm trong group nào không
      const targetGroup = findTargetGroup(upEvent.clientX, upEvent.clientY);

      if (targetGroup && targetGroup.dataset.groupId === el.dataset.groupId) {
        // ĐÚNG
        showFeedback("Chính xác!", "correct");
        const slots = targetGroup.querySelector(".group-slots");

        // Xóa placeholder ngay lập tức để các item khác dồn lên
        placeholder.remove();
        animateToTarget(el, slots, true);
      } else {
        // SAI hoặc thả ra ngoài
        if (targetGroup) showFeedback("Sai rồi!", "wrong");

        animateToTarget(el, placeholder, false, () => {
          placeholder.remove();
          el.classList.remove("dragging");
          el.style.position = "";
        });
      }
    };
  };
}

function findTargetGroup(x, y) {
  const columns = document.querySelectorAll(".group-column");
  for (let col of columns) {
    const rect = col.getBoundingClientRect();
    if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
      return col;
    }
  }
  return null;
}

function animateToTarget(el, targetContainer, isSuccess, callback) {
  el.classList.add("animating");

  // Nếu thành công, tạm thời append vào đích để lấy vị trí cuối cùng
  let targetRect;
  if (isSuccess) {
    const tempNode = document.createElement("div");
    tempNode.className = "item"; // giống kích thước item
    targetContainer.appendChild(tempNode);
    targetRect = tempNode.getBoundingClientRect();
    tempNode.remove();
  } else {
    targetRect = targetContainer.getBoundingClientRect();
  }

  el.style.left = targetRect.left + "px";
  el.style.top = targetRect.top + "px";

  el.ontransitionend = () => {
    el.classList.remove("animating");
    if (isSuccess) {
      el.classList.remove("dragging");
      el.style.position = "";
      targetContainer.appendChild(el);
    }
    if (callback) callback();
    el.ontransitionend = null;
  };
}

function showFeedback(text, className) {
  const fb = document.getElementById("feedback");
  fb.innerText = text;
  fb.className = className;
  setTimeout(() => (fb.className = "hidden"), 1000);
}

init();
