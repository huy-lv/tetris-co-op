import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getStoredPlayerName } from "../utils/nameGenerator";
import gameService from "../services/gameService";

export const useRoomNavigation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  const roomId = searchParams.get("id");

  // Navigate to room URL
  const navigateToRoom = (roomCode: string) => {
    navigate(`/room?id=${roomCode}`);
  };

  // Auto join room from URL
  useEffect(() => {
    const autoJoinRoom = async () => {
      if (roomId && !gameService.getRoomCode()) {
        // Nếu có roomId trong URL nhưng chưa join room
        const savedPlayerName = getStoredPlayerName(); // Sử dụng utility function

        setIsJoiningRoom(true);
        setRoomError(null);

        try {
          await gameService.joinRoom(roomId, savedPlayerName);
          console.log(
            `🚪 Auto-joined room: ${roomId} with player: ${savedPlayerName}`
          );
        } catch (error) {
          console.error("Failed to auto-join room:", error);
          setRoomError(`Failed to join room ${roomId}`);
          // Navigate back to home on error
          navigate("/");
        } finally {
          setIsJoiningRoom(false);
        }
      }
    };

    autoJoinRoom();
  }, [roomId, navigate]);

  return {
    roomId,
    navigateToRoom,
    isJoiningRoom,
    roomError,
  };
};
