import React from "react";
import { Box } from "@mui/material";
import { TetrominoType } from "../types";
import { TETROMINO_SHAPES, TETROMINO_COLORS } from "../constants";

interface HoldPieceProps {
  type: TetrominoType;
  blockSize?: number;
}

const HoldPiece: React.FC<HoldPieceProps> = ({ type, blockSize = 20 }) => {
  // Get the first rotation shape of the piece type
  const shape = TETROMINO_SHAPES[type][0];
  const color = TETROMINO_COLORS[type];

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: `repeat(${shape.length}, ${blockSize}px)`,
          gridTemplateColumns: `repeat(${shape[0].length}, ${blockSize}px)`,
          gap: "1px",
        }}
      >
        {shape.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Box
              key={`${rowIndex}-${colIndex}`}
              sx={{
                width: blockSize,
                height: blockSize,
                backgroundColor: cell ? color : "transparent",
                border: cell ? "1px solid rgba(255, 255, 255, 0.4)" : "none",
                boxShadow: cell
                  ? "inset 0 0 8px rgba(255, 255, 255, 0.6)"
                  : "none",
                borderRadius: "2px",
              }}
            />
          ))
        )}
      </Box>
    </Box>
  );
};

export default HoldPiece;
