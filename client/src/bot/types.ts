export interface BotMove {
  x: number;
  rotation: number;
  score: number;
}

export interface BotAnalysis {
  bestMove: BotMove;
  allMoves: BotMove[];
  evaluationTime: number;
}

export interface BoardAnalysis {
  heights: number[];
  holes: number;
  bumpiness: number;
  completedLines: number;
  totalHeight: number;
  maxHeight: number;
  wellDepths?: number;
  holeDepths?: number;
  adjacentHoles?: number;
  rowTransitions?: number;
  colTransitions?: number;
}

export interface BotConfig {
  enabled: boolean;
  difficulty: "easy" | "medium" | "hard" | "expert";
  speed: number; // milliseconds between moves
  weights: {
    height: number;
    lines: number;
    holes: number;
    bumpiness: number;
    aggregateHeight: number;
  };
}

export const BOT_DIFFICULTIES: Record<string, BotConfig["weights"]> = {
  easy: {
    height: -0.5, // Increase penalty for height
    lines: 1.0, // More emphasis on clearing lines
    holes: -0.7, // More penalty for holes
    bumpiness: -0.2, // Keep same penalty for bumpiness
    aggregateHeight: -0.1, // Keep same penalty for total height
  },
  medium: {
    height: -0.7, // Increase penalty for height
    lines: 1.2, // More reward for clearing lines
    holes: -1.0, // More penalty for holes
    bumpiness: -0.3, // Keep same penalty for bumpiness
    aggregateHeight: -0.2, // Keep same penalty for total height
  },
  hard: {
    height: -1.0, // Increase penalty for height
    lines: 1.8, // More reward for clearing lines
    holes: -1.5, // More penalty for holes
    bumpiness: -0.5, // Keep same penalty for bumpiness
    aggregateHeight: -0.3, // Keep same penalty for total height
  },
  expert: {
    height: -1.5, // Significantly increase penalty for height
    lines: 2.5, // Significantly increase reward for clearing lines
    holes: -2.0, // Significantly increase penalty for holes
    bumpiness: -0.8, // Keep same penalty for bumpiness
    aggregateHeight: -0.5, // Keep same penalty for total height
  },
};
