import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { HomeRounded } from "@mui/icons-material";
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
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [multiplayerGameOver, setMultiplayerGameOver] =
    useState<MultiplayerGameOverState>({ isGameOver: false });
  const { gameBoard, gameWinner, playerName, startGame, pauseGame } =
    useGameLogic(settingsOpen);
  const { roomId, isJoiningRoom, roomError } = useRoomNavigation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
      gameService.onPlayerGameOver = handlePlayerGameOver;
      // Không set handlers cho game_winner và game_ended vì useGameLogic đã quản lý

      // Cleanup function
      return () => {
        gameService.onRoomJoined = undefined;
        gameService.onPlayerJoined = undefined;
        gameService.onPlayerLeft = undefined;
        gameService.onGameStarted = undefined;
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
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={4}
          alignItems={isMobile ? "center" : "flex-start"}
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

            {/* Game Over Popup - chỉ hiện cho người thua hoặc single player game over */}
            <GameOverPopup
              isVisible={
                gameBoard.gameState === GAME_STATES.GAME_OVER &&
                !(
                  gameWinner.hasWinner && gameWinner.winner?.name === playerName
                )
              }
              score={gameBoard.score}
              lines={gameBoard.lines}
              level={gameBoard.level}
              onPlayAgain={() => window.location.reload()}
              onLeaveRoom={handleGoHome}
            />

            {/* Game Winner Popup - chỉ che game board và chỉ hiện cho người thắng */}
            <WinnerPopup
              isVisible={
                gameWinner.hasWinner && gameWinner.winner?.name === playerName
              }
              winner={gameWinner.winner}
              finalScores={gameWinner.finalScores}
              playerName={playerName}
              onPlayAgain={() => window.location.reload()}
            />
          </Box>

          {/* Multiplayer Game Over Notification */}
          <MultiplayerGameOverNotification
            multiplayerGameOver={multiplayerGameOver}
          />

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
            onPauseGame={pauseGame}
            onGoHome={handleGoHome}
            onSettingsOpen={handleSettingsOpen}
          />
        </Stack>

        {/* Settings Dialog */}
        <SettingsDialog open={settingsOpen} onClose={handleSettingsClose} />
      </Container>
    </Box>
  );
};

export default RoomPage;
