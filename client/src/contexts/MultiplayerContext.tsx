import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import socketService, {
  GameState,
  PlayerData,
  RoomData,
} from "../services/socketService";

interface MultiplayerState {
  isConnected: boolean;
  currentRoom: RoomData | null;
  playerName: string;
  isHost: boolean;
  connectionError: string | null;
  gameRankings: PlayerData[] | null;
}

type MultiplayerAction =
  | { type: "SET_CONNECTED"; payload: boolean }
  | { type: "SET_ROOM"; payload: RoomData | null }
  | { type: "SET_PLAYER_NAME"; payload: string }
  | { type: "SET_HOST"; payload: boolean }
  | { type: "SET_CONNECTION_ERROR"; payload: string | null }
  | { type: "SET_RANKINGS"; payload: PlayerData[] | null }
  | { type: "UPDATE_ROOM"; payload: RoomData }
  | { type: "RESET_STATE" };

const initialState: MultiplayerState = {
  isConnected: false,
  currentRoom: null,
  playerName: "",
  isHost: false,
  connectionError: null,
  gameRankings: null,
};

const multiplayerReducer = (
  state: MultiplayerState,
  action: MultiplayerAction
): MultiplayerState => {
  switch (action.type) {
    case "SET_CONNECTED":
      return { ...state, isConnected: action.payload };
    case "SET_ROOM":
      return { ...state, currentRoom: action.payload };
    case "SET_PLAYER_NAME":
      return { ...state, playerName: action.payload };
    case "SET_HOST":
      return { ...state, isHost: action.payload };
    case "SET_CONNECTION_ERROR":
      return { ...state, connectionError: action.payload };
    case "SET_RANKINGS":
      return { ...state, gameRankings: action.payload };
    case "UPDATE_ROOM":
      return { ...state, currentRoom: action.payload };
    case "RESET_STATE":
      return { ...initialState, playerName: state.playerName };
    default:
      return state;
  }
};

interface MultiplayerContextType {
  state: MultiplayerState;
  connectToServer: () => Promise<void>;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  updateGameState: (gameState: GameState) => void;
  disconnect: () => void;
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(
  undefined
);

export const useMultiplayer = (): MultiplayerContextType => {
  const context = useContext(MultiplayerContext);
  return context
    ? context
    : (() => {
        throw new Error(
          "useMultiplayer must be used within a MultiplayerProvider"
        );
      })();
};

interface MultiplayerProviderProps {
  children: ReactNode;
}

export const MultiplayerProvider: React.FC<MultiplayerProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(multiplayerReducer, initialState);

  useEffect(() => {
    // Setup socket event listeners
    socketService.onRoomCreated((data) => {
      dispatch({ type: "SET_ROOM", payload: data.room });
      dispatch({ type: "SET_HOST", payload: true });
    });

    socketService.onRoomJoined((data) => {
      dispatch({ type: "SET_ROOM", payload: data.room });
      dispatch({ type: "SET_HOST", payload: false });
    });

    socketService.onPlayerJoined((data) => {
      dispatch({ type: "UPDATE_ROOM", payload: data.room });
    });

    socketService.onPlayerLeft((data) => {
      dispatch({ type: "UPDATE_ROOM", payload: data.room });
    });

    socketService.onGameStarted((data) => {
      dispatch({ type: "UPDATE_ROOM", payload: data.room });
    });

    socketService.onPlayerStateUpdated((data) => {
      dispatch({ type: "UPDATE_ROOM", payload: data.room });
    });

    socketService.onGameEnded((data) => {
      dispatch({ type: "SET_RANKINGS", payload: data.rankings });
      dispatch({ type: "UPDATE_ROOM", payload: data.room });
    });

    socketService.onError((data) => {
      dispatch({ type: "SET_CONNECTION_ERROR", payload: data.message });
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const connectToServer = async (): Promise<void> => {
    try {
      dispatch({ type: "SET_CONNECTION_ERROR", payload: null });
      await socketService.connect();
      dispatch({ type: "SET_CONNECTED", payload: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect to server";
      dispatch({ type: "SET_CONNECTION_ERROR", payload: errorMessage });
      dispatch({ type: "SET_CONNECTED", payload: false });
    }
  };

  const createRoom = (playerName: string): void => {
    dispatch({ type: "SET_PLAYER_NAME", payload: playerName });
    socketService.createRoom(playerName);
  };

  const joinRoom = (roomCode: string, playerName: string): void => {
    dispatch({ type: "SET_PLAYER_NAME", payload: playerName });
    socketService.joinRoom(roomCode, { name: playerName });
  };

  const leaveRoom = (): void => {
    socketService.leaveRoom();
    dispatch({ type: "RESET_STATE" });
  };

  const startGame = (): void => {
    socketService.startGame();
  };

  const updateGameState = (gameState: GameState): void => {
    socketService.updateGameState(gameState);
  };

  const disconnect = (): void => {
    socketService.disconnect();
    dispatch({ type: "SET_CONNECTED", payload: false });
    dispatch({ type: "RESET_STATE" });
  };

  const contextValue: MultiplayerContextType = {
    state,
    connectToServer,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    updateGameState,
    disconnect,
  };

  return (
    <MultiplayerContext.Provider value={contextValue}>
      {children}
    </MultiplayerContext.Provider>
  );
};
