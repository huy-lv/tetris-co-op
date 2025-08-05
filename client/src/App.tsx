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
} from "@mui/material";
import { keyframes } from "@emotion/react";
import {
  PauseRounded,
  SettingsRounded,
  PlayArrowRounded,
} from "@mui/icons-material";
import { GAME_STATES } from "./constants";
import { useGameLogic } from "./hooks/useGameLogic";
import { getControlsFromStorage } from "./utils/controlsUtils";
import WelcomeScreen from "./components/WelcomeScreen";
import GameBoard from "./components/GameBoard";
import GameInfo from "./components/GameInfo";
import { BotControlPanel } from "./components/BotControlPanel";
import SettingsDialog from "./components/SettingsDialog";

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

const App: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentControls, setCurrentControls] = useState(
    getControlsFromStorage()
  );
  const { gameBoard, playerName, startGame, createRoom, pauseGame, bot } =
    useGameLogic(settingsOpen);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Update controls when settings dialog closes
  useEffect(() => {
    if (!settingsOpen) {
      setCurrentControls(getControlsFromStorage());
    }
  }, [settingsOpen]);

  const handleSettingsOpen = () => {
    // Pause game when opening settings if game is playing
    if (gameBoard.gameState === GAME_STATES.PLAYING && !gameBoard.isPaused) {
      pauseGame();
    }
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const renderGameContent = () => {
    const { gameState } = gameBoard;

    if (gameState === GAME_STATES.WELCOME) {
      return (
        <WelcomeScreen onCreateRoom={createRoom} savedPlayerName={playerName} />
      );
    }

    // WAITING, Playing, Paused, or Game Over state - show game layout
    return (
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
            />

            {gameBoard.isPaused && gameState === GAME_STATES.PLAYING && (
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

            {gameState === GAME_STATES.GAME_OVER && (
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
                  elevation={8}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    background: "rgba(26, 26, 26, 0.95)",
                    border: "2px solid rgba(255, 69, 58, 0.6)",
                    animation: `${pulseAnimation} 2s ease-in-out infinite`,
                  }}
                >
                  <Typography variant="h3" color="error.main" gutterBottom>
                    💀 GAME OVER
                  </Typography>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    Final Score: {gameBoard.score.toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Lines: {gameBoard.lines} • Level: {gameBoard.level}
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={startGame}
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      background: "linear-gradient(45deg, #00aa55, #00cc66)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #009944, #00bb55)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(0, 204, 102, 0.4)",
                      },
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    🎮 Start Again
                  </Button>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Center: Game Stats & Next Piece */}
          {gameState === GAME_STATES.PLAYING && (
            <GameInfo
              score={gameBoard.score}
              lines={gameBoard.lines}
              level={gameBoard.level}
              nextPiece={gameBoard.nextPiece}
              holdPiece={gameBoard.holdPiece}
              canHold={gameBoard.canHold}
            />
          )}

          {/* Right Side: Toolbar */}
          <Stack spacing={3} sx={{ minWidth: { xs: "100%", md: 320 } }}>
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
                color="success.main"
                gutterBottom
                textAlign="center"
              >
                👋 Welcome, {playerName}!
              </Typography>

              {gameState === GAME_STATES.WAITING && (
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  fullWidth
                  onClick={startGame}
                  sx={{
                    py: 2,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    background: "linear-gradient(45deg, #00aa55, #00cc66)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #009944, #00bb55)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0, 204, 102, 0.4)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  🎮 Start Game
                </Button>
              )}

              {gameState === GAME_STATES.PLAYING && (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                >
                  Game in progress... Good luck! 🍀
                </Typography>
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
                ⚙️ Cài đặt
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
                Mở cài đặt
              </Button>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={pauseGame}
                startIcon={
                  gameBoard.isPaused ? <PlayArrowRounded /> : <PauseRounded />
                }
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  background: gameBoard.isPaused
                    ? "linear-gradient(45deg, #00c853, #4caf50)"
                    : "linear-gradient(45deg, #2196f3, #00bcd4)",
                  "&:hover": {
                    background: gameBoard.isPaused
                      ? "linear-gradient(45deg, #00a83a, #43a047)"
                      : "linear-gradient(45deg, #1976d2, #0097a7)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {gameBoard.isPaused ? "Tiếp tục game" : "Tạm dừng game"}
              </Button>
            </Paper>

            {/* Controls Reminder */}
            <Paper
              elevation={4}
              sx={{
                p: 3,
                background: "rgba(26, 26, 26, 0.9)",
                border: "1px solid rgba(0, 170, 255, 0.2)",
              }}
            >
              <Typography
                variant="h6"
                component="h4"
                textAlign="center"
                color="primary.light"
                gutterBottom
              >
                🎮 Game Controls
              </Typography>

              <Stack
                spacing={1}
                sx={{
                  p: 2,
                  background: "rgba(0, 170, 255, 0.05)",
                  border: "1px solid rgba(0, 170, 255, 0.2)",
                  borderRadius: 2,
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "rgba(0, 170, 255, 0.1)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {[
                  {
                    keys: `${currentControls.MOVE_UP} ${currentControls.MOVE_LEFT} ${currentControls.MOVE_DOWN} ${currentControls.MOVE_RIGHT}`,
                    action: "Move pieces",
                  },
                  { keys: currentControls.ROTATE, action: "Rotate" },
                  { keys: currentControls.HARD_DROP, action: "Hard Drop" },
                  { keys: currentControls.HOLD, action: "Hold Piece" },
                ].map((control, index) => (
                  <Box key={index}>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      fontWeight={500}
                    >
                      {control.keys.toUpperCase()} - {control.action}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {gameBoard.gameState === GAME_STATES.PLAYING && (
              <BotControlPanel
                isEnabled={bot.isEnabled}
                difficulty={bot.difficulty}
                onEnabledChange={bot.setEnabled}
                onDifficultyChange={bot.setDifficulty}
                currentMove={bot.currentMove}
              />
            )}
          </Stack>
        </Stack>

        {/* Settings Dialog */}
        <SettingsDialog open={settingsOpen} onClose={handleSettingsClose} />
      </Container>
    );
  };

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
      {renderGameContent()}
    </Box>
  );
};

export default App;
