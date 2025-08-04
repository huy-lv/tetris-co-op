import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Fade,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import {
  RestartAltRounded,
  HomeRounded,
  EmojiEventsRounded,
} from "@mui/icons-material";

interface GameOverScreenProps {
  score: number;
  lines: number;
  level: number;
  onRestart: () => void;
  onBackToWelcome: () => void;
}

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  lines,
  level,
  onRestart,
  onBackToWelcome,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const stats = [
    {
      label: "Final Score",
      value: score.toLocaleString(),
      color: "primary.main",
    },
    { label: "Lines Cleared", value: lines.toString(), color: "success.main" },
    { label: "Level Reached", value: level.toString(), color: "warning.main" },
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Fade in timeout={800}>
        <Box>
          <Box textAlign="center" mb={4}>
            <Typography
              variant="h2"
              component="h2"
              color="error.main"
              sx={{
                mb: 2,
                fontSize: isMobile ? "2rem" : "2.5rem",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                animation: `${fadeInUp} 0.8s ease-out`,
              }}
            >
              💀 Game Over!
            </Typography>
            <EmojiEventsRounded
              sx={{
                fontSize: 64,
                color: "warning.main",
                animation: `${fadeInUp} 1s ease-out 0.2s both`,
              }}
            />
          </Box>

          <Card
            elevation={8}
            sx={{
              backdropFilter: "blur(20px)",
              background: "rgba(26, 26, 26, 0.95)",
              border: "1px solid rgba(204, 0, 102, 0.2)",
              animation: `${fadeInUp} 1s ease-out 0.4s both`,
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography
                variant="h4"
                component="h3"
                textAlign="center"
                color="primary.light"
                gutterBottom
                sx={{ mb: 3 }}
              >
                📊 Final Statistics
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                  <Box key={stat.label}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
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
                        animation: `${fadeInUp} 0.6s ease-out ${
                          0.6 + index * 0.1
                        }s both`,
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {stat.label}:
                      </Typography>
                      <Typography
                        variant="h5"
                        color={stat.color}
                        fontWeight="bold"
                        sx={{ fontSize: isMobile ? "1.2rem" : "1.5rem" }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                    {index < stats.length - 1 && (
                      <Divider sx={{ opacity: 0.3 }} />
                    )}
                  </Box>
                ))}
              </Stack>

              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                sx={{
                  animation: `${fadeInUp} 0.8s ease-out 1s both`,
                }}
              >
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  fullWidth
                  onClick={onRestart}
                  startIcon={<RestartAltRounded />}
                  sx={{
                    py: 2,
                    fontSize: "1.1rem",
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
                  Play Again
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={onBackToWelcome}
                  startIcon={<HomeRounded />}
                  sx={{
                    py: 2,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    background: "linear-gradient(45deg, #0066cc, #00aaff)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #0055aa, #0099ee)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0, 170, 255, 0.4)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  Back to Menu
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Fade>
    </Container>
  );
};

export default GameOverScreen;
