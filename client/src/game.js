import Phaser from "phaser";
import { config } from "./config/gameConfig";
import { createNameInput } from "./ui/PlayerSetup";
import { socket } from "./services/socket";

function startGame(playerData) {
  const game = new Phaser.Game(config);
  socket.emit("playerData", playerData);
}

// Start the player setup flow
createNameInput(startGame);