import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Stack,
  Paper,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Fab,
} from "@mui/material";
import { HomeRounded, Menu } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { GAME_STATES } from "../constants";
import { useGameLogic } from "../hooks/useGameLogic";
import { getControlsFromStorage } from "../utils/controlsUtils";
import GameBoard from "../components/GameBoard";
import MultiBoard, { MultiBoardRef } from "../components/MultiBoard";
import FireballEffect, {
  FireballEffectRef,
} from "../components/FireballEffect";
import GameInfo from "../components/GameInfo";
import SettingsDialog from "../components/SettingsDialog";
import WinnerPopup from "../components/WinnerPopup";
import GameOverPopup from "../components/GameOverPopup";
import MultiplayerGameOverNotification from "../components/MultiplayerGameOverNotification";
import PauseOverlay from "../components/PauseOverlay";
import MobileSidebarPopup from "../components/MobileSidebarPopup";
import VirtualControls from "../components/VirtualControls";
import RoomSidebar from "../components/RoomSidebar";
import GameAlreadyStartedPopup from "../components/GameAlreadyStartedPopup";
import gameService from "../services/gameService";
import { MultiplayerGameOverState, PlayerGameOverData } from "../types";

const RoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [multiplayerGameOver, setMultiplayerGameOver] =
    useState<MultiplayerGameOverState>({ isGameOver: false });
  const multiBoardRef = useRef<MultiBoardRef>(null);
  const fireballEffectRef = useRef<FireballEffectRef>(null);

  const {
    gameBoard,
    gameWinner,
    playerName,
    startGame,
    pauseGame,
    togglePause,
    forcePause,
    forceResume,
    handleKeyPress,
    handleKeyRelease,
    // Room navigation
    roomCode,
    isJoiningRoom,
    roomError,
    showGameStartedPopup,
    gameStartedRoomCode,
    closeGameStartedPopup,
    roomPlayers,
  } = useGameLogic(settingsOpen);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Virtual control handlers
  const handleVirtualControl = useCallback(
    (action: string) => {
      const controls = getControlsFromStorage();
      let key = "";

      switch (action) {
        case "moveLeft":
          key = controls.MOVE_LEFT;
          break;
        case "moveRight":
          key = controls.MOVE_RIGHT;
          break;
        case "softDrop":
          key = controls.MOVE_DOWN;
          break;
        case "hardDrop":
          key = controls.HARD_DROP;
          break;
        case "rotate":
          key = controls.ROTATE;
          break;
        case "hold":
          key = controls.HOLD;
          break;
      }

      key && handleKeyPress(key);
    },
    [handleKeyPress]
  );

  const handleVirtualControlRelease = useCallback(
    (action: string) => {
      const controls = getControlsFromStorage();
      let key = "";

      switch (action) {
        case "moveLeft":
          key = controls.MOVE_LEFT;
          break;
        case "moveRight":
          key = controls.MOVE_RIGHT;
          break;
        case "softDrop":
          key = controls.MOVE_DOWN;
          break;
        case "hardDrop":
          key = controls.HARD_DROP;
          break;
        case "rotate":
          key = controls.ROTATE;
          break;
        case "hold":
          key = controls.HOLD;
          break;
      }

      key && handleKeyRelease(key);
    },
    [handleKeyRelease]
  );

  // Debug useEffect để log state changes
  useEffect(() => {
    console.log("🔄 State Debug:", {
      "gameBoard.gameState": gameBoard.gameState,
      "gameWinner.hasWinner": gameWinner.hasWinner,
      "gameWinner.winner?.name": gameWinner.winner?.name,
      playerName: playerName,
      isPlayerWinner: gameWinner.winner?.name === playerName,
      shouldShowGameOver:
        gameBoard.gameState === GAME_STATES.GAME_OVER &&
        !(gameWinner.hasWinner && gameWinner.winner?.name === playerName),
      shouldShowWinner:
        gameWinner.hasWinner && gameWinner.winner?.name === playerName,
    });
  }, [gameBoard.gameState, gameWinner, playerName]);

  // Update controls when settings dialog closes
  useEffect(() => {
    if (!settingsOpen) {
      getControlsFromStorage();
    }
  }, [settingsOpen]);

  // Track lines cleared and shoot fireballs
  const lastLinesRef = useRef(gameBoard.lines);
  useEffect(() => {
    const currentLines = gameBoard.lines;
    const previousLines = lastLinesRef.current;

    if (currentLines > previousLines) {
      const linesCleared = currentLines - previousLines;
      console.log(`🔥 Lines cleared: ${linesCleared}, shooting fireball!`);

      // Get all player board positions and shoot ONE fireball to first target
      if (multiBoardRef.current && fireballEffectRef.current) {
        const positions = multiBoardRef.current.getPlayerBoardPositions();
        if (positions.length > 0) {
          // Only shoot one fireball to the first player
          const firstTarget = positions[0];
          fireballEffectRef.current.shootFireball(
            firstTarget.x,
            firstTarget.y,
            firstTarget.playerId,
            linesCleared
          );
        }
      }
    }

    lastLinesRef.current = currentLines;
  }, [gameBoard.lines]);

  // Setup multiplayer event handlers
  useEffect(() => {
    if (roomCode) {
      const handleGamePaused = (data: {
        pausedBy: string;
        roomCode: string;
      }) => {
        console.log("Game paused by:", data.pausedBy);
        // Force pause game state for all players
        forcePause();
      };

      const handleGameResumed = (data: {
        resumedBy: string;
        roomCode: string;
      }) => {
        console.log("Game resumed by:", data.resumedBy);
        // Force resume game state for all players
        forceResume();
      };

      const handlePlayerGameOver = (data: PlayerGameOverData) => {
        console.log("Player game over event:", data);
        if (data.playerName !== playerName) {
          // Chỉ hiện thông báo nếu không phải mình game over
          setMultiplayerGameOver({
            isGameOver: true,
            playerName: data.playerName,
            finalScore: data.finalScore,
            playersRemaining: data.playersRemaining,
            totalPlayers: data.totalPlayers,
            allPlayersData: data.allPlayersData,
          });

          // Tự động ẩn thông báo sau 5 giây
          setTimeout(() => {
            setMultiplayerGameOver({ isGameOver: false });
          }, 5000);
        }
      };

      // Gán event listeners
      gameService.onGamePaused = handleGamePaused;
      gameService.onGameResumed = handleGameResumed;
      gameService.onPlayerGameOver = handlePlayerGameOver;

      // Cleanup function
      return () => {
        gameService.onGamePaused = undefined;
        gameService.onGameResumed = undefined;
        gameService.onPlayerGameOver = undefined;
      };
    }
  }, [roomCode, playerName, forcePause, forceResume]);

  const handleSettingsOpen = () => {
    // Pause game when opening settings if game is playing
    if (gameBoard.gameState === GAME_STATES.PLAYING) {
      pauseGame();
    }
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleGoHome = () => {
    gameService.disconnect();
    navigate("/");
  };

  // Show loading while joining room
  if (isJoiningRoom) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            textAlign: "center",
            background: "rgba(26, 26, 26, 0.95)",
            border: "1px solid rgba(0, 170, 255, 0.2)",
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h5" color="primary">
            Joining Room {roomCode}...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Show error if failed to join
  if (roomError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 4,
            textAlign: "center",
            background: "rgba(26, 26, 26, 0.95)",
            border: "1px solid rgba(244, 67, 54, 0.2)",
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {roomError}
          </Alert>
          <Button
            variant="contained"
            onClick={handleGoHome}
            startIcon={<HomeRounded />}
          >
            Go Home
          </Button>
        </Paper>
      </Box>
    );
  }

  // Main game UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(0, 170, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(0, 204, 102, 0.1) 0%, transparent 50%)
          `,
          zIndex: -1,
        },
      }}
    >
      <FireballEffect ref={fireballEffectRef}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {isMobile ? (
            /* Mobile Layout */
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "calc(100vh - 64px)",
                width: "100%",
                gap: 1,
                px: 1,
                pb: 2, // Minimal padding since virtual controls float over
              }}
            >
              {/* Mobile Game Info - Top */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "400px",
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <GameInfo
                  score={gameBoard.score}
                  lines={gameBoard.lines}
                  level={gameBoard.level}
                  nextPiece={gameBoard.nextPiece}
                  holdPiece={gameBoard.holdPiece}
                  canHold={gameBoard.canHold}
                />
              </Box>

              {/* MultiBoard - Preview of other players */}
              <MultiBoard ref={multiBoardRef} />

              {/* Mobile Game Board - Center */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  minHeight: 0,
                }}
              >
                <Box position="relative">
                  <GameBoard
                    grid={gameBoard.grid}
                    activePiece={gameBoard.activePiece}
                    ghostPiece={gameBoard.ghostPiece}
                    clearingRows={gameBoard.clearingRows}
                    dropPosition={gameBoard.dropPosition}
                    isShaking={gameBoard.isShaking}
                  />

                  <PauseOverlay
                    isVisible={gameBoard.gameState === GAME_STATES.PAUSED}
                  />

                  <GameOverPopup
                    isVisible={
                      gameBoard.gameState === GAME_STATES.GAME_OVER &&
                      !(
                        gameWinner.hasWinner &&
                        gameWinner.winner?.name === playerName
                      )
                    }
                    score={gameBoard.score}
                    lines={gameBoard.lines}
                    level={gameBoard.level}
                    onPlayAgain={startGame}
                    onLeaveRoom={handleGoHome}
                  />

                  <WinnerPopup
                    isVisible={
                      gameWinner.hasWinner &&
                      gameWinner.winner?.name === playerName
                    }
                    winner={gameWinner.winner}
                    finalScores={gameWinner.finalScores}
                    playerName={playerName}
                    onPlayAgain={() => gameService.restartGame()}
                  />
                </Box>
              </Box>

              {/* Mobile Menu Button */}
              <Fab
                color="primary"
                onClick={() => setMobileSidebarOpen(true)}
                sx={{
                  position: "fixed",
                  bottom: 220, // Position above floating virtual controls
                  right: 16,
                  zIndex: 1000,
                }}
              >
                <Menu />
              </Fab>

              {/* Virtual Controls - Only on Mobile */}
              <VirtualControls
                onMoveLeft={() => handleVirtualControl("moveLeft")}
                onMoveRight={() => handleVirtualControl("moveRight")}
                onMoveDown={() => handleVirtualControl("softDrop")}
                onRotate={() => handleVirtualControl("rotate")}
                onHardDrop={() => handleVirtualControl("hardDrop")}
                onHold={() => handleVirtualControl("hold")}
                onMoveLeftRelease={() =>
                  handleVirtualControlRelease("moveLeft")
                }
                onMoveRightRelease={() =>
                  handleVirtualControlRelease("moveRight")
                }
                onMoveDownRelease={() =>
                  handleVirtualControlRelease("softDrop")
                }
                onRotateRelease={() => handleVirtualControlRelease("rotate")}
                onHardDropRelease={() =>
                  handleVirtualControlRelease("hardDrop")
                }
                onHoldRelease={() => handleVirtualControlRelease("hold")}
              />

              {/* Mobile Sidebar Popup */}
              <MobileSidebarPopup
                open={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
                roomCode={roomCode}
                players={roomPlayers}
                playerName={playerName}
                gameBoard={gameBoard}
                gameWinner={gameWinner}
                onStartGame={startGame}
                onPauseGame={pauseGame}
                onGoHome={handleGoHome}
                onSettingsOpen={handleSettingsOpen}
              />
            </Box>
          ) : (
            /* Desktop Layout */
            <Stack
              direction="row"
              spacing={4}
              alignItems="flex-start"
              justifyContent="center"
            >
              {/* Left Side: Game Board */}
              <Box position="relative">
                {/* MultiBoard - Preview of other players */}
                <MultiBoard ref={multiBoardRef} />

                <GameBoard
                  grid={gameBoard.grid}
                  activePiece={gameBoard.activePiece}
                  ghostPiece={gameBoard.ghostPiece}
                  clearingRows={gameBoard.clearingRows}
                  dropPosition={gameBoard.dropPosition}
                  isShaking={gameBoard.isShaking}
                />

                <PauseOverlay
                  isVisible={gameBoard.gameState === GAME_STATES.PAUSED}
                />

                <GameOverPopup
                  isVisible={
                    gameBoard.gameState === GAME_STATES.GAME_OVER &&
                    !(
                      gameWinner.hasWinner &&
                      gameWinner.winner?.name === playerName
                    )
                  }
                  score={gameBoard.score}
                  lines={gameBoard.lines}
                  level={gameBoard.level}
                  onPlayAgain={startGame}
                  onLeaveRoom={handleGoHome}
                />

                <WinnerPopup
                  isVisible={
                    gameWinner.hasWinner &&
                    gameWinner.winner?.name === playerName
                  }
                  winner={gameWinner.winner}
                  finalScores={gameWinner.finalScores}
                  playerName={playerName}
                  onPlayAgain={() => gameService.restartGame()}
                />
              </Box>

              {/* Middle: Game Info */}
              <GameInfo
                score={gameBoard.score}
                lines={gameBoard.lines}
                level={gameBoard.level}
                nextPiece={gameBoard.nextPiece}
                holdPiece={gameBoard.holdPiece}
                canHold={gameBoard.canHold}
              />

              {/* Right Side: Toolbar */}
              <RoomSidebar
                roomCode={roomCode}
                players={roomPlayers}
                playerName={playerName}
                gameBoard={gameBoard}
                gameWinner={gameWinner}
                onStartGame={startGame}
                onPauseGame={togglePause}
                onGoHome={handleGoHome}
                onSettingsOpen={handleSettingsOpen}
              />
            </Stack>
          )}

          {/* Multiplayer Game Over Notification */}
          <MultiplayerGameOverNotification
            multiplayerGameOver={multiplayerGameOver}
          />

          {/* Settings Dialog */}
          <SettingsDialog open={settingsOpen} onClose={handleSettingsClose} />

          {/* Game Already Started Popup */}
          <GameAlreadyStartedPopup
            isOpen={showGameStartedPopup}
            roomCode={gameStartedRoomCode}
            onClose={closeGameStartedPopup}
          />
        </Container>
      </FireballEffect>
    </Box>
  );
};

export default RoomPage;
