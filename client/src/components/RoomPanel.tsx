import React from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  PlayArrow as PlayIcon,
  ExitToApp as LeaveIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

const RoomPanel: React.FC = () => {
  // TODO: Replace with actual room data
  const state = {
    currentRoom: null,
    playerName: "",
    isHost: false,
  };

  const startGame = () => {
    console.log("Start game clicked");
  };

  const leaveRoom = () => {
    console.log("Leave room clicked");
  };

  const handleCopyRoomCode = async (): Promise<void> => {
    if (state.currentRoom?.roomCode) {
      try {
        await navigator.clipboard.writeText(state.currentRoom.roomCode);
        // Could add a toast notification here
      } catch (error) {
        console.error("Failed to copy room code:", error);
      }
    }
  };

  const getGameStateText = (): string => {
    switch (state.currentRoom?.gameState) {
      case "waiting":
        return "Waiting for players";
      case "playing":
        return "Game in progress";
      case "finished":
        return "Game finished";
      default:
        return "Unknown";
    }
  };

  const getGameStateColor = ():
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    switch (state.currentRoom?.gameState) {
      case "waiting":
        return "warning";
      case "playing":
        return "success";
      case "finished":
        return "default";
      default:
        return "default";
    }
  };

  const canStartGame = (): boolean => {
    return (
      state.isHost &&
      state.currentRoom?.gameState === "waiting" &&
      (state.currentRoom?.players.length ?? 0) >= 2
    );
  };

  if (!state.currentRoom) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, minWidth: 300 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Room: {state.currentRoom.roomCode}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Button
            size="small"
            startIcon={<CopyIcon />}
            onClick={handleCopyRoomCode}
            variant="outlined"
          >
            Copy Code
          </Button>
          <Chip
            label={getGameStateText()}
            color={getGameStateColor()}
            size="small"
          />
        </Box>
        {state.isHost && (
          <Typography variant="body2" color="primary">
            🏠 You are the host
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Players ({state.currentRoom.players.length}/4)
        </Typography>
        <List dense>
          {state.currentRoom.players.map((player, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
              <ListItemText
                primary={player.name}
                secondary={
                  player.gameState
                    ? `Score: ${player.gameState.score} | Lines: ${player.gameState.lines}`
                    : "Waiting..."
                }
              />
              {player.name === state.playerName && (
                <Chip label="You" size="small" color="primary" />
              )}
            </ListItem>
          ))}
        </List>
      </Box>

      {state.gameRankings && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Final Rankings
            </Typography>
            <List dense>
              {state.gameRankings.map((player, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <Typography variant="h6" sx={{ mr: 2, minWidth: 30 }}>
                    #{index + 1}
                  </Typography>
                  <ListItemText
                    primary={player.name}
                    secondary={`Score: ${player.gameState?.score ?? 0}`}
                  />
                  {index === 0 && (
                    <Chip label="🏆 Winner" size="small" color="success" />
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
        {canStartGame() && (
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={startGame}
            fullWidth
          >
            Start Game
          </Button>
        )}

        {!canStartGame() && state.currentRoom.gameState === "waiting" && (
          <Alert severity="info" sx={{ mb: 1 }}>
            {state.isHost
              ? "Need at least 2 players to start the game"
              : "Waiting for host to start the game"}
          </Alert>
        )}

        <Button
          variant="outlined"
          startIcon={<LeaveIcon />}
          onClick={leaveRoom}
          fullWidth
          color="error"
        >
          Leave Room
        </Button>
      </Box>
    </Paper>
  );
};

export default RoomPanel;
