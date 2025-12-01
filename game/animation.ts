// Animation system for character sprites

export type AnimationState = 'idle' | 'run' | 'jump' | 'fall';

export interface AnimationFrame {
  state: AnimationState;
  frameIndex: number;
  duration: number;
}

export class Animation {
  private currentState: AnimationState = 'idle';
  private frameIndex: number = 0;
  private frameTime: number = 0;
  private frameDuration: number = 0.1; // seconds per frame

  // Frame counts for each animation state
  private frameCounts: Record<AnimationState, number> = {
    idle: 4,
    run: 6,
    jump: 1,
    fall: 1,
  };

  constructor(private characterName: string) {}

  update(deltaTime: number, velocityX: number, velocityY: number, isGrounded: boolean) {
    // Determine animation state based on physics
    let newState: AnimationState = 'idle';

    if (!isGrounded) {
      newState = velocityY < 0 ? 'jump' : 'fall';
    } else if (Math.abs(velocityX) > 0.1) {
      newState = 'run';
    }

    // Reset frame if state changed
    if (newState !== this.currentState) {
      this.currentState = newState;
      this.frameIndex = 0;
      this.frameTime = 0;
    }

    // Update frame timing
    this.frameTime += deltaTime;
    if (this.frameTime >= this.frameDuration) {
      this.frameTime = 0;
      this.frameIndex = (this.frameIndex + 1) % this.frameCounts[this.currentState];
    }
  }

  getCurrentFrame(): { state: AnimationState; index: number } {
    return {
      state: this.currentState,
      index: this.frameIndex,
    };
  }

  getState(): AnimationState {
    return this.currentState;
  }
}

// Simple sprite rendering helper
export function drawCharacterSprite(
  ctx: CanvasRenderingContext2D,
  characterName: string,
  state: AnimationState,
  frameIndex: number,
  x: number,
  y: number,
  width: number,
  height: number,
  facingRight: boolean
) {
  // For now, we'll use colored rectangles with simple decorations
  // Later this can be replaced with actual sprite images
  ctx.save();

  // Flip if facing left
  if (!facingRight) {
    ctx.translate(x + width / 2, y + height / 2);
    ctx.scale(-1, 1);
    ctx.translate(-(x + width / 2), -(y + height / 2));
  }

  // Character colors
  const colors: Record<string, string> = {
    Turtle: '#2D8B2D',
    Pig: '#FFB6C1',
    Lemur: '#8B4513',
    Axolotl: '#FF69B4',
  };

  const color = colors[characterName] || '#888888';

  // Draw body
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);

  // Add simple details based on character
  ctx.fillStyle = '#000000';

  // Eyes
  const eyeY = y + height * 0.3;
  const eyeSize = width * 0.1;
  ctx.fillRect(x + width * 0.3, eyeY, eyeSize, eyeSize);
  ctx.fillRect(x + width * 0.6, eyeY, eyeSize, eyeSize);

  // Character-specific features
  if (characterName === 'Turtle') {
    // Shell pattern
    ctx.strokeStyle = '#1a5c1a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + width * 0.2, y + height * 0.5, width * 0.6, height * 0.4);
  } else if (characterName === 'Pig') {
    // Snout
    ctx.fillStyle = '#FFE4E1';
    ctx.fillRect(x + width * 0.35, y + height * 0.6, width * 0.3, height * 0.2);
  } else if (characterName === 'Lemur') {
    // Tail indicator (stripe)
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + width * 0.8, y + height * 0.4, width * 0.15, height * 0.5);
  } else if (characterName === 'Axolotl') {
    // Gills
    ctx.fillStyle = '#FF1493';
    ctx.fillRect(x - width * 0.1, y + height * 0.2, width * 0.15, height * 0.15);
    ctx.fillRect(x + width * 0.95, y + height * 0.2, width * 0.15, height * 0.15);
  }

  // Add animation bounce for run cycle
  if (state === 'run') {
    const bounce = Math.sin(frameIndex * Math.PI / 3) * 2;
    ctx.translate(0, bounce);
  }

  ctx.restore();
}
