import { useState, useCallback, useEffect, useRef } from "react";
import { GameBoard, Tetromino, Position } from "../types";
import { GAME_CONFIG, GAME_STATES, CONTROLS } from "../constants";
import {
  createEmptyGrid,
  getRandomTetromino,
  createTetromino,
  rotateTetromino,
  isValidPosition,
  placeTetromino,
  clearLines,
  calculateScore,
} from "../utils/gameUtils";
import { useBot } from "../bot";

const createInitialGameBoard = (): GameBoard => ({
  grid: createEmptyGrid(),
  activePiece: null,
  nextPiece: getRandomTetromino(),
  ghostPiece: null, // Add ghost piece to GameBoard
  score: 0,
  lines: 0,
  level: 0,
  gameState: GAME_STATES.WELCOME,
});

export const useGameLogic = () => {
  const [gameBoard, setGameBoard] = useState<GameBoard>(createInitialGameBoard);
  const [playerName, setPlayerName] = useState<string>(() => {
    // Load player name from localStorage on initialization
    return localStorage.getItem("tetris-player-name") || "";
  });
  const gameLoopRef = useRef<number | null>(null);
  const lastDropTimeRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastMoveTimeRef = useRef<{ [key: string]: number }>({});

  // Bot functionality
  const bot = useBot(
    (direction: "left" | "right") => moveActivePiece(direction),
    () => rotateActivePiece(),
    () => hardDrop()
  );

  const spawnNewPiece = useCallback((): Tetromino => {
    const type = gameBoard.nextPiece || getRandomTetromino();
    const startPosition: Position = {
      x: Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) - 1,
      y: -1,
    };

    return createTetromino(type, startPosition);
  }, [gameBoard.nextPiece]);

  // Calculate and update ghost piece position
  const updateGhostPiece = useCallback(
    (board: GameBoard, activePiece: Tetromino): Tetromino | null => {
      if (!activePiece) return null;

      // Create a copy of the active piece for the ghost
      const ghostPiece: Tetromino = {
        ...activePiece,
        position: { ...activePiece.position },
      };

      // Drop the ghost piece as far as it can go
      while (
        isValidPosition(board.grid, ghostPiece, {
          x: ghostPiece.position.x,
          y: ghostPiece.position.y + 1,
        })
      ) {
        ghostPiece.position.y += 1;
      }

      return ghostPiece;
    },
    []
  );

  const moveActivePiece = useCallback(
    (direction: "left" | "right" | "down") => {
      setGameBoard((prev: GameBoard) => {
        if (!prev.activePiece || prev.gameState !== GAME_STATES.PLAYING)
          return prev;

        const offsets = {
          left: { x: -1, y: 0 },
          right: { x: 1, y: 0 },
          down: { x: 0, y: 1 },
        };

        const newPosition: Position = {
          x: prev.activePiece.position.x + offsets[direction].x,
          y: prev.activePiece.position.y + offsets[direction].y,
        };

        const canMove = isValidPosition(
          prev.grid,
          prev.activePiece,
          newPosition
        );

        if (canMove) {
          const updatedPiece = {
            ...prev.activePiece,
            position: newPosition,
          };

          // Update ghost piece based on new active piece position
          const updatedGhostPiece = updateGhostPiece(prev, updatedPiece);

          return {
            ...prev,
            activePiece: updatedPiece,
            ghostPiece: updatedGhostPiece,
          };
        }

        // If moving down failed, place the piece
        if (direction === "down") {
          const newGrid = placeTetromino(prev.grid, prev.activePiece);
          const { newGrid: clearedGrid, linesCleared } = clearLines(newGrid);
          const scoreIncrease = calculateScore(linesCleared, prev.level);
          const newLines = prev.lines + linesCleared;
          const newLevel = Math.floor(newLines / GAME_CONFIG.LINES_PER_LEVEL);

          // Check for game over
          const newActivePiece = spawnNewPiece();
          const gameOver = !isValidPosition(
            clearedGrid,
            newActivePiece,
            newActivePiece.position
          );

          return {
            ...prev,
            grid: clearedGrid,
            activePiece: gameOver ? null : newActivePiece,
            nextPiece: getRandomTetromino(),
            score: prev.score + scoreIncrease,
            lines: newLines,
            level: newLevel,
            gameState: gameOver ? GAME_STATES.GAME_OVER : prev.gameState,
          };
        }

        return prev;
      });
    },
    [spawnNewPiece]
  );

  const rotateActivePiece = useCallback(() => {
    setGameBoard((prev: GameBoard) => {
      if (!prev.activePiece || prev.gameState !== GAME_STATES.PLAYING)
        return prev;

      const rotatedPiece = rotateTetromino(prev.activePiece);
      const currentPos = prev.activePiece.position;
      const boardWidth = GAME_CONFIG.BOARD_WIDTH;

      // Smart wall kick: determine direction based on piece position
      const isNearLeftWall = currentPos.x <= 2;
      const isNearRightWall = currentPos.x >= boardWidth - 3;

      let wallKickOffsets: Array<{ x: number; y: number }>;

      if (isNearLeftWall) {
        // Near left wall - prioritize moving right
        wallKickOffsets = [
          { x: 0, y: 0 }, // Original position
          { x: 1, y: 0 }, // Move right
          { x: 2, y: 0 }, // Move further right
          { x: 3, y: 0 }, // Move even further right (for I piece)
          { x: 0, y: -1 }, // Move up
          { x: 1, y: -1 }, // Move right and up
        ];
      } else if (isNearRightWall) {
        // Near right wall - prioritize moving left
        wallKickOffsets = [
          { x: 0, y: 0 }, // Original position
          { x: -1, y: 0 }, // Move left
          { x: -2, y: 0 }, // Move further left
          { x: -3, y: 0 }, // Move even further left (for I piece)
          { x: 0, y: -1 }, // Move up
          { x: -1, y: -1 }, // Move left and up
        ];
      } else {
        // Middle of board - try both directions
        wallKickOffsets = [
          { x: 0, y: 0 }, // Original position
          { x: -1, y: 0 }, // Try moving left first
          { x: 1, y: 0 }, // Try moving right
          { x: -2, y: 0 }, // Try moving further left
          { x: 2, y: 0 }, // Try moving further right
          { x: 0, y: -1 }, // Try moving up
          { x: -1, y: -1 }, // Try left and up
          { x: 1, y: -1 }, // Try right and up
        ];
      }

      // Try each wall kick offset
      for (const offset of wallKickOffsets) {
        const testPosition: Position = {
          x: rotatedPiece.position.x + offset.x,
          y: rotatedPiece.position.y + offset.y,
        };

        if (isValidPosition(prev.grid, rotatedPiece, testPosition)) {
          const updatedPiece = {
            ...rotatedPiece,
            position: testPosition,
          };

          // Update ghost piece after rotation
          const updatedGhostPiece = updateGhostPiece(prev, updatedPiece);

          return {
            ...prev,
            activePiece: updatedPiece,
            ghostPiece: updatedGhostPiece,
          };
        }
      }

      // If no wall kick worked, don't rotate
      return prev;
    });
  }, []);

  const hardDrop = useCallback(() => {
    setGameBoard((prev: GameBoard) => {
      if (!prev.activePiece || prev.gameState !== GAME_STATES.PLAYING)
        return prev;

      let dropDistance = 0;
      let testPosition = { ...prev.activePiece.position };

      // Find how far we can drop
      while (
        isValidPosition(prev.grid, prev.activePiece, {
          x: testPosition.x,
          y: testPosition.y + 1,
        })
      ) {
        testPosition.y += 1;
        dropDistance += 1;
      }

      const droppedPiece = {
        ...prev.activePiece,
        position: testPosition,
      };

      const newGrid = placeTetromino(prev.grid, droppedPiece);
      const { newGrid: clearedGrid, linesCleared } = clearLines(newGrid);
      const scoreIncrease =
        calculateScore(linesCleared, prev.level) + dropDistance * 2;
      const newLines = prev.lines + linesCleared;
      const newLevel = Math.floor(newLines / GAME_CONFIG.LINES_PER_LEVEL);

      // Check for game over
      const newActivePiece = spawnNewPiece();
      const gameOver = !isValidPosition(
        clearedGrid,
        newActivePiece,
        newActivePiece.position
      );

      return {
        ...prev,
        grid: clearedGrid,
        activePiece: gameOver ? null : newActivePiece,
        ghostPiece: gameOver
          ? null
          : updateGhostPiece(
              {
                ...prev,
                grid: clearedGrid,
                activePiece: newActivePiece,
              },
              newActivePiece
            ),
        nextPiece: getRandomTetromino(),
        score: prev.score + scoreIncrease,
        lines: newLines,
        level: newLevel,
        gameState: gameOver ? GAME_STATES.GAME_OVER : prev.gameState,
      };
    });
  }, [spawnNewPiece]);

  const startGame = useCallback(() => {
    setGameBoard((prev: GameBoard) => {
      // If game over, reset the board completely
      if (prev.gameState === GAME_STATES.GAME_OVER) {
        const newActivePiece = spawnNewPiece();
        const initialBoard = createInitialGameBoard();

        return {
          ...initialBoard,
          gameState: GAME_STATES.PLAYING,
          activePiece: newActivePiece,
          ghostPiece: updateGhostPiece(
            {
              ...initialBoard,
              activePiece: newActivePiece,
            },
            newActivePiece
          ),
        };
      }

      // Regular start from waiting state
      const newActivePiece = spawnNewPiece();
      return {
        ...prev,
        activePiece: newActivePiece,
        ghostPiece: updateGhostPiece(
          { ...prev, activePiece: newActivePiece },
          newActivePiece
        ),
        gameState: GAME_STATES.PLAYING,
      };
    });
    lastDropTimeRef.current = Date.now();
  }, [spawnNewPiece]);

  const pauseGame = useCallback(() => {
    setGameBoard((prev: GameBoard) => ({
      ...prev,
      gameState:
        prev.gameState === GAME_STATES.PLAYING
          ? GAME_STATES.PAUSED
          : GAME_STATES.PLAYING,
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameBoard(createInitialGameBoard());
  }, []);

  const createRoom = useCallback((name: string) => {
    // Save player name to localStorage
    localStorage.setItem("tetris-player-name", name);
    setPlayerName(name);
    setGameBoard((prev: GameBoard) => ({
      ...prev,
      gameState: GAME_STATES.WAITING,
    }));
  }, []);

  const handleKeyPress = useCallback(
    (key: string) => {
      const lowerKey = key.toLowerCase();

      // Handle rotation and hard drop immediately (non-continuous)
      if (lowerKey === CONTROLS.ROTATE) {
        rotateActivePiece();
        return;
      }

      if (lowerKey === CONTROLS.HARD_DROP) {
        hardDrop();
        return;
      }

      // Add continuous movement keys to pressed set
      if (
        lowerKey === CONTROLS.MOVE_LEFT ||
        lowerKey === CONTROLS.MOVE_RIGHT ||
        lowerKey === CONTROLS.MOVE_DOWN
      ) {
        keysPressed.current.add(lowerKey);

        // Execute immediate movement on first press
        const now = Date.now();
        // Record when key was first pressed (for acceleration)
        lastMoveTimeRef.current[lowerKey + "_start"] = now;

        if (!lastMoveTimeRef.current[lowerKey]) {
          if (lowerKey === CONTROLS.MOVE_LEFT) {
            moveActivePiece("left");
          } else if (lowerKey === CONTROLS.MOVE_RIGHT) {
            moveActivePiece("right");
          } else if (lowerKey === CONTROLS.MOVE_DOWN) {
            moveActivePiece("down");
          }
          lastMoveTimeRef.current[lowerKey] = now;
        }
      }
    },
    [moveActivePiece, rotateActivePiece, hardDrop]
  );

  const handleKeyRelease = useCallback((key: string) => {
    const lowerKey = key.toLowerCase();
    keysPressed.current.delete(lowerKey);
    delete lastMoveTimeRef.current[lowerKey];
    delete lastMoveTimeRef.current[lowerKey + "_start"]; // Remove the start time as well
  }, []);

  // Game loop
  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now();
      const dropSpeed =
        GAME_CONFIG.INITIAL_SPEED -
        gameBoard.level * GAME_CONFIG.SPEED_INCREASE;
      const minSpeed = 50;
      const actualDropSpeed = Math.max(dropSpeed, minSpeed);

      // Handle automatic piece dropping
      if (
        gameBoard.gameState === GAME_STATES.PLAYING &&
        gameBoard.activePiece &&
        now - lastDropTimeRef.current > actualDropSpeed
      ) {
        moveActivePiece("down");
        lastDropTimeRef.current = now;
      }

      // Handle continuous movement for held keys with acceleration
      keysPressed.current.forEach((key) => {
        if (gameBoard.gameState === GAME_STATES.PLAYING) {
          const lastMoveTime = lastMoveTimeRef.current[key] || 0;
          const holdDuration = now - lastMoveTime;

          // Calculate adaptive move speed: faster the longer the key is held
          // Initial speed: 150ms, reduces to 50ms after holding for 1 second
          const baseMoveSpeed = 150; // Initial delay in milliseconds
          const minMoveSpeed = 50; // Minimum delay in milliseconds (maximum speed)
          const accelerationTime = 1000; // Time to reach maximum speed in milliseconds

          // Calculate current move speed based on how long the key has been held
          const holdingTime =
            now - (lastMoveTimeRef.current[key + "_start"] || now);
          const speedReduction =
            Math.min(holdingTime / accelerationTime, 1) *
            (baseMoveSpeed - minMoveSpeed);
          const currentMoveSpeed = baseMoveSpeed - speedReduction;

          if (holdDuration > currentMoveSpeed) {
            if (key === CONTROLS.MOVE_LEFT) {
              moveActivePiece("left");
            } else if (key === CONTROLS.MOVE_RIGHT) {
              moveActivePiece("right");
            } else if (key === CONTROLS.MOVE_DOWN) {
              moveActivePiece("down");
            }
            lastMoveTimeRef.current[key] = now;
          }
        }
      });

      // Bot decision making
      if (
        bot.isEnabled &&
        gameBoard.gameState === GAME_STATES.PLAYING &&
        gameBoard.activePiece
      ) {
        bot.executeMove(gameBoard, gameBoard.activePiece);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [
    gameBoard.gameState,
    gameBoard.level,
    gameBoard.activePiece,
    moveActivePiece,
    bot,
  ]);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle game keys when in game states (not welcome screen)
      if (
        gameBoard.gameState === GAME_STATES.WELCOME ||
        gameBoard.gameState === GAME_STATES.GAME_OVER
      ) {
        return;
      }

      // Prevent default for game keys to avoid browser shortcuts
      const lowerKey = event.key.toLowerCase();
      const gameKeys = [
        CONTROLS.MOVE_LEFT,
        CONTROLS.MOVE_RIGHT,
        CONTROLS.MOVE_DOWN,
        CONTROLS.ROTATE,
        CONTROLS.HARD_DROP,
      ];

      if (gameKeys.includes(lowerKey as any)) {
        event.preventDefault();
      }

      handleKeyPress(event.key);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Only handle game keys when in game states (not welcome screen)
      if (
        gameBoard.gameState === GAME_STATES.WELCOME ||
        gameBoard.gameState === GAME_STATES.GAME_OVER
      ) {
        return;
      }

      handleKeyRelease(event.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyPress, handleKeyRelease, gameBoard.gameState]);

  return {
    gameBoard,
    playerName,
    startGame,
    pauseGame,
    resetGame,
    createRoom,
    handleKeyPress,
    handleKeyRelease,
    bot,
  };
};
