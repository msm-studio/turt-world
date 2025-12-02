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
  private blinkTimer: number = 0;
  private isBlinking: boolean = false;
  private nextBlinkTime: number = 2 + Math.random() * 3; // Random 2-5 seconds

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

    // Update blink timer
    this.blinkTimer += deltaTime;
    if (this.blinkTimer >= this.nextBlinkTime) {
      this.isBlinking = true;
      if (this.blinkTimer >= this.nextBlinkTime + 0.15) {
        // Blink duration 150ms
        this.isBlinking = false;
        this.blinkTimer = 0;
        this.nextBlinkTime = 2 + Math.random() * 3; // Next blink in 2-5 seconds
      }
    }
  }

  getCurrentFrame(): { state: AnimationState; index: number; isBlinking: boolean } {
    return {
      state: this.currentState,
      index: this.frameIndex,
      isBlinking: this.isBlinking,
    };
  }

  getState(): AnimationState {
    return this.currentState;
  }
}

// Enhanced sprite rendering with gradients and details
export function drawCharacterSprite(
  ctx: CanvasRenderingContext2D,
  characterName: string,
  state: AnimationState,
  frameIndex: number,
  x: number,
  y: number,
  width: number,
  height: number,
  facingRight: boolean,
  isBlinking: boolean = false
) {
  ctx.save();

  // Add animation bounce for run cycle
  let bounce = 0;
  if (state === 'run') {
    bounce = Math.sin(frameIndex * Math.PI / 3) * 2;
  }

  // Flip if facing left
  if (!facingRight) {
    ctx.translate(x + width / 2, y + bounce + height / 2);
    ctx.scale(-1, 1);
    ctx.translate(-(x + width / 2), -(y + bounce + height / 2));
  } else {
    ctx.translate(0, bounce);
  }

  // Add drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;

  // Character-specific rendering
  if (characterName === 'Turtle') {
    drawTurtle(ctx, x, y, width, height, isBlinking);
  } else if (characterName === 'Pig') {
    drawPig(ctx, x, y, width, height, isBlinking);
  } else if (characterName === 'Lemur') {
    drawLemur(ctx, x, y, width, height, isBlinking, frameIndex);
  } else if (characterName === 'Axolotl') {
    drawAxolotl(ctx, x, y, width, height, isBlinking, frameIndex);
  }

  ctx.restore();
}

function drawTurtle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean
) {
  // Body gradient (green)
  const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
  bodyGradient.addColorStop(0, '#3D9B3D');
  bodyGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = bodyGradient;
  ctx.fillRect(x, y, width, height);

  // Shell with gradient
  const shellGradient = ctx.createRadialGradient(
    x + width / 2, y + height * 0.6, 0,
    x + width / 2, y + height * 0.6, width * 0.4
  );
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(1, '#1a5c1a');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height * 0.6, width * 0.35, height * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell hexagon pattern
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const size = 3 + i * 2;
    ctx.strokeRect(
      x + width / 2 - size,
      y + height * 0.6 - size,
      size * 2,
      size * 2
    );
  }

  // Little arms/legs
  ctx.fillStyle = '#2D7B2D';
  ctx.fillRect(x - 2, y + height * 0.4, 4, 6); // left arm
  ctx.fillRect(x + width - 2, y + height * 0.4, 4, 6); // right arm
  ctx.fillRect(x + width * 0.2, y + height - 4, 4, 4); // left leg
  ctx.fillRect(x + width * 0.7, y + height - 4, 4, 4); // right leg

  // Eyes
  drawEyes(ctx, x, y, width, height, isBlinking);
}

function drawPig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean
) {
  // Body gradient (pink)
  const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
  bodyGradient.addColorStop(0, '#FFB6C1');
  bodyGradient.addColorStop(1, '#FF9BAE');

  ctx.fillStyle = bodyGradient;
  ctx.fillRect(x, y, width, height);

  // Ears
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width * 0.2, y + height * 0.15, width * 0.15, height * 0.2, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width * 0.8, y + height * 0.15, width * 0.15, height * 0.2, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  const snoutGradient = ctx.createRadialGradient(
    x + width / 2, y + height * 0.65, 0,
    x + width / 2, y + height * 0.65, width * 0.25
  );
  snoutGradient.addColorStop(0, '#FFE4E1');
  snoutGradient.addColorStop(1, '#FFB6C1');

  ctx.fillStyle = snoutGradient;
  ctx.beginPath();
  ctx.ellipse(x + width / 2, y + height * 0.65, width * 0.22, height * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.arc(x + width * 0.42, y + height * 0.65, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width * 0.58, y + height * 0.65, 2, 0, Math.PI * 2);
  ctx.fill();

  // Curly tail
  ctx.strokeStyle = '#FF9BAE';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + width * 0.95, y + height * 0.6, 4, 0, Math.PI * 1.5);
  ctx.stroke();

  // Eyes
  drawEyes(ctx, x, y, width, height, isBlinking);
}

