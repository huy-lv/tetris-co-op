import { GAME_STATES, TETROMINO_SHAPES } from "./constants";

export type TetrominoType = keyof typeof TETROMINO_SHAPES;

export type GameState = (typeof GAME_STATES)[keyof typeof GAME_STATES];

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  type: TetrominoType;
  position: Position;
  rotation: number;
  shape: readonly (readonly number[])[];
}

export interface GameBoard {
  grid: (TetrominoType | null)[][];
  activePiece: Tetromino | null;
  nextPiece: TetrominoType | null;
  ghostPiece: Tetromino | null;
  holdPiece: TetrominoType | null;
  canHold: boolean;
  isPaused: boolean;
  clearingRows: number[];
  dropPosition?: { x: number; y: number };
  score: number;
  lines: number;
  level: number;
  gameState: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
}

export interface Room {
  id: string;
  players: Player[];
  isStarted: boolean;
  maxPlayers: number;
}
