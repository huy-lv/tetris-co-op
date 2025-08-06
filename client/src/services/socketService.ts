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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private reconnectTimer: number | null = null;
  private currentRoomCode: string | null = null;
  private currentPlayerData: PlayerData | null = null;
  private isReconnecting = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        withCredentials: true,
        reconnection: false, // We'll handle reconnection manually
      });

      this.socket.on("connect", () => {
        console.log("✅ Connected to server");
        this.reconnectAttempts = 0;
        this.isReconnecting = false;

        // Auto-rejoin room if we were in one before disconnect
        if (this.currentRoomCode && this.currentPlayerData) {
          console.log("🔄 Auto-rejoining room:", this.currentRoomCode);
          this.joinRoom(this.currentRoomCode, this.currentPlayerData);
        }

        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ Connection failed:", error);
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("🔌 Disconnected from server:", reason);
        this.handleDisconnect(reason);
      });
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.currentRoomCode = null;
    this.currentPlayerData = null;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private handleDisconnect(reason: string): void {
    // Don't reconnect if it's a manual disconnect
    if (reason === "io client disconnect") {
      return;
    }

    // Don't reconnect if we're already reconnecting
    if (this.isReconnecting) {
      return;
    }

    this.isReconnecting = true;
    console.log("🔄 Attempting to reconnect...");

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

      console.log(
        `🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
      );

      this.reconnectTimer = setTimeout(() => {
        this.attemptReconnect();
      }, delay);
    } else {
      console.error("❌ Max reconnection attempts reached");
      this.isReconnecting = false;
    }
  }

  private async attemptReconnect(): Promise<void> {
    try {
      console.log("🔄 Attempting to reconnect to server...");
      await this.connect();
    } catch (error) {
      console.error("❌ Reconnection failed:", error);
      this.isReconnecting = false;

      // Try again if we haven't reached max attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleDisconnect("reconnect_failed");
      }
    }
  }

  // Room operations - Removed createRoom since we use API
  joinRoom(roomCode: string, playerData: PlayerData): void {
    // Store current room info for auto-rejoin
    this.currentRoomCode = roomCode.toUpperCase();
    this.currentPlayerData = playerData;

    this.socket?.emit("join_room", {
      roomCode: this.currentRoomCode,
      playerData,
    });
  }

  leaveRoom(): void {
    this.socket?.emit("leave_room");
    this.currentRoomCode = null;
    this.currentPlayerData = null;
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
    const connected = this.socket?.connected ?? false;
    console.log(
      "🚀 ~ SocketService ~ isConnected ~ this.socket?.connected:",
      connected
    );
    return connected;
  }

  getReconnectingStatus(): boolean {
    return this.isReconnecting;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  getCurrentRoomCode(): string | null {
    return this.currentRoomCode;
  }
}

export const socketService = new SocketService();
export default socketService;
