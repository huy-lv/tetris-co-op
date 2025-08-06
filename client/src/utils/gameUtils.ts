import { TetrominoType, Position, Tetromino } from "../types";
import {
  TETROMINO_SHAPES,
  TETROMINO_COLORS,
  GAME_CONFIG,
  TEST_MODE,
} from "../constants";

export const createEmptyGrid = (): (TetrominoType | null)[][] => {
  return Array(GAME_CONFIG.BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(GAME_CONFIG.BOARD_WIDTH).fill(null));
};

export const getRandomTetromino = (): TetrominoType => {
  if (TEST_MODE) return "O";
  const types = Object.keys(TETROMINO_SHAPES) as TetrominoType[];
  return types[Math.floor(Math.random() * types.length)];
};

export const createTetromino = (
  type: TetrominoType,
  position: Position
): Tetromino => ({
  type,
  position,
  rotation: 0,
  shape: TETROMINO_SHAPES[type][0],
});

export const rotateTetromino = (tetromino: Tetromino): Tetromino => {
  const shapes = TETROMINO_SHAPES[tetromino.type];
  const nextRotation = (tetromino.rotation + 1) % shapes.length;

  return {
    ...tetromino,
    rotation: nextRotation,
    shape: shapes[nextRotation],
  };
};

export const isValidPosition = (
  grid: (TetrominoType | null)[][],
  tetromino: Tetromino,
  newPosition: Position
): boolean => {
  const { shape } = tetromino;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      const blockExists = shape[y][x] === 1;

      if (blockExists) {
        const newX = newPosition.x + x;
        const newY = newPosition.y + y;

        // Check boundaries
        const outOfBounds =
          newX < 0 ||
          newX >= GAME_CONFIG.BOARD_WIDTH ||
          newY >= GAME_CONFIG.BOARD_HEIGHT;

        if (outOfBounds) return false;

        // Check collision with existing blocks (ignore if above board)
        const collisionExists = newY >= 0 && grid[newY][newX] !== null;
        if (collisionExists) return false;
      }
    }
  }

  return true;
};

export const placeTetromino = (
  grid: (TetrominoType | null)[][],
  tetromino: Tetromino
): (TetrominoType | null)[][] => {
  const newGrid = grid.map((row) => [...row]);
  const { shape, position, type } = tetromino;

  shape.forEach((row, y) => {
    row.forEach((cell, x) => {
      const cellExists = cell === 1;
      const boardY = position.y + y;
      const boardX = position.x + x;

      if (cellExists && boardY >= 0) {
        newGrid[boardY][boardX] = type;
      }
    });
  });

  return newGrid;
};

export const findLinesToClear = (
  grid: (TetrominoType | null)[][]
): number[] => {
  const linesToClear: number[] = [];

  // Find complete lines
  grid.forEach((row, index) => {
    const isComplete = row.every((cell) => cell !== null);
    if (isComplete) {
      linesToClear.push(index);
    }
  });

  return linesToClear;
};

export const clearLines = (
  grid: (TetrominoType | null)[][]
): {
  newGrid: (TetrominoType | null)[][];
  linesCleared: number;
} => {
  const linesToClear = findLinesToClear(grid);

  // Remove complete lines and add empty lines at top
  let newGrid = grid.filter((_, index) => !linesToClear.includes(index));
  const emptyLines = Array(linesToClear.length)
    .fill(null)
    .map(() => Array(GAME_CONFIG.BOARD_WIDTH).fill(null));

  newGrid = [...emptyLines, ...newGrid];

  return {
    newGrid,
    linesCleared: linesToClear.length,
  };
};

export const calculateScore = (linesCleared: number, level: number): number => {
  const baseScores = [0, 40, 100, 300, 1200];
  return baseScores[linesCleared] * (level + 1);
};

export const getTetrominoColor = (
  type: TetrominoType,
  isGhost: boolean = false
): string => {
  if (isGhost) {
    return "rgba(220, 220, 220, 0.3)"; // Light gray semi-transparent for ghost pieces
  }
  return TETROMINO_COLORS[type];
};

// Add garbage rows to the bottom of the grid
export const addGarbageRows = (
  grid: (TetrominoType | null)[][],
  numRows: number
): (TetrominoType | null)[][] => {
  const newGrid = [...grid];

  // Remove rows from top to make space for garbage rows
  for (let i = 0; i < numRows; i++) {
    newGrid.shift();
  }

  // Create garbage rows
  for (let i = 0; i < numRows; i++) {
    const garbageRow: (TetrominoType | null)[] = Array(
      GAME_CONFIG.BOARD_WIDTH
    ).fill("I" as TetrominoType); // Use "I" type for garbage blocks
    // Add one random empty space in each garbage row
    const emptyIndex = Math.floor(Math.random() * GAME_CONFIG.BOARD_WIDTH);
    garbageRow[emptyIndex] = null;

    // Add garbage row at bottom
    newGrid.push(garbageRow);
  }

  return newGrid;
};
