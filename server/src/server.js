const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Game state storage
const rooms = new Map();
const players = new Map(); // socketId -> playerInfo

// Generate 6-character room code
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Room management
class GameRoom {
  constructor(roomCode, hostSocketId) {
    this.roomCode = roomCode;
    this.hostSocketId = hostSocketId;
    this.players = new Map(); // socketId -> playerData
    this.isStarted = false;
    this.gameState = null;
    this.createdAt = new Date();
  }

  addPlayer(socketId, playerData) {
    this.players.set(socketId, {
      ...playerData,
      socketId,
      isReady: false,
      gameState: null,
      lastUpdate: new Date(),
    });
  }

  removePlayer(socketId) {
    this.players.delete(socketId);

    // If host leaves, assign new host
    if (this.hostSocketId === socketId && this.players.size > 0) {
      this.hostSocketId = this.players.keys().next().value;
    }
  }

  updatePlayerGameState(socketId, gameState) {
    const player = this.players.get(socketId);
    if (player) {
      player.gameState = gameState;
      player.lastUpdate = new Date();
    }
  }

  startGame() {
    this.isStarted = true;
    // Initialize game state for all players
    for (const [socketId, player] of this.players) {
      player.gameState = {
        grid: Array(20)
          .fill()
          .map(() => Array(10).fill(null)),
        score: 0,
        lines: 0,
        level: 0,
        isGameOver: false,
      };
    }
  }

  getPlayersData() {
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
      // Max 8 players
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

    // Lưu thông tin player
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
    console.log(`Player ${playerData.name} joined room ${roomCode}`);

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

  // Game state update (on hard drop)
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
    });

    // Check game over logic
    const allPlayersData = room.getPlayersData();
    const alivePlayers = allPlayersData.filter((p) => !p.isGameOver);
    const gameOverPlayers = allPlayersData.filter((p) => p.isGameOver);

    console.log(`🎮 Game state update in room ${playerInfo.roomCode}:`);
    console.log(`  - Total players: ${allPlayersData.length}`);
    console.log(`  - Alive players: ${alivePlayers.length}`);
    console.log(`  - Game over players: ${gameOverPlayers.length}`);
    console.log(`  - Current player game over: ${gameState.isGameOver}`);
    console.log(
      `  - Players data:`,
      allPlayersData.map((p) => ({
        name: p.name,
        isGameOver: p.isGameOver,
        score: p.score,
      }))
    );

    // Nếu có player vừa game over, thông báo cho tất cả
    if (gameState.isGameOver) {
      console.log(
        `🎮 Player ${playerInfo.name} just game over, notifying all players`
      );
      io.to(playerInfo.roomCode).emit("player_game_over", {
        playerId: socket.id,
        playerName: playerInfo.name,
        finalScore: gameState.score,
        playersRemaining: alivePlayers.length,
        totalPlayers: allPlayersData.length,
        allPlayersData: allPlayersData.sort((a, b) => b.score - a.score),
      });
    }

    // Nếu chỉ còn 1 người chơi và có nhiều hơn 1 người ban đầu => có winner
    if (alivePlayers.length === 1 && allPlayersData.length > 1) {
      const winner = alivePlayers[0];

      console.log(
        `🏆 Game winner detected in room ${playerInfo.roomCode}: ${winner.name}`
      );
      io.to(playerInfo.roomCode).emit("game_winner", {
        winner: winner,
        finalScores: allPlayersData.sort((a, b) => b.score - a.score),
        totalPlayers: allPlayersData.length,
      });

      room.isStarted = false;
      console.log(`Game winner in room ${playerInfo.roomCode}: ${winner.name}`);
    }
    // Nếu tất cả đều game over => kết thúc game
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
      console.log(
        `All players game over in room ${playerInfo.roomCode}, top scorer: ${topPlayer.name}`
      );
    }
  });

  // Player ready/unready
  socket.on("toggle_ready", () => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomCode);
    if (!room || room.isStarted) return;

    const player = room.players.get(socket.id);
    if (player) {
      player.isReady = !player.isReady;

      io.to(playerInfo.roomCode).emit("player_ready_changed", {
        playerId: socket.id,
        isReady: player.isReady,
        players: room.getPlayersData(),
      });
    }
  });

  // Get room info
  socket.on("get_room_info", () => {
    const playerInfo = players.get(socket.id);
    if (!playerInfo) return;

    const room = rooms.get(playerInfo.roomCode);
    if (!room) return;

    socket.emit("room_info", {
      roomCode: room.roomCode,
      isHost: socket.id === room.hostSocketId,
      isStarted: room.isStarted,
      players: room.getPlayersData(),
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

        // Remove player from room using GameRoom method
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

          console.log(
            `${playerName} left room ${playerInfo.roomCode}. Remaining players: ${room.players.size}`
          );
        }
      }

      players.delete(socket.id);
    }
  });
});

// REST API endpoints
app.get("/api/rooms", (req, res) => {
  const roomList = Array.from(rooms.values()).map((room) => ({
    roomCode: room.roomCode,
    playerCount: room.players.size,
    isStarted: room.isStarted,
    createdAt: room.createdAt,
  }));

  res.json(roomList);
});

app.get("/api/rooms/:roomCode", (req, res) => {
  const room = rooms.get(req.params.roomCode);

  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  res.json({
    roomCode: room.roomCode,
    playerCount: room.players.size,
    isStarted: room.isStarted,
    players: room.getPlayersData(),
    createdAt: room.createdAt,
  });
});

app.get("/api/stats", (req, res) => {
  res.json({
    totalRooms: rooms.size,
    totalPlayers: players.size,
    activeGames: Array.from(rooms.values()).filter((room) => room.isStarted)
      .length,
  });
});

// Create room endpoint
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

    // Sử dụng roomCode được request hoặc tạo mới
    const roomCode = requestedRoomCode
      ? requestedRoomCode.toUpperCase()
      : generateRoomCode();

    // Kiểm tra xem room đã tồn tại chưa
    if (requestedRoomCode && rooms.has(roomCode)) {
      return res.status(409).json({ error: "Room already exists" });
    }

    // Tạo room instance với GameRoom class (hostSocketId sẽ được set khi join qua socket)
    const room = new GameRoom(roomCode, null);
    room.hostName = playerName.trim(); // Temporary host name until socket connection

    rooms.set(roomCode, room);

    console.log(
      `🏠 Room created: ${roomCode} by ${playerName}${
        requestedRoomCode ? " (custom code)" : ""
      }`
    );

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

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`🚀 Tetris Co-op Server running on port ${PORT}`);
  console.log(`🔗 WebSocket server ready for connections`);
});

// Cleanup empty rooms every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [roomCode, room] of rooms) {
    // Remove rooms that are empty for more than 5 minutes
    if (room.players.size === 0 && now - room.createdAt > 5 * 60 * 1000) {
      rooms.delete(roomCode);
      console.log(`Cleaned up empty room: ${roomCode}`);
    }
  }
}, 5 * 60 * 1000);
