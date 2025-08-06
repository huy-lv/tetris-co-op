import React from "react";
import { Box } from "@mui/material";
import { TetrominoType } from "../types";
import { TETROMINO_SHAPES } from "../constants";
import { getTetrominoColor } from "../utils/gameUtils";

interface TetrominoShapeProps {
  type: TetrominoType;
  blockSize?: number;
  rotation?: number;
  isGhost?: boolean;
  showBorder?: boolean;
  customColor?: string;
}

const TetrominoShape: React.FC<TetrominoShapeProps> = ({
  type,
  blockSize = 20,
  rotation = 0,
  isGhost = false,
  showBorder = true,
  customColor,
}) => {
  const shapes = TETROMINO_SHAPES[type];
  const shape = shapes[rotation % shapes.length];
  const color = customColor || getTetrominoColor(type, isGhost);

  return (
    <>
      {shape.map((row, rowIndex) => (
        <Box key={rowIndex} display="flex" sx={{ height: blockSize }}>
          {row.map((cell, colIndex) => (
            <Box
              key={`${rowIndex}-${colIndex}`}
              sx={{
                width: blockSize,
                height: blockSize,
                backgroundColor: cell ? color : "transparent",
                border:
                  cell && showBorder
                    ? "1px solid rgba(255, 255, 255, 0.2)"
                    : "none",
                position: "relative",
                "&::before":
                  cell && !isGhost
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
              }}
            />
          ))}
        </Box>
      ))}
    </>
  );
};

export default TetrominoShape;
