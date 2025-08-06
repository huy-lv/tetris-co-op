import React, { useState, useEffect, useCallback } from "react";
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
import { useRoomNavigation } from "../hooks/useRoomNavigation";
import { getControlsFromStorage } from "../utils/controlsUtils";
import GameBoard from "../components/GameBoard";
import GameInfo from "../components/GameInfo";
import SettingsDialog from "../components/SettingsDialog";
import WinnerPopup from "../components/WinnerPopup";
import GameOverPopup from "../components/GameOverPopup";
import MultiplayerGameOverNotification from "../components/MultiplayerGameOverNotification";
import PauseOverlay from "../components/PauseOverlay";
import MobileSidebarPopup from "../components/MobileSidebarPopup";
import VirtualControls from "../components/VirtualControls";
import RoomSidebar from "../components/RoomSidebar";
import gameService from "../services/gameService";
import {
  MultiplayerGameOverState,
  RoomJoinedData,
  PlayerJoinedData,
  PlayerLeftData,
  GameStartedData,
  PlayerGameOverData,
  Player,
} from "../types";

const RoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [multiplayerGameOver, setMultiplayerGameOver] =
    useState<MultiplayerGameOverState>({ isGameOver: false });
  const {
    gameBoard,
    gameWinner,
    playerName,
    startGame,
    pauseGame,
    togglePause,
    forcePause,
    forceResume,
    resetGame,
    handleKeyPress,
    handleKeyRelease,
  } = useGameLogic(settingsOpen);
  const { roomId, isJoiningRoom, roomError } = useRoomNavigation();
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

  // Check room code from gameService
  useEffect(() => {
    const checkRoomCode = () => {
      const currentRoomCode = gameService.getRoomCode();
      setRoomCode(currentRoomCode);
    };

    checkRoomCode();
    const interval = setInterval(checkRoomCode, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock players list - trong tương lai sẽ lấy từ socket
  useEffect(() => {
    if (roomCode || roomId) {
      // Khởi tạo với player hiện tại
      setPlayers([playerName]);

      // Setup event listeners để cập nhật danh sách players real-time
      const handleRoomJoined = (data: RoomJoinedData) => {
        console.log("Room joined event:", data);
        if (data.players) {
          setPlayers(data.players.map((p: Player) => p.name));
        }
      };

      const handlePlayerJoined = (data: PlayerJoinedData) => {
        console.log("Player joined event:", data);
        if (data.players) {
          setPlayers(data.players.map((p: Player) => p.name));
        }
      };

      const handlePlayerLeft = (data: PlayerLeftData) => {
        console.log("Player left event:", data);
        if (data.players) {
          setPlayers(data.players.map((p: Player) => p.name));
        }
      };

      const handleGameStarted = (data: GameStartedData) => {
        console.log("Game started event:", data);
        if (data.players) {
          setPlayers(data.players.map((p: Player) => p.name));
        }
      };

      const handleGameRestarted = (data: GameStartedData) => {
        console.log("Game restarted event:", data);
        if (data.players) {
          setPlayers(data.players.map((p: Player) => p.name));
        }
        // Reset và start lại game
        resetGame();
        startGame();
      };

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
      gameService.onRoomJoined = handleRoomJoined;
      gameService.onPlayerJoined = handlePlayerJoined;
      gameService.onPlayerLeft = handlePlayerLeft;
      gameService.onGameStarted = handleGameStarted;
      gameService.onGameRestarted = handleGameRestarted;
      gameService.onGamePaused = handleGamePaused;
      gameService.onGameResumed = handleGameResumed;
      gameService.onPlayerGameOver = handlePlayerGameOver;
      // Không set handlers cho game_winner và game_ended vì useGameLogic đã quản lý

      // Cleanup function
      return () => {
        gameService.onRoomJoined = undefined;
        gameService.onPlayerJoined = undefined;
        gameService.onPlayerLeft = undefined;
        gameService.onGameStarted = undefined;
        gameService.onGameRestarted = undefined;
        gameService.onGamePaused = undefined;
        gameService.onGameResumed = undefined;
        gameService.onPlayerGameOver = undefined;
        gameService.onGameWinner = undefined;
        gameService.onGameEnded = undefined;
      };
    }
  }, [roomCode, roomId, playerName]);

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

  const handleCopyRoomCode = async () => {
    const codeToShare = roomCode || roomId;
    if (codeToShare) {
      try {
        await navigator.clipboard.writeText(codeToShare);
        console.log("Room code copied:", codeToShare);
      } catch (error) {
        console.error("Failed to copy room code:", error);
      }
    }
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
            Joining Room {roomId}...
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
                  onPlayAgain={() => gameService.restartGame()}
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
              onMoveLeftRelease={() => handleVirtualControlRelease("moveLeft")}
              onMoveRightRelease={() =>
                handleVirtualControlRelease("moveRight")
              }
              onMoveDownRelease={() => handleVirtualControlRelease("softDrop")}
              onRotateRelease={() => handleVirtualControlRelease("rotate")}
              onHardDropRelease={() => handleVirtualControlRelease("hardDrop")}
              onHoldRelease={() => handleVirtualControlRelease("hold")}
            />

            {/* Mobile Sidebar Popup */}
            <MobileSidebarPopup
              open={mobileSidebarOpen}
              onClose={() => setMobileSidebarOpen(false)}
              roomCode={roomCode}
              roomId={roomId}
              players={players}
              playerName={playerName}
              gameBoard={gameBoard}
              gameWinner={gameWinner}
              onCopyRoomCode={handleCopyRoomCode}
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
                onPlayAgain={() => gameService.restartGame()}
                onLeaveRoom={handleGoHome}
              />

              <WinnerPopup
                isVisible={
                  gameWinner.hasWinner && gameWinner.winner?.name === playerName
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
              roomId={roomId}
              players={players}
              playerName={playerName}
              gameBoard={gameBoard}
              gameWinner={gameWinner}
              onCopyRoomCode={handleCopyRoomCode}
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
      </Container>
    </Box>
  );
};

export default RoomPage;
