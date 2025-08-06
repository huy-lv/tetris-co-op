import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  List,
  Divider,
  Stack,
} from "@mui/material";
import { Close, PlayArrow, Pause, Home, Settings } from "@mui/icons-material";
import RoomCodeDisplay from "./RoomCodeDisplay";
import PlayerListItem from "./PlayerListItem";
import { GAME_STATES } from "../constants";
import { GameBoard as GameBoardType, GameWinnerState } from "../types";

interface MobileSidebarPopupProps {
  open: boolean;
  onClose: () => void;
  roomCode: string | null;
  players: string[];
  playerName: string;
  gameBoard: GameBoardType;
  gameWinner: GameWinnerState;
  onStartGame: () => void;
  onPauseGame: () => void;
  onGoHome: () => void;
  onSettingsOpen: () => void;
}

const MobileSidebarPopup: React.FC<MobileSidebarPopupProps> = ({
  open,
  onClose,
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
  const codeToShare = roomCode;
  const canStartGame = gameBoard.gameState === GAME_STATES.WAITING;
  const canPauseGame =
    gameBoard.gameState === GAME_STATES.PLAYING && !gameWinner.hasWinner;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: "rgba(26, 26, 26, 0.98)",
          border: "1px solid rgba(0, 170, 255, 0.3)",
          borderRadius: 3,
          backdropFilter: "blur(20px)",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "primary.main",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <Typography variant="h6" component="div">
          Game Controls
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Room Info */}
          <Box>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Room Information
            </Typography>
            <Box
              sx={{
                p: 2,
                background: "rgba(0, 170, 255, 0.1)",
                borderRadius: 2,
                border: "1px solid rgba(0, 170, 255, 0.3)",
              }}
            >
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Room Code
              </Typography>
              <RoomCodeDisplay
                roomCode={codeToShare}
                height={45}
                fontSize="1.1rem"
              />
            </Box>
          </Box>

          {/* Players List */}
          <Box>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Players ({players.length})
            </Typography>
            <List
              sx={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                maxHeight: "120px",
                overflow: "auto",
              }}
            >
              {players.map((player, index) => (
                <PlayerListItem
                  key={index}
                  playerName={player}
                  isCurrentPlayer={player === playerName}
                  showAvatar={false}
                />
              ))}
            </List>
          </Box>

          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

          {/* Game Controls */}
          <Box>
            <Typography variant="subtitle1" color="primary" gutterBottom>
              Game Controls
            </Typography>
            <Stack spacing={2}>
              {canStartGame && (
                <Button
                  variant="contained"
                  onClick={onStartGame}
                  startIcon={<PlayArrow />}
                  fullWidth
                  sx={{
                    background: "linear-gradient(45deg, #4caf50, #66bb6a)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #388e3c, #4caf50)",
                    },
                  }}
                >
                  Start Game
                </Button>
              )}

              {canPauseGame && (
                <Button
                  variant="outlined"
                  onClick={onPauseGame}
                  startIcon={<Pause />}
                  fullWidth
                  sx={{
                    borderColor: "warning.main",
                    color: "warning.main",
                    "&:hover": {
                      borderColor: "warning.dark",
                      background: "rgba(255, 193, 7, 0.1)",
                    },
                  }}
                >
                  Pause Game
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={onSettingsOpen}
                startIcon={<Settings />}
                fullWidth
                sx={{
                  borderColor: "info.main",
                  color: "info.main",
                  "&:hover": {
                    borderColor: "info.dark",
                    background: "rgba(33, 150, 243, 0.1)",
                  },
                }}
              >
                Settings
              </Button>

              <Button
                variant="outlined"
                onClick={onGoHome}
                startIcon={<Home />}
                fullWidth
                sx={{
                  borderColor: "error.main",
                  color: "error.main",
                  "&:hover": {
                    borderColor: "error.dark",
                    background: "rgba(244, 67, 54, 0.1)",
                  },
                }}
              >
                Leave Room
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default MobileSidebarPopup;
