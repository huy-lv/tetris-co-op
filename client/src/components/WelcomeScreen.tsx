import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Container,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import { GamepadRounded, SportsEsportsRounded } from "@mui/icons-material";

interface WelcomeScreenProps {
  onCreateRoom: (playerName: string) => void;
  savedPlayerName?: string;
}

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCreateRoom,
  savedPlayerName = "",
}) => {
  const [playerName, setPlayerName] = useState<string>(savedPlayerName);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = playerName.trim();
    if (trimmedName) {
      onCreateRoom(trimmedName);
    }
  };

  const controls = [
    { keys: "W A S D", action: "Move pieces", icon: "🎮" },
    { keys: "N", action: "Rotate", icon: "↻" },
    { keys: "J", action: "Hard Drop", icon: "⬇" },
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Box>
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                animation: `${pulseAnimation} 2s ease-in-out infinite`,
                mb: 2,
                fontSize: isMobile ? "2.5rem" : "3rem",
              }}
            >
              TETRIS COOP
            </Typography>
            <SportsEsportsRounded
              sx={{
                fontSize: 48,
                color: "primary.main",
                animation: `${pulseAnimation} 3s ease-in-out infinite`,
              }}
            />
          </Box>

          <Card
            elevation={8}
            sx={{
              backdropFilter: "blur(20px)",
              background: "rgba(26, 26, 26, 0.95)",
              border: "1px solid rgba(0, 170, 255, 0.2)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Enter your name"
                  variant="outlined"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                  inputProps={{ maxLength: 20 }}
                  required
                  sx={{
                    mb: 3,
                    "& .MuiInputLabel-root": {
                      color: "primary.light",
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={!playerName.trim()}
                  startIcon={<GamepadRounded />}
                  sx={{
                    py: 2,
                    mb: 4,
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    background: !playerName.trim()
                      ? "rgba(255, 255, 255, 0.12)"
                      : "linear-gradient(45deg, #0066cc, #00aaff)",
                    "&:hover": {
                      background: !playerName.trim()
                        ? "rgba(255, 255, 255, 0.12)"
                        : "linear-gradient(45deg, #0055aa, #0099ee)",
                    },
                  }}
                >
                  Create Room
                </Button>

                <Box>
                  <Typography
                    variant="h4"
                    component="h3"
                    textAlign="center"
                    mb={2}
                    color="primary.light"
                  >
                    Game Controls
                  </Typography>

                  <Stack spacing={2}>
                    {controls.map((control, index) => (
                      <Card
                        key={index}
                        variant="outlined"
                        sx={{
                          background: "rgba(0, 0, 0, 0.3)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: "rgba(0, 170, 255, 0.1)",
                            border: "1px solid rgba(0, 170, 255, 0.3)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="h6" component="span">
                                {control.icon}
                              </Typography>
                              <Chip
                                label={control.keys}
                                color="primary"
                                variant="outlined"
                                sx={{
                                  fontFamily: "monospace",
                                  fontWeight: "bold",
                                }}
                              />
                            </Box>
                            <Typography
                              variant="body1"
                              color="text.secondary"
                              fontWeight={500}
                            >
                              {control.action}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Container>
  );
};

export default WelcomeScreen;
