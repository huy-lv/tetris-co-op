import { GAME_CONFIG } from "../constants";
import { BoardAnalysis } from "./types";
import { TetrominoType } from "../types";

export const analyzeBoardState = (
  grid: (TetrominoType | null)[][]
): BoardAnalysis => {
  const heights = getColumnHeights(grid);
  const holes = countHoles(grid, heights);
  const bumpiness = calculateBumpiness(heights);
  const completedLines = countCompletedLines(grid);
  const totalHeight = heights.reduce((sum, h) => sum + h, 0);
  const maxHeight = Math.max(...heights);
  const wellDepths = calculateWellDepths(heights);
  const holeDepths = calculateHoleDepths(grid, heights);
  const adjacentHoles = countAdjacentHoles(grid, heights);
  const rowTransitions = countRowTransitions(grid);
  const colTransitions = countColumnTransitions(grid);

  return {
    heights,
    holes,
    bumpiness,
    completedLines,
    totalHeight,
    maxHeight,
    wellDepths,
    holeDepths,
    adjacentHoles,
    rowTransitions,
    colTransitions,
  };
};

const getColumnHeights = (grid: (TetrominoType | null)[][]): number[] => {
  const heights: number[] = [];

  for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
    let height = 0;
    for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
      if (grid[y][x] !== null) {
        height = GAME_CONFIG.BOARD_HEIGHT - y;
        break;
      }
    }
    heights.push(height);
  }

  return heights;
};

const countHoles = (
  grid: (TetrominoType | null)[][],
  heights: number[]
): number => {
  let holes = 0;

  for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
    const startY = GAME_CONFIG.BOARD_HEIGHT - heights[x];
    for (let y = startY; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
      if (grid[y][x] === null) {
        holes++;
      }
    }
  }

  return holes;
};

const calculateBumpiness = (heights: number[]): number => {
  let bumpiness = 0;

  for (let i = 0; i < heights.length - 1; i++) {
    bumpiness += Math.abs(heights[i] - heights[i + 1]);
  }

  return bumpiness;
};

const countCompletedLines = (grid: (TetrominoType | null)[][]): number => {
  let completedLines = 0;

  for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
    let isComplete = true;
    for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
      if (grid[y][x] === null) {
        isComplete = false;
        break;
      }
    }
    if (isComplete) {
      completedLines++;
    }
  }

  return completedLines;
};

export const simulateLineClear = (
  grid: (TetrominoType | null)[][]
): (TetrominoType | null)[][] => {
  const newGrid = grid.map((row) => [...row]);
  const linesToClear: number[] = [];

  // Find completed lines
  for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
    let isComplete = true;
    for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
      if (newGrid[y][x] === null) {
        isComplete = false;
        break;
      }
    }
    if (isComplete) {
      linesToClear.push(y);
    }
  }

  // Remove completed lines and add empty lines at top
  linesToClear.forEach(() => {
    for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT - 1; y++) {
      newGrid[y] = [...newGrid[y + 1]];
    }
    newGrid[GAME_CONFIG.BOARD_HEIGHT - 1] = new Array(
      GAME_CONFIG.BOARD_WIDTH
    ).fill(null);
  });

  return newGrid;
};

export const copyGrid = (
  grid: (TetrominoType | null)[][]
): (TetrominoType | null)[][] => {
  return grid.map((row) => [...row]);
};

// Calculate deep wells - columns that are much lower than their neighbors
const calculateWellDepths = (heights: number[]): number => {
  let wellSum = 0;

  // Check each column
  for (let x = 0; x < heights.length; x++) {
    const leftHeight = x > 0 ? heights[x - 1] : Infinity;
    const rightHeight = x < heights.length - 1 ? heights[x + 1] : Infinity;
    const currentHeight = heights[x];

    // If both neighbors are at least 2 blocks higher, it's a well
    if (leftHeight > currentHeight && rightHeight > currentHeight) {
      const depthLeft = Math.min(leftHeight - currentHeight, 3);
      const depthRight = Math.min(rightHeight - currentHeight, 3);
      const wellDepth = Math.min(depthLeft, depthRight);

      // Penalize deeper wells more heavily using n(n+1)/2 formula
      wellSum += (wellDepth * (wellDepth + 1)) / 2;
    }
  }

  return wellSum;
};

// Calculate how deep the holes are
const calculateHoleDepths = (
  grid: (TetrominoType | null)[][],
  heights: number[]
): number => {
  let depthSum = 0;

  for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
    let depth = 0;
    let holeFound = false;

    for (
      let y = GAME_CONFIG.BOARD_HEIGHT - heights[x];
      y < GAME_CONFIG.BOARD_HEIGHT;
      y++
    ) {
      if (grid[y][x] === null) {
        holeFound = true;
        depth += 1;
      } else if (holeFound) {
        // Add an increasing penalty for deeper holes
        depthSum += depth * depth;
        holeFound = false;
        depth = 0;
      }
    }

    // Handle hole at the bottom
    if (holeFound) {
      depthSum += depth * depth;
    }
  }

  return depthSum;
};

// Count adjacent holes (which are harder to clear)
const countAdjacentHoles = (
  grid: (TetrominoType | null)[][],
  heights: number[]
): number => {
  let adjacentCount = 0;
  const holePositions: { x: number; y: number }[] = [];

  // Find all holes
  for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
    for (
      let y = GAME_CONFIG.BOARD_HEIGHT - heights[x];
      y < GAME_CONFIG.BOARD_HEIGHT;
      y++
    ) {
      if (grid[y][x] === null) {
        holePositions.push({ x, y });
      }
    }
  }

  // Count adjacent holes
  for (let i = 0; i < holePositions.length; i++) {
    for (let j = i + 1; j < holePositions.length; j++) {
      const hole1 = holePositions[i];
      const hole2 = holePositions[j];

      // Check if holes are adjacent horizontally or vertically
      if (
        (Math.abs(hole1.x - hole2.x) === 1 && hole1.y === hole2.y) ||
        (Math.abs(hole1.y - hole2.y) === 1 && hole1.x === hole2.x)
      ) {
        adjacentCount += 1;
      }
    }
  }

  return adjacentCount;
};

// Count row transitions (empty cell next to filled cell or vice versa)
const countRowTransitions = (grid: (TetrominoType | null)[][]): number => {
  let transitions = 0;

  for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
    let lastCell: boolean = true; // Assume border is filled

    for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
      const currentCell = grid[y][x] !== null;

      if (currentCell !== lastCell) {
        transitions += 1;
      }

      lastCell = currentCell;
    }

    // Count transition to right border
    if (lastCell === false) {
      transitions += 1;
    }
  }

  return transitions;
};

// Count column transitions
const countColumnTransitions = (grid: (TetrominoType | null)[][]): number => {
  let transitions = 0;

  for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
    let lastCell: boolean = true; // Assume border is filled

    for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
      const currentCell = grid[y][x] !== null;

      if (currentCell !== lastCell) {
        transitions += 1;
      }

      lastCell = currentCell;
    }

    // Count transition to bottom border
    if (lastCell === false) {
      transitions += 1;
    }
  }

  return transitions;
};
