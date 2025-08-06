import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { keyframes } from "@emotion/react";
import { PlayArrowRounded } from "@mui/icons-material";
import { Player } from "../types";

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

interface WinnerPopupProps {
  isVisible: boolean;
  winner: Player | null;
  finalScores: Player[];
  playerName: string;
  onPlayAgain: () => void;
}

const WinnerPopup: React.FC<WinnerPopupProps> = ({
  isVisible,
  winner,
  finalScores,
  playerName,
  onPlayAgain,
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
          {winner?.name}
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Final Score: {winner?.score?.toLocaleString()}
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
            {finalScores?.map((player: Player, index: number) => (
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
                  {player.name} {player.name === playerName ? "(You)" : ""}
                </Typography>
                <Typography
                  variant="body2"
                  color={index === 0 ? "warning.main" : "text.secondary"}
                  sx={{ fontWeight: index === 0 ? 600 : 400 }}
                >
                  {player.score?.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Button
          variant="contained"
          size="medium"
          onClick={onPlayAgain}
          startIcon={<PlayArrowRounded />}
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
          Play Again
        </Button>
      </Paper>
    </Box>
  );
};

export default WinnerPopup;