function drawLemur(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean,
  frameIndex: number
) {
  // Body gradient (brown)
  const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
  bodyGradient.addColorStop(0, '#A0522D');
  bodyGradient.addColorStop(1, '#6B3410');

  ctx.fillStyle = bodyGradient;
  ctx.fillRect(x, y, width, height);

  // Fluffy ear tufts
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.arc(x + width * 0.2, y + height * 0.1, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width * 0.8, y + height * 0.1, 5, 0, Math.PI * 2);
  ctx.fill();

  // Striped tail with animation
  const tailSwing = Math.sin(frameIndex * 0.5) * 5;
  ctx.fillStyle = '#A0522D';
  const tailX = x + width * 0.9;
  const tailY = y + height * 0.3;

  // Draw striped tail segments
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#A0522D' : '#654321';
    ctx.fillRect(
      tailX + i * 4 + tailSwing,
      tailY + i * 3,
      4,
      8
    );
  }

  // Belly patch
  ctx.fillStyle = '#D2B48C';
  ctx.fillRect(x + width * 0.25, y + height * 0.5, width * 0.5, height * 0.35);

  // Large eyes with highlights
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width * 0.35, y + height * 0.35, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width * 0.65, y + height * 0.35, 5, 0, Math.PI * 2);
  ctx.fill();

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + width * 0.35, y + height * 0.35, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.65, y + height * 0.35, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + width * 0.36, y + height * 0.34, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.66, y + height * 0.34, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawAxolotl(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean,
  frameIndex: number
) {
  // Body gradient (pink)
  const bodyGradient = ctx.createLinearGradient(x, y, x, y + height);
  bodyGradient.addColorStop(0, '#FF69B4');
  bodyGradient.addColorStop(1, '#FF1493');

  ctx.fillStyle = bodyGradient;
  ctx.fillRect(x, y, width, height);

  // Animated gill fronds (3 on each side)
  const time = frameIndex * 0.3;
  ctx.fillStyle = '#FF1493';

  // Left gills
  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(time + i * 0.5) * 2;
    ctx.beginPath();
    ctx.moveTo(x - 2, y + height * 0.25 + i * 4);
    ctx.lineTo(x - 8 + wave, y + height * 0.22 + i * 4);
    ctx.lineTo(x - 6 + wave, y + height * 0.28 + i * 4);
    ctx.closePath();
    ctx.fill();
  }

  // Right gills
  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(time + i * 0.5) * 2;
    ctx.beginPath();
    ctx.moveTo(x + width + 2, y + height * 0.25 + i * 4);
    ctx.lineTo(x + width + 8 - wave, y + height * 0.22 + i * 4);
    ctx.lineTo(x + width + 6 - wave, y + height * 0.28 + i * 4);
    ctx.closePath();
    ctx.fill();
  }

  // Cute spots/freckles
  ctx.fillStyle = '#FF1493';
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 6; i++) {
    const spotX = x + width * (0.2 + (i % 3) * 0.25);
    const spotY = y + height * (0.45 + Math.floor(i / 3) * 0.3);
    ctx.beginPath();
    ctx.arc(spotX, spotY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // Kawaii eyes
  ctx.fillStyle = '#000000';
  if (!isBlinking) {
    ctx.beginPath();
    ctx.arc(x + width * 0.35, y + height * 0.35, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.65, y + height * 0.35, 4, 0, Math.PI * 2);
    ctx.fill();

    // White highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + width * 0.36, y + height * 0.34, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.66, y + height * 0.34, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Blink - draw lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.3, y + height * 0.35);
    ctx.lineTo(x + width * 0.4, y + height * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + width * 0.6, y + height * 0.35);
    ctx.lineTo(x + width * 0.7, y + height * 0.35);
    ctx.stroke();
  }

  // Smile
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + width / 2, y + height * 0.5, width * 0.15, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean
) {
  const eyeY = y + height * 0.3;

  if (!isBlinking) {
    // White of eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + width * 0.35, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.65, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + width * 0.35, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.65, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + width * 0.36, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.66, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Blinking - draw horizontal lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.3, eyeY);
    ctx.lineTo(x + width * 0.4, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + width * 0.6, eyeY);
    ctx.lineTo(x + width * 0.7, eyeY);
    ctx.stroke();
  }
}
