import React from "react";
import { Box } from "@mui/material";
import { TetrominoType } from "../types";
import TetrominoShape from "./TetrominoShape";

interface NextPieceProps {
  type: TetrominoType;
  blockSize?: number;
}

const NextPiece: React.FC<NextPieceProps> = ({ type, blockSize = 20 }) => {
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
      <TetrominoShape type={type} blockSize={blockSize} />
    </Box>
  );
};

export default NextPiece;
