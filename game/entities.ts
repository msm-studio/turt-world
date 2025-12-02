import { PhysicsWorld, PhysicsBody, Platform, CharacterPhysics } from './physics';
import { Animation, drawCharacterSprite } from './animation';
import { InputManager } from './input';
import { Character } from '@/db/supabase';

export class Player {
  private physicsBody: PhysicsBody;
  private animation: Animation;
  private characterData: Character;
  private width = 32;
  private height = 48;
  private facingRight = true;

  constructor(
    world: PhysicsWorld,
    characterData: Character,
    startX: number,
    startY: number
  ) {
    this.characterData = characterData;

    const physics: CharacterPhysics = {
      speed: characterData.speed,
      jumpForce: characterData.jump_force,
      mass: characterData.mass,
      airControl: characterData.air_control,
      floatTime: characterData.float_time,
    };

    this.physicsBody = new PhysicsBody(
      world,
      startX,
      startY,
      this.width,
      this.height,
      physics
    );

    this.animation = new Animation(characterData.name);
  }

  cachePhysicsState() {
    // Cache physics state (called after physics step)
    this.physicsBody.updateCache();
  }

  update(input: InputManager, deltaTime: number) {
    // Handle horizontal movement
    let moveDirection = 0;
    if (input.left) moveDirection -= 1;
    if (input.right) moveDirection += 1;

    if (moveDirection !== 0) {
      this.facingRight = moveDirection > 0;
      this.physicsBody.moveHorizontal(moveDirection, deltaTime);
    }

    // Handle jumping
    this.physicsBody.jump(input.jump, deltaTime);

    // Update animation
    const velocity = this.physicsBody.getVelocity();
    const isGrounded = this.physicsBody.isGrounded();
    this.animation.update(deltaTime, velocity.x, velocity.y, isGrounded);
  }

  render(ctx: CanvasRenderingContext2D) {
    const pos = this.physicsBody.getPosition();
    const frame = this.animation.getCurrentFrame();

    drawCharacterSprite(
      ctx,
      this.characterData.name,
      frame.state,
      frame.index,
      pos.x - this.width / 2,
      pos.y - this.height / 2,
      this.width,
      this.height,
      this.facingRight
    );
  }

  getPosition() {
    return this.physicsBody.getPosition();
  }

  getBounds(): { x: number; y: number; width: number; height: number } {
    const pos = this.physicsBody.getPosition();
    return {
      x: pos.x - this.width / 2,
      y: pos.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  destroy() {
    this.physicsBody.destroy();
  }
}

export class Hazard {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public type: string
  ) {}

  render(ctx: CanvasRenderingContext2D) {
    // Draw hazards based on type
    ctx.save();

    if (this.type === 'cactus') {
      // Draw cactus
      ctx.fillStyle = '#2D5016';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Add spikes
      ctx.fillStyle = '#1a3010';
      for (let i = 0; i < 3; i++) {
        const spikeY = this.y + (this.height / 4) * (i + 0.5);
        ctx.fillRect(this.x - 5, spikeY, 5, 3);
        ctx.fillRect(this.x + this.width, spikeY, 5, 3);
      }
    } else {
      // Generic hazard
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }

  checkCollision(player: Player): boolean {
    const playerBounds = player.getBounds();

    return (
      playerBounds.x < this.x + this.width &&
      playerBounds.x + playerBounds.width > this.x &&
      playerBounds.y < this.y + this.height &&
      playerBounds.y + playerBounds.height > this.y
    );
  }
}

export class Goal {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  render(ctx: CanvasRenderingContext2D) {
    // Draw goal as a flag/portal
    ctx.save();

    // Flag pole
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(this.x + this.width / 2 - 3, this.y, 6, this.height);

    // Flag
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y + 5);
    ctx.lineTo(this.x + this.width / 2 + 30, this.y + 15);
    ctx.lineTo(this.x + this.width / 2, this.y + 25);
    ctx.closePath();
    ctx.fill();

    // Sparkle effect
    const time = Date.now() / 1000;
    const sparkle = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.globalAlpha = sparkle;
    ctx.strokeStyle = '#FFF700';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    ctx.restore();
  }

  checkCollision(player: Player): boolean {
    const playerBounds = player.getBounds();

    return (
      playerBounds.x < this.x + this.width &&
      playerBounds.x + playerBounds.width > this.x &&
      playerBounds.y < this.y + this.height &&
      playerBounds.y + playerBounds.height > this.y
    );
  }
}

export class LevelPlatform {
  private platform: Platform;

  constructor(
    world: PhysicsWorld,
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public type: string
  ) {
    this.platform = new Platform(world, x, y, width, height);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Platform colors based on type
    if (this.type === 'ground') {
      ctx.fillStyle = '#8B7355';
    } else if (this.type === 'sand') {
      ctx.fillStyle = '#DEB887';
    } else {
      ctx.fillStyle = '#A0A0A0';
    }

    const pos = this.platform.getPosition();
    ctx.fillRect(
      pos.x - pos.width / 2,
      pos.y - pos.height / 2,
      pos.width,
      pos.height
    );

    // Add texture/detail
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      pos.x - pos.width / 2,
      pos.y - pos.height / 2,
      pos.width,
      pos.height
    );

    ctx.restore();
  }
}
