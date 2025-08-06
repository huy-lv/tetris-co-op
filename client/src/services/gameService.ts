import { getStoredPlayerName, storePlayerName } from "../utils/nameGenerator";
import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "../config/api";
import {
  RoomJoinedData,
  PlayerJoinedData,
  PlayerLeftData,
  GameStartedData,
  PlayerGameOverData,
  GameWinnerData,
  GameEndedData,
  Player,
  GameStateUpdate,
} from "../types";
import { PlayerStateUpdatedData } from "../types/multiplayer";

class SimpleGameService {
  private roomCode: string | null = null;
  private serverUrl = API_CONFIG.BASE_URL;
  private socket: Socket | null = null;

  // Tự động tạo phòng khi game bắt đầu
  async createRoom(playerName: string): Promise<string> {
    try {
      const response = await fetch(`${this.serverUrl}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const data = await response.json();
      this.roomCode = data.roomCode;

      // Chỉ kết nối socket sau khi có phòng
      await this.connectSocket(playerName);

      return data.roomCode;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  // Join existing room
  async joinRoom(roomCode: string, playerName: string): Promise<void> {
    try {
      this.roomCode = roomCode.toUpperCase();

      // Kết nối socket để join room
      await this.connectSocket(playerName);

      console.log(`🚪 Joined room: ${this.roomCode}`);
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
    }
  }

  // Kết nối socket chỉ khi cần
  private async connectSocket(playerName: string = "Player"): Promise<void> {
    if (!this.socket && this.roomCode) {
      this.socket = io(this.serverUrl, {
        withCredentials: true
      });

      this.socket.emit("join_room", {
        roomCode: this.roomCode,
        playerData: { name: playerName },
      });

      // Setup event listeners cho multiplayer
      this.setupMultiplayerEvents();
    }
  }

  private setupMultiplayerEvents(): void {
    if (!this.socket) return;

    this.socket.on("room_joined", (data: RoomJoinedData) => {
      console.log("Room joined:", data);
      this.currentPlayers = data.players?.map((p: Player) => p.name) || [];
      this.onRoomJoined?.(data);
    });

    this.socket.on("player_joined", (data: PlayerJoinedData) => {
      console.log("New player joined:", data);
      this.currentPlayers = data.players?.map((p: Player) => p.name) || [];
      this.onPlayerJoined?.(data);
    });

    this.socket.on("player_left", (data: PlayerLeftData) => {
      console.log("Player left:", data);
      this.currentPlayers = data.players?.map((p: Player) => p.name) || [];
      this.onPlayerLeft?.(data);
    });

    this.socket.on("game_started", (data: GameStartedData) => {
      console.log("Game started by:", data);
      this.onGameStarted?.(data);
    });

    this.socket.on("game_restarted", (data: GameStartedData) => {
      console.log("Game restarted by:", data);
      this.onGameRestarted?.(data);
    });

    this.socket.on(
      "game_paused",
      (data: { pausedBy: string; roomCode: string }) => {
        console.log("Game paused by:", data);
        this.onGamePaused?.(data);
      }
    );

    this.socket.on(
      "game_resumed",
      (data: { resumedBy: string; roomCode: string }) => {
        console.log("Game resumed by:", data);
        this.onGameResumed?.(data);
      }
    );

    this.socket.on("player_game_over", (data: PlayerGameOverData) => {
      console.log("Player game over:", data);
      this.onPlayerGameOver?.(data);
    });

    this.socket.on("player_state_updated", (data: PlayerStateUpdatedData) => {
      console.log("Player state updated:", data);
      this.onPlayerStateUpdated?.(data);
    });

    this.socket.on("game_winner", (data: GameWinnerData) => {
      console.log("Game winner:", data);
      this.onGameWinner?.(data);
    });

    this.socket.on("game_ended", (data: GameEndedData) => {
      console.log("Game ended:", data);
      this.onGameEnded?.(data);
    });

    this.socket.on(
      "receive_garbage",
      (data: {
        garbageRows: number;
        fromPlayerId: string;
        fromPlayerName: string;
      }) => {
        console.log(
          `💥 Received ${data.garbageRows} garbage rows from ${data.fromPlayerName}`
        );
        this.onReceiveGarbage?.(data);
      }
    );

    this.socket.on("error", (data: { message?: string; error?: string }) => {
      console.error("Socket error:", data);

      // Nếu room không tồn tại, tự động tạo room mới
      if (data.message === "Room not found" && this.roomCode) {
        console.log("Room not found, creating new room...");
        this.handleRoomNotFound();
      }
    });
  }

  // Xử lý trường hợp room không tồn tại
  private async handleRoomNotFound(): Promise<void> {
    try {
      if (!this.roomCode) return;

      // Lấy tên player từ storage hoặc tạo random
      const playerName = getStoredPlayerName();

      console.log(`Creating room ${this.roomCode} with player: ${playerName}`);

      // Tạo room mới qua API với roomCode hiện tại
      const response = await fetch(`${this.serverUrl}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerName,
          roomCode: this.roomCode, // Sử dụng roomCode từ URL
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      // Sau khi tạo thành công, join room
      if (this.socket) {
        this.socket.emit("join_room", {
          roomCode: this.roomCode,
          playerData: { name: playerName },
        });

        // Lưu tên player vào storage
        storePlayerName(playerName);
      }
    } catch (error) {
      console.error("Error handling room not found:", error);
    }
  }

  // Callbacks for multiplayer events
  onPlayerJoined?: (data: PlayerJoinedData) => void;
  onPlayerLeft?: (data: PlayerLeftData) => void;
  onRoomJoined?: (data: RoomJoinedData) => void;
  onGameStarted?: (data: GameStartedData) => void;
  onGameRestarted?: (data: GameStartedData) => void;
  onGamePaused?: (data: { pausedBy: string; roomCode: string }) => void;
  onGameResumed?: (data: { resumedBy: string; roomCode: string }) => void;
  onGameStateUpdate?: (data: unknown) => void;
  onPlayerStateUpdated?: (data: PlayerStateUpdatedData) => void;
  onPlayerGameOver?: (data: PlayerGameOverData) => void;
  onGameWinner?: (data: GameWinnerData) => void;
  onGameEnded?: (data: GameEndedData) => void;
  onReceiveGarbage?: (data: {
    garbageRows: number;
    fromPlayerId: string;
    fromPlayerName: string;
  }) => void;

  // Current room players
  private currentPlayers: string[] = [];

  // Update game state (chỉ khi có socket connection)
  updateGameState(gameState: GameStateUpdate): void {
    if (this.socket && this.roomCode) {
      this.socket.emit("game_state_update", gameState);
    }
  }

  // Start game for all players in room
  startGame(): void {
    if (this.socket && this.roomCode) {
      this.socket.emit("start_game");
      console.log("🎮 Start game event sent to room");
    }
  }

  // Get room code để share
  getRoomCode(): string | null {
    return this.roomCode;
  }

  // Get current players in room
  getCurrentPlayers(): string[] {
    return this.currentPlayers;
  }

  // Check if multiplayer (có người khác trong phòng)
  isMultiplayer(): boolean {
    return this.socket?.connected ?? false;
  }

  // Restart game after game over
  restartGame(): void {
    if (this.socket && this.roomCode) {
      this.socket.emit("restart_game");
    }
  }

  // Pause game for all players
  pauseGame(): void {
    if (this.socket && this.roomCode) {
      this.socket.emit("pause_game");
    }
  }

  // Resume game for all players
  resumeGame(): void {
    if (this.socket && this.roomCode) {
      this.socket.emit("resume_game");
    }
  }

  // Send garbage rows to target player
  sendGarbageRows(targetPlayerId: string, garbageRows: number): void {
    if (this.socket && this.roomCode) {
      console.log(
        `📡 Sending ${garbageRows} garbage rows to player ${targetPlayerId}`
      );
      this.socket.emit("send_garbage", {
        targetPlayerId,
        garbageRows,
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.roomCode = null;
  }
}

export const gameService = new SimpleGameService();
export default gameService;
