import { useCallback, useEffect, useRef, useState } from "react";
import { TetrisBot } from "./tetrisBot";
import { BotMove, BotConfig } from "./types";
import { GameBoard, Tetromino } from "../types";
import { GAME_STATES } from "../constants";

interface UseBotReturn {
  bot: TetrisBot;
  isEnabled: boolean;
  difficulty: BotConfig["difficulty"];
  setEnabled: (enabled: boolean) => void;
  setDifficulty: (difficulty: BotConfig["difficulty"]) => void;
  executeMove: (gameBoard: GameBoard, activePiece: Tetromino) => BotMove | null;
  currentMove: BotMove | null;
}

export const useBot = (
  onMove: (direction: "left" | "right") => void,
  onRotate: () => void,
  onHardDrop: () => void
): UseBotReturn => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [difficulty, setDifficulty] =
    useState<BotConfig["difficulty"]>("medium");

  const botRef = useRef<TetrisBot>(new TetrisBot(difficulty));
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentMoveRef = useRef<BotMove | null>(null);
  const commandsRef = useRef<Array<"left" | "right" | "rotate" | "drop">>([]);
  const commandIndexRef = useRef<number>(0);

  const bot = botRef.current;

  // Update bot configuration when settings change
  useEffect(() => {
    bot.setDifficulty(difficulty);
    bot.setEnabled(isEnabled);
  }, [bot, difficulty, isEnabled]);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (!enabled && moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = null;
      currentMoveRef.current = null;
      commandsRef.current = [];
      commandIndexRef.current = 0;
    }
  }, []);

  const setDifficultyLevel = useCallback(
    (newDifficulty: BotConfig["difficulty"]) => {
      setDifficulty(newDifficulty);
    },
    []
  );

  const executeNextCommand = useCallback(() => {
    if (commandIndexRef.current >= commandsRef.current.length) {
      commandsRef.current = [];
      commandIndexRef.current = 0;
      currentMoveRef.current = null;
      return;
    }

    const command = commandsRef.current[commandIndexRef.current];
    commandIndexRef.current++;

    switch (command) {
      case "left":
        onMove("left");
        break;
      case "right":
        onMove("right");
        break;
      case "rotate":
        onRotate();
        break;
      case "drop":
        onHardDrop();
        // Reset after drop
        commandsRef.current = [];
        commandIndexRef.current = 0;
        currentMoveRef.current = null;
        return;
    }

    // Schedule next command
    if (isEnabled) {
      moveTimeoutRef.current = setTimeout(executeNextCommand, 100);
    }
  }, [isEnabled, onMove, onRotate, onHardDrop]);

  const executeMove = useCallback(
    (gameBoard: GameBoard, activePiece: Tetromino): BotMove | null => {
      if (
        !isEnabled ||
        gameBoard.gameState !== GAME_STATES.PLAYING ||
        !activePiece
      ) {
        return null;
      }

      // If we're already executing a move, don't start a new one
      if (currentMoveRef.current !== null || commandsRef.current.length > 0) {
        return currentMoveRef.current;
      }

      const analysis = bot.analyzePiece(gameBoard, activePiece);
      const bestMove = analysis.bestMove;

      if (bestMove.score === -Infinity) {
        return null;
      }

      currentMoveRef.current = bestMove;

      // Calculate the commands needed to execute this move
      const commands = bot.calculateOptimalPath(activePiece, bestMove);
      commandsRef.current = commands;
      commandIndexRef.current = 0;

      // Start executing commands
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }

      moveTimeoutRef.current = setTimeout(executeNextCommand, bot.getSpeed());

      return bestMove;
    },
    [isEnabled, bot, executeNextCommand]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
      }
    };
  }, []);

  return {
    bot,
    isEnabled,
    difficulty,
    setEnabled,
    setDifficulty: setDifficultyLevel,
    executeMove,
    currentMove: currentMoveRef.current,
  };
};
