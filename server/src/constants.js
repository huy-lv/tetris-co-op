const GAME_EVENTS = {
  // Client to Server
  CREATE_ROOM: "create_room",
  JOIN_ROOM: "join_room",
  START_GAME: "start_game",
  GAME_STATE_UPDATE: "game_state_update",
  TOGGLE_READY: "toggle_ready",
  GET_ROOM_INFO: "get_room_info",

  // Server to Client
  ROOM_CREATED: "room_created",
  ROOM_JOINED: "room_joined",
  PLAYER_JOINED: "player_joined",
  PLAYER_LEFT: "player_left",
  GAME_STARTED: "game_started",
  PLAYER_STATE_UPDATED: "player_state_updated",
  GAME_ENDED: "game_ended",
  PLAYER_READY_CHANGED: "player_ready_changed",
  ROOM_INFO: "room_info",
  ERROR: "error",
};

const GAME_CONFIG = {
  MAX_PLAYERS_PER_ROOM: 4,
  ROOM_CODE_LENGTH: 6,
  ROOM_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  ROOM_EXPIRE_TIME: 5 * 60 * 1000, // 5 minutes of inactivity

  // Game constants (should match client)
  BOARD_WIDTH: 10,
  BOARD_HEIGHT: 20,
};

const ROOM_STATUS = {
  WAITING: "waiting",
  PLAYING: "playing",
  FINISHED: "finished",
};

const PLAYER_STATUS = {
  CONNECTED: "connected",
  READY: "ready",
  PLAYING: "playing",
  GAME_OVER: "game_over",
  DISCONNECTED: "disconnected",
};

module.exports = {
  GAME_EVENTS,
  GAME_CONFIG,
  ROOM_STATUS,
  PLAYER_STATUS,
};
