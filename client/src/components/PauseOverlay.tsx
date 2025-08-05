import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { keyframes } from "@emotion/react";
import { PauseRounded } from "@mui/icons-material";

const pulseAnimation = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

interface PauseOverlayProps {
  isVisible: boolean;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ isVisible }) => {
  return isVisible ? (
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
  ) : null;
};

export default PauseOverlay;
