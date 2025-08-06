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
  isShaking?: boolean;
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

// Multiplayer event types
export interface GameWinnerData {
  winner: Player;
  finalScores: Player[];
  totalPlayers: number;
}

export interface GameEndedData {
  winner: Player;
  finalScores: Player[];
  totalPlayers: number;
}

export interface RoomJoinedData {
  roomCode: string;
  players: Player[];
  isHost: boolean;
}

export interface PlayerJoinedData {
  player: Player;
  players: Player[];
  roomCode: string;
}

export interface PlayerLeftData {
  playerName: string;
  players: Player[];
  roomCode: string;
}

export interface GameStartedData {
  players: Player[];
  startTime: number;
  startedBy?: string;
  restartedBy?: string;
  roomCode?: string;
}

export interface PlayerGameOverData {
  playerName: string;
  finalScore: number;
  playersRemaining: number;
  totalPlayers: number;
  allPlayersData: Player[];
}

export interface MultiplayerGameOverState {
  isGameOver: boolean;
  playerName?: string;
  finalScore?: number;
  playersRemaining?: number;
  totalPlayers?: number;
  allPlayersData?: Player[];
}

export interface GameWinnerState {
  hasWinner: boolean;
  winner: Player | null;
  finalScores: Player[];
  totalPlayers: number;
}

// Game state update for multiplayer sync
export interface GameStateUpdate {
  grid?: (TetrominoType | null)[][];
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
  gameState?: GameState;
}
