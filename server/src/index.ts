import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

// Production config - disable console.log in production
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  // Keep console.error for debugging critical issues
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface PlayerData {
  name: string;
  socketId: string;
  isReady: boolean;
  gameState: any;
  lastUpdate: Date;
  isGameOver?: boolean;
  score?: number;
  level?: number;
  linesCleared?: number;
}

interface GameRoomData {
  roomCode: string;
  hostSocketId: string | null;
  players: Map<string, PlayerData>;
  isStarted: boolean;
  gameState: any;
  createdAt: Date;
  hostName?: string;
}

// Game state storage
const rooms = new Map<string, GameRoom>();
const players = new Map<string, any>(); // socketId -> playerInfo

// Generate 6-character room code
function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Room management
class GameRoom implements GameRoomData {
  roomCode: string;
  hostSocketId: string | null;
  players: Map<string, PlayerData>;
  isStarted: boolean;
  gameState: any;
  createdAt: Date;
  hostName?: string;

  constructor(roomCode: string, hostSocketId: string | null) {
    this.roomCode = roomCode;
    this.hostSocketId = hostSocketId;
    this.players = new Map();
    this.isStarted = false;
    this.gameState = null;
    this.createdAt = new Date();
  }

  addPlayer(socketId: string, playerData: any): void {
    this.players.set(socketId, {
      ...playerData,
      socketId,
      isReady: false,
      gameState: null,
      lastUpdate: new Date(),
    });
  }

  removePlayer(socketId: string): void {
    this.players.delete(socketId);

    // If host leaves, assign new host
    if (this.hostSocketId === socketId && this.players.size > 0) {
      const nextPlayer = this.players.keys().next().value;
      this.hostSocketId = nextPlayer || null;
    }
  }

  updatePlayerGameState(socketId: string, gameState: any): void {
    const player = this.players.get(socketId);
    if (player) {
      player.gameState = gameState;
      player.lastUpdate = new Date();
    }
  }

  startGame(): void {
    this.isStarted = true;
    // Initialize game state for all players
    for (const [socketId, player] of this.players) {
      player.gameState = {
        grid: Array(20)
          .fill(null)
          .map(() => Array(10).fill(null)),
        score: 0,
        lines: 0,
        level: 0,
        isGameOver: false,
      };
    }
  }

