const { GAME_CONFIG } = require("./constants");

/**
 * Generate a random room code
 * @returns {string} 6-character room code
 */
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < GAME_CONFIG.ROOM_CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate room code format
 * @param {string} roomCode
 * @returns {boolean}
 */
function isValidRoomCode(roomCode) {
  if (!roomCode || typeof roomCode !== "string") return false;
  return /^[A-Z0-9]{6}$/.test(roomCode.toUpperCase());
}

/**
 * Validate player data
 * @param {object} playerData
 * @returns {boolean}
 */
function isValidPlayerData(playerData) {
  return (
    playerData &&
    typeof playerData.name === "string" &&
    playerData.name.trim().length > 0 &&
    playerData.name.trim().length <= 20
  );
}

/**
 * Validate game state data
 * @param {object} gameState
 * @returns {boolean}
 */
function isValidGameState(gameState) {
  return (
    gameState &&
    typeof gameState.score === "number" &&
    typeof gameState.lines === "number" &&
    typeof gameState.level === "number" &&
    typeof gameState.isGameOver === "boolean" &&
    Array.isArray(gameState.grid) &&
    gameState.grid.length === GAME_CONFIG.BOARD_HEIGHT
  );
}

/**
 * Clean player name (remove special characters, trim)
 * @param {string} name
 * @returns {string}
 */
function cleanPlayerName(name) {
  if (!name || typeof name !== "string") return "Player";

  return (
    name
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special chars except dash and space
      .substring(0, 20) || // Max 20 characters
    "Player"
  );
}

/**
 * Calculate game statistics
 * @param {Array} players
 * @returns {object}
 */
function calculateGameStats(players) {
  const stats = {
    totalPlayers: players.length,
    activePlayers: 0,
    gameOverPlayers: 0,
    highestScore: 0,
    highestLines: 0,
    averageScore: 0,
  };

  let totalScore = 0;

  players.forEach((player) => {
    if (player.gameState) {
      if (!player.gameState.isGameOver) {
        stats.activePlayers++;
      } else {
        stats.gameOverPlayers++;
      }

      if (player.gameState.score > stats.highestScore) {
        stats.highestScore = player.gameState.score;
      }

      if (player.gameState.lines > stats.highestLines) {
        stats.highestLines = player.gameState.lines;
      }

      totalScore += player.gameState.score;
    }
  });

  stats.averageScore =
    players.length > 0 ? Math.round(totalScore / players.length) : 0;

  return stats;
}

/**
 * Create empty Tetris grid
 * @returns {Array}
 */
function createEmptyGrid() {
  return Array(GAME_CONFIG.BOARD_HEIGHT)
    .fill()
    .map(() => Array(GAME_CONFIG.BOARD_WIDTH).fill(null));
}

/**
 * Log with timestamp
 * @param {string} message
 * @param {string} level
 */
function log(message, level = "INFO") {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`);
}

module.exports = {
  generateRoomCode,
  isValidRoomCode,
  isValidPlayerData,
  isValidGameState,
  cleanPlayerName,
  calculateGameStats,
  createEmptyGrid,
  log,
};
