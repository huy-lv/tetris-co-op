import React from "react";
import { Box, Paper, useTheme, useMediaQuery } from "@mui/material";
import { keyframes } from "@emotion/react";
import { Tetromino, TetrominoType } from "../types";
import { GAME_CONFIG, ANIMATION_SETTINGS } from "../constants";
import GameCell from "./GameCell";

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

const shakeAnimation = keyframes`
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-3px); }
  20% { transform: translateX(3px); }
  30% { transform: translateX(-3px); }
  40% { transform: translateX(3px); }
  50% { transform: translateX(-2px); }
  60% { transform: translateX(2px); }
  70% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
  90% { transform: translateX(-1px); }
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

    // Build a set of ghost piece coordinates using map/flatMap (no side effects)
    const ghostCoords: Set<string> = new Set(
      ghostPiece
        ? ghostPiece.shape.flatMap((row, y) =>
            row.flatMap((cell, x) => {
              if (cell !== 1) return [] as string[];
              const boardY = ghostPiece.position.y + y;
              const boardX = ghostPiece.position.x + x;
              const inBounds =
                boardY >= 0 &&
                boardY < GAME_CONFIG.BOARD_HEIGHT &&
                boardX >= 0 &&
                boardX < GAME_CONFIG.BOARD_WIDTH;
              return inBounds ? [`${boardY}-${boardX}`] : [];
            })
          )
        : []
    );

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
            <GameCell
              key={`${y}-${x}`}
              cellType={finalCell || null}
              blockSize={blockSize}
              isGhost={isGhost}
              isClearing={isClearing}
              animationDelay={animationDelay}
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
          "linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(10, 10, 10, 0.95))",
        backdropFilter: "blur(10px)",
        border: "3px solid rgba(0, 170, 255, 0.3)",
        borderRadius: 3,
        padding: 2,
        boxShadow: `
          0 0 30px rgba(0, 170, 255, 0.2),
          inset 0 0 30px rgba(0, 0, 0, 0.7)
        `,
        position: "relative",
        animation:
          isShaking && ANIMATION_SETTINGS.ENABLE_SHAKE
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
