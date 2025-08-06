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
import {
  ScoreRounded,
  ViewStreamRounded,
  TrendingUpRounded,
  ExtensionRounded,
  PanToolRounded,
} from "@mui/icons-material";
import { TetrominoType } from "../types";
import NextPiece from "./NextPiece";
import HoldPiece from "./HoldPiece";

interface GameInfoProps {
  score: number;
  lines: number;
  level: number;
  nextPiece: TetrominoType | null;
  holdPiece: TetrominoType | null;
  canHold: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({
  score,
  lines,
  level,
  nextPiece,
  holdPiece,
  canHold,
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
      <Stack spacing={2} direction={isMobile ? "row" : "column"}>
        {/* Stats Card */}
        <Card
          elevation={6}
          sx={{
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0, 170, 255, 0.2)",
            flex: isMobile ? 1 : "none",
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Stack
              spacing={isMobile ? 1 : 2}
              sx={{
                p: isMobile ? 1 : 2,
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
              {stats.map((stat) => (
                <Box key={stat.label}>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                      <Typography
                        variant={isMobile ? "body2" : "h6"}
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                    <Chip
                      label={stat.value}
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        backgroundColor: stat.color,
                        color: "white",
                        fontWeight: "bold",
                        fontSize: isMobile ? "0.8rem" : "1rem",
                        "& .MuiChip-label": {
                          px: isMobile ? 1 : 2,
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
              flex: isMobile ? "0 0 auto" : "none",
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Typography
                variant={isMobile ? "body2" : "h6"}
                component="h4"
                textAlign="center"
                color="primary.light"
                gutterBottom
                sx={{ mb: isMobile ? 1 : 2 }}
              >
                <ExtensionRounded
                  sx={{
                    mr: 1,
                    verticalAlign: "middle",
                    fontSize: isMobile ? "1rem" : "1.25rem",
                  }}
                />
                Next
              </Typography>

              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  minHeight: isMobile ? 60 : 100,
                  background: "rgba(0, 0, 0, 0.2)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <NextPiece type={nextPiece} blockSize={isMobile ? 12 : 18} />
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Hold Piece Card */}
        <Card
          elevation={6}
          sx={{
            background: "rgba(26, 26, 26, 0.95)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${
              canHold ? "rgba(0, 170, 255, 0.2)" : "rgba(255, 50, 50, 0.2)"
            }`,
            opacity: canHold ? 1 : 0.7,
            flex: isMobile ? "0 0 auto" : "none",
          }}
        >
          <CardContent sx={{ p: isMobile ? 2 : 3 }}>
            <Typography
              variant={isMobile ? "body2" : "h6"}
              component="h4"
              textAlign="center"
              color={canHold ? "primary.light" : "error.light"}
              gutterBottom
              sx={{ mb: isMobile ? 1 : 2 }}
            >
              <PanToolRounded
                sx={{
                  mr: 1,
                  verticalAlign: "middle",
                  fontSize: isMobile ? "1rem" : "1.25rem",
                }}
              />
              Hold
            </Typography>

            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                minHeight: isMobile ? 60 : 100,
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: 2,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {holdPiece ? (
                <HoldPiece type={holdPiece} blockSize={isMobile ? 12 : 18} />
              ) : (
                <Typography color="text.secondary" variant="caption">
                  Empty
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default GameInfo;
