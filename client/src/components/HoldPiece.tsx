import React from "react";
import { Box } from "@mui/material";
import { TetrominoType } from "../types";
import TetrominoShape from "./TetrominoShape";

interface HoldPieceProps {
  type: TetrominoType;
  blockSize?: number;
}

const HoldPiece: React.FC<HoldPieceProps> = ({ type, blockSize = 20 }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: blockSize * 4,
        minWidth: blockSize * 4,
      }}
    >
      <TetrominoShape type={type} blockSize={blockSize} />
    </Box>
  );
};

export default HoldPiece;
