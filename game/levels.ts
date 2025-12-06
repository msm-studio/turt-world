import { PhysicsWorld } from './physics';
import { Player, LevelPlatform, Hazard, Goal, Collectible } from './entities';
import { Level, Character } from '@/db/supabase';
import { Camera } from './camera';

export class GameLevel {
  private platforms: LevelPlatform[] = [];
  private hazards: Hazard[] = [];
  private goal: Goal;
  private collectibles: Collectible[] = [];
  private player: Player | null = null;
  private levelData: Level;
  private startTime: number = 0;
  private deaths: number = 0;
  private isComplete: boolean = false;
  private isFailed: boolean = false;
  private camera: Camera;
  private score: number = 0;
  private coinsCollected: number = 0;
  private currentCombo: number = 0;
  private maxCombo: number = 0;
  private isGrounded: boolean = false;

  constructor(private world: PhysicsWorld, levelData: Level) {
    this.levelData = levelData;

    // Calculate world bounds from level layout
    const worldWidth = this.calculateWorldWidth();
    const worldHeight = 700; // Standard height
    this.camera = new Camera(1300, 600, worldWidth, worldHeight);

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

    // Create collectibles
    if (levelData.layout.collectibles) {
      for (const coinData of levelData.layout.collectibles) {
        this.collectibles.push(new Collectible(coinData.x, coinData.y));
      }
    }
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

    // Get player position for camera and bounds checking
    const playerPos = this.player.getPosition();

    // Update camera to follow player
    this.camera.follow(playerPos.x, playerPos.y);

    // Check if player is grounded (for combo system)
    const wasGrounded = this.isGrounded;
    this.isGrounded = this.player.getPhysicsBody().isGrounded();

    // Reset combo when landing on ground
    if (this.isGrounded && !wasGrounded) {
      this.currentCombo = 0;
    }

    // Check collectible collisions
    for (const collectible of this.collectibles) {
      if (collectible.checkCollision(this.player)) {
        collectible.collect();
        this.coinsCollected++;

        // Combo only increases when collecting in the air
        if (!this.isGrounded) {
          this.currentCombo++;
          if (this.currentCombo > this.maxCombo) {
            this.maxCombo = this.currentCombo;
          }
        }

        // Calculate score with combo multiplier
        const basePoints = 100;
        let multiplier = 1.0;
        if (this.currentCombo >= 15) multiplier = 3.0;
        else if (this.currentCombo >= 10) multiplier = 2.0;
        else if (this.currentCombo >= 5) multiplier = 1.5;

        this.score += Math.floor(basePoints * multiplier);
      }
    }

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
      // Add perfect collection bonus
      const totalCoins = this.collectibles.length;
      if (this.coinsCollected === totalCoins && totalCoins > 0) {
        this.score += 5000;
      }
    }

    // Check if player fell off the world
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
    const cameraX = this.camera.getX();
    const isArctic = this.levelData.theme === 'arctic';

    // Draw base background (no camera transform)
    ctx.fillStyle = this.levelData.layout.background.color;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Sky gradient based on theme
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.6);
    if (isArctic) {
      // Arctic sky
      skyGradient.addColorStop(0, '#B8E6F9'); // Light blue at top
      skyGradient.addColorStop(0.4, '#D4F1F9'); // Pale blue
      skyGradient.addColorStop(1, '#E8F4F8'); // Almost white at horizon
    } else {
      // Desert sky
      skyGradient.addColorStop(0, '#FDB45C'); // Orange-yellow at top
      skyGradient.addColorStop(0.4, '#FFA07A'); // Light coral
      skyGradient.addColorStop(1, '#E8C3A0'); // Tan at horizon
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.6);

    if (isArctic) {
      // Snowflakes falling
      const time = Date.now() / 1000;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 20; i++) {
        const x = ((i * 83 + time * 15) % canvasWidth);
        const y = ((i * 107 + time * 30) % canvasHeight);
        const size = 2 + (i % 3);
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Distant snowy mountains
      ctx.fillStyle = 'rgba(200, 220, 255, 0.4)';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight * 0.5);
      for (let i = 0; i <= 6; i++) {
        const x = (canvasWidth / 6) * i;
        const peakHeight = canvasHeight * (0.3 + Math.sin(i * 1.5) * 0.15);
        ctx.lineTo(x, peakHeight);
      }
      ctx.lineTo(canvasWidth, canvasHeight * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Mid-distance ice formations
      ctx.fillStyle = 'rgba(180, 220, 255, 0.3)';
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 5; i++) {
        const x = canvasWidth * (0.1 + i * 0.2);
        const y = canvasHeight * (0.55 + Math.sin(i) * 0.05);
        ctx.beginPath();
        ctx.moveTo(x, y + 50);
        ctx.lineTo(x - 15, y);
        ctx.lineTo(x + 15, y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    } else {
      // Desert sun
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

      // Distant desert mountains
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

      // Sand dunes
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

      // Cacti
      ctx.fillStyle = '#556B2F';
      ctx.globalAlpha = 0.3;
      ctx.fillRect(canvasWidth * 0.05, canvasHeight * 0.45, 15, 80);
      ctx.fillRect(canvasWidth * 0.05 - 8, canvasHeight * 0.55, 10, 25);
      ctx.fillRect(canvasWidth * 0.92, canvasHeight * 0.5, 12, 60);
      ctx.fillRect(canvasWidth * 0.92 + 12, canvasHeight * 0.6, 8, 20);
      ctx.globalAlpha = 1.0;

      // Dust particles
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
    }

    // Apply camera transform for game objects
    ctx.save();
    this.camera.apply(ctx);

    // Draw platforms
    for (const platform of this.platforms) {
      platform.render(ctx);
    }

    // Draw collectibles
    for (const collectible of this.collectibles) {
      collectible.render(ctx);
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

    // Restore camera transform
    ctx.restore();
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

  getScore(): number {
    return this.score;
  }

  getCoinsCollected(): number {
    return this.coinsCollected;
  }

  getTotalCoins(): number {
    return this.collectibles.length;
  }

  getCurrentCombo(): number {
    return this.currentCombo;
  }

  getMaxCombo(): number {
    return this.maxCombo;
  }

  private calculateWorldWidth(): number {
    // Find the rightmost point in the level
    let maxX = 0;

    // Check platforms
    for (const platform of this.levelData.layout.platforms) {
      const right = platform.x + platform.width;
      if (right > maxX) maxX = right;
    }

    // Check goal
    const goalRight = this.levelData.layout.goal.x + this.levelData.layout.goal.width;
    if (goalRight > maxX) maxX = goalRight;

    // Add some padding
    return Math.max(maxX + 200, 1300);
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
