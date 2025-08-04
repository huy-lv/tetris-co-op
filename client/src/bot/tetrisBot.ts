import { Tetromino, GameBoard, TetrominoType } from "../types";
import { BotMove, BotAnalysis, BotConfig, BOT_DIFFICULTIES } from "./types";
import {
  analyzeBoardState,
  simulateLineClear,
  copyGrid,
} from "./boardAnalysis";
import {
  isValidPosition,
  placeTetromino,
  rotateTetromino,
} from "../utils/gameUtils";
import { GAME_CONFIG } from "../constants";

export class TetrisBot {
  private config: BotConfig;

  constructor(difficulty: BotConfig["difficulty"] = "medium") {
    this.config = {
      enabled: false,
      difficulty,
      speed: this.getSpeedForDifficulty(difficulty),
      weights: BOT_DIFFICULTIES[difficulty],
    };
  }

  private getSpeedForDifficulty(difficulty: BotConfig["difficulty"]): number {
    const speeds = {
      easy: 1000, // 1 second
      medium: 800, // 0.8 seconds
      hard: 600, // 0.6 seconds
      expert: 400, // 0.4 seconds
    };
    return speeds[difficulty];
  }

  public setDifficulty(difficulty: BotConfig["difficulty"]): void {
    this.config.difficulty = difficulty;
    this.config.weights = BOT_DIFFICULTIES[difficulty];
    this.config.speed = this.getSpeedForDifficulty(difficulty);
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public getSpeed(): number {
    return this.config.speed;
  }

  public analyzePiece(gameBoard: GameBoard, piece: Tetromino): BotAnalysis {
    const startTime = Date.now();
    const moves: BotMove[] = [];
    let bestMove: BotMove = { x: 0, rotation: 0, score: -Infinity };

    // Try all possible rotations
    for (let rotation = 0; rotation < 4; rotation++) {
      const rotatedPiece = this.rotatePieceToOrientation(piece, rotation);

      // Try all possible x positions
      for (let x = 0; x < GAME_CONFIG.BOARD_WIDTH; x++) {
        const finalY = this.findDropPosition(gameBoard.grid, rotatedPiece, x);

        if (finalY !== -1) {
          const score = this.evaluateMove(
            gameBoard.grid,
            rotatedPiece,
            x,
            finalY
          );
          const move: BotMove = { x, rotation, score };
          moves.push(move);

          if (score > bestMove.score) {
            bestMove = move;
          }
        }
      }
    }

    const evaluationTime = Date.now() - startTime;

    return {
      bestMove,
      allMoves: moves,
      evaluationTime,
    };
  }

  private rotatePieceToOrientation(
    piece: Tetromino,
    targetRotation: number
  ): Tetromino {
    let rotatedPiece = { ...piece };
    const rotationsNeeded = (targetRotation - piece.rotation + 4) % 4;

    for (let i = 0; i < rotationsNeeded; i++) {
      rotatedPiece = rotateTetromino(rotatedPiece);
    }

    return rotatedPiece;
  }

  private findDropPosition(
    grid: (TetrominoType | null)[][],
    piece: Tetromino,
    x: number
  ): number {
    const testPiece = { ...piece, position: { x, y: 0 } };

    // Start from top and find the lowest valid position
    for (let y = 0; y < GAME_CONFIG.BOARD_HEIGHT; y++) {
      testPiece.position.y = y;

      if (!isValidPosition(grid, testPiece, testPiece.position)) {
        return y - 1;
      }
    }

    return GAME_CONFIG.BOARD_HEIGHT - 1;
  }

  private evaluateMove(
    grid: (TetrominoType | null)[][],
    piece: Tetromino,
    x: number,
    y: number
  ): number {
    // Create a copy of the grid and simulate placing the piece
    const testGrid = copyGrid(grid);
    const testPiece = { ...piece, position: { x, y } };

    // Place the piece
    const gridWithPiece = placeTetromino(testGrid, testPiece);

    // Simulate line clearing
    const gridAfterClear = simulateLineClear(gridWithPiece);

    // Calculate the number of lines cleared
    const linesCleared = this.countNewCompletedLines(gridWithPiece);

    // Analyze the board after clearing lines
    const newAnalysis = analyzeBoardState(gridAfterClear);

    // Give immediate bonus for clearing lines (square function rewards clearing multiple lines)
    const linesClearedScore =
      linesCleared * linesCleared * this.config.weights.lines;

    // Height factors
    const heightScore = this.config.weights.height * newAnalysis.maxHeight;
    const aggregateHeightScore =
      this.config.weights.aggregateHeight * newAnalysis.totalHeight;

    // Hole factors - weighted heavily because holes are very bad
    const holesScore = this.config.weights.holes * newAnalysis.holes;

    // Bumpiness - smooth surface is better
    const bumpinessScore =
      this.config.weights.bumpiness * newAnalysis.bumpiness;

    // Additional factors
    const wellDepthsScore = (newAnalysis.wellDepths || 0) * -0.5; // Penalize wells
    const holeDepthsScore = (newAnalysis.holeDepths || 0) * -0.8; // Heavily penalize deep holes
    const adjacentHolesScore = (newAnalysis.adjacentHoles || 0) * -1.0; // Very heavily penalize adjacent holes

    // Transitions scores - fewer transitions means a cleaner board
    const rowTransitionsScore = (newAnalysis.rowTransitions || 0) * -0.2;
    const colTransitionsScore = (newAnalysis.colTransitions || 0) * -0.2;

    // Adjust scores based on difficulty
    let difficultyMultiplier = 1.0;
    if (this.config.difficulty === "easy") {
      difficultyMultiplier = 0.7; // Easy mode makes more mistakes
    } else if (this.config.difficulty === "expert") {
      difficultyMultiplier = 1.3; // Expert mode plays very optimally
    }

    // Combine all factors into final score
    const score =
      (linesClearedScore +
        heightScore +
        aggregateHeightScore +
        holesScore +
        bumpinessScore +
        wellDepthsScore +
        holeDepthsScore +
        adjacentHolesScore +
        rowTransitionsScore +
        colTransitionsScore) *
      difficultyMultiplier;

    // If placing the piece would cause game over, return very negative score
    if (newAnalysis.maxHeight >= GAME_CONFIG.BOARD_HEIGHT) {
      return -Infinity;
    }

    return score;
  }

  private countNewCompletedLines(grid: (TetrominoType | null)[][]): number {
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
  }

  public calculateOptimalPath(
    currentPiece: Tetromino,
    targetMove: BotMove
  ): Array<"left" | "right" | "rotate" | "drop"> {
    const commands: Array<"left" | "right" | "rotate" | "drop"> = [];
    let currentX = currentPiece.position.x;
    let currentRotation = currentPiece.rotation;

    // Rotate to target rotation
    const rotationsNeeded = (targetMove.rotation - currentRotation + 4) % 4;
    for (let i = 0; i < rotationsNeeded; i++) {
      commands.push("rotate");
    }

    // Move to target x position
    const xDifference = targetMove.x - currentX;
    if (xDifference > 0) {
      for (let i = 0; i < xDifference; i++) {
        commands.push("right");
      }
    } else if (xDifference < 0) {
      for (let i = 0; i < Math.abs(xDifference); i++) {
        commands.push("left");
      }
    }

    // Drop the piece
    commands.push("drop");

    return commands;
  }

  public getDifficulty(): BotConfig["difficulty"] {
    return this.config.difficulty;
  }

  public getConfig(): BotConfig {
    return { ...this.config };
  }
}
