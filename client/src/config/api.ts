// API Configuration
// Check if we're in production environment
const isProduction =
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1" &&
  !window.location.hostname.includes("192.168");

export const API_CONFIG = {
  BASE_URL: isProduction
    ? "https://tetris-server.huytrang.id.vn"
    : "http://192.168.2.76:5001",
} as const;

export default API_CONFIG;
