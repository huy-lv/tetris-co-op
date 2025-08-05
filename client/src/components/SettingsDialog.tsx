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
} from "@mui/icons-material";
import { CONTROLS } from "../constants";

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
      // Không cho phép các phím đặc biệt
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

  // Tải các cài đặt từ localStorage khi component được mount
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
  }, [open]);

  const handleClose = (
    _event: object,
    reason?: "backdropClick" | "escapeKeyDown"
  ) => {
    // Chỉ đóng khi nhấn ESC, không đóng khi click backdrop
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
    setOriginalControls({ ...controls });
    onClose();
  };

  const handleReset = () => {
    setControls({ ...CONTROLS });
  };

  const controlLabels: { [key: string]: string } = {
    MOVE_LEFT: "Di chuyển trái",
    MOVE_RIGHT: "Di chuyển phải",
    MOVE_DOWN: "Di chuyển xuống",
    MOVE_UP: "Di chuyển lên",
    ROTATE: "Xoay mảnh",
    HARD_DROP: "Thả nhanh",
    HOLD: "Giữ mảnh",
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
          Cài đặt
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
          <Tab icon={<KeyboardRounded />} label="Điều khiển" />
          <Tab icon={<TuneRounded />} label="Chung" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" color="primary.light" gutterBottom>
            Tùy chỉnh phím điều khiển
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 1,
            }}
          >
            {Object.entries(controlLabels).map(([key, label]) => (
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
              Các thay đổi sẽ được lưu và áp dụng ngay lập tức.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" color="primary.light" gutterBottom>
            Cài đặt chung
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Các cài đặt chung sẽ được thêm vào trong các phiên bản tiếp theo.
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
          Đặt lại mặc định
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={
            JSON.stringify(controls) === JSON.stringify(originalControls)
          }
        >
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
