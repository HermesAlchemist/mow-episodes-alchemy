import Phaser from "phaser";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

let playerName = null;

function startGame() {
  const game = new Phaser.Game(config);
}

// Add sprite options at the top of your file
const SPRITE_OPTIONS = [
  { id: "player1", label: "Character 1" },
  { id: "player2", label: "Character 2" },
];

function createNameInput() {
  const nameForm = document.createElement("div");
  nameForm.style.position = "absolute";
  nameForm.style.top = "50%";
  nameForm.style.left = "50%";
  nameForm.style.transform = "translate(-50%, -50%)";
  nameForm.style.textAlign = "center";
  nameForm.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  nameForm.style.padding = "20px";
  nameForm.style.borderRadius = "10px";

  // Name input
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter your name";
  input.style.padding = "10px";
  input.style.marginBottom = "20px";
  input.style.display = "block";
  input.style.width = "200px";

  // Sprite selection
  const spriteDiv = document.createElement("div");
  spriteDiv.style.marginBottom = "20px";

  SPRITE_OPTIONS.forEach((sprite, index) => {
    const container = document.createElement("div");
    container.style.marginBottom = "10px";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.gap = "10px";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "spriteChoice";
    radio.value = sprite.id;
    radio.id = sprite.id;
    radio.checked = index === 0; // First option selected by default

    const label = document.createElement("label");
    label.htmlFor = sprite.id;
    label.textContent = sprite.label;
    label.style.color = "white";

    // Create a container for the sprite preview
    const previewContainer = document.createElement("div");
    previewContainer.style.width = "48px";
    previewContainer.style.height = "48px";
    previewContainer.style.overflow = "hidden";
    previewContainer.style.position = "relative";

    const preview = document.createElement("img");
    preview.src = `assets/${sprite.id}.png`;
    preview.style.position = "absolute";
    preview.style.left = "0";
    preview.style.top = "0";
    preview.style.width = "288px"; // Full spritesheet width (48 * 6)
    preview.style.height = "384px"; // Full spritesheet height
    preview.style.imageRendering = "pixelated";
    preview.style.clipPath = "inset(0 240px 336px 0)"; // Clip to show only first frame
    preview.style.transform = "scale(1)"; // Adjust if needed

    previewContainer.appendChild(preview);

    container.appendChild(radio);
    container.appendChild(previewContainer);
    container.appendChild(label);
    spriteDiv.appendChild(container);
  });

  const button = document.createElement("button");
  button.textContent = "Join Game";
  button.style.padding = "10px 20px";

  nameForm.appendChild(input);
  nameForm.appendChild(spriteDiv);
  nameForm.appendChild(button);
  document.body.appendChild(nameForm);

  button.onclick = () => {
    const selectedSprite = document.querySelector(
      'input[name="spriteChoice"]:checked'
    ).value;
    playerName = input.value.trim() || "Player";
    document.body.removeChild(nameForm);
    startGame();
    // Emit both name and sprite choice
    socket.emit("playerData", { name: playerName, spriteId: selectedSprite });
  };
}

createNameInput();

function preload() {
  // Load both sprite sheets
  this.load.spritesheet("player1", "assets/player1.png", {
    frameWidth: 48,
    frameHeight: 48,
  });
  this.load.spritesheet("player2", "assets/player2.png", {
    frameWidth: 48,
    frameHeight: 48,
  });
  this.load.spritesheet("slime", "assets/slime.png", {
    frameWidth: 32,
    frameHeight: 32,
  });
}

