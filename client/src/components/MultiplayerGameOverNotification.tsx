import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { keyframes } from "@emotion/react";
import { MultiplayerGameOverState } from "../types";

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

interface MultiplayerGameOverNotificationProps {
  multiplayerGameOver: MultiplayerGameOverState;
}

const MultiplayerGameOverNotification: React.FC<
  MultiplayerGameOverNotificationProps
> = ({ multiplayerGameOver }) => {
  return multiplayerGameOver.isGameOver ? (
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
          Final Score: {multiplayerGameOver.finalScore?.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.9)">
          Players Remaining: {multiplayerGameOver.playersRemaining}/
          {multiplayerGameOver.totalPlayers}
        </Typography>
      </Paper>
    </Box>
  ) : null;
};

export default MultiplayerGameOverNotification;
