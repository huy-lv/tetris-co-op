import React from "react";
import {
  Stack,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  PlayArrowRounded,
  PauseRounded,
  HomeRounded,
  SettingsRounded,
} from "@mui/icons-material";
import { GAME_STATES } from "../constants";
import { gameService } from "../services/gameService";

interface RoomSidebarProps {
  roomCode: string | null;
  roomId: string | null;
  players: string[];
  playerName: string;
  gameBoard: {
    gameState: string;
  };
  gameWinner: {
    hasWinner: boolean;
    winner?: { name: string } | null;
  };
  onCopyRoomCode: () => void;
  onStartGame: () => void;
  onPauseGame: () => void;
  onGoHome: () => void;
  onSettingsOpen: () => void;
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({
  roomCode,
  roomId,
  players,
  playerName,
  gameBoard,
  gameWinner,
  onCopyRoomCode,
  onStartGame,
  onPauseGame,
  onGoHome,
  onSettingsOpen,
}) => {
  return (
    <Stack spacing={3} sx={{ minWidth: { xs: "100%", md: 320 } }}>
      {/* Room Code Panel */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          background: "rgba(26, 26, 26, 0.9)",
          border: "1px solid rgba(156, 39, 176, 0.3)",
        }}
      >
        <Typography
          variant="h6"
          component="h4"
          textAlign="center"
          color="secondary.light"
          gutterBottom
        >
          🏠 Room Code
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Chip
            label={roomCode || roomId || "Loading..."}
            color="secondary"
            sx={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              flexGrow: 1,
              height: 40,
            }}
          />
          <Button
            variant="outlined"
            color="secondary"
            onClick={onCopyRoomCode}
            startIcon={<CopyIcon />}
            sx={{ minWidth: "auto", px: 2 }}
          >
            Copy
          </Button>
        </Box>

        {/* Players List */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="body2"
            color="text.primary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            Players ({players.length}/8):
          </Typography>
          <List dense sx={{ py: 0 }}>
            {players.map((player, index) => (
              <ListItem
                key={index}
                sx={{
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  background:
                    player === playerName
                      ? "rgba(0, 170, 255, 0.1)"
                      : "rgba(255, 255, 255, 0.05)",
                  border:
                    player === playerName
                      ? "1px solid rgba(0, 170, 255, 0.3)"
                      : "1px solid transparent",
                }}
              >
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    mr: 1.5,
                    fontSize: "0.75rem",
                    background:
                      player === playerName
                        ? "linear-gradient(45deg, #00aaff, #0088cc)"
                        : "linear-gradient(45deg, #666, #888)",
                  }}
                >
                  {player.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={player === playerName ? `${player} (You)` : player}
                  primaryTypographyProps={{
                    variant: "body2",
                    color:
                      player === playerName ? "primary.light" : "text.primary",
                    fontWeight: player === playerName ? 600 : 400,
                  }}
                />
              </ListItem>
            ))}
          </List>
          {players.length < 8 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontStyle: "italic" }}
            >
              Share room code to invite more players
            </Typography>
          )}
        </Box>
      </Paper>

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
          component="h3"
          textAlign="center"
          color="success.light"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          👋 Hello, {playerName}!
        </Typography>

        {gameBoard.gameState === GAME_STATES.WAITING && (
          <Button
            variant="contained"
            color="success"
            fullWidth
            size="large"
            onClick={onStartGame}
            startIcon={<PlayArrowRounded />}
            sx={{
              py: 2,
              mb: 2,
              fontSize: "1.2rem",
              fontWeight: 600,
              background: "linear-gradient(45deg, #00c853, #00e676)",
              "&:hover": {
                background: "linear-gradient(45deg, #00b248, #00c853)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(0, 200, 83, 0.4)",
              },
              transition: "all 0.3s ease-in-out",
            }}
          >
            Start Game
          </Button>
        )}

        {(gameBoard.gameState === GAME_STATES.PLAYING ||
          gameBoard.gameState === GAME_STATES.PAUSED) && (
          <Button
            variant="contained"
            color={
              gameBoard.gameState === GAME_STATES.PAUSED ? "success" : "warning"
            }
            fullWidth
            size="large"
            onClick={onPauseGame}
            disabled={
              gameWinner.hasWinner && gameWinner.winner?.name === playerName
            }
            startIcon={
              gameBoard.gameState === GAME_STATES.PAUSED ? (
                <PlayArrowRounded />
              ) : (
                <PauseRounded />
              )
            }
            sx={{
              py: 2,
              fontSize: "1.2rem",
              fontWeight: 600,
              background:
                gameBoard.gameState === GAME_STATES.PAUSED
                  ? "linear-gradient(45deg, #00c853, #00e676)"
                  : "linear-gradient(45deg, #ff8f00, #ffab00)",
              "&:hover":
                !gameWinner.hasWinner || gameWinner.winner?.name !== playerName
                  ? {
                      background:
                        gameBoard.gameState === GAME_STATES.PAUSED
                          ? "linear-gradient(45deg, #00b248, #00c853)"
                          : "linear-gradient(45deg, #e68900, #ff9500)",
                      transform: "translateY(-2px)",
                      boxShadow:
                        gameBoard.gameState === GAME_STATES.PAUSED
                          ? "0 8px 25px rgba(0, 200, 83, 0.4)"
                          : "0 8px 25px rgba(255, 171, 0, 0.4)",
                    }
                  : {},
              "&:disabled": {
                background: "rgba(128, 128, 128, 0.3)",
                color: "rgba(255, 255, 255, 0.3)",
              },
              transition: "all 0.3s ease-in-out",
            }}
          >
            {gameBoard.gameState === GAME_STATES.PAUSED
              ? "Resume Game"
              : "Pause Game"}
          </Button>
        )}

        {/* Leave Room Button - Chỉ hiển thị khi không đang chơi game */}
        {gameBoard.gameState !== GAME_STATES.PLAYING &&
          gameBoard.gameState !== GAME_STATES.PAUSED && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onGoHome}
              startIcon={<HomeRounded />}
              sx={{
                py: 1.5,
                fontSize: "1rem",
                fontWeight: 600,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(100, 100, 100, 0.2)",
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              Leave Room
            </Button>
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
          ⚙️ Settings
        </Typography>

        <Button
          variant="contained"
          color="warning"
          fullWidth
          onClick={onSettingsOpen}
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
          Open Settings
        </Button>
      </Paper>
    </Stack>
  );
};

export default RoomSidebar;
