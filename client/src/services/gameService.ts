import { getStoredPlayerName, storePlayerName } from "../utils/nameGenerator";

class SimpleGameService {
  private roomCode: string | null = null;
  private serverUrl = "http://localhost:5001";
  private socket: any = null;

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
      const { io } = await import("socket.io-client");
      this.socket = io(this.serverUrl);

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

    this.socket.on("room_joined", (data: any) => {
      console.log("Room joined:", data);
      this.currentPlayers = data.players?.map((p: any) => p.name) || [];
      this.onRoomJoined?.(data);
    });

    this.socket.on("player_joined", (data: any) => {
      console.log("New player joined:", data);
      this.currentPlayers = data.players?.map((p: any) => p.name) || [];
      this.onPlayerJoined?.(data);
    });

    this.socket.on("player_left", (data: any) => {
      console.log("Player left:", data);
      this.currentPlayers = data.players?.map((p: any) => p.name) || [];
      this.onPlayerLeft?.(data);
    });

    this.socket.on("game_started", (data: any) => {
      console.log("Game started by:", data);
      this.onGameStarted?.(data);
    });

    this.socket.on("player_game_over", (data: any) => {
      console.log("Player game over:", data);
      this.onPlayerGameOver?.(data);
    });

    this.socket.on("game_winner", (data: any) => {
      console.log("Game winner:", data);
      this.onGameWinner?.(data);
    });

    this.socket.on("game_ended", (data: any) => {
      console.log("Game ended:", data);
      this.onGameEnded?.(data);
    });

    this.socket.on("error", (data: any) => {
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
  onPlayerJoined?: (data: any) => void;
  onPlayerLeft?: (data: any) => void;
  onRoomJoined?: (data: any) => void;
  onGameStarted?: (data: any) => void;
  onGameStateUpdate?: (data: any) => void;
  onPlayerGameOver?: (data: any) => void;
  onGameWinner?: (data: any) => void;
  onGameEnded?: (data: any) => void;

  // Current room players
  private currentPlayers: string[] = [];

  // Update game state (chỉ khi có socket connection)
  updateGameState(gameState: any): void {
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