  getPlayersData(): any[] {
    return Array.from(this.players.values()).map((player) => ({
      socketId: player.socketId,
      name: player.name,
      isReady: player.isReady,
      score: player.gameState?.score || 0,
      lines: player.gameState?.lines || 0,
      level: player.gameState?.level || 0,
      isGameOver: player.gameState?.isGameOver || false,
    }));
  }
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Join room
  socket.on("join_room", (data) => {
    const { roomCode, playerData } = data;
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit("error", { message: "Room not found" });
      return;
    }

    if (room.players.size >= 8) {
      socket.emit("error", { message: "Room is full (max 8 players)" });
      return;
    }

    if (room.isStarted) {
      socket.emit("error", { message: "Game already started" });
      return;
    }

    // Check if player name already exists in room
    const existingPlayers = Array.from(room.players.values());
    if (existingPlayers.some((p) => p.name === playerData.name)) {
      socket.emit("error", { message: "Player name already exists in room" });
      return;
    }

    // Set host if this is the first player
    if (room.players.size === 0) {
      room.hostSocketId = socket.id;
    }

    // Add player to room using GameRoom method
    room.addPlayer(socket.id, playerData);

    // Store player info
    players.set(socket.id, {
      ...playerData,
      roomCode,
    });

    socket.join(roomCode);

    // Get current players list for broadcasting
    const currentPlayers = room.getPlayersData();

    // Notify all players in room about new player
    io.to(roomCode).emit("player_joined", {
      players: currentPlayers,
      newPlayer: playerData.name,
      roomCode,
    });

    // Send room info to joining player
    socket.emit("room_joined", {
      roomCode,
      players: currentPlayers,
      isHost: room.hostSocketId === socket.id,
    });

    console.log(
      `${playerData.name} joined room ${roomCode}. Total players: ${room.players.size}`
    );
  });

  // Start game
  socket.on("start_game", () => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomCode);
    if (!room) return;

    if (room.isStarted) {
      socket.emit("error", { message: "Game already started" });
      return;
    }

    // Start the game using GameRoom method
    room.startGame();

    // Get updated players data
    const currentPlayers = room.getPlayersData();

    // Notify all players that game started
    io.to(playerInfo.roomCode).emit("game_started", {
      players: currentPlayers,
      startedBy: playerInfo.name,
      roomCode: playerInfo.roomCode,
    });

    console.log(
      `Game started in room ${playerInfo.roomCode} by ${playerInfo.name}. Total players: ${room.players.size}`
    );
  });

  // Game state update
  socket.on("game_state_update", (gameState) => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomCode);
    if (!room || !room.isStarted) return;

    room.updatePlayerGameState(socket.id, gameState);

    // Broadcast updated game state to all players in room
    socket.to(playerInfo.roomCode).emit("player_state_updated", {
      playerId: socket.id,
      playerName: playerInfo.name,
      gameState: gameState,
      grid: gameState.grid,
    });

    // Check game over logic
    const allPlayersData = room.getPlayersData();
    const alivePlayers = allPlayersData.filter((p) => !p.isGameOver);

    // If player just game over, notify all players
    if (gameState.isGameOver) {
      io.to(playerInfo.roomCode).emit("player_game_over", {
        playerId: socket.id,
        playerName: playerInfo.name,
        finalScore: gameState.score,
        playersRemaining: alivePlayers.length,
        totalPlayers: allPlayersData.length,
        allPlayersData: allPlayersData.sort((a, b) => b.score - a.score),
      });
    }

    // Check for game winner
    if (alivePlayers.length === 1 && allPlayersData.length > 1) {
      const winner = alivePlayers[0];
      io.to(playerInfo.roomCode).emit("game_winner", {
        winner: winner,
        finalScores: allPlayersData.sort((a, b) => b.score - a.score),
        totalPlayers: allPlayersData.length,
      });
      room.isStarted = false;
    }
    // If all players game over
    else if (alivePlayers.length === 0) {
      const topPlayer = allPlayersData.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );
      io.to(playerInfo.roomCode).emit("game_ended", {
        winner: topPlayer,
        finalScores: allPlayersData.sort((a, b) => b.score - a.score),
        totalPlayers: allPlayersData.length,
        reason: "all_players_game_over",
      });
      room.isStarted = false;
    }
  });

  // Restart game
  socket.on("restart_game", () => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomCode);
    if (!room || room.isStarted) return;

    // Reset all players' game state
    room.players.forEach((player) => {
      player.isGameOver = false;
      player.score = 0;
      player.level = 1;
      player.linesCleared = 0;
      player.isReady = true;
    });

    // Start the game immediately
    room.startGame();

    // Get updated players data
    const currentPlayers = room.getPlayersData();

    // Notify all players that game restarted
    io.to(playerInfo.roomCode).emit("game_restarted", {
      players: currentPlayers,
      restartedBy: playerInfo.name,
      roomCode: playerInfo.roomCode,
    });
  });

  // Handle sending garbage to opponents
  socket.on("send_garbage", (data) => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomCode);
    if (!room) return;

    console.log(
      `💥 ${playerInfo.name} sending ${data.garbageRows} garbage rows to opponents`
    );

    // Send garbage to all other players in the room
    socket.to(playerInfo.roomCode).emit("receive_garbage", {
      garbageRows: data.garbageRows,
      fromPlayer: playerInfo.name,
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);

    const playerInfo = players.get(socket.id);
    if (playerInfo) {
      const room = rooms.get(playerInfo.roomCode);
      if (room) {
        const playerName = playerInfo.name;

        // Remove player from room
        room.removePlayer(socket.id);

        if (room.players.size === 0) {
          // Remove empty room
          rooms.delete(playerInfo.roomCode);
          console.log(`Room ${playerInfo.roomCode} deleted (empty)`);
        } else {
          // Get updated players list
          const currentPlayers = room.getPlayersData();

          // Notify remaining players
          io.to(playerInfo.roomCode).emit("player_left", {
            playerName: playerName,
            players: currentPlayers,
            roomCode: playerInfo.roomCode,
          });
        }
      }
      players.delete(socket.id);
    }
  });
});

// REST API endpoints
app.post("/api/rooms", (req, res) => {
  try {
    const { playerName, roomCode: requestedRoomCode } = req.body;

    if (
      !playerName ||
      typeof playerName !== "string" ||
      playerName.trim().length === 0
    ) {
      return res.status(400).json({ error: "Player name is required" });
    }

    const roomCode = requestedRoomCode
      ? requestedRoomCode.toUpperCase()
      : generateRoomCode();

    if (requestedRoomCode && rooms.has(roomCode)) {
      return res.status(409).json({ error: "Room already exists" });
    }

    const room = new GameRoom(roomCode, null);
    room.hostName = playerName.trim();
    rooms.set(roomCode, room);

    res.status(201).json({
      roomCode,
      message: "Room created successfully",
      playerName: playerName.trim(),
    });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
