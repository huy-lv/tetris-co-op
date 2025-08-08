import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
} from "@mui/material";
import {
  SettingsRounded,
  KeyboardRounded,
  TuneRounded,
  CloseRounded,
  Animation,
} from "@mui/icons-material";
import {
  CONTROLS,
  ANIMATION_SETTINGS,
  updateAnimationSettings,
} from "../constants";

interface KeyCaptureProps {
  value: string;
  onKeyChange: (key: string) => void;
  isCapturing: boolean;
  onStartCapture: () => void;
}

const KeyCapture: React.FC<KeyCaptureProps> = ({
  value,
  onKeyChange,
  isCapturing,
  onStartCapture,
}) => {
  useEffect(() => {
    if (!isCapturing) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const key = e.key.toLowerCase();
      // Don't allow special keys
      if (key.length === 1 && key.match(/[a-z0-9]/)) {
        onKeyChange(key);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isCapturing, onKeyChange]);

  return (
    <Box
      onClick={onStartCapture}
      sx={{
        width: "60px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1,
        border: isCapturing
          ? "2px solid #00aaff"
          : "1px solid rgba(0, 170, 255, 0.3)",
        bgcolor: isCapturing
          ? "rgba(0, 170, 255, 0.2)"
          : "rgba(0, 170, 255, 0.1)",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: "rgba(0, 170, 255, 0.2)",
          borderColor: "primary.main",
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: "bold",
          textTransform: "uppercase",
          color: isCapturing ? "primary.main" : "text.primary",
          fontSize: "14px",
        }}
      >
        {isCapturing ? "..." : value || "?"}
      </Typography>
    </Box>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [controls, setControls] = useState<{ [key: string]: string }>({
    ...CONTROLS,
  });
  const [originalControls, setOriginalControls] = useState<{
    [key: string]: string;
  }>({ ...CONTROLS });
  const [capturingKey, setCapturingKey] = useState<string | null>(null);
  const [animationSettings, setAnimationSettings] = useState({
    enableShake: ANIMATION_SETTINGS.ENABLE_SHAKE,
    enableFireball: ANIMATION_SETTINGS.ENABLE_FIREBALL,
  });
  const [originalAnimationSettings, setOriginalAnimationSettings] = useState({
    enableShake: ANIMATION_SETTINGS.ENABLE_SHAKE,
    enableFireball: ANIMATION_SETTINGS.ENABLE_FIREBALL,
  });

  // Load settings from localStorage when component mounts
  useEffect(() => {
    const savedControls = localStorage.getItem("tetris-controls");
    if (savedControls) {
      try {
        const parsedControls = JSON.parse(savedControls);
        setControls(parsedControls);
        setOriginalControls(parsedControls);
      } catch (error) {
        console.error("Failed to parse saved controls:", error);
      }
    }

    // Load animation settings from localStorage
    const savedAnimationSettings = localStorage.getItem(
      "tetris-animation-settings"
    );
    if (savedAnimationSettings) {
      try {
        const parsedAnimationSettings = JSON.parse(savedAnimationSettings);
        setAnimationSettings(parsedAnimationSettings);
        setOriginalAnimationSettings(parsedAnimationSettings);
      } catch (error) {
        console.error("Failed to parse saved animation settings:", error);
      }
    }
  }, [open]);

  const handleClose = (
    _event: object,
    reason?: "backdropClick" | "escapeKeyDown"
  ) => {
    // Only close when ESC is pressed, don't close when clicking backdrop
    if (reason === "backdropClick") {
      return;
    }
    onClose();
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStartCapture = (controlKey: string) => {
    setCapturingKey(controlKey);
  };

  const handleKeyChange = (controlKey: string, newKey: string) => {
    setControls({ ...controls, [controlKey]: newKey });
    setCapturingKey(null);
  };

  const handleSave = () => {
    localStorage.setItem("tetris-controls", JSON.stringify(controls));
    localStorage.setItem(
      "tetris-animation-settings",
      JSON.stringify(animationSettings)
    );
    setOriginalControls({ ...controls });
    setOriginalAnimationSettings({ ...animationSettings });

    // Update global animation settings
    updateAnimationSettings({
      ENABLE_SHAKE: animationSettings.enableShake,
      ENABLE_FIREBALL: animationSettings.enableFireball,
    });

    onClose();
  };

  const handleReset = () => {
    setControls({ ...CONTROLS });
    setAnimationSettings({
      enableShake: true,
      enableFireball: true,
    });
    setOriginalAnimationSettings({
      enableShake: true,
      enableFireball: true,
    });
  };

  const CONTROL_LABELS: Record<keyof typeof CONTROLS, string> = {
    MOVE_LEFT: "Move Left",
    MOVE_RIGHT: "Move Right",
    MOVE_DOWN: "Move Down",
    MOVE_UP: "Move Up",
    ROTATE: "Rotate Piece",
    HARD_DROP: "Hard Drop",
    HOLD: "Hold Piece",
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      disableEscapeKeyDown={false}
      PaperProps={{
        sx: {
          background: "rgba(26, 26, 26, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0, 170, 255, 0.3)",
          borderRadius: 3,
          minWidth: "500px",
          position: "relative",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "rgba(0, 0, 0, 0.3)",
          color: "primary.light",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SettingsRounded sx={{ mr: 1 }} />
          Settings
        </Box>
        <Button
          onClick={onClose}
          sx={{
            minWidth: "auto",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            color: "text.secondary",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.1)",
              color: "primary.light",
            },
          }}
        >
          <CloseRounded fontSize="small" />
        </Button>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              color: "text.secondary",
              "&.Mui-selected": { color: "primary.light" },
            },
          }}
        >
          <Tab icon={<KeyboardRounded />} label="Controls" />
          <Tab icon={<Animation />} label="Animations" />
          <Tab icon={<TuneRounded />} label="General" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" color="primary.light" gutterBottom>
            Customize Control Keys
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 1,
            }}
          >
            {Object.entries(CONTROL_LABELS).map(([key, label]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid rgba(0, 170, 255, 0.2)",
                  bgcolor: "rgba(0, 0, 0, 0.2)",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ flexGrow: 1, color: "text.primary" }}
                >
                  {label}:
                </Typography>
                <KeyCapture
                  value={controls[key as keyof typeof CONTROLS] || ""}
                  onKeyChange={(newKey) => handleKeyChange(key, newKey)}
                  isCapturing={capturingKey === key}
                  onStartCapture={() => handleStartCapture(key)}
                />
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Changes will be saved and applied immediately.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" color="primary.light" gutterBottom>
            Animation Settings
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                py: 1.5,
                borderRadius: 2,
                border: "1px solid rgba(0, 170, 255, 0.2)",
                bgcolor: "rgba(0, 0, 0, 0.2)",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="body1" color="text.primary">
                  Shake Animation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Screen shake when clearing lines or game over
                </Typography>
              </Box>
              <input
                type="checkbox"
                checked={animationSettings.enableShake}
                onChange={(e) =>
                  setAnimationSettings({
                    ...animationSettings,
                    enableShake: e.target.checked,
                  })
                }
                style={{
                  width: "20px",
                  height: "20px",
                  accentColor: "#00aaff",
                }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                py: 1.5,
                borderRadius: 2,
                border: "1px solid rgba(0, 170, 255, 0.2)",
                bgcolor: "rgba(0, 0, 0, 0.2)",
              }}
            >
              <Box>
                <Typography variant="body1" color="text.primary">
                  Fireball Animation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Fireball effects when sending garbage rows
                </Typography>
              </Box>
              <input
                type="checkbox"
                checked={animationSettings.enableFireball}
                onChange={(e) =>
                  setAnimationSettings({
                    ...animationSettings,
                    enableFireball: e.target.checked,
                  })
                }
                style={{
                  width: "20px",
                  height: "20px",
                  accentColor: "#00aaff",
                }}
              />
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" color="primary.light" gutterBottom>
            General Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            General settings will be added in future versions.
          </Typography>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: "rgba(0, 0, 0, 0.2)" }}>
        <Button
          onClick={handleReset}
          color="error"
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Reset to Default
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={
            JSON.stringify(controls) === JSON.stringify(originalControls) &&
            JSON.stringify(animationSettings) ===
              JSON.stringify(originalAnimationSettings)
          }
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
