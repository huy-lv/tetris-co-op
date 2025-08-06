import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import { Warning } from "@mui/icons-material";

interface GameAlreadyStartedPopupProps {
  isOpen: boolean;
  roomCode: string;
  onClose: () => void;
}

const GameAlreadyStartedPopup: React.FC<GameAlreadyStartedPopupProps> = ({
  isOpen,
  roomCode,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    onClose();
    navigate("/");
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: "rgba(26, 26, 26, 0.95)",
            border: "1px solid rgba(255, 193, 7, 0.3)",
            borderRadius: 2,
          },
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
          <Avatar
            sx={{
              bgcolor: "warning.main",
              width: 56,
              height: 56,
              mb: 2,
            }}
          >
            <Warning fontSize="large" />
          </Avatar>
        </Box>
        <Typography
          variant="h5"
          align="center"
          color="warning.main"
          fontWeight="bold"
        >
          Phòng đã bắt đầu game
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          Phòng{" "}
          <Typography
            component="span"
            sx={{
              fontFamily: "monospace",
              fontWeight: "bold",
              color: "primary.main",
              fontSize: "1.1em",
            }}
          >
            {roomCode}
          </Typography>{" "}
          đã bắt đầu trò chơi.
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
          Bạn không thể tham gia vào lúc này.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button
          onClick={handleGoHome}
          variant="contained"
          color="primary"
          size="large"
          sx={{
            minWidth: 140,
            borderRadius: 2,
          }}
        >
          Về trang chủ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GameAlreadyStartedPopup;
