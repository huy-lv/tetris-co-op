import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Fade,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import { PlayArrowRounded, PersonRounded } from "@mui/icons-material";

interface WaitingRoomProps {
  playerName: string;
  onStartGame: () => void;
}

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  playerName,
  onStartGame,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const controls = ["W A S D - Move pieces", "N - Rotate", "J - Hard Drop"];

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Box>
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h2"
              component="h2"
              color="primary.light"
              sx={{
                mb: 2,
                fontSize: isMobile ? "1.8rem" : "2rem",
              }}
            >
              Welcome, {playerName}! 👋
            </Typography>
            <PersonRounded
              sx={{
                fontSize: 48,
                color: "success.main",
                animation: `${bounceAnimation} 2s ease-in-out infinite`,
              }}
            />
          </Box>

          <Card
            elevation={8}
            sx={{
              backdropFilter: "blur(20px)",
              background: "rgba(26, 26, 26, 0.95)",
              border: "1px solid rgba(0, 204, 102, 0.2)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box textAlign="center" mb={4}>
                <Chip
                  label="✅ Room created successfully"
                  color="success"
                  variant="outlined"
                  sx={{
                    mb: 2,
                    fontSize: "1rem",
                    py: 1,
                  }}
                />
                <Typography
                  variant="h4"
                  component="p"
                  color="text.primary"
                  gutterBottom
                >
                  Ready to play Tetris? 🎮
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Challenge yourself and see how many lines you can clear!
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                onClick={onStartGame}
                startIcon={<PlayArrowRounded />}
                sx={{
                  py: 2,
                  mb: 4,
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  background: "linear-gradient(45deg, #00aa55, #00cc66)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #009944, #00bb55)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0, 204, 102, 0.4)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Start Game
              </Button>

              <Card
                variant="outlined"
                sx={{
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h4"
                    component="h4"
                    textAlign="center"
                    color="primary.light"
                    gutterBottom
                  >
                    🎮 Controls Reminder
                  </Typography>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {controls.map((control, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          background: "rgba(0, 170, 255, 0.05)",
                          border: "1px solid rgba(0, 170, 255, 0.2)",
                          borderRadius: 2,
                          textAlign: "center",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: "rgba(0, 170, 255, 0.1)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          color="text.primary"
                          fontWeight={500}
                        >
                          {control}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Container>
  );
};

export default WaitingRoom;
