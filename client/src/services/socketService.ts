import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "../config/api";

export interface GameState {
  grid: (string | null)[][];
  score: number;
  lines: number;
  level: number;
  isGameOver: boolean;
}

export interface PlayerData {
  name: string;
  gameState?: GameState;
}

export interface RoomData {
  roomCode: string;
  players: PlayerData[];
  gameState: "waiting" | "playing" | "finished";
  createdAt: string;
}

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = API_CONFIG.BASE_URL;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        withCredentials: true,
      });

      this.socket.on("connect", () => {
        console.log("✅ Connected to server");
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Connection failed:", error);
        reject(error);
      });
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  // Room operations - Removed createRoom since we use API
  joinRoom(roomCode: string, playerData: PlayerData): void {
    this.socket?.emit("join_room", {
      roomCode: roomCode.toUpperCase(),
      playerData,
    });
  }

  leaveRoom(): void {
    this.socket?.emit("leave_room");
  }

  // Game operations
  startGame(): void {
    this.socket?.emit("start_game");
  }

  updateGameState(gameState: GameState): void {
    this.socket?.emit("game_state_update", gameState);
  }

  // Event listeners
  onRoomCreated(
    callback: (data: { roomCode: string; room: RoomData }) => void
  ): void {
    this.socket?.on("room_created", callback);
  }

  onRoomJoined(
    callback: (data: { roomCode: string; room: RoomData }) => void
  ): void {
    this.socket?.on("room_joined", callback);
  }

  onPlayerJoined(
    callback: (data: { newPlayer: string; room: RoomData }) => void
  ): void {
    this.socket?.on("player_joined", callback);
  }

  onPlayerLeft(
    callback: (data: { playerName: string; room: RoomData }) => void
  ): void {
    this.socket?.on("player_left", callback);
  }

  onGameStarted(
    callback: (data: { startedBy: string; room: RoomData }) => void
  ): void {
    this.socket?.on("game_started", callback);
  }

  onPlayerStateUpdated(
    callback: (data: {
      playerName: string;
      gameState: GameState;
      room: RoomData;
    }) => void
  ): void {
    this.socket?.on("player_state_updated", callback);
  }

  onGameEnded(
    callback: (data: {
      winner: PlayerData;
      rankings: PlayerData[];
      room: RoomData;
    }) => void
  ): void {
    this.socket?.on("game_ended", callback);
  }

  onError(callback: (data: { message: string }) => void): void {
    this.socket?.on("error", callback);
  }

  // Remove event listeners
  removeAllListeners(): void {
    this.socket?.removeAllListeners();
  }

  removeListener(event: string): void {
    this.socket?.removeAllListeners(event);
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();
export default socketService;
