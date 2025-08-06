import React from "react";
import { Box } from "@mui/material";
import { styled, keyframes } from "@mui/system";

const fireballFly = keyframes`
  0% {
    transform: translateX(0) translateY(0) scale(0.5);
    opacity: 0;
  }
  10% {
    transform: translateX(0) translateY(0) scale(1);
    opacity: 1;
  }
  20% {
    transform: translateX(calc(var(--target-x, 100px) * 0.15)) translateY(calc(var(--target-y, 50px) * 0.1)) scale(1.1);
    opacity: 1;
  }
  40% {
    transform: translateX(calc(var(--target-x, 100px) * 0.4)) translateY(calc(var(--target-y, 50px) * 0.3)) scale(1.2);
    opacity: 1;
  }
  60% {
    transform: translateX(calc(var(--target-x, 100px) * 0.65)) translateY(calc(var(--target-y, 50px) * 0.55)) scale(1.3);
    opacity: 1;
  }
  80% {
    transform: translateX(calc(var(--target-x, 100px) * 0.85)) translateY(calc(var(--target-y, 50px) * 0.8)) scale(1.4);
    opacity: 1;
  }
  95% {
    transform: translateX(calc(var(--target-x, 100px) * 0.98)) translateY(calc(var(--target-y, 50px) * 0.95)) scale(1.6);
    opacity: 1;
  }
  100% {
    transform: translateX(var(--target-x, 100px)) translateY(var(--target-y, 50px)) scale(2);
    opacity: 0;
  }
`;

const fireballGlow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 4px rgba(255, 69, 0, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(255, 69, 0, 0.9)) drop-shadow(0 0 20px rgba(255, 140, 0, 0.5));
  }
`;

const FireballContainer = styled(Box, {
  shouldForwardProp: (prop) =>
    !["startX", "startY", "targetX", "targetY"].includes(prop as string),
})<{
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
}>`
  position: fixed;
  left: ${(props) => props.startX}px;
  top: ${(props) => props.startY}px;
  z-index: 2200;
  pointer-events: none;
  --target-x: ${(props) => props.targetX - props.startX}px;
  --target-y: ${(props) => props.targetY - props.startY}px;
  animation: ${fireballFly} 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards,
    ${fireballGlow} 0.4s ease-in-out infinite;
`;

const FireballBall = styled("div")`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    #ffff00 0%,
    #ff8c00 30%,
    #ff4500 60%,
    #dc143c 100%
  );
  box-shadow: 0 0 12px rgba(255, 69, 0, 0.8),
    inset -3px -3px 6px rgba(0, 0, 0, 0.3),
    inset 2px 2px 3px rgba(255, 255, 255, 0.6);
  transform-origin: center;
`;

interface FireballProps {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetPlayerId: string;
  garbageRows: number;
  onComplete?: () => void;
}

const Fireball: React.FC<FireballProps> = ({
  startX,
  startY,
  targetX,
  targetY,
  targetPlayerId,
  garbageRows,
  onComplete,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Import gameService dynamically to avoid circular dependency
      import("../services/gameService").then(({ default: gameService }) => {
        console.log(
          `💥 Fireball hit! Sending ${garbageRows} garbage rows to player ${targetPlayerId}`
        );
        gameService.sendGarbageRows(targetPlayerId, garbageRows);
      });

      onComplete?.();
    }, 400); // Match animation duration (0.4s)

    return () => clearTimeout(timer);
  }, [onComplete, targetPlayerId, garbageRows]);

  return (
    <FireballContainer
      startX={startX}
      startY={startY}
      targetX={targetX}
      targetY={targetY}
    >
      <FireballBall />
    </FireballContainer>
  );
};

export default Fireball;
