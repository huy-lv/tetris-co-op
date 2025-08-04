import React from "react";
import { Box, Paper, useTheme, useMediaQuery } from "@mui/material";
import { keyframes } from "@emotion/react";
import { Tetromino, TetrominoType } from "../types";
import { GAME_CONFIG } from "../constants";
import { getTetrominoColor } from "../utils/gameUtils";

interface GameBoardProps {
  grid: (TetrominoType | null)[][];
  activePiece: Tetromino | null;
}

const blockGlow = keyframes`
  0%, 100% { 
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  50% { 
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  }
`;

const GameBoardComponent: React.FC<GameBoardProps> = ({
  grid,
  activePiece,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const blockSize = isMobile
    ? GAME_CONFIG.BLOCK_SIZE * 0.8
    : GAME_CONFIG.BLOCK_SIZE;

  const renderGrid = () => {
    const displayGrid = grid.map((row) => [...row]);

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
        {row.map((cell, x) => (
          <Box
            key={`${y}-${x}`}
            sx={{
              width: blockSize,
              height: blockSize,
              backgroundColor: cell ? getTetrominoColor(cell) : "transparent",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              position: "relative",
              animation: cell ? `${blockGlow} 2s ease-in-out infinite` : "none",
              "&::before": cell
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
              "&::after": cell
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
        ))}
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
          animation: `${blockGlow} 4s ease-in-out infinite`,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          border: "2px solid rgba(255, 255, 255, 0.2)",
          borderRadius: 2,
          overflow: "hidden",
          background: "rgba(0, 0, 0, 0.8)",
        }}
      >
        {renderGrid()}
      </Box>
    </Paper>
  );
};

export default GameBoardComponent;
