export const GAME_CONFIG = {
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 20,
  BLOCK_SIZE: 30,
  INITIAL_SPEED: 800,
  SPEED_INCREASE: 40,
  LINES_PER_LEVEL: 10,
} as const;

export const TEST_MODE = true; // Set to true to always spawn O pieces for testing

export const CONTROLS = {
  MOVE_LEFT: "a",
  MOVE_RIGHT: "d",
  MOVE_DOWN: "s",
  MOVE_UP: "w",
  ROTATE: "n",
  HARD_DROP: "j",
  HOLD: "b",
} as const;

export const TETROMINO_SHAPES = {
  I: [[[1, 1, 1, 1]], [[1], [1], [1], [1]]],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    [
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
    ],
    [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    [
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
    ],
    [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    [
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
  ],
  GARBAGE: [[[1]]], // Simple 1x1 shape for garbage blocks
} as const;

export const TETROMINO_COLORS = {
  I: "#00f0f0",
  O: "#f0f000",
  T: "#a000f0",
  S: "#00f000",
  Z: "#f00000",
  J: "#0000f0",
  L: "#f0a000",
  GARBAGE: "#808080", // Gray color for garbage blocks
} as const;

export const GAME_STATES = {
  WELCOME: "welcome",
  WAITING: "waiting",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "game_over",
} as const;
