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
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import {
  PauseRounded,
  SettingsRounded,
  PlayArrowRounded,
  ContentCopy as CopyIcon,
  HomeRounded,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { GAME_STATES } from "../constants";
import { useGameLogic } from "../hooks/useGameLogic";
import { useRoomNavigation } from "../hooks/useRoomNavigation";
import { getControlsFromStorage } from "../utils/controlsUtils";
import GameBoard from "../components/GameBoard";
import GameInfo from "../components/GameInfo";
import SettingsDialog from "../components/SettingsDialog";
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

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

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

            {gameBoard.gameState === GAME_STATES.PAUSED && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  background: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 3,
                  zIndex: 1000,
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    background: "rgba(26, 26, 26, 0.95)",
                    border: "2px solid rgba(255, 170, 0, 0.5)",
                    animation: `${pulseAnimation} 2s ease-in-out infinite`,
                  }}
                >
                  <PauseRounded
                    sx={{
                      fontSize: 48,
                      color: "warning.main",
                      mb: 2,
                    }}
                  />
                  <Typography variant="h4" color="warning.main" gutterBottom>
                    PAUSED
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Press any movement key to resume
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Game Over Popup - chỉ hiện cho người thua hoặc single player game over */}
            {gameBoard.gameState === GAME_STATES.GAME_OVER &&
              !(
                gameWinner.hasWinner && gameWinner.winner?.name === playerName
              ) && (
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    background: "rgba(0, 0, 0, 0.9)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 3,
                    zIndex: 1000,
                  }}
                >
                  <Paper
                    elevation={12}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      background: "rgba(26, 26, 26, 0.95)",
                      border: "2px solid rgba(244, 67, 54, 0.5)",
                      animation: `${pulseAnimation} 2s ease-in-out infinite`,
                    }}
                  >
                    <Typography
                      variant="h3"
                      color="error.main"
                      gutterBottom
                      sx={{ fontWeight: "bold" }}
                    >
                      GAME OVER
                    </Typography>
                    <Typography
                      variant="h5"
                      color="text.primary"
                      sx={{ mb: 2 }}
                    >
                      Final Score: {gameBoard.score.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Lines Cleared: {gameBoard.lines} | Level:{" "}
                      {gameBoard.level}
                    </Typography>

                    {/* Multiplayer context - không hiện Play Again nếu đang multiplayer */}
                    {gameService.isMultiplayer() ? (
                      <Typography
                        variant="body1"
                        color="info.main"
                        sx={{ mb: 3, fontStyle: "italic" }}
                      >
                        🎮 Waiting for other players to finish...
                      </Typography>
                    ) : (
                      <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="center"
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          onClick={() => window.location.reload()}
                          sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: "1.1rem",
                            fontWeight: 600,
                          }}
                        >
                          Play Again
                        </Button>
                      </Stack>
                    )}

                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleGoHome}
                      startIcon={<HomeRounded />}
                      sx={{
                        px: 4,
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        mt: gameService.isMultiplayer() ? 0 : 2,
                      }}
                    >
                      Leave Room
                    </Button>
                  </Paper>
                </Box>
              )}

            {/* Game Winner Popup - chỉ che game board và chỉ hiện cho người thắng */}
            {gameWinner.hasWinner && gameWinner.winner?.name === playerName && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  background: "rgba(0, 0, 0, 0.9)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 3,
                  zIndex: 2000,
                }}
              >
                <Paper
                  elevation={16}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    background: "rgba(26, 26, 26, 0.95)",
                    border: "3px solid rgba(0, 204, 102, 0.8)",
                    borderRadius: 3,
                    maxWidth: 400,
                    maxHeight: "90%",
                    overflow: "auto",
                    animation: `${pulseAnimation} 2s ease-in-out infinite`,
                  }}
                >
                  <Typography
                    variant="h3"
                    color="success.main"
                    gutterBottom
                    sx={{ fontWeight: "bold", mb: 2 }}
                  >
                    🏆 YOU WIN!
                  </Typography>

                  <Typography
                    variant="h5"
                    color="text.primary"
                    gutterBottom
                    sx={{ mb: 2 }}
                  >
                    {gameWinner.winner?.name}
                  </Typography>

                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Final Score: {gameWinner.winner?.score?.toLocaleString()}
                  </Typography>

                  {/* Final Scores Table */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      gutterBottom
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      📊 Final Rankings
                    </Typography>
                    <Box
                      sx={{
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: 2,
                        p: 1.5,
                      }}
                    >
                      {gameWinner.finalScores?.map(
                        (player: Player, index: number) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              py: 0.5,
                              px: 1.5,
                              mb: 0.5,
                              borderRadius: 1,
                              background:
                                player.name === playerName
                                  ? "rgba(0, 170, 255, 0.1)"
                                  : index === 0
                                  ? "rgba(255, 193, 7, 0.1)"
                                  : "rgba(255, 255, 255, 0.02)",
                              border:
                                player.name === playerName
                                  ? "1px solid rgba(0, 170, 255, 0.3)"
                                  : index === 0
                                  ? "1px solid rgba(255, 193, 7, 0.3)"
                                  : "1px solid transparent",
                            }}
                          >
                            <Typography
                              variant="body2"
                              color={
                                player.name === playerName
                                  ? "primary.light"
                                  : "text.primary"
                              }
                              sx={{ fontWeight: index === 0 ? 600 : 400 }}
                            >
                              {index === 0
                                ? "🥇"
                                : index === 1
                                ? "🥈"
                                : index === 2
                                ? "🥉"
                                : `${index + 1}.`}{" "}
                              {player.name}{" "}
                              {player.name === playerName ? "(You)" : ""}
                            </Typography>
                            <Typography
                              variant="body2"
                              color={
                                index === 0 ? "warning.main" : "text.secondary"
                              }
                              sx={{ fontWeight: index === 0 ? 600 : 400 }}
                            >
                              {player.score?.toLocaleString()}
                            </Typography>
                          </Box>
                        )
                      )}
                    </Box>
                  </Box>

                  <Button
                    variant="contained"
                    size="medium"
                    onClick={handleGoHome}
                    startIcon={<HomeRounded />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      background: "linear-gradient(45deg, #00c853, #00e676)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #00b248, #00c853)",
                      },
                    }}
                  >
                    Return to Home
                  </Button>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Multiplayer Game Over Notification */}
          {multiplayerGameOver.isGameOver && (
            <Box
              position="fixed"
              top={20}
              right={20}
              sx={{
                zIndex: 1500,
                animation: `${pulseAnimation} 2s ease-in-out infinite`,
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  p: 3,
                  background: "rgba(244, 67, 54, 0.95)",
                  border: "2px solid rgba(244, 67, 54, 0.8)",
                  borderRadius: 2,
                  minWidth: 300,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography
                  variant="h6"
                  color="white"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  💀 {multiplayerGameOver.playerName} Game Over!
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Final Score:{" "}
                  {multiplayerGameOver.finalScore?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.9)">
                  Players Remaining: {multiplayerGameOver.playersRemaining}/
                  {multiplayerGameOver.totalPlayers}
                </Typography>
              </Paper>
            </Box>
          )}

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
          <Stack spacing={3} sx={{ minWidth: { xs: "100%", md: 320 } }}>
            {/* Room Code Panel */}
            <Paper
              elevation={4}
              sx={{
                p: 3,
                background: "rgba(26, 26, 26, 0.9)",
                border: "1px solid rgba(156, 39, 176, 0.3)",
              }}
            >
              <Typography
                variant="h6"
                component="h4"
                textAlign="center"
                color="secondary.light"
                gutterBottom
              >
                🏠 Room Code
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Chip
                  label={roomCode || roomId || "Loading..."}
                  color="secondary"
                  sx={{
                    fontSize: "1.2rem",
                    fontWeight: "bold",
                    flexGrow: 1,
                    height: 40,
                  }}
                />
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCopyRoomCode}
                  startIcon={<CopyIcon />}
                  sx={{ minWidth: "auto", px: 2 }}
                >
                  Copy
                </Button>
              </Box>

              {/* Players List */}
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ mb: 1, fontWeight: 600 }}
                >
                  Players ({players.length}/8):
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {players.map((player, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        mb: 0.5,
                        background:
                          player === playerName
                            ? "rgba(0, 170, 255, 0.1)"
                            : "rgba(255, 255, 255, 0.05)",
                        border:
                          player === playerName
                            ? "1px solid rgba(0, 170, 255, 0.3)"
                            : "1px solid transparent",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          mr: 1.5,
                          fontSize: "0.75rem",
                          background:
                            player === playerName
                              ? "linear-gradient(45deg, #00aaff, #0088cc)"
                              : "linear-gradient(45deg, #666, #888)",
                        }}
                      >
                        {player.charAt(0).toUpperCase()}
                      </Avatar>
                      <ListItemText
                        primary={
                          player === playerName ? `${player} (You)` : player
                        }
                        primaryTypographyProps={{
                          variant: "body2",
                          color:
                            player === playerName
                              ? "primary.light"
                              : "text.primary",
                          fontWeight: player === playerName ? 600 : 400,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
                {players.length < 8 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    Share room code to invite more players
                  </Typography>
                )}
              </Box>

              {gameService.isMultiplayer() && (
                <Chip
                  label="🟢 Multiplayer Active"
                  color="success"
                  size="small"
                  sx={{ mt: 1, width: "100%" }}
                />
              )}
            </Paper>

            {/* Player Info & Start Game */}
            <Paper
              elevation={6}
              sx={{
                p: 3,
                background: "rgba(26, 26, 26, 0.95)",
                border: "1px solid rgba(0, 204, 102, 0.3)",
              }}
            >
              <Typography
                variant="h5"
                component="h3"
                textAlign="center"
                color="success.light"
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                👋 Hello, {playerName}!
              </Typography>

              {gameBoard.gameState === GAME_STATES.WAITING && (
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  size="large"
                  onClick={startGame}
                  startIcon={<PlayArrowRounded />}
                  sx={{
                    py: 2,
                    mb: 2,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    background: "linear-gradient(45deg, #00c853, #00e676)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #00b248, #00c853)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0, 200, 83, 0.4)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  Start Game
                </Button>
              )}

              {(gameBoard.gameState === GAME_STATES.PLAYING ||
                gameBoard.gameState === GAME_STATES.PAUSED) && (
                <Button
                  variant="contained"
                  color={
                    gameBoard.gameState === GAME_STATES.PAUSED
                      ? "success"
                      : "warning"
                  }
                  fullWidth
                  size="large"
                  onClick={pauseGame}
                  startIcon={
                    gameBoard.gameState === GAME_STATES.PAUSED ? (
                      <PlayArrowRounded />
                    ) : (
                      <PauseRounded />
                    )
                  }
                  sx={{
                    py: 2,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    background:
                      gameBoard.gameState === GAME_STATES.PAUSED
                        ? "linear-gradient(45deg, #00c853, #00e676)"
                        : "linear-gradient(45deg, #ff8f00, #ffab00)",
                    "&:hover": {
                      background:
                        gameBoard.gameState === GAME_STATES.PAUSED
                          ? "linear-gradient(45deg, #00b248, #00c853)"
                          : "linear-gradient(45deg, #e68900, #ff9500)",
                      transform: "translateY(-2px)",
                      boxShadow:
                        gameBoard.gameState === GAME_STATES.PAUSED
                          ? "0 8px 25px rgba(0, 200, 83, 0.4)"
                          : "0 8px 25px rgba(255, 171, 0, 0.4)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  {gameBoard.gameState === GAME_STATES.PAUSED
                    ? "Resume Game"
                    : "Pause Game"}
                </Button>
              )}

              {/* Leave Room Button - Chỉ hiển thị khi không đang chơi game */}
              {gameBoard.gameState !== GAME_STATES.PLAYING &&
                gameBoard.gameState !== GAME_STATES.PAUSED && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleGoHome}
                    startIcon={<HomeRounded />}
                    sx={{
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(100, 100, 100, 0.2)",
                      },
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    Leave Room
                  </Button>
                )}
            </Paper>

            {/* Settings Button */}
            <Paper
              elevation={4}
              sx={{
                p: 3,
                background: "rgba(26, 26, 26, 0.9)",
                border: "1px solid rgba(255, 170, 0, 0.2)",
              }}
            >
              <Typography
                variant="h6"
                component="h4"
                textAlign="center"
                color="warning.light"
                gutterBottom
              >
                ⚙️ Settings
              </Typography>

              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={handleSettingsOpen}
                startIcon={<SettingsRounded />}
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: "linear-gradient(45deg, #ff8f00, #ffab00)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #e68900, #ff9500)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(255, 171, 0, 0.4)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Open Settings
              </Button>
            </Paper>
          </Stack>
        </Stack>

        {/* Settings Dialog */}
        <SettingsDialog open={settingsOpen} onClose={handleSettingsClose} />
      </Container>
    </Box>
  );
};

export default RoomPage;
