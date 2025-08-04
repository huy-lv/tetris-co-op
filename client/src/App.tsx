import React from "react";
import {
  Box,
  Container,
  Stack,
  Paper,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import { PauseRounded } from "@mui/icons-material";
import { GAME_STATES } from "./constants";
import { useGameLogic } from "./hooks/useGameLogic";
import WelcomeScreen from "./components/WelcomeScreen";
import WaitingRoom from "./components/WaitingRoom";
import GameBoard from "./components/GameBoard";
import GameInfo from "./components/GameInfo";
import GameOverScreen from "./components/GameOverScreen";

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

const App: React.FC = () => {
  const { gameBoard, playerName, startGame, resetGame, createRoom } =
    useGameLogic();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleBackToWelcome = () => {
    resetGame();
  };

  const renderGameContent = () => {
    const { gameState } = gameBoard;

    if (gameState === GAME_STATES.WELCOME) {
      return <WelcomeScreen onCreateRoom={createRoom} />;
    }

    if (gameState === GAME_STATES.WAITING) {
      return <WaitingRoom playerName={playerName} onStartGame={startGame} />;
    }

    if (gameState === GAME_STATES.GAME_OVER) {
      return (
        <GameOverScreen
          score={gameBoard.score}
          lines={gameBoard.lines}
          level={gameBoard.level}
          onRestart={startGame}
          onBackToWelcome={handleBackToWelcome}
        />
      );
    }

    // Playing or Paused state
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={4}
          alignItems={isMobile ? "center" : "flex-start"}
          justifyContent="center"
        >
          <Box position="relative">
            <GameBoard
              grid={gameBoard.grid}
              activePiece={gameBoard.activePiece}
            />

            {gameState === GAME_STATES.PAUSED && (
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
          </Box>

          <GameInfo
            score={gameBoard.score}
            lines={gameBoard.lines}
            level={gameBoard.level}
            nextPiece={gameBoard.nextPiece}
          />
        </Stack>

        <Box mt={4}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              background: "rgba(26, 26, 26, 0.9)",
              border: "1px solid rgba(0, 170, 255, 0.2)",
            }}
          >
            <Typography
              variant="h5"
              component="h4"
              textAlign="center"
              color="primary.light"
              gutterBottom
            >
              🎮 Game Controls
            </Typography>

            <Stack
              direction={isMobile ? "column" : "row"}
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              {[
                { keys: "W A S D", action: "Move pieces" },
                { keys: "N", action: "Rotate" },
                { keys: "J", action: "Hard Drop" },
              ].map((control, index) => (
                <Chip
                  key={index}
                  label={`${control.keys} - ${control.action}`}
                  variant="outlined"
                  color="primary"
                  sx={{
                    fontSize: "1rem",
                    py: 1,
                    px: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(0, 170, 255, 0.1)",
                      transform: "translateY(-2px)",
                    },
                  }}
                />
              ))}
            </Stack>
          </Paper>
        </Box>
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
