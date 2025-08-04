import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import { BotConfig } from "../bot/types";

interface BotControlPanelProps {
  isEnabled: boolean;
  difficulty: BotConfig["difficulty"];
  onEnabledChange: (enabled: boolean) => void;
  onDifficultyChange: (difficulty: BotConfig["difficulty"]) => void;
  currentMove?: {
    x: number;
    rotation: number;
    score: number;
  } | null;
}

const DIFFICULTY_DESCRIPTIONS = {
  easy: "Beginner - Makes basic moves",
  medium: "Intermediate - Balanced strategy",
  hard: "Advanced - Smart positioning",
  expert: "Master - Optimal play",
};

const DIFFICULTY_COLORS = {
  easy: "success",
  medium: "primary",
  hard: "warning",
  expert: "error",
} as const;

export const BotControlPanel: React.FC<BotControlPanelProps> = ({
  isEnabled,
  difficulty,
  onEnabledChange,
  onDifficultyChange,
  currentMove,
}) => {
  return (
    <Card
      sx={{
        width: "100%",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        border: "1px solid rgba(76, 175, 80, 0.3)",
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            color: "#4caf50",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          🤖 AI Bot Control
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#fff" }}>
            Bot Status
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: isEnabled ? "#4caf50" : "#666" }}
            >
              {isEnabled ? "ON" : "OFF"}
            </Typography>
            <Switch
              checked={isEnabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
              color="success"
              size="small"
            />
          </Box>
        </Box>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel id="difficulty-label" sx={{ color: "#4caf50" }}>
            Difficulty
          </InputLabel>
          <Select
            labelId="difficulty-label"
            value={difficulty}
            label="Difficulty"
            onChange={(e) =>
              onDifficultyChange(e.target.value as BotConfig["difficulty"])
            }
            disabled={!isEnabled}
            sx={{
              color: "#fff",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(76, 175, 80, 0.5)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4caf50",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#4caf50",
              },
            }}
          >
            {Object.entries(DIFFICULTY_DESCRIPTIONS).map(
              ([key, description]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={key.toUpperCase()}
                      size="small"
                      color={
                        DIFFICULTY_COLORS[key as keyof typeof DIFFICULTY_COLORS]
                      }
                      variant="outlined"
                    />
                    <Typography variant="body2">{description}</Typography>
                  </Box>
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        {isEnabled && (
          <>
            <Divider sx={{ my: 2, borderColor: "rgba(76, 175, 80, 0.3)" }} />
            <Typography variant="subtitle2" sx={{ color: "#4caf50", mb: 1 }}>
              Current Analysis
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  Target X:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#fff", fontWeight: "bold" }}
                >
                  {currentMove ? currentMove.x : "--"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  Rotation:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#fff", fontWeight: "bold" }}
                >
                  {currentMove ? currentMove.rotation : "--"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  Score:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      currentMove && currentMove.score > 0
                        ? "#4caf50"
                        : currentMove
                        ? "#f44336"
                        : "#999",
                    fontWeight: "bold",
                  }}
                >
                  {currentMove ? currentMove.score.toFixed(2) : "--"}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};
