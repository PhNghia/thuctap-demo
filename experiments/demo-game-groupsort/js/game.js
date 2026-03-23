const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE, // Tự động mở rộng toàn bộ viewport
    parent: "game-container",
    width: "100%",
    height: "100%",
  },
  backgroundColor: "#34495e",
  scene: { preload: preload, create: create },
};

const game = new Phaser.Game(config);

function preload() {
  // Load config và assets tương tự như trên
  window.GAME_CONFIG.groups.forEach((g) =>
    this.load.image(g.image, `assets/${g.image}.svg`),
  );
  window.GAME_CONFIG.items.forEach((i) =>
    this.load.image(i.image, `assets/${i.image}.svg`),
  );
}

function create() {
  const { width, height } = this.scale;
  const SIDEBAR_WIDTH = 250;
  const ITEM_SIZE = 80;
  const PADDING = 20;

  // --- 1. LEFT SIDEBAR (ITEMS) ---
  const sidebarBg = this.add
    .rectangle(0, 0, SIDEBAR_WIDTH, height, 0x2c3e50)
    .setOrigin(0);
  const itemContainer = this.add.container(0, 0);

  // Tạo Mask cho Sidebar để cuộn dọc
  const sidebarMask = this.add
    .graphics()
    .fillRect(0, 0, SIDEBAR_WIDTH, height)
    .createGeometryMask();
  itemContainer.setMask(sidebarMask);

  window.GAME_CONFIG.items.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);

    const x = PADDING + col * (ITEM_SIZE + PADDING) + ITEM_SIZE / 2;
    const y = PADDING + row * (ITEM_SIZE + PADDING) + ITEM_SIZE / 2;

    const img = this.add
      .image(x, y, item.image)
      .setDisplaySize(ITEM_SIZE, ITEM_SIZE)
      .setInteractive({ draggable: true });
    img.setData({
      correctGroupId: item.groupId,
      homeX: x,
      homeY: y,
      container: itemContainer,
    });

    itemContainer.add(img);
    this.input.setDraggable(img);
  });

  // Logic cuộn Sidebar (Wheel input)
  this.input.on("wheel", (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
    if (pointer.x < SIDEBAR_WIDTH) {
      itemContainer.y -= deltaY;
      itemContainer.y = Phaser.Math.Clamp(itemContainer.y, -500, 0); // Giới hạn cuộn
    }
  });

  // --- 2. RIGHT AREA (GROUPS) ---
  const gameAreaX = SIDEBAR_WIDTH + PADDING;
  const gameAreaWidth = width - gameAreaX - PADDING;
  const groupScrollContainer = this.add.container(gameAreaX, 0);

  // Tính toán Space-around cho các cột Group
  const groupCount = window.GAME_CONFIG.groups.length;
  const columnWidth = 200;
  const totalContentWidth = groupCount * (columnWidth + PADDING);

  window.GAME_CONFIG.groups.forEach((group, index) => {
    const x = index * (columnWidth + PADDING) + columnWidth / 2;

    // Header Group (Hình đại diện)
    this.add.image(gameAreaX + x, 60, group.image).setDisplaySize(80, 80);

    // Slot chứa (Background cột) - Màu giống sidebar
    const columnBg = this.add
      .rectangle(
        gameAreaX + x,
        height / 2 + 50,
        columnWidth,
        height - 150,
        0x2c3e50,
        0.8,
      )
      .setOrigin(0.5);

    // Vùng Drop Zone
    const zone = this.add
      .zone(gameAreaX + x, height / 2 + 50, columnWidth, height - 150)
      .setRectangleDropZone(columnWidth, height - 150);
    zone.setData("groupId", group.id);
  });

  // --- 3. LOGIC KÉO THẢ NÂNG CAO ---
  this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    // Khi kéo, vật thể thoát khỏi container để không bị mask che khuất
    if (gameObject.parentContainer) {
      const worldPos = gameObject.getWorldTransformMatrix();
      gameObject.parentContainer.remove(gameObject);
      gameObject.x = worldPos.tx;
      gameObject.y = worldPos.ty;
    }
    gameObject.x = dragX;
    gameObject.y = dragY;
    gameObject.setDepth(1000);
  });

  this.input.on("drop", (pointer, gameObject, dropZone) => {
    const isCorrect =
      gameObject.getData("correctGroupId") === dropZone.getData("groupId");

    if (isCorrect) {
      // Hiệu ứng dính vào cột
      gameObject.x = dropZone.x;
      gameObject.y =
        dropZone.y - dropZone.height / 2 + 50 + Math.random() * 200;
      gameObject.disableInteractive();
      showFeedback(this, "ĐÚNG", 0x2ecc71);
    } else {
      showFeedback(this, "SAI", 0xe74c3c);
      returnToSidebar(this, gameObject);
    }
  });

  this.input.on("dragend", (pointer, gameObject, dropped) => {
    if (!dropped) returnToSidebar(this, gameObject);
  });
}

function returnToSidebar(scene, gameObject) {
  const homeX = gameObject.getData("homeX");
  const homeY = gameObject.getData("homeY");
  const container = gameObject.getData("container");

  scene.tweens.add({
    targets: gameObject,
    x: homeX,
    y: homeY,
    duration: 400,
    ease: "Back.easeOut",
    onComplete: () => {
      container.add(gameObject);
      gameObject.x = homeX;
      gameObject.y = homeY;
    },
  });
}

function showFeedback(scene, text, color) {
  const txt = scene.add
    .text(scene.scale.width / 2, scene.scale.height / 2, text, {
      fontSize: "80px",
      fontStyle: "bold",
      fill: "#" + color.toString(16),
    })
    .setOrigin(0.5)
    .setDepth(2000);

  scene.tweens.add({
    targets: txt,
    y: "-=100",
    alpha: 0,
    duration: 800,
    onComplete: () => txt.destroy(),
  });
}
