import { PhysicsWorld } from './physics';
import { Player, LevelPlatform, Hazard, Goal } from './entities';
import { Level, Character } from '@/db/supabase';

export class GameLevel {
  private platforms: LevelPlatform[] = [];
  private hazards: Hazard[] = [];
  private goal: Goal;
  private player: Player | null = null;
  private levelData: Level;
  private startTime: number = 0;
  private deaths: number = 0;
  private isComplete: boolean = false;
  private isFailed: boolean = false;

  constructor(private world: PhysicsWorld, levelData: Level) {
    this.levelData = levelData;

    // Create platforms
    for (const platformData of levelData.layout.platforms) {
      this.platforms.push(
        new LevelPlatform(
          world,
          platformData.x + platformData.width / 2,
          platformData.y + platformData.height / 2,
          platformData.width,
          platformData.height,
          platformData.type
        )
      );
    }

    // Create hazards
    for (const hazardData of levelData.layout.hazards) {
      this.hazards.push(
        new Hazard(
          hazardData.x,
          hazardData.y,
          hazardData.width,
          hazardData.height,
          hazardData.type
        )
      );
    }

    // Create goal
    const goalData = levelData.layout.goal;
    this.goal = new Goal(goalData.x, goalData.y, goalData.width, goalData.height);
  }

  spawnPlayer(characterData: Character) {
    if (this.player) {
      this.player.destroy();
    }

    const start = this.levelData.layout.start;
    this.player = new Player(this.world, characterData, start.x, start.y);
    this.startTime = Date.now();
  }

  update(deltaTime: number, input: any) {
    if (!this.player || this.isComplete || this.isFailed) return;

    this.player.update(input, deltaTime);

    // Check hazard collisions
    for (const hazard of this.hazards) {
      if (hazard.checkCollision(this.player)) {
        this.handlePlayerDeath();
        return;
      }
    }

    // Check goal collision
    if (this.goal.checkCollision(this.player)) {
      this.isComplete = true;
    }

    // Check if player fell off the world
    const playerPos = this.player.getPosition();
    if (playerPos.y > 700) {
      this.handlePlayerDeath();
    }
  }

  private handlePlayerDeath() {
    this.deaths++;
    this.isFailed = true;
  }

  respawn(characterData: Character) {
    this.isFailed = false;
    this.spawnPlayer(characterData);
  }

  render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    // Draw base background
    ctx.fillStyle = this.levelData.layout.background.color;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Enhanced sky gradient for desert
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.6);
    skyGradient.addColorStop(0, '#FDB45C'); // Orange-yellow at top
    skyGradient.addColorStop(0.4, '#FFA07A'); // Light coral
    skyGradient.addColorStop(1, '#E8C3A0'); // Tan at horizon
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.6);

    // Sun
    const sunGradient = ctx.createRadialGradient(
      canvasWidth * 0.8, canvasHeight * 0.15, 0,
      canvasWidth * 0.8, canvasHeight * 0.15, 50
    );
    sunGradient.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
    sunGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.6)');
    sunGradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(canvasWidth * 0.8, canvasHeight * 0.15, 50, 0, Math.PI * 2);
    ctx.fill();

    // Parallax Layer 1: Distant mountains (far back)
    ctx.fillStyle = 'rgba(139, 90, 43, 0.3)';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight * 0.5);
    for (let i = 0; i <= 6; i++) {
      const x = (canvasWidth / 6) * i;
      const peakHeight = canvasHeight * (0.35 + Math.sin(i * 1.2) * 0.1);
      ctx.lineTo(x, peakHeight);
    }
    ctx.lineTo(canvasWidth, canvasHeight * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Parallax Layer 2: Mid-distance dunes
    const duneGradient = ctx.createLinearGradient(0, canvasHeight * 0.4, 0, canvasHeight * 0.65);
    duneGradient.addColorStop(0, '#D2A774');
    duneGradient.addColorStop(1, '#C19A6B');
    ctx.fillStyle = duneGradient;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight * 0.65);
    for (let i = 0; i <= 8; i++) {
      const x = (canvasWidth / 8) * i;
      const y = canvasHeight * (0.55 + Math.sin(i * 0.8 + 1) * 0.08);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.quadraticCurveTo(x - canvasWidth / 16, y, x, y);
      }
    }
    ctx.lineTo(canvasWidth, canvasHeight * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Parallax Layer 3: Foreground cacti (simplified)
    ctx.fillStyle = '#556B2F';
    ctx.globalAlpha = 0.3;
    // Left cactus silhouette
    ctx.fillRect(canvasWidth * 0.05, canvasHeight * 0.45, 15, 80);
    ctx.fillRect(canvasWidth * 0.05 - 8, canvasHeight * 0.55, 10, 25);
    // Right cactus silhouette
    ctx.fillRect(canvasWidth * 0.92, canvasHeight * 0.5, 12, 60);
    ctx.fillRect(canvasWidth * 0.92 + 12, canvasHeight * 0.6, 8, 20);
    ctx.globalAlpha = 1.0;

    // Floating dust particles
    const time = Date.now() / 1000;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 15; i++) {
      const x = ((i * 73 + time * 20) % canvasWidth);
      const y = ((i * 97) % (canvasHeight * 0.7)) + Math.sin(time + i) * 10;
      const size = 1 + (i % 3);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw platforms
    for (const platform of this.platforms) {
      platform.render(ctx);
    }

    // Draw hazards
    for (const hazard of this.hazards) {
      hazard.render(ctx);
    }

    // Draw goal
    this.goal.render(ctx);

    // Draw player
    if (this.player) {
      this.player.render(ctx);
    }
  }

  getCompletionTime(): number {
    return (Date.now() - this.startTime) / 1000;
  }

  getDeaths(): number {
    return this.deaths;
  }

  isLevelComplete(): boolean {
    return this.isComplete;
  }

  isLevelFailed(): boolean {
    return this.isFailed;
  }

  getLevelData(): Level {
    return this.levelData;
  }

  destroy() {
    if (this.player) {
      this.player.destroy();
    }
  }
}

export class LevelManager {
  private currentLevel: GameLevel | null = null;

  constructor(private world: PhysicsWorld) {}

  loadLevel(levelData: Level): GameLevel {
    if (this.currentLevel) {
      this.currentLevel.destroy();
    }

    this.currentLevel = new GameLevel(this.world, levelData);
    return this.currentLevel;
  }

  getCurrentLevel(): GameLevel | null {
    return this.currentLevel;
  }

  unloadLevel() {
    if (this.currentLevel) {
      this.currentLevel.destroy();
      this.currentLevel = null;
    }
  }
}
