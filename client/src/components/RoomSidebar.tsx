import React from "react";
import { Stack, Paper, Typography, Box, Button, List } from "@mui/material";
import {
  PlayArrowRounded,
  PauseRounded,
  HomeRounded,
  SettingsRounded,
} from "@mui/icons-material";
import RoomCodeDisplay from "./RoomCodeDisplay";
import PlayerListItem from "./PlayerListItem";
import { GAME_STATES } from "../constants";

// Common button styles

const getButtonStyles = {
  py: 2,
  fontSize: "1rem",
  fontWeight: 600,
  "&:hover": {
    transform: "translateY(-2px)",
  },
  "&:disabled": {
    background: "rgba(128, 128, 128, 0.3)",
    color: "rgba(255, 255, 255, 0.3)",
  },
  transition: "all 0.3s ease-in-out",
  mb: 2,
};

const getOutlinedButtonStyles = {
  minWidth: "auto",
  py: 2,
  fontSize: "1rem",
  fontWeight: 600,
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(100, 100, 100, 0.2)",
  },
  transition: "all 0.3s ease-in-out",
  mb: 2,
};

interface RoomSidebarProps {
  roomCode: string | null;
  players: string[];
  playerName: string;
  gameBoard: {
    gameState: string;
  };
  gameWinner: {
    hasWinner: boolean;
    winner?: { name: string } | null;
  };
  onStartGame: () => void;
  onPauseGame: () => void;
  onGoHome: () => void;
  onSettingsOpen: () => void;
}

const RoomSidebar: React.FC<RoomSidebarProps> = ({
  roomCode,
  players,
  playerName,
  gameBoard,
  gameWinner,
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
        <RoomCodeDisplay roomCode={roomCode} />

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
              <PlayerListItem
                key={index}
                playerName={player}
                isCurrentPlayer={player === playerName}
              />
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
            sx={getButtonStyles}
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
            sx={getButtonStyles}
          >
            {gameBoard.gameState === GAME_STATES.PAUSED
              ? "Resume Game"
              : "Pause Game"}
          </Button>
        )}
        <Button
          variant="contained"
          color="warning"
          fullWidth
          onClick={onSettingsOpen}
          startIcon={<SettingsRounded />}
          sx={getButtonStyles}
        >
          Open Settings
        </Button>
        {/* Leave Room Button - Chỉ hiển thị khi không đang chơi game */}
        {gameBoard.gameState !== GAME_STATES.PLAYING &&
          gameBoard.gameState !== GAME_STATES.PAUSED && (
            <Button
              variant="outlined"
              fullWidth
              onClick={onGoHome}
              startIcon={<HomeRounded />}
              sx={getOutlinedButtonStyles}
            >
              Leave Room
            </Button>
          )}
      </Paper>
    </Stack>
  );
};

export default RoomSidebar;
