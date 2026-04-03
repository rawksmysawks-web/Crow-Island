import { useEffect, useRef } from 'react';
import Constants from './Constants';
import { WALLS, SAFE_ZONES, LIGHTS } from './Map';

function checkCollision(px, py, size, walls) {
  const half = size / 2;
  const pr = { l: px - half, r: px + half, t: py - half, b: py + half };
  for (const w of walls) {
    const wr = { l: w.x - w.width/2, r: w.x + w.width/2, t: w.y - w.height/2, b: w.y + w.height/2 };
    if (pr.l < wr.r && pr.r > wr.l && pr.t < wr.b && pr.b > wr.t) return true;
  }
  return false;
}

function isInsideSafeZone(px, py, size, safeZones) {
  const half = size / 2;
  const pr = { l: px - half, r: px + half, t: py - half, b: py + half };
  for (const sz of safeZones) {
    const sr = { l: sz.x - sz.width/2, r: sz.x + sz.width/2, t: sz.y - sz.height/2, b: sz.y + sz.height/2 };
    if (pr.l < sr.r && pr.r > sr.l && pr.t < sr.b && pr.b > sr.t) return true;
  }
  return false;
}

export function useGameLoop(
  gameState,
  setGameState,
  playerPosRef,
  enemyPosRef,
  joystickRef,
  isSprintingRef,
  staminaRef,
  setStaminaState,
  fearRef,
  setFearState,
  dayTimeRef,
  setDayTimeState,
  setDayTime,
  playerAngleRef,
  enemyAngleRef
) {
  const requestRef = useRef();
  const powerOutTimerRef = useRef(0);
  const previousTimeRef = useRef();

  const update = (time) => {
    if (gameState !== 'PLAYING') return;

    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;

      // 1. Update Time of Day
      dayTimeRef.current += deltaTime;
      
      const totalCycleTime = Constants.DAY_DURATION + Constants.NIGHT_DURATION;
      const cycleTime = dayTimeRef.current % totalCycleTime;
      const currentNightNum = Math.floor(dayTimeRef.current / totalCycleTime) + 1;
      const isNight = cycleTime > Constants.DAY_DURATION;

      // Sync dayTimeState occasionally
      if (Math.floor(dayTimeRef.current) % 500 < 50) {
        setDayTimeState(dayTimeRef.current);
      }

      // 2. Move Player
      const { angle, force } = joystickRef.current;
      if (force > 0 && playerAngleRef) {
        playerAngleRef.current = angle + Math.PI / 2;
      }

      let currentSpeed = Constants.PLAYER_SPEED;
      let isActuallySprinting = force > 0 && isSprintingRef.current && staminaRef.current > 0;

      if (isActuallySprinting) {
        currentSpeed = Constants.PLAYER_SPEED * Constants.SPRINT_SPEED_MULTIPLIER;
        staminaRef.current -= Constants.STAMINA_DRAIN * (deltaTime / 1000);
      } else {
        staminaRef.current += Constants.STAMINA_REGEN * (deltaTime / 1000);
      }
      staminaRef.current = Math.max(0, Math.min(Constants.STAMINA_MAX, staminaRef.current));

      if (Math.floor(dayTimeRef.current) % 500 < 50) {
        setStaminaState(staminaRef.current);
      }

      if (force > 0) {
        const speed = currentSpeed * force;
        let newX = playerPosRef.current.x + Math.cos(angle) * speed;
        let newY = playerPosRef.current.y + Math.sin(angle) * speed;

        newX = Math.max(-Constants.MAP_WIDTH / 2, Math.min(Constants.MAP_WIDTH / 2, newX));
        newY = Math.max(-Constants.MAP_HEIGHT / 2, Math.min(Constants.MAP_HEIGHT / 2, newY));

        if (!checkCollision(newX, playerPosRef.current.y, Constants.PLAYER_SIZE, WALLS)) {
          playerPosRef.current.x = newX;
        }
        if (!checkCollision(playerPosRef.current.x, newY, Constants.PLAYER_SIZE, WALLS)) {
          playerPosRef.current.y = newY;
        }
      }

      // Fear Mechanics and Power Out
      let inSafeZone = false;
      for (const sz of SAFE_ZONES) {
        if (playerPosRef.current.x > sz.x - sz.width/2 && playerPosRef.current.x < sz.x + sz.width/2 &&
            playerPosRef.current.y > sz.y - sz.height/2 && playerPosRef.current.y < sz.y + sz.height/2) {
          inSafeZone = true;
          break;
        }
      }

      if (isNight) {
        powerOutTimerRef.current -= deltaTime;
        if (powerOutTimerRef.current <= 0) {
          if (Math.random() < 0.2) {
            powerOutTimerRef.current = 5000; 
          } else {
            powerOutTimerRef.current = 10000;
          }
        }
        
        // Randomly extinguish outside campfires
        if (Math.floor(dayTimeRef.current) % 1000 < 50) {
           LIGHTS.forEach(l => {
              if (l.type === 'CAMPFIRE' && !l.safeZoneId && l.active) {
                 if (Math.random() < 0.05) {
                    l.active = false;
                 }
              }
           });
        }
      }

      const isPowerOut = powerOutTimerRef.current > 0 && powerOutTimerRef.current <= 5000;

      if (isNight && (!inSafeZone || isPowerOut)) {
        fearRef.current += (100 / 20) * (deltaTime / 1000);
      } else {
        fearRef.current -= (100 / 5) * (deltaTime / 1000);
      }
      fearRef.current = Math.max(0, Math.min(100, fearRef.current));

      if (Math.floor(dayTimeRef.current) % 500 < 50) {
        setFearState({ value: fearRef.current, powerOut: isPowerOut });
      }

      // 3. Move Enemy
      const dx = playerPosRef.current.x - enemyPosRef.current.x;
      const dy = playerPosRef.current.y - enemyPosRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isNight) {
        if (dist > 0.1) {
          if (enemyAngleRef) {
              enemyAngleRef.current = Math.atan2(dy, dx) + Math.PI / 2;
          }

          const scaledNightSpeed = Constants.ENEMY_SPEED_NIGHT + (currentNightNum - 1) * 0.5;
          let newEx = enemyPosRef.current.x + (dx / dist) * scaledNightSpeed;
          let newEy = enemyPosRef.current.y + (dy / dist) * scaledNightSpeed;
          
          newEx = Math.max(-Constants.MAP_WIDTH / 2, Math.min(Constants.MAP_WIDTH / 2, newEx));
          newEy = Math.max(-Constants.MAP_HEIGHT / 2, Math.min(Constants.MAP_HEIGHT / 2, newEy));
          
          let inLight = false;
          if (!isPowerOut) {
             if (isInsideSafeZone(newEx, newEy, Constants.ENEMY_SIZE, SAFE_ZONES)) {
                inLight = true;
             }
             
             const distToPlayer = Math.sqrt(Math.pow(newEx - playerPosRef.current.x, 2) + Math.pow(newEy - playerPosRef.current.y, 2));
             if (distToPlayer < 400) {
                const angleToEnemy = Math.atan2(newEy - playerPosRef.current.y, newEx - playerPosRef.current.x);
                let angleDiff = angleToEnemy - playerAngleRef.current;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                if (Math.abs(angleDiff) < Math.PI / 6) {
                   inLight = true;
                }
             }

             for (const l of LIGHTS) {
                if (!l.active) continue;
                const distToLight = Math.sqrt(Math.pow(newEx - l.x, 2) + Math.pow(newEy - l.y, 2));
                const radius = l.safeZoneId ? 0 : 250; 
                if (radius > 0 && distToLight < radius) {
                   inLight = true;
                   break;
                }
             }
          }

          if (!inLight) {
            if (!checkCollision(newEx, enemyPosRef.current.y, Constants.ENEMY_SIZE, WALLS)) {
              enemyPosRef.current.x = newEx;
            }
            if (!checkCollision(enemyPosRef.current.x, newEy, Constants.ENEMY_SIZE, WALLS)) {
              enemyPosRef.current.y = newEy;
            }
          } else {
             const retreatSpeed = scaledNightSpeed * 0.5;
             let retreatEx = enemyPosRef.current.x - (dx / dist) * retreatSpeed;
             let retreatEy = enemyPosRef.current.y - (dy / dist) * retreatSpeed;
             retreatEx = Math.max(-Constants.MAP_WIDTH / 2, Math.min(Constants.MAP_WIDTH / 2, retreatEx));
             retreatEy = Math.max(-Constants.MAP_HEIGHT / 2, Math.min(Constants.MAP_HEIGHT / 2, retreatEy));
             if (!checkCollision(retreatEx, enemyPosRef.current.y, Constants.ENEMY_SIZE, WALLS)) {
               enemyPosRef.current.x = retreatEx;
             }
             if (!checkCollision(enemyPosRef.current.x, retreatEy, Constants.ENEMY_SIZE, WALLS)) {
               enemyPosRef.current.y = retreatEy;
             }
          }
        }

        if (dist < (Constants.PLAYER_SIZE + Constants.ENEMY_SIZE) / 2) {
          if (setDayTime) setDayTime(dayTimeRef.current);
          setGameState('GAMEOVER');
          return;
        }
      } else {
        if (dist < 1500) {
          const scaledFleeSpeed = Constants.ENEMY_SPEED_NIGHT * 1.5;
          const fleeDx = -(dx / dist) * scaledFleeSpeed;
          const fleeDy = -(dy / dist) * scaledFleeSpeed;
          if (enemyAngleRef) {
             enemyAngleRef.current = Math.atan2(fleeDy, fleeDx) + Math.PI / 2;
          }
          let newEx = enemyPosRef.current.x + fleeDx;
          let newEy = enemyPosRef.current.y + fleeDy;
          newEx = Math.max(-Constants.MAP_WIDTH / 2, Math.min(Constants.MAP_WIDTH / 2, newEx));
          newEy = Math.max(-Constants.MAP_HEIGHT / 2, Math.min(Constants.MAP_HEIGHT / 2, newEy));
          enemyPosRef.current.x = newEx;
          enemyPosRef.current.y = newEy;
        }
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState]);
}
