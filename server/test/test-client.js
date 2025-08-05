const io = require("socket.io-client");

// Test client for Tetris multiplayer server
class TestClient {
  constructor(name, serverUrl = "http://localhost:5001") {
    this.name = name;
    this.serverUrl = serverUrl;
    this.socket = null;
    this.roomCode = null;
  }

  connect() {
    return new Promise((resolve) => {
      this.socket = io(this.serverUrl);

      this.socket.on("connect", () => {
        console.log(`✅ ${this.name} connected to server`);
        this.setupEventListeners();
        resolve();
      });
    });
  }

  setupEventListeners() {
    this.socket.on("room_created", (data) => {
      console.log(`🏠 ${this.name} created room: ${data.roomCode}`);
      this.roomCode = data.roomCode;
    });

    this.socket.on("room_joined", (data) => {
      console.log(`🚪 ${this.name} joined room: ${data.roomCode}`);
      this.roomCode = data.roomCode;
    });

    this.socket.on("player_joined", (data) => {
      console.log(`👤 New player joined: ${data.newPlayer}`);
    });

    this.socket.on("game_started", (data) => {
      console.log(`🎮 Game started by: ${data.startedBy}`);
    });

    this.socket.on("player_state_updated", (data) => {
      console.log(
        `📊 ${data.playerName} updated state - Score: ${data.gameState.score}`
      );
    });

    this.socket.on("game_ended", (data) => {
      console.log(
        `🏆 Game ended! Winner: ${data.winner.name} with score: ${data.winner.score}`
      );
    });

    this.socket.on("error", (data) => {
      console.log(`❌ ${this.name} error: ${data.message}`);
    });
  }

  createRoom() {
    this.socket.emit("create_room", {
      name: this.name,
    });
  }

  joinRoom(roomCode) {
    this.socket.emit("join_room", {
      roomCode: roomCode.toUpperCase(),
      playerData: {
        name: this.name,
      },
    });
  }

  startGame() {
    this.socket.emit("start_game");
  }

  updateGameState(score = 100, lines = 1, level = 1, isGameOver = false) {
    const gameState = {
      grid: Array(20)
        .fill()
        .map(() => Array(10).fill(null)),
      score,
      lines,
      level,
      isGameOver,
    };

    this.socket.emit("game_state_update", gameState);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log(`🔌 ${this.name} disconnected`);
    }
  }
}

// Test scenario
async function runTest() {
  console.log("🧪 Starting Tetris multiplayer test...\n");

  const player1 = new TestClient("Alice");
  const player2 = new TestClient("Bob");

  try {
    // Connect players
    await player1.connect();
    await player2.connect();

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Player 1 creates room
    player1.createRoom();

    // Wait for room creation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Player 2 joins room
    if (player1.roomCode) {
      player2.joinRoom(player1.roomCode);
    }

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Start game
    player1.startGame();

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate some game updates
    console.log("\n📈 Simulating game updates...");
    player1.updateGameState(150, 1, 1);
    await new Promise((resolve) => setTimeout(resolve, 500));

    player2.updateGameState(200, 2, 1);
    await new Promise((resolve) => setTimeout(resolve, 500));

    player1.updateGameState(300, 3, 1);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // End game for both players
    console.log("\n🏁 Ending game...");
    player1.updateGameState(400, 4, 1, true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    player2.updateGameState(350, 3, 1, true);

    // Wait to see results
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Clean up
    player1.disconnect();
    player2.disconnect();
    process.exit(0);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  runTest();
}

module.exports = TestClient;
