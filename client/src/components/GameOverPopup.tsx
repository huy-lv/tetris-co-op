import React from "react";
import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import { keyframes } from "@emotion/react";
import { HomeRounded } from "@mui/icons-material";
import gameService from "../services/gameService";

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

interface GameOverPopupProps {
  isVisible: boolean;
  score: number;
  lines: number;
  level: number;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
}

const GameOverPopup: React.FC<GameOverPopupProps> = ({
  isVisible,
  score,
  lines,
  level,
  onPlayAgain,
  onLeaveRoom,
}) => {
  if (!isVisible) return null;

  return (
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
        background: "rgba(0, 0, 0, 0.5)",
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
        <Typography variant="h5" color="text.primary" sx={{ mb: 2 }}>
          Final Score: {score.toLocaleString()}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Lines Cleared: {lines} | Level: {level}
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
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={onPlayAgain}
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
          onClick={onLeaveRoom}
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
  );
};

export default GameOverPopup;
