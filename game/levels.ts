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

  cachePhysicsState() {
    // Cache physics state for this frame (called after physics step)
    if (this.player) {
      this.player.cachePhysicsState();
    }
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
    // Draw background
    ctx.fillStyle = this.levelData.layout.background.color;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw background layers with parallax
    for (const layer of this.levelData.layout.background.layers) {
      if (layer.type === 'sky') {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, layer.color);
        gradient.addColorStop(1, this.levelData.layout.background.color);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight / 2);
      }
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
