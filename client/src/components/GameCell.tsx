import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";
import { TetrominoType } from "../types";
import { getTetrominoColor } from "../utils/gameUtils";

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
    background: linear-gradient(45deg, #ff2f3a, #ff4757);
    box-shadow: 
      0 0 40px rgba(255, 47, 58, 1),
      inset 0 0 20px rgba(255, 255, 255, 0.9);
  }
  100% {
    transform: scale(2);
    opacity: 0;
    background: linear-gradient(45deg, #ff1744, #ff5722);
    box-shadow: 
      0 0 50px rgba(255, 23, 68, 1),
      inset 0 0 25px rgba(255, 255, 255, 1);
  }
`;

interface GameCellProps {
  cellType: TetrominoType | null;
  blockSize: number;
  isGhost?: boolean;
  isClearing?: boolean;
  animationDelay?: number;
}

const GameCell: React.FC<GameCellProps> = ({
  cellType,
  blockSize,
  isGhost = false,
  isClearing = false,
  animationDelay = 0,
}) => {
  return (
    <Box
      sx={{
        width: blockSize,
        height: blockSize,
        backgroundColor: cellType
          ? getTetrominoColor(cellType, isGhost)
          : "rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        position: "relative",
        animation: isClearing
          ? `${explosionAnimation} 0.2s ease-in-out forwards`
          : cellType && !isGhost
          ? `${blockGlow} 2s ease-in-out infinite`
          : "none",
        animationDelay: isClearing ? `${animationDelay}s` : "none",
        zIndex: isClearing ? 10 : 1,
        "&::before":
          cellType && !isGhost
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
          cellType && !isGhost
            ? {
                content: '""',
                position: "absolute",
                bottom: 1,
                right: 1,
                width: "30%",
                height: "30%",
                background:
                  "linear-gradient(45deg, rgba(0, 0, 0, 0.3), transparent)",
                borderRadius: "1px",
                pointerEvents: "none",
              }
            : {},
      }}
    />
  );
};

export default GameCell;
