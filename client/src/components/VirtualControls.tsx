import React, { useCallback, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowDown,
  RotateRight,
  ReplayCircleFilled,
} from "@mui/icons-material";

interface VirtualControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onHold: () => void;
  onMoveLeftRelease: () => void;
  onMoveRightRelease: () => void;
  onMoveDownRelease: () => void;
  onRotateRelease: () => void;
  onHardDropRelease: () => void;
  onHoldRelease: () => void;
}

const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  onHold,
  onMoveLeftRelease,
  onMoveRightRelease,
  onMoveDownRelease,
  onRotateRelease,
  onHardDropRelease,
  onHoldRelease,
}) => {
  const intervalRefs = useRef<{ [key: string]: number | null }>({});
  const isActiveRefs = useRef<{ [key: string]: boolean }>({});

  const handleStart = useCallback(
    (action: () => void, key: string, isRepeatable = false) => {
      // Prevent multiple starts
      if (isActiveRefs.current[key]) {
        return;
      }

      isActiveRefs.current[key] = true;

      // Clear any existing interval for this key first
      const existingInterval = intervalRefs.current[key];
      if (existingInterval) {
        clearInterval(existingInterval);
        intervalRefs.current[key] = null;
      }

      // Execute immediate action
      action();

      // Setup interval for repeatable actions (movement keys)
      if (isRepeatable) {
        intervalRefs.current[key] = setInterval(() => {
          action();
        }, 120);
      }
    },
    []
  );

  const handleEnd = useCallback((key: string) => {
    // Only end if it was active
    if (!isActiveRefs.current[key]) {
      return;
    }

    isActiveRefs.current[key] = false;

    const interval = intervalRefs.current[key];
    if (interval) {
      clearInterval(interval);
      intervalRefs.current[key] = null;
    }
  }, []);

  const buttonStyle = {
    width: "100%",
    height: "100%",
    borderRadius: 2,
    backgroundColor: "rgba(0, 170, 255, 0.85)",
    backdropFilter: "blur(10px)",
    border: "2px solid rgba(0, 170, 255, 0.9)",
    color: "white",
    "&:active": {
      backgroundColor: "rgba(255, 107, 53, 0.9)",
      transform: "scale(0.9)",
      borderColor: "rgba(255, 107, 53, 1)",
      boxShadow: "0 0 20px rgba(255, 107, 53, 0.5)",
    },
    "&:hover": {
      backgroundColor: "rgba(0, 170, 255, 0.9)",
      boxShadow: "0 0 15px rgba(0, 170, 255, 0.4)",
    },
    transition: "all 0.1s ease",
    boxShadow:
      "0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 8,
        left: 8,
        right: 8,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: "1vw",
        alignItems: "flex-end",
        px: "2vw",
        py: 1.5,
        zIndex: 1500,
        opacity: 0.5,
      }}
    >
      {/* Phần 1: Left Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          aspectRatio: "1",
        }}
      >
        <IconButton
          sx={buttonStyle}
          onPointerDown={(e) => {
            e.preventDefault();
            handleStart(onMoveLeft, "left", true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            handleEnd("left");
            onMoveLeftRelease();
          }}
          onPointerLeave={(e) => {
            e.preventDefault();
            handleEnd("left");
            onMoveLeftRelease();
          }}
        >
          <KeyboardArrowLeft sx={{ fontSize: "min(8vw, 32px)" }} />
        </IconButton>
      </Box>

      {/* Phần 2: Up and Down Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5vw",
        }}
      >
        {/* Soft Drop */}
        <Box sx={{ flex: 1, aspectRatio: "1" }}>
          <IconButton
            sx={buttonStyle}
            onPointerDown={(e) => {
              e.preventDefault();
              handleStart(onMoveDown, "down", true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleEnd("down");
              onMoveDownRelease();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              handleEnd("down");
              onMoveDownRelease();
            }}
          >
            <KeyboardArrowDown sx={{ fontSize: "min(6vw, 24px)" }} />
          </IconButton>
        </Box>
      </Box>

      {/* Phần 3: Right Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5vw",
        }}
      >
        {/* Hold */}
        <Box sx={{ flex: 1, aspectRatio: "1" }}>
          <IconButton
            sx={buttonStyle}
            onPointerDown={(e) => {
              e.preventDefault();
              handleStart(onHold, "hold");
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleEnd("hold");
              onHoldRelease();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              handleEnd("hold");
              onHoldRelease();
            }}
          >
            <ReplayCircleFilled sx={{ fontSize: "min(6vw, 24px)" }} />
          </IconButton>
        </Box>

        {/* Rotate */}
        <Box sx={{ flex: 1, aspectRatio: "1" }}>
          <IconButton
            sx={buttonStyle}
            onPointerDown={(e) => {
              e.preventDefault();
              handleStart(onMoveRight, "right", true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleEnd("right");
              onMoveRightRelease();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              handleEnd("right");
              onMoveRightRelease();
            }}
          >
            <KeyboardArrowRight sx={{ fontSize: "min(8vw, 32px)" }} />
          </IconButton>
        </Box>
      </Box>
      {/* Phần 4: Hard Drop and Rotate Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5vw",
        }}
      >
        {/* Rotate */}
        <Box sx={{ flex: 1, aspectRatio: "1" }}>
          <IconButton
            sx={buttonStyle}
            onPointerDown={(e) => {
              e.preventDefault();
              handleStart(onRotate, "rotate");
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleEnd("rotate");
              onRotateRelease();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              handleEnd("rotate");
              onRotateRelease();
            }}
          >
            <RotateRight sx={{ fontSize: "min(6vw, 24px)" }} />
          </IconButton>
        </Box>

        {/* Hard Drop */}
        <Box sx={{ flex: 1, aspectRatio: "1" }}>
          <IconButton
            sx={buttonStyle}
            onPointerDown={(e) => {
              e.preventDefault();
              handleStart(onHardDrop, "hardDrop");
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleEnd("hardDrop");
              onHardDropRelease();
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              handleEnd("hardDrop");
              onHardDropRelease();
            }}
          >
            <KeyboardArrowDown sx={{ fontSize: "min(6vw, 24px)" }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualControls;
