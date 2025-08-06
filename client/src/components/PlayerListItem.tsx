import React from "react";
import { ListItem, ListItemText, Avatar, Box } from "@mui/material";
import { FiberManualRecord } from "@mui/icons-material";
import gameService from "../services/gameService";

// CSS for blink animation
const blinkKeyframes = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
`;

// Inject CSS
const style = document.createElement("style");
style.textContent = blinkKeyframes;
document.head.appendChild(style);

interface PlayerListItemProps {
  playerName: string;
  isCurrentPlayer: boolean;
  showAvatar?: boolean;
}

const PlayerListItem: React.FC<PlayerListItemProps> = ({
  playerName,
  isCurrentPlayer,
  showAvatar = true,
}) => {
  const isConnected = gameService.isConnected();
  const isReconnecting = gameService.getReconnectingStatus();

  // Determine connection status color
  const getConnectionColor = () => {
    if (isConnected) return "success.main"; // 🟢 Xanh - Connected
    if (isReconnecting) return "warning.main"; // 🟡 Vàng - Reconnecting
    return "error.main"; // 🔴 Đỏ - Disconnected
  };

  return (
    <ListItem
      dense
      sx={{
        py: 0.5,
        px: 1,
        borderRadius: 1,
        mb: 0.5,
        background: isCurrentPlayer
          ? "rgba(0, 170, 255, 0.1)"
          : "rgba(255, 255, 255, 0.05)",
        border: isCurrentPlayer
          ? "1px solid rgba(0, 170, 255, 0.3)"
          : "1px solid transparent",
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}
      >
        <FiberManualRecord
          sx={{
            fontSize: 12,
            color: getConnectionColor(),
            animation: "blink 1s ease-in-out infinite",
          }}
        />
        {showAvatar && (
          <Avatar
            sx={{
              width: 24,
              height: 24,
              mr: 1.5,
              fontSize: "0.75rem",
              background: isCurrentPlayer
                ? "linear-gradient(45deg, #00aaff, #0088cc)"
                : "linear-gradient(45deg, #666, #888)",
            }}
          >
            {playerName.charAt(0).toUpperCase()}
          </Avatar>
        )}
        <ListItemText
          primary={isCurrentPlayer ? `${playerName} (You)` : playerName}
          primaryTypographyProps={{
            variant: "body2",
            color: isCurrentPlayer ? "primary.light" : "text.primary",
            fontWeight: isCurrentPlayer ? 600 : 400,
          }}
        />
      </Box>
    </ListItem>
  );
};

export default PlayerListItem;
