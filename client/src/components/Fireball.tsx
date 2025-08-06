import React from "react";
import { motion } from "motion/react";
import { styled } from "@mui/system";

const FireballContainer = styled(motion.div)`
  position: fixed;
  z-index: 2200;
  pointer-events: none;
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
  filter: drop-shadow(0 0 8px rgba(255, 69, 0, 0.6));
`;
interface FireballProps {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  onComplete?: () => void;
}

const Fireball: React.FC<FireballProps> = ({
  startX,
  startY,
  targetX,
  targetY,
  onComplete,
}) => {
  console.log(
    `🚀 Fireball created: from (${startX}, ${startY}) to (${targetX}, ${targetY})`
  );

  return (
    <FireballContainer
      initial={{
        x: startX,
        y: startY,
        scale: 0.5,
        opacity: 0,
      }}
      animate={{
        x: targetX,
        y: targetY,
        scale: [0.5, 1, 1.2, 1.4, 1.8],
        opacity: [0, 1, 1, 0.8, 0],
        filter: [
          "drop-shadow(0 0 8px rgba(255, 69, 0, 0.6))",
          "drop-shadow(0 0 12px rgba(255, 69, 0, 0.8))",
          "drop-shadow(0 0 16px rgba(255, 140, 0, 0.9))",
          "drop-shadow(0 0 20px rgba(255, 140, 0, 1))",
          "drop-shadow(0 0 24px rgba(255, 69, 0, 0))",
        ],
      }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        scale: {
          times: [0, 0.2, 0.5, 0.8, 1],
          ease: "easeInOut",
        },
        opacity: {
          times: [0, 0.1, 0.7, 0.9, 1],
          ease: "easeInOut",
        },
        filter: {
          times: [0, 0.3, 0.6, 0.8, 1],
          ease: "easeInOut",
        },
      }}
      onAnimationComplete={() => {
        console.log(`✅ Fireball animation completed`);
        onComplete?.();
      }}
      onAnimationStart={() => {
        console.log(`🎬 Fireball animation started`);
      }}
    >
      <FireballBall />
    </FireballContainer>
  );
};

export default Fireball;
