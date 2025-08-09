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
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import { AddRounded, LoginRounded } from "@mui/icons-material";
import gameConsole from "../assets/game-console.png";

interface WelcomeScreenProps {
  onCreateRoom: (playerName: string) => void;
  onJoinRoom?: (playerName: string, roomCode: string) => void;
  savedPlayerName?: string;
}

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
  savedPlayerName = "",
}) => {
  const [playerName, setPlayerName] = useState<string>(savedPlayerName);
  const [roomCode, setRoomCode] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = playerName.trim();
    if (trimmedName) {
      onCreateRoom(trimmedName);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = playerName.trim();
    const trimmedCode = roomCode.trim().toUpperCase();
    if (trimmedName && trimmedCode && onJoinRoom) {
      onJoinRoom(trimmedName, trimmedCode);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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
            <Stack direction="row" justifyContent="center" alignItems="center">
              <Box
                component="img"
                src={gameConsole}
                alt="Game console"
                sx={{
                  height: isMobile ? 72 : 96,
                  width: "auto",
                  animation: `${pulseAnimation} 3s ease-in-out infinite`,
                  filter: "drop-shadow(0 6px 18px rgba(0, 170, 255, 0.25))",
                }}
              />
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  animation: `${pulseAnimation} 2s ease-in-out infinite`,
                  mb: 0,
                  fontSize: isMobile ? "2.5rem" : "3rem",
                }}
              >
                TETRIS COOP
              </Typography>
            </Stack>
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
              {/* Tabs for Create/Join Room */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                centered
                sx={{
                  mb: 3,
                  "& .MuiTab-root": {
                    color: "text.secondary",
                    "&.Mui-selected": {
                      color: "primary.main",
                    },
                  },
                }}
              >
                <Tab
                  icon={<AddRounded />}
                  label="Create Room"
                  iconPosition="start"
                />
                <Tab
                  icon={<LoginRounded />}
                  label="Join Room"
                  iconPosition="start"
                />
              </Tabs>

              {/* Create Room Form */}
              {activeTab === 0 && (
                <Box component="form" onSubmit={handleCreateRoom}>
                  <TextField
                    fullWidth
                    label="Enter your name"
                    variant="outlined"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Your name"
                    slotProps={{ input: { inputProps: { maxLength: 20 } } }}
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
                    startIcon={<AddRounded />}
                    sx={{
                      py: 2,
                      mb: 3,
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
                    Create New Room
                  </Button>
                </Box>
              )}

              {/* Join Room Form */}
              {activeTab === 1 && (
                <Box component="form" onSubmit={handleJoinRoom}>
                  <TextField
                    fullWidth
                    label="Enter your name"
                    variant="outlined"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Your name"
                    slotProps={{ input: { inputProps: { maxLength: 20 } } }}
                    required
                    sx={{
                      mb: 2,
                      "& .MuiInputLabel-root": {
                        color: "primary.light",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Room Code"
                    variant="outlined"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="e.g., ABC123"
                    slotProps={{ input: { inputProps: { maxLength: 6 } } }}
                    required
                    sx={{
                      mb: 3,
                      "& .MuiInputLabel-root": {
                        color: "secondary.light",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(156, 39, 176, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "secondary.main",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "secondary.main",
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    disabled={!playerName.trim() || !roomCode.trim()}
                    startIcon={<LoginRounded />}
                    sx={{
                      py: 2,
                      mb: 3,
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      background:
                        !playerName.trim() || !roomCode.trim()
                          ? "rgba(255, 255, 255, 0.12)"
                          : "linear-gradient(45deg, #9c27b0, #673ab7)",
                      "&:hover": {
                        background:
                          !playerName.trim() || !roomCode.trim()
                            ? "rgba(255, 255, 255, 0.12)"
                            : "linear-gradient(45deg, #7b1fa2, #512da8)",
                      },
                    }}
                  >
                    Join Room
                  </Button>
                </Box>
              )}

              <Divider
                sx={{ my: 3, borderColor: "rgba(255, 255, 255, 0.1)" }}
              />

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
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Container>
  );
};

export default WelcomeScreen;
