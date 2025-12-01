'use client';

import { useEffect, useRef } from 'react';
import { PhysicsWorld } from '@/game/physics';
import { InputManager } from '@/game/input';
import { LevelManager } from '@/game/levels';
import { Character, Level } from '@/db/supabase';

interface CanvasProps {
  width: number;
  height: number;
  character: Character;
  level: Level;
  onLevelComplete: (time: number, deaths: number) => void;
  onLevelFailed: () => void;
}

export default function Canvas({
  width,
  height,
  character,
  level,
  onLevelComplete,
  onLevelFailed,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const physicsWorldRef = useRef<PhysicsWorld>();
  const inputManagerRef = useRef<InputManager>();
  const levelManagerRef = useRef<LevelManager>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    // Initialize game systems
    const init = async () => {
      // Initialize physics
      const physicsWorld = new PhysicsWorld();
      await physicsWorld.initialize();
      physicsWorldRef.current = physicsWorld;

      // Initialize input
      const inputManager = new InputManager();
      inputManagerRef.current = inputManager;

      // Initialize level
      const levelManager = new LevelManager(physicsWorld);
      levelManagerRef.current = levelManager;

      const gameLevel = levelManager.loadLevel(level);
      gameLevel.spawnPlayer(character);

      // Start game loop
      lastTimeRef.current = performance.now();
      gameLoop(performance.now());
    };

    // Game loop with delta time
    const gameLoop = (currentTime: number) => {
      if (!isRunning) return;

      const deltaTime = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      // Update physics
      physicsWorldRef.current?.step(deltaTime);

      // Update game
      const currentLevel = levelManagerRef.current?.getCurrentLevel();
      if (currentLevel && inputManagerRef.current) {
        currentLevel.update(deltaTime, inputManagerRef.current);

        // Check win/lose conditions
        if (currentLevel.isLevelComplete()) {
          onLevelComplete(currentLevel.getCompletionTime(), currentLevel.getDeaths());
          isRunning = false;
          return;
        }

        if (currentLevel.isLevelFailed()) {
          onLevelFailed();
          // Respawn after a short delay
          setTimeout(() => {
            currentLevel.respawn(character);
          }, 500);
        }
      }

      // Render
      ctx.clearRect(0, 0, width, height);
      currentLevel?.render(ctx, width, height);

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    init();

    // Cleanup
    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      inputManagerRef.current?.cleanup();
      levelManagerRef.current?.unloadLevel();
    };
  }, [character, level, width, height, onLevelComplete, onLevelFailed]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border-4 border-gray-800 rounded-lg shadow-lg"
    />
  );
}
