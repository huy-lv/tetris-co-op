import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Wifi, WifiOff, Sync } from "@mui/icons-material";
import { socketService } from "../services/socketService";

// CSS for spin animation
const spinKeyframes = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Inject CSS
const style = document.createElement("style");
style.textContent = spinKeyframes;
document.head.appendChild(style);

const ConnectionStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.isConnected());
      setIsReconnecting(socketService.getReconnectingStatus());
    };

    // Check initial status
    checkConnection();

    // Set up interval to check connection status
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  if (isConnected) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 1,
          background: "rgba(76, 175, 80, 0.9)",
          color: "white",
          px: 2,
          py: 1,
          borderRadius: 2,
          fontSize: "0.875rem",
          fontWeight: 500,
          zIndex: 1000,
        }}
      >
        <Wifi sx={{ fontSize: 16 }} />
        <Typography variant="caption">Đã kết nối</Typography>
      </Box>
    );
  }

  if (isReconnecting) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 1,
          background: "rgba(255, 193, 7, 0.9)",
          color: "white",
          px: 2,
          py: 1,
          borderRadius: 2,
          fontSize: "0.875rem",
          fontWeight: 500,
          zIndex: 1000,
        }}
      >
        <Sync sx={{ fontSize: 16, animation: "spin 1s linear infinite" }} />
        <Typography variant="caption">Đang kết nối lại...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        display: "flex",
        alignItems: "center",
        gap: 1,
        background: "rgba(244, 67, 54, 0.9)",
        color: "white",
        px: 2,
        py: 1,
        borderRadius: 2,
        fontSize: "0.875rem",
        fontWeight: 500,
        zIndex: 1000,
      }}
    >
      <WifiOff sx={{ fontSize: 16 }} />
      <Typography variant="caption">Mất kết nối</Typography>
    </Box>
  );
};

export default ConnectionStatus;
