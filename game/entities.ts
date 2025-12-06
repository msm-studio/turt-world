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
      this.facingRight,
      frame.isBlinking
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

  getPhysicsBody() {
    return this.physicsBody;
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
    ctx.save();

    if (this.type === 'cactus') {
      // Cactus body with gradient
      const cactusGradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
      cactusGradient.addColorStop(0, '#1F3A12');
      cactusGradient.addColorStop(0.5, '#2D5016');
      cactusGradient.addColorStop(1, '#1F3A12');
      ctx.fillStyle = cactusGradient;
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // Outline
      ctx.strokeStyle = '#1a3010';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);

      // Enhanced spikes
      ctx.fillStyle = '#1a3010';
      for (let i = 0; i < 4; i++) {
        const spikeY = this.y + (this.height / 5) * (i + 0.5);
        // Left spikes
        ctx.beginPath();
        ctx.moveTo(this.x, spikeY);
        ctx.lineTo(this.x - 6, spikeY - 2);
        ctx.lineTo(this.x - 4, spikeY + 4);
        ctx.closePath();
        ctx.fill();
        // Right spikes
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, spikeY);
        ctx.lineTo(this.x + this.width + 6, spikeY - 2);
        ctx.lineTo(this.x + this.width + 4, spikeY + 4);
        ctx.closePath();
        ctx.fill();
      }

      // Flower on top
      ctx.fillStyle = '#FF69B4';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Generic hazard with pulsing effect
      const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = '#8B0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
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
    ctx.save();

    const time = Date.now() / 1000;

    // Pulsing scale effect
    const scale = 0.95 + Math.sin(time * 2) * 0.05;
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

    // Flag pole with gradient
    const poleGradient = ctx.createLinearGradient(
      this.x + this.width / 2 - 3, this.y,
      this.x + this.width / 2 + 3, this.y
    );
    poleGradient.addColorStop(0, '#6B3410');
    poleGradient.addColorStop(0.5, '#8B4513');
    poleGradient.addColorStop(1, '#6B3410');
    ctx.fillStyle = poleGradient;
    ctx.fillRect(this.x + this.width / 2 - 3, this.y, 6, this.height);

    // Flag with gradient
    const flagGradient = ctx.createLinearGradient(
      this.x + this.width / 2, this.y + 5,
      this.x + this.width / 2 + 30, this.y + 15
    );
    flagGradient.addColorStop(0, '#FFD700');
    flagGradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = flagGradient;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width / 2, this.y + 5);
    ctx.lineTo(this.x + this.width / 2 + 30, this.y + 15);
    ctx.lineTo(this.x + this.width / 2, this.y + 25);
    ctx.closePath();
    ctx.fill();

    // Flag outline
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rotating sparkle particles
    const sparkleCount = 6;
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (time * 2 + (i / sparkleCount) * Math.PI * 2);
      const radius = 25 + Math.sin(time * 3 + i) * 5;
      const sparkleX = this.x + this.width / 2 + Math.cos(angle) * radius;
      const sparkleY = this.y + this.height / 2 + Math.sin(angle) * radius;

      const sparkleAlpha = Math.sin(time * 4 + i) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(255, 255, 0, ${sparkleAlpha})`;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glow effect
    const glowAlpha = Math.sin(time * 3) * 0.3 + 0.5;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.globalAlpha = glowAlpha;
    ctx.strokeStyle = '#FFF700';
    ctx.lineWidth = 3;
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

    const pos = this.platform.getPosition();
    const x = pos.x - pos.width / 2;
    const y = pos.y - pos.height / 2;

    // Platform gradient based on type
    let gradient;
    if (this.type === 'ground') {
      gradient = ctx.createLinearGradient(x, y, x + pos.width, y);
      gradient.addColorStop(0, '#7A6347');
      gradient.addColorStop(0.5, '#8B7355');
      gradient.addColorStop(1, '#7A6347');
    } else if (this.type === 'sand') {
      gradient = ctx.createLinearGradient(x, y, x + pos.width, y);
      gradient.addColorStop(0, '#D4A574');
      gradient.addColorStop(0.5, '#DEB887');
      gradient.addColorStop(1, '#D4A574');
    } else {
      gradient = ctx.createLinearGradient(x, y, x + pos.width, y);
      gradient.addColorStop(0, '#909090');
      gradient.addColorStop(0.5, '#A0A0A0');
      gradient.addColorStop(1, '#909090');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, pos.width, pos.height);

    // Top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x, y, pos.width, 2);

    // Bottom shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x, y + pos.height - 2, pos.width, 2);

    // Texture dots for sand
    if (this.type === 'sand') {
      ctx.fillStyle = 'rgba(200, 160, 100, 0.4)';
      for (let i = 0; i < pos.width / 10; i++) {
        for (let j = 0; j < pos.height / 10; j++) {
          if (Math.random() > 0.7) {
            ctx.fillRect(x + i * 10 + Math.random() * 5, y + j * 10 + Math.random() * 5, 2, 2);
          }
        }
      }
    }

    // Grass tufts for ground platforms
    if (this.type === 'ground') {
      ctx.fillStyle = '#4CAF50';
      for (let i = 0; i < pos.width / 20; i++) {
        const turfX = x + i * 20 + Math.random() * 10;
        ctx.beginPath();
        ctx.moveTo(turfX, y);
        ctx.lineTo(turfX - 2, y - 5);
        ctx.lineTo(turfX + 2, y - 5);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Border
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, pos.width, pos.height);

    ctx.restore();
  }
}

// Collectible coin entity
export class Collectible {
  private x: number;
  private y: number;
  private width: number = 20;
  private height: number = 20;
  private collected: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.collected) return;

    ctx.save();

    // Floating animation
    const time = Date.now() / 1000;
    const floatOffset = Math.sin(time * 3 + this.x * 0.01) * 3;

    // Glow effect
    const glowGradient = ctx.createRadialGradient(
      this.x, this.y + floatOffset,
      0,
      this.x, this.y + floatOffset,
      this.width
    );
    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    glowGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.4)');
    glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y + floatOffset, this.width, 0, Math.PI * 2);
    ctx.fill();

    // Coin body with gradient
    const coinGradient = ctx.createRadialGradient(
      this.x - 3, this.y + floatOffset - 3,
      0,
      this.x, this.y + floatOffset,
      this.width / 2
    );
    coinGradient.addColorStop(0, '#FFD700');
    coinGradient.addColorStop(0.5, '#FFA500');
    coinGradient.addColorStop(1, '#FF8C00');
    ctx.fillStyle = coinGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y + floatOffset, this.width / 2, 0, Math.PI * 2);
    ctx.fill();

    // Inner circle detail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(this.x, this.y + floatOffset, this.width / 3, 0, Math.PI * 2);
    ctx.fill();

    // Shine effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y + floatOffset - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  checkCollision(player: Player): boolean {
    if (this.collected) return false;

    const playerBounds = player.getBounds();
    const coinRadius = this.width / 2;

    // Check if player's bounding box overlaps with coin circle
    return (
      playerBounds.x < this.x + coinRadius &&
      playerBounds.x + playerBounds.width > this.x - coinRadius &&
      playerBounds.y < this.y + coinRadius &&
      playerBounds.y + playerBounds.height > this.y - coinRadius
    );
  }

  collect() {
    this.collected = true;
  }

  isCollected(): boolean {
    return this.collected;
  }

  reset() {
    this.collected = false;
  }
}
