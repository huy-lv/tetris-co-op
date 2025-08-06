import React from "react";
import WelcomeScreen from "../components/WelcomeScreen";
import GameAlreadyStartedPopup from "../components/GameAlreadyStartedPopup";
import { useGameLogic } from "../hooks/useGameLogic";
import { getStoredPlayerNameOnly } from "../utils/nameGenerator";
import gameService from "../services/gameService";

const HomePage: React.FC = () => {
  const {
    createRoom,
    navigateToRoom,
    showGameStartedPopup,
    gameStartedRoomCode,
    closeGameStartedPopup,
  } = useGameLogic(false);

  // Load saved player name from storage (only if exists, no random generation)
  const savedPlayerName = getStoredPlayerNameOnly();

  const handleCreateRoom = async (playerName: string) => {
    try {
      // Store player name trước khi tạo room
      localStorage.setItem("tetris_player_name", playerName);

      // Create room và navigate
      await createRoom(playerName);
      const roomCode = gameService.getRoomCode();
      if (roomCode) {
        navigateToRoom(roomCode);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  const handleJoinRoom = async (playerName: string, roomCode: string) => {
    // Store player name trước khi navigate (sử dụng cùng key với utils)
    localStorage.setItem("tetris_player_name", playerName);
    // Navigate, sau đó logic auto-join sẽ handle
    navigateToRoom(roomCode);
  };

  return (
    <>
      <WelcomeScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        savedPlayerName={savedPlayerName}
      />

      {/* Game Already Started Popup */}
      <GameAlreadyStartedPopup
        isOpen={showGameStartedPopup}
        roomCode={gameStartedRoomCode}
        onClose={closeGameStartedPopup}
      />
    </>
  );
};

export default HomePage;
