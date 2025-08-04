import React from "react";
import { Box } from "@mui/material";
import { TetrominoType } from "../types";
import { TETROMINO_SHAPES } from "../constants";
import { getTetrominoColor } from "../utils/gameUtils";

interface NextPieceProps {
  type: TetrominoType;
  blockSize?: number;
}

const NextPiece: React.FC<NextPieceProps> = ({ type, blockSize = 20 }) => {
  const shape = TETROMINO_SHAPES[type][0]; // Use first rotation
  const color = getTetrominoColor(type);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        padding: 1,
        minHeight: blockSize * 4,
        minWidth: blockSize * 4,
      }}
    >
      {shape.map((row, rowIndex) => (
        <Box key={rowIndex} display="flex" sx={{ height: blockSize }}>
          {row.map((cell, colIndex) => (
            <Box
              key={`${rowIndex}-${colIndex}`}
              sx={{
                width: blockSize,
                height: blockSize,
                backgroundColor: cell ? color : "transparent",
                border: cell ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
                position: "relative",
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
                    }
                  : {},
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default NextPiece;
