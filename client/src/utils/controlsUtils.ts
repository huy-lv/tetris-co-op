import { CONTROLS } from "../constants";

export const getControlsFromStorage = () => {
  const savedControls = localStorage.getItem("tetris-controls");
  if (savedControls) {
    try {
      const parsedControls = JSON.parse(savedControls);
      // Merge với CONTROLS mặc định để đảm bảo tất cả keys đều có
      return { ...CONTROLS, ...parsedControls };
    } catch (error) {
      console.error("Failed to parse saved controls:", error);
      return CONTROLS;
    }
  }
  return CONTROLS;
};
