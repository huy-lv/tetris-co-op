export interface Player {
  name: string;
  id: string;
  score: number;
  isReady?: boolean;
}

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
}

export interface PlayerGameOverData {
  playerName: string;
  finalScore: number;
  playersRemaining: number;
  totalPlayers: number;
  allPlayersData: Player[];
}

export interface PlayerStateUpdatedData {
  playerId: string;
  playerName: string;
  gameState: {
    score: number;
    lines: number;
    level: number;
    isGameOver: boolean;
  };
  grid: (string | null)[][];
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
