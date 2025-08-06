import React from "react";
import { Stack, Typography, IconButton } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { copyRoomLink } from "../utils/roomUtils";

interface RoomCodeDisplayProps {
  roomCode: string | null;
  height?: number;
  fontSize?: string;
}

const RoomCodeDisplay: React.FC<RoomCodeDisplayProps> = ({
  roomCode,
  height = 50,
  fontSize = "1.2rem",
}) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        width: "100%",
        height,
        background: "rgba(156, 39, 176, 0.1)",
        border: "1px solid rgba(156, 39, 176, 0.3)",
        borderRadius: 2,
        px: 2,
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(156, 39, 176, 0.4)",
          background: "rgba(156, 39, 176, 0.15)",
        },
        transition: "all 0.3s ease-in-out",
      }}
      onClick={copyRoomLink}
    >
      <Typography
        variant="body1"
        sx={{
          flexGrow: 1,
          fontSize,
          fontWeight: "bold",
          color: "secondary.main",
        }}
      >
        Room code: {roomCode || "Loading..."}
      </Typography>
      <IconButton
        size="small"
        sx={{
          color: "secondary.main",
          "&:hover": {
            background: "rgba(156, 39, 176, 0.2)",
          },
        }}
      >
        <ContentCopy />
      </IconButton>
    </Stack>
  );
};

export default RoomCodeDisplay;
