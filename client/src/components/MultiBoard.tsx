import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { styled, keyframes } from "@mui/system";
import { TetrominoType } from "../types";
import { getTetrominoColor } from "../utils/gameUtils";
import gameService from "../services/gameService";
import { PlayerStateUpdatedData } from "../types/multiplayer";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Container = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;
  z-index: 2100;
`;

const PlayerBoardContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PlayerName = styled(Typography)`
  font-size: 10px;
  margin-bottom: 4px;
  color: #fff;
  text-align: center;
  font-weight: 500;
`;

const PlayerScore = styled(Typography)`
  font-size: 8px;
  color: #aaa;
  margin-bottom: 4px;
`;

const MiniBoard = styled(Box)`
  width: 50px;
  height: 100px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
`;

const MiniRow = styled(Box)`
  display: flex;
  flex: 1;
`;

const MiniCell = styled(Box, {
  shouldForwardProp: (prop) => prop !== "cellType",
})<{ cellType?: string | null }>`
  flex: 1;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  background: ${(props: { cellType?: string | null }) =>
    props.cellType
      ? getTetrominoColor(props.cellType as TetrominoType)
      : "transparent"};
  opacity: ${(props: { cellType?: string | null }) =>
    props.cellType ? 0.8 : 1};
`;

interface PlayerBoard {
  playerId: string;
  playerName: string;
  grid: (string | null)[][];
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
}

export interface MultiBoardRef {
  getPlayerBoardPositions: () => { x: number; y: number; playerId: string }[];
}

const MultiBoard = React.forwardRef<MultiBoardRef>((_, ref) => {
  const [playerBoards, setPlayerBoards] = useState<Map<string, PlayerBoard>>(
    new Map()
  );

  React.useImperativeHandle(ref, () => ({
    getPlayerBoardPositions: () => {
      const positions: { x: number; y: number; playerId: string }[] = [];
      const boards = document.querySelectorAll("[data-player-id]");

      console.log(`🎯 Found ${boards.length} player boards`);

      boards.forEach((board) => {
        const playerId = board.getAttribute("data-player-id");
        if (playerId) {
          const rect = board.getBoundingClientRect();
          console.log(`📍 Player ${playerId} board rect:`, {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right,
          });

          positions.push({
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            playerId,
          });
        }
      });

      console.log(`🎯 Final positions:`, positions);
      return positions;
    },
  }));

  useEffect(() => {
    const handlePlayerStateUpdated = (data: PlayerStateUpdatedData) => {
      // Validate incoming data
      if (!data || !data.playerId || !data.playerName || !data.gameState) {
        console.warn("Invalid player state update data:", data);
        return;
      }

      setPlayerBoards((prev) => {
        const updated = new Map(prev);
        updated.set(data.playerId, {
          playerId: data.playerId,
          playerName: data.playerName,
          grid:
            data.grid ||
            Array(20)
              .fill(null)
              .map(() => Array(10).fill(null)), // Fallback empty grid
          score: data.gameState.score || 0,
          lines: data.gameState.lines || 0,
          level: data.gameState.level || 0,
          isGameOver: data.gameState.isGameOver || false,
        });
        return updated;
      });
    };

    // Add event listener to gameService
    gameService.onPlayerStateUpdated = handlePlayerStateUpdated;

    return () => {
      // Clean up
      if (gameService.onPlayerStateUpdated === handlePlayerStateUpdated) {
        gameService.onPlayerStateUpdated = undefined;
      }
    };
  }, []);

  // Don't render if no other players
  const boardsArray = Array.from(playerBoards.values());
  if (boardsArray.length === 0) {
    return null;
  }

  return (
    <Container>
      {boardsArray.map((board) => (
        <PlayerBoardContainer
          key={board.playerId}
          data-player-id={board.playerId}
        >
          <PlayerName>
            {board.playerName}
            {board.isGameOver && " (Game Over)"}
          </PlayerName>
          <PlayerScore>Score: {board.score.toLocaleString()}</PlayerScore>
          <MiniBoard>
            {board.grid && Array.isArray(board.grid)
              ? board.grid.map((row, y) => (
                  <MiniRow key={y}>
                    {Array.isArray(row)
                      ? row.map((cell, x) => (
                          <MiniCell key={`${y}-${x}`} cellType={cell} />
                        ))
                      : null}
                  </MiniRow>
                ))
              : // Fallback empty grid if no grid data
                Array.from({ length: 20 }, (_, y) => (
                  <MiniRow key={y}>
                    {Array.from({ length: 10 }, (_, x) => (
                      <MiniCell key={`${y}-${x}`} cellType={null} />
                    ))}
                  </MiniRow>
                ))}
          </MiniBoard>
        </PlayerBoardContainer>
      ))}
    </Container>
  );
});

MultiBoard.displayName = "MultiBoard";

export default MultiBoard;
