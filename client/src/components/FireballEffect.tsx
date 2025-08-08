import React, { useState, useCallback, useRef } from "react";
import Fireball from "./Fireball";
import { ANIMATION_SETTINGS } from "../constants";

interface FireballData {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetPlayerId: string;
  garbageRows: number;
}

interface FireballEffectProps {
  children?: React.ReactNode;
}

export interface FireballEffectRef {
  shootFireball: (
    targetX: number,
    targetY: number,
    targetPlayerId: string,
    garbageRows: number
  ) => void;
  shootMultipleFireballs: (
    targets: { x: number; y: number; playerId: string }[],
    garbageRows: number
  ) => void;
}

const FireballEffect = React.forwardRef<FireballEffectRef, FireballEffectProps>(
  ({ children }, ref) => {
    const [fireballs, setFireballs] = useState<FireballData[]>([]);
    const nextIdRef = useRef(0);

    const shootFireball = useCallback(
      (
        targetX: number,
        targetY: number,
        targetPlayerId: string,
        garbageRows: number
      ) => {
        console.log(`🎯 Shooting fireball to: ${targetX}, ${targetY}`);

        // Get game board bottom center as starting point
        const gameBoard =
          document.querySelector('[data-testid="game-board"]') ||
          document.querySelector('[data-testid="gameboard"]') ||
          document.querySelector("canvas") ||
          document.querySelector(".MuiPaper-root");

        let startX = window.innerWidth / 2;
        let startY = window.innerHeight / 2;

        console.log(`🎮 Game board found:`, gameBoard);

        if (gameBoard) {
          const rect = gameBoard.getBoundingClientRect();
          startX = rect.left + rect.width / 2;
          startY = rect.bottom - 20; // Start from bottom of game board
          console.log(`📍 Start position: ${startX}, ${startY}`);
        } else {
          console.warn(`❌ Game board not found, using fallback position`);
        }

        const newFireball: FireballData = {
          id: `fireball-${nextIdRef.current++}`,
          startX,
          startY,
          targetX,
          targetY,
          targetPlayerId,
          garbageRows,
        };

        console.log(`🔥 Creating fireball:`, newFireball);
        setFireballs((prev) => {
          const updated = [...prev, newFireball];
          console.log(`🔥 Fireballs array:`, updated);
          return updated;
        });
      },
      []
    );

    const shootMultipleFireballs = useCallback(
      (
        targets: { x: number; y: number; playerId: string }[],
        garbageRows: number
      ) => {
        targets.forEach((target, index) => {
          setTimeout(() => {
            shootFireball(target.x, target.y, target.playerId, garbageRows);
          }, index * 150); // Stagger fireball shots by 150ms
        });
      },
      [shootFireball]
    );

    const removeFireball = useCallback((id: string) => {
      setFireballs((prev) => prev.filter((fb) => fb.id !== id));
    }, []);

    React.useImperativeHandle(ref, () => ({
      shootFireball,
      shootMultipleFireballs,
    }));

    return (
      <>
        {children}
        {ANIMATION_SETTINGS.ENABLE_FIREBALL &&
          fireballs.map((fireball) => (
            <Fireball
              key={fireball.id}
              startX={fireball.startX}
              startY={fireball.startY}
              targetX={fireball.targetX}
              targetY={fireball.targetY}
              targetPlayerId={fireball.targetPlayerId}
              garbageRows={fireball.garbageRows}
              onComplete={() => removeFireball(fireball.id)}
            />
          ))}
      </>
    );
  }
);

FireballEffect.displayName = "FireballEffect";

export default FireballEffect;
