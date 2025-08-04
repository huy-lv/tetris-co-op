import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import {
  ScoreRounded,
  ViewStreamRounded,
  TrendingUpRounded,
  ExtensionRounded,
} from "@mui/icons-material";
import { TetrominoType } from "../types";
import NextPiece from "./NextPiece";

interface GameInfoProps {
  score: number;
  lines: number;
  level: number;
  nextPiece: TetrominoType | null;
}

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 5px rgba(0, 170, 255, 0.3);
  }
  50% { 
    box-shadow: 0 0 20px rgba(0, 170, 255, 0.6);
  }
`;

const GameInfo: React.FC<GameInfoProps> = ({
  score,
  lines,
  level,
  nextPiece,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const stats = [
    {
      label: "Score",
      value: score.toLocaleString(),
      icon: <ScoreRounded />,
      color: "primary.main",
    },
    {
      label: "Lines",
      value: lines.toString(),
      icon: <ViewStreamRounded />,
      color: "success.main",
    },
    {
      label: "Level",
      value: level.toString(),
      icon: <TrendingUpRounded />,
      color: "warning.main",
    },
  ];

  return (
    <Box
      sx={{
        minWidth: isMobile ? "100%" : 250,
        maxWidth: isMobile ? "100%" : 300,
      }}
    >
      <Stack spacing={2}>
        {/* Stats Card */}
        <Card
          elevation={6}
          sx={{
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0, 170, 255, 0.2)",
            animation: `${pulseGlow} 3s ease-in-out infinite`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h5"
              component="h3"
              textAlign="center"
              color="primary.light"
              gutterBottom
              sx={{ mb: 3 }}
            >
              📊 Game Stats
            </Typography>

            <Stack spacing={2}>
              {stats.map((stat) => (
                <Box
                  key={stat.label}
                  sx={{
                    p: 2,
                    background: "rgba(0, 0, 0, 0.3)",
                    borderRadius: 2,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.05)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                    <Chip
                      label={stat.value}
                      sx={{
                        backgroundColor: stat.color,
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        "& .MuiChip-label": {
                          px: 2,
                        },
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Next Piece Card */}
        {nextPiece && (
          <Card
            elevation={6}
            sx={{
              background: "rgba(26, 26, 26, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0, 170, 255, 0.2)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                component="h4"
                textAlign="center"
                color="primary.light"
                gutterBottom
                sx={{ mb: 2 }}
              >
                <ExtensionRounded sx={{ mr: 1, verticalAlign: "middle" }} />
                Next Piece
              </Typography>

              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  minHeight: 100,
                  background: "rgba(0, 0, 0, 0.2)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <NextPiece type={nextPiece} blockSize={18} />
              </Box>

              <Typography
                variant="body2"
                textAlign="center"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Type: {nextPiece.toUpperCase()}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
};

export default GameInfo;
