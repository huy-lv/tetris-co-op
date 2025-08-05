import React from "react";
import { Box, Paper, useTheme, useMediaQuery } from "@mui/material";
import { keyframes } from "@emotion/react";
import { Tetromino, TetrominoType } from "../types";
import { GAME_CONFIG } from "../constants";
import { getTetrominoColor } from "../utils/gameUtils";

interface GameBoardProps {
  grid: (TetrominoType | null)[][];
  activePiece: Tetromino | null;
  ghostPiece: Tetromino | null;
  clearingRows?: number[];
  dropPosition?: { x: number; y: number };
  isShaking?: boolean;
}

const blockGlow = keyframes`
  0%, 100% {
     box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  50% {
     box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  }
`;

const explosionAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
    background: linear-gradient(45deg, #ff6b35, #f7931e);
    box-shadow: 
      0 0 10px rgba(255, 107, 53, 0.8),
      inset 0 0 5px rgba(255, 255, 255, 0.3);
  }
  25% {
    transform: scale(1.2);
    opacity: 0.9;
    background: linear-gradient(45deg, #ff4757, #ffa502);
    box-shadow: 
      0 0 20px rgba(255, 71, 87, 0.9),
      inset 0 0 10px rgba(255, 255, 255, 0.5);
  }
  50% {
    transform: scale(1.4);
    opacity: 0.7;
    background: linear-gradient(45deg, #ff3742, #ff6348);
    box-shadow: 
      0 0 30px rgba(255, 55, 66, 1),
      inset 0 0 15px rgba(255, 255, 255, 0.7);
  }
  75% {
    transform: scale(1.6);
    opacity: 0.4;
    background: linear-gradient(45deg, #ff2d92, #ff6b9d);
    box-shadow: 
      0 0 40px rgba(255, 45, 146, 0.8),
      inset 0 0 20px rgba(255, 255, 255, 0.4);
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
    background: linear-gradient(45deg, #c44569, #f8b500);
    box-shadow: 
      0 0 50px rgba(196, 69, 105, 0.3),
      inset 0 0 25px rgba(255, 255, 255, 0.1);
  }
`;

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-1px); }
  20% { transform: translateX(1px); }
  30% { transform: translateX(-1px); }
  40% { transform: translateX(1px); }
  50% { transform: translateX(-0.5px); }
  60% { transform: translateX(0.5px); }
  70% { transform: translateX(-0.5px); }
  80% { transform: translateX(0.5px); }
  90% { transform: translateX(-0.5px); }
`;

const GameBoardComponent: React.FC<GameBoardProps> = ({
  grid,
  activePiece,
  ghostPiece,
  clearingRows = [],
  dropPosition,
  isShaking = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const blockSize = isMobile
    ? GAME_CONFIG.BLOCK_SIZE * 0.8
    : GAME_CONFIG.BLOCK_SIZE;

  const renderGrid = () => {
    const displayGrid = grid.map((row) => [...row]);

    // Build a set of ghost piece coordinates for easy lookup
    const ghostCoords = new Set<string>();

    if (ghostPiece) {
      ghostPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            const boardY = ghostPiece.position.y + y;
            const boardX = ghostPiece.position.x + x;

            if (
              boardY >= 0 &&
              boardY < GAME_CONFIG.BOARD_HEIGHT &&
              boardX >= 0 &&
              boardX < GAME_CONFIG.BOARD_WIDTH
            ) {
              ghostCoords.add(`${boardY}-${boardX}`);
            }
          }
        });
      });
    }

    // Add active piece to display grid
    if (activePiece) {
      activePiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          const cellExists = cell === 1;
          const boardY = activePiece.position.y + y;
          const boardX = activePiece.position.x + x;

          if (
            cellExists &&
            boardY >= 0 &&
            boardY < GAME_CONFIG.BOARD_HEIGHT &&
            boardX >= 0 &&
            boardX < GAME_CONFIG.BOARD_WIDTH
          ) {
            displayGrid[boardY][boardX] = activePiece.type;
          }
        });
      });
    }

    return displayGrid.map((row, y) => (
      <Box key={y} display="flex">
        {row.map((cell, x) => {
          // Check if this position is a ghost piece
          const isGhostPiece = ghostCoords.has(`${y}-${x}`);

          // Only render ghost piece if there's no real piece at this location
          const finalCell =
            cell || (isGhostPiece && !cell) ? cell || ghostPiece?.type : null;
          const isGhost = !cell && isGhostPiece;
          const isClearing = clearingRows.includes(y);

          // Calculate animation delay based on distance from drop position
          let animationDelay = 0;
          if (isClearing && dropPosition) {
            const distance = Math.abs(x - dropPosition.x);
            animationDelay = distance * 0.02; // 50ms per cell distance
          }

          return (
            <Box
              key={`${y}-${x}`}
              sx={{
                width: blockSize,
                height: blockSize,
                backgroundColor: finalCell
                  ? getTetrominoColor(finalCell, isGhost)
                  : "transparent",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                position: "relative",
                animation: isClearing
                  ? `${explosionAnimation} 0.2s ease-in-out forwards`
                  : finalCell && !isGhost
                  ? `${blockGlow} 2s ease-in-out infinite`
                  : "none",
                animationDelay: isClearing ? `${animationDelay}s` : "none",
                zIndex: isClearing ? 10 : 1,
                "&::before":
                  finalCell && !isGhost
                    ? {
                        content: '""',
                        position: "absolute",
                        top: 1,
                        left: 1,
                        right: 1,
                        bottom: 1,
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent)",
                        borderRadius: "2px",
                        pointerEvents: "none",
                      }
                    : {},
                "&::after":
                  finalCell && !isGhost
                    ? {
                        content: '""',
                        position: "absolute",
                        bottom: 1,
                        right: 1,
                        width: "60%",
                        height: "60%",
                        background:
                          "linear-gradient(135deg, transparent, rgba(0, 0, 0, 0.2))",
                        borderRadius: "2px",
                        pointerEvents: "none",
                      }
                    : {},
              }}
            />
          );
        })}
      </Box>
    ));
  };

  return (
    <Paper
      elevation={8}
      sx={{
        display: "inline-block",
        background:
          "linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(26, 26, 26, 0.9))",
        backdropFilter: "blur(10px)",
        border: "3px solid rgba(0, 170, 255, 0.3)",
        borderRadius: 3,
        padding: 2,
        boxShadow: `
          0 0 30px rgba(0, 170, 255, 0.2),
          inset 0 0 30px rgba(0, 0, 0, 0.5)
        `,
        position: "relative",
        animation: isShaking
          ? `${shakeAnimation} 0.3s ease-in-out`
          : `${blockGlow} 4s ease-in-out infinite`,
        "&::before": {
          content: '""',
          position: "absolute",
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: "linear-gradient(45deg, #0066cc, #00aaff, #0066cc)",
          borderRadius: 3,
          zIndex: -1,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          background: "rgba(0, 0, 0, 0.5)",
          padding: "2px",
          borderRadius: 1,
        }}
      >
        {renderGrid()}
      </Box>
    </Paper>
  );
};

export default GameBoardComponent;
