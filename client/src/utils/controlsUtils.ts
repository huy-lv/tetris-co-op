import { CONTROLS } from "../constants";

export const getControlsFromStorage = () => {
  const savedControls = localStorage.getItem("tetris-controls");
  if (savedControls) {
    try {
      const parsedControls = JSON.parse(savedControls);
      // Merge with default CONTROLS to ensure all keys exist
      return { ...CONTROLS, ...parsedControls };
    } catch (error) {
      console.error("Failed to parse saved controls:", error);
      return CONTROLS;
    }
  }
  return CONTROLS;
};
