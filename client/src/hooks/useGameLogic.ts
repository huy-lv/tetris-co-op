import { useState, useCallback, useEffect, useRef } from "react";
import { GameBoard, Tetromino, Position, TetrominoType } from "../types";
import { GAME_CONFIG, GAME_STATES } from "../constants";
import {
  createEmptyGrid,
  getRandomTetromino,
  createTetromino,
  rotateTetromino,
  isValidPosition,
  placeTetromino,
  clearLines,
  findLinesToClear,
  calculateScore,
} from "../utils/gameUtils";
import { useBot } from "../bot";
import { getControlsFromStorage } from "../utils/controlsUtils";

const createInitialGameBoard = (): GameBoard => ({
  grid: createEmptyGrid(),
  activePiece: null,
  nextPiece: getRandomTetromino(),
  ghostPiece: null, // Add ghost piece to GameBoard
  holdPiece: null, // Add hold piece
  canHold: true, // Allow holding on game start
  score: 0,
  lines: 0,
  level: 0,
  gameState: GAME_STATES.WELCOME,
  isPaused: false, // Add pause state
  clearingRows: [], // Add clearing rows for animation
  dropPosition: undefined, // Add drop position for animation
  isShaking: false, // Initialize shake state
});

export const useGameLogic = (settingsOpen: boolean = false) => {
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
          const linesToClear = findLinesToClear(newGrid);

          // If there are lines to clear, start animation and shake
          if (linesToClear.length > 0) {
            // Trigger shake animation
            setTimeout(() => {
              setGameBoard((current) => ({
                ...current,
                isShaking: true,
              }));

              // Reset shake animation after 300ms
              setTimeout(() => {
                setGameBoard((current) => ({
                  ...current,
                  isShaking: false,
                }));
              }, 300);
            }, 0);
            // Spawn new piece immediately
            const newActivePiece = spawnNewPiece();
            const gameOver = !isValidPosition(
              newGrid,
              newActivePiece,
              newActivePiece.position
            );

            // After animation delay, actually clear the lines
            setTimeout(() => {
              setGameBoard((current) => {
                const { newGrid: clearedGrid, linesCleared } = clearLines(
                  current.grid
                );
                const scoreIncrease = calculateScore(
                  linesCleared,
                  current.level
                );
                const newLines = current.lines + linesCleared;
                const newLevel = Math.floor(
                  newLines / GAME_CONFIG.LINES_PER_LEVEL
                );

                return {
                  ...current,
                  grid: clearedGrid,
                  score: current.score + scoreIncrease,
                  lines: newLines,
                  level: newLevel,
                  clearingRows: [], // Clear the animation state
                  dropPosition: undefined, // Clear drop position
                };
              });
            }, 500); // 500ms animation delay

            // Return immediately with animation state
            return {
              ...prev,
              grid: newGrid,
              activePiece: gameOver ? null : newActivePiece,
              ghostPiece: gameOver
                ? null
                : updateGhostPiece(
                    {
                      ...prev,
                      grid: newGrid,
                      activePiece: newActivePiece,
                    },
                    newActivePiece
                  ),
              nextPiece: getRandomTetromino(),
              canHold: true,
              clearingRows: linesToClear,
              dropPosition: prev.activePiece
                ? {
                    x:
                      prev.activePiece.position.x +
                      Math.floor(prev.activePiece.shape[0].length / 2),
                    y: prev.activePiece.position.y,
                  }
                : undefined,
              gameState: gameOver ? GAME_STATES.GAME_OVER : prev.gameState,
            };
          } else {
            // No lines to clear, proceed normally
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
              canHold: true, // Reset the ability to hold when a new piece appears
              gameState: gameOver ? GAME_STATES.GAME_OVER : prev.gameState,
              clearingRows: [], // No rows being cleared
            };
          }
        }

        return prev;
      });
    },
    [spawnNewPiece, updateGhostPiece]
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
      const linesToClear = findLinesToClear(newGrid);

      // If there are lines to clear, start animation and shake
      if (linesToClear.length > 0) {
        // Trigger shake animation
        setTimeout(() => {
          setGameBoard((current) => ({
            ...current,
            isShaking: true,
          }));

          // Reset shake animation after 300ms
          setTimeout(() => {
            setGameBoard((current) => ({
              ...current,
              isShaking: false,
            }));
          }, 300);
        }, 0);
        // Spawn new piece immediately
        const newActivePiece = spawnNewPiece();
        const gameOver = !isValidPosition(
          newGrid,
          newActivePiece,
          newActivePiece.position
        );

        // After animation delay, actually clear the lines
        setTimeout(() => {
          setGameBoard((current) => {
            const { newGrid: clearedGrid, linesCleared } = clearLines(
              current.grid
            );
            const scoreIncrease =
              calculateScore(linesCleared, current.level) + dropDistance * 2;
            const newLines = current.lines + linesCleared;
            const newLevel = Math.floor(newLines / GAME_CONFIG.LINES_PER_LEVEL);

            return {
              ...current,
              grid: clearedGrid,
              score: current.score + scoreIncrease,
              lines: newLines,
              level: newLevel,
              clearingRows: [], // Clear the animation state
              dropPosition: undefined, // Clear drop position
            };
          });
        }, 500); // 500ms animation delay

        // Return immediately with animation state
        return {
          ...prev,
          grid: newGrid,
          activePiece: gameOver ? null : newActivePiece,
          ghostPiece: gameOver
            ? null
            : updateGhostPiece(
                {
                  ...prev,
                  grid: newGrid,
                  activePiece: newActivePiece,
                },
                newActivePiece
              ),
          nextPiece: getRandomTetromino(),
          canHold: true,
          clearingRows: linesToClear,
          dropPosition: droppedPiece
            ? {
                x:
                  droppedPiece.position.x +
                  Math.floor(droppedPiece.shape[0].length / 2),
                y: droppedPiece.position.y,
              }
            : undefined,
          gameState: gameOver ? GAME_STATES.GAME_OVER : prev.gameState,
        };
      } else {
        // No lines to clear, proceed normally
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
          canHold: true, // Reset hold flag when a piece is placed
          gameState: gameOver ? GAME_STATES.GAME_OVER : prev.gameState,
          clearingRows: [], // No rows being cleared
        };
      }
    });
  }, [spawnNewPiece, updateGhostPiece]);

  const holdActivePiece = useCallback(() => {
    setGameBoard((prev: GameBoard) => {
      if (
        !prev.activePiece ||
        prev.gameState !== GAME_STATES.PLAYING ||
        !prev.canHold
      ) {
        return prev;
      }

      // Get the current active piece type
      const currentType = prev.activePiece.type;

      // Determine which piece to spawn next
      let nextActiveType: TetrominoType;

      if (prev.holdPiece) {
        // If there's already a hold piece, swap with it
        nextActiveType = prev.holdPiece;
      } else {
        // If there's no hold piece yet, use the next piece and generate a new next piece
        nextActiveType = prev.nextPiece || getRandomTetromino();
      }

      // Create the new active piece
      const startPosition: Position = {
        x: Math.floor(GAME_CONFIG.BOARD_WIDTH / 2) - 1,
        y: -1,
      };

      const newActivePiece = createTetromino(nextActiveType, startPosition);

      // Update ghost piece based on new active piece
      const updatedGhostPiece = updateGhostPiece(
        {
          ...prev,
          activePiece: newActivePiece,
        },
        newActivePiece
      );

      return {
        ...prev,
        activePiece: newActivePiece,
        ghostPiece: updatedGhostPiece,
        holdPiece: currentType,
        nextPiece: prev.holdPiece ? prev.nextPiece : getRandomTetromino(),
        canHold: false, // Prevent holding again until the piece is placed
      };
    });
  }, [updateGhostPiece]);

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
          holdPiece: null, // Reset hold piece
          canHold: true, // Allow holding on new game
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
      isPaused: !prev.isPaused,
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
      // Don't handle any game keys when settings is open
      if (settingsOpen) {
        return;
      }

      const lowerKey = key.toLowerCase();
      const currentControls = getControlsFromStorage();

      // Auto-resume game if paused and movement key is pressed
      const movementKeys = [
        currentControls.MOVE_LEFT,
        currentControls.MOVE_RIGHT,
        currentControls.MOVE_DOWN,
        currentControls.ROTATE,
        currentControls.HARD_DROP,
        currentControls.HOLD,
      ];

      if (gameBoard.isPaused && movementKeys.includes(lowerKey as any)) {
        // Resume game first
        setGameBoard((prev: GameBoard) => ({
          ...prev,
          isPaused: false,
        }));
      }

      // Handle rotation and hard drop immediately (non-continuous)
      if (lowerKey === currentControls.ROTATE) {
        rotateActivePiece();
        return;
      }

      if (lowerKey === currentControls.HARD_DROP) {
        hardDrop();
        return;
      }

      if (lowerKey === currentControls.HOLD) {
        holdActivePiece();
        return;
      }

      // Add continuous movement keys to pressed set
      if (
        lowerKey === currentControls.MOVE_LEFT ||
        lowerKey === currentControls.MOVE_RIGHT ||
        lowerKey === currentControls.MOVE_DOWN
      ) {
        keysPressed.current.add(lowerKey);

        // Execute immediate movement on first press
        const now = Date.now();
        // Record when key was first pressed (for acceleration)
        lastMoveTimeRef.current[lowerKey + "_start"] = now;

        if (!lastMoveTimeRef.current[lowerKey]) {
          if (lowerKey === currentControls.MOVE_LEFT) {
            moveActivePiece("left");
          } else if (lowerKey === currentControls.MOVE_RIGHT) {
            moveActivePiece("right");
          } else if (lowerKey === currentControls.MOVE_DOWN) {
            moveActivePiece("down");
          }
          lastMoveTimeRef.current[lowerKey] = now;
        }
      }
    },
    [
      moveActivePiece,
      rotateActivePiece,
      hardDrop,
      holdActivePiece,
      gameBoard.isPaused,
      settingsOpen,
    ]
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
        !gameBoard.isPaused &&
        gameBoard.activePiece &&
        now - lastDropTimeRef.current > actualDropSpeed
      ) {
        moveActivePiece("down");
        lastDropTimeRef.current = now;
      }

      // Handle continuous movement for held keys with acceleration
      keysPressed.current.forEach((key) => {
        if (
          gameBoard.gameState === GAME_STATES.PLAYING &&
          !gameBoard.isPaused &&
          !settingsOpen
        ) {
          const lastMoveTime = lastMoveTimeRef.current[key] || 0;
          const holdDuration = now - lastMoveTime;
          const currentControls = getControlsFromStorage();

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
            if (key === currentControls.MOVE_LEFT) {
              moveActivePiece("left");
            } else if (key === currentControls.MOVE_RIGHT) {
              moveActivePiece("right");
            } else if (key === currentControls.MOVE_DOWN) {
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
        !gameBoard.isPaused &&
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
    gameBoard.isPaused,
    settingsOpen,
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
      const currentControls = getControlsFromStorage();
      const gameKeys = [
        currentControls.MOVE_LEFT,
        currentControls.MOVE_RIGHT,
        currentControls.MOVE_DOWN,
        currentControls.ROTATE,
        currentControls.HARD_DROP,
        currentControls.HOLD,
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
    holdActivePiece,
    bot,
  };
};
