import { useEffect } from "react";
import { GAME_STATES } from "../constants";

interface UseNavigationGuardProps {
  gameState: string;
  roomCode: string | null;
  isInGame: boolean;
  onPauseGame?: () => void;
}

export const useNavigationGuard = ({
  gameState,
  roomCode,
  isInGame,
  onPauseGame,
}: UseNavigationGuardProps) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Chỉ hiển thị confirm khi đang trong game hoặc room
      if (
        gameState === GAME_STATES.PLAYING ||
        gameState === GAME_STATES.PAUSED ||
        (roomCode && gameState === GAME_STATES.WAITING)
      ) {
        const message =
          "Are you sure you want to leave the page? Game progress will be lost.";
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    const handlePopState = (event: PopStateEvent) => {
      // Chỉ hiển thị confirm khi đang trong game
      if (
        gameState === GAME_STATES.PLAYING ||
        gameState === GAME_STATES.PAUSED
      ) {
        const confirmed = window.confirm(
          "Are you sure you want to leave the game? Progress will be lost."
        );
        if (!confirmed) {
          // Ngăn navigation nếu user không confirm
          event.preventDefault();
          window.history.pushState(null, "", window.location.href);
        }
      }
    };

    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Push current state để có thể handle back button
    if (gameState === GAME_STATES.PLAYING || gameState === GAME_STATES.PAUSED) {
      window.history.pushState(null, "", window.location.href);
    }

    // Handle visibility change (tab focus/blur)
    const handleVisibilityChange = () => {
      if (document.hidden && isInGame && onPauseGame) {
        console.log("🔄 Tab lost focus, auto-pausing game for all players");
        onPauseGame();
      }
    };

    // Add visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [gameState, roomCode, isInGame, onPauseGame]);
};