function create() {
  this.players = new Map();
  this.cursors = this.input.keyboard.createCursorKeys();

  // Create animations for both player sprites
  ["player1", "player2"].forEach((spriteId) => {
    // Create animations for this sprite
    this.anims.create({
      key: `${spriteId}_idleDown`,
      frames: this.anims.generateFrameNumbers(spriteId, { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${spriteId}_idleRight`,
      frames: this.anims.generateFrameNumbers(spriteId, { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${spriteId}_idleUp`,
      frames: this.anims.generateFrameNumbers(spriteId, { start: 12, end: 17 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${spriteId}_walkDown`,
      frames: this.anims.generateFrameNumbers(spriteId, { start: 18, end: 23 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${spriteId}_walkRight`,
      frames: this.anims.generateFrameNumbers(spriteId, { start: 24, end: 29 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${spriteId}_walkUp`,
      frames: this.anims.generateFrameNumbers(spriteId, { start: 30, end: 35 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${spriteId}_attackDown`,
      frames: this.anims.generateFrameNumbers(spriteId, { start: 36, end: 39 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${spriteId}_attackRight`,
      frames: this.anims.generateFrameNumbers(spriteId, { start: 42, end: 45 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${spriteId}_attackUp`,
      frames: this.anims.generateFrameNumbers(spriteId, { start: 48, end: 51 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: `${spriteId}_die`,
      frames: this.anims.generateFrameNumbers(spriteId, { start: 54, end: 56 }),
      frameRate: 10,
      repeat: 0,
    });
  });

  // Create slime animations
  this.anims.create({
    key: "slimeIdleDown",
    frames: this.anims.generateFrameNumbers("slime", { start: 0, end: 3 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeIdleRight",
    frames: this.anims.generateFrameNumbers("slime", { start: 7, end: 10 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeIdleUp",
    frames: this.anims.generateFrameNumbers("slime", { start: 14, end: 17 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeHopDown",
    frames: this.anims.generateFrameNumbers("slime", { start: 21, end: 26 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeHopRight",
    frames: this.anims.generateFrameNumbers("slime", { start: 28, end: 33 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeHopUp",
    frames: this.anims.generateFrameNumbers("slime", { start: 35, end: 40 }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeJumpDown",
    frames: this.anims.generateFrameNumbers("slime", { start: 42, end: 48 }),
    frameRate: 15,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeJumpRight",
    frames: this.anims.generateFrameNumbers("slime", { start: 49, end: 55 }),
    frameRate: 15,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeJumpUp",
    frames: this.anims.generateFrameNumbers("slime", { start: 56, end: 62 }),
    frameRate: 15,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeConfuseDown",
    frames: this.anims.generateFrameNumbers("slime", { start: 63, end: 65 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeConfuseRight",
    frames: this.anims.generateFrameNumbers("slime", { start: 66, end: 68 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeConfuseUp",
    frames: this.anims.generateFrameNumbers("slime", { start: 69, end: 71 }),
    frameRate: 5,
    repeat: -1,
  });

  this.anims.create({
    key: "slimeDie",
    frames: this.anims.generateFrameNumbers("slime", { start: 72, end: 76 }),
    frameRate: 10,
    repeat: 0,
  });

  this.slimes = this.physics.add.group();

  for (let i = 0; i < 10; i++) {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 600);
    const slime = this.slimes.create(x, y, "slime");
    slime.play("slimeIdleDown");
  }

  socket.on("gameState", (gameState) => {
    // Update or create players
    gameState.players.forEach((playerData) => {
      let player = this.players.get(playerData.id);

      if (!player) {
        player = this.physics.add.sprite(
          playerData.x,
          playerData.y,
          playerData.spriteId
        );
        player.setScale(1.5);

        const displayName = playerData.name || "Player";
        const playerText = this.add.text(
          playerData.x,
          playerData.y - 40,
          displayName,
          {
            fontSize: "16px",
            fill: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 4, y: 4 },
          }
        );
        playerText.setOrigin(0.5);
        player.playerText = playerText;

        this.players.set(playerData.id, player);
      }

      // Update player position and animation
      player.x = playerData.x;
      player.y = playerData.y;
      player.playerText.x = playerData.x;
      player.playerText.y = playerData.y - 40;

      if (playerData.animation) {
        player.anims.play(
          `${playerData.spriteId}_${playerData.animation}`,
          true
        );
        player.flipX = playerData.flipX;
      }
    });

    // Remove disconnected players
    const currentPlayerIds = gameState.players.map((p) => p.id);
    Array.from(this.players.keys()).forEach((playerId) => {
      if (!currentPlayerIds.includes(playerId)) {
        const player = this.players.get(playerId);
        player.playerText.destroy(); // Destroy the text object
        player.destroy();
        this.players.delete(playerId);
      }
    });

    // Update slimes
    gameState.slimes.forEach((slimeData, index) => {
      let slime = this.slimes.getChildren()[index];
      if (!slime) {
        slime = this.slimes.create(slimeData.x, slimeData.y, "slime");
      }
      slime.x = slimeData.x;
      slime.y = slimeData.y;
      if (slimeData.animation) {
        slime.play(slimeData.animation, true);
        slime.flipX = slimeData.flipX;
      }
    });
  });
}

function update() {
  const inputState = {
    left: this.cursors.left.isDown,
    right: this.cursors.right.isDown,
    up: this.cursors.up.isDown,
    down: this.cursors.down.isDown,
  };

  socket.emit("playerInput", inputState);
}
