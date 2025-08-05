# Tetris Co-op Server

Backend server for multiplayer Tetris game using Express.js and Socket.IO.

## Features

- **Room Management**: Create and join rooms with 6-character codes
- **Real-time Multiplayer**: Up to 4 players per room
- **Game Synchronization**: Real-time game state updates via WebSocket
- **Automatic Cleanup**: Empty rooms are automatically removed
- **REST API**: Get room info and server statistics

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## API Endpoints

### WebSocket Events

#### Client to Server

- `create_room` - Create a new game room
- `join_room` - Join existing room with code
- `start_game` - Start the game (any player can start)
- `game_state_update` - Update game state (on hard drop)
- `toggle_ready` - Toggle player ready status
- `get_room_info` - Get current room information

#### Server to Client

- `room_created` - Room creation successful
- `room_joined` - Successfully joined room
- `player_joined` - New player joined room
- `player_left` - Player left room
- `game_started` - Game started notification
- `player_state_updated` - Player's game state updated
- `game_ended` - Game finished with results
- `player_ready_changed` - Player ready status changed
- `room_info` - Room information response
- `error` - Error message

### REST API

- `GET /api/rooms` - List all active rooms
- `GET /api/rooms/:roomCode` - Get specific room info
- `GET /api/stats` - Server statistics
- `GET /health` - Health check

## Game Flow

1. **Create Room**: Player creates room, gets 6-character code
2. **Join Room**: Other players join using the code
3. **Ready Up**: Players can toggle ready status (optional)
4. **Start Game**: Any player can start the game
5. **Play**: Real-time game state sync on hard drops
6. **End Game**: Game ends when all players finish, winner announced

## Room Codes

- 6 characters (A-Z, 0-9)
- Automatically generated
- Case-insensitive
- Unique across all active rooms

## Configuration

Default settings:

- Port: 5000
- Max players per room: 4
- Room cleanup interval: 5 minutes
- CORS origin: http://localhost:3000

## Architecture

```
Client (React) <-> Socket.IO <-> Express Server
                               |
                               v
                         Room Management
                         Player Tracking
                         Game State Sync
```
