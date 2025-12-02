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
  // PROFILE VIEW - facing RIGHT, cute style
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Shell (rounded dome)
  const shellGradient = ctx.createRadialGradient(
    centerX, centerY - height * 0.05, 0,
    centerX, centerY - height * 0.05, width * 0.45
  );
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(1, '#1a5c1a');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY - height * 0.05, width * 0.42, height * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell hexagon pattern
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY - height * 0.05, 6 + i * 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Cute round head (RIGHT side)
  const headGradient = ctx.createRadialGradient(
    x + width * 0.82, centerY - height * 0.2, 0,
    x + width * 0.82, centerY - height * 0.2, 11
  );
  headGradient.addColorStop(0, '#4DAF4D');
  headGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x + width * 0.82, centerY - height * 0.2, 10, 0, Math.PI * 2);
  ctx.fill();

  // Neck connecting to shell
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width * 0.7, centerY - height * 0.12, 7, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Big cute eye
  const eyeX = x + width * 0.84;
  const eyeY = centerY - height * 0.22;

  if (!isBlinking) {
    // White of eye
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    // Highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 0.5, eyeY - 0.5, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 3, eyeY);
    ctx.lineTo(eyeX + 3, eyeY);
    ctx.stroke();
  }

  // Little smile
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + width * 0.82, centerY - height * 0.16, 3, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Stubby legs (2 visible)
  ctx.fillStyle = '#2D7B2D';
  // Front leg (right side)
  ctx.beginPath();
  ctx.ellipse(x + width * 0.7, y + height * 0.75, 5, 9, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Back leg
  ctx.beginPath();
  ctx.ellipse(x + width * 0.35, y + height * 0.78, 5, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Tiny tail at back (left side)
  ctx.beginPath();
  ctx.ellipse(x + width * 0.12, centerY + height * 0.05, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawPig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean
) {
  // PROFILE VIEW - facing RIGHT, cute chubby pig
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Round chubby body
  const bodyGradient = ctx.createRadialGradient(
    centerX - width * 0.05, centerY, 0,
    centerX - width * 0.05, centerY, width * 0.48
  );
  bodyGradient.addColorStop(0, '#FFB6C1');
  bodyGradient.addColorStop(1, '#FF9BAE');

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(centerX - width * 0.05, centerY, width * 0.45, height * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cute head (RIGHT side)
  ctx.beginPath();
  ctx.arc(x + width * 0.78, centerY - height * 0.15, 12, 0, Math.PI * 2);
  ctx.fill();

  // Floppy ear
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width * 0.75, centerY - height * 0.26, 7, 11, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Adorable snout
  const snoutGradient = ctx.createRadialGradient(
    x + width * 0.9, centerY - height * 0.12, 0,
    x + width * 0.9, centerY - height * 0.12, 10
  );
  snoutGradient.addColorStop(0, '#FFE4E1');
  snoutGradient.addColorStop(1, '#FFB6C1');

  ctx.fillStyle = snoutGradient;
  ctx.beginPath();
  ctx.ellipse(x + width * 0.9, centerY - height * 0.12, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Two nostrils
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(x + width * 0.88, centerY - height * 0.14, 1.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width * 0.92, centerY - height * 0.10, 1.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Big cute eye
  const eyeX = x + width * 0.8;
  const eyeY = centerY - height * 0.2;

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 0.5, eyeY - 0.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 3, eyeY);
    ctx.lineTo(eyeX + 3, eyeY);
    ctx.stroke();
  }

  // Stubby legs (2 visible)
  ctx.fillStyle = '#FF9BAE';
  // Front leg
  ctx.beginPath();
  ctx.ellipse(x + width * 0.65, y + height * 0.82, 5, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Back leg
  ctx.beginPath();
  ctx.ellipse(x + width * 0.35, y + height * 0.84, 5, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Curly tail (left/back)
  ctx.strokeStyle = '#FF9BAE';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x + width * 0.08, centerY - height * 0.02, 5, -Math.PI * 0.5, Math.PI);
  ctx.stroke();
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
  // PROFILE VIEW - facing RIGHT, cute big-eyed lemur
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Slim body
  const bodyGradient = ctx.createRadialGradient(
    centerX - width * 0.08, centerY, 0,
    centerX - width * 0.08, centerY, width * 0.4
  );
  bodyGradient.addColorStop(0, '#A0522D');
  bodyGradient.addColorStop(1, '#6B3410');

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(centerX - width * 0.08, centerY, width * 0.35, height * 0.4, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Cream belly
  ctx.fillStyle = '#D2B48C';
  ctx.beginPath();
  ctx.ellipse(centerX - width * 0.08, centerY + height * 0.05, width * 0.22, height * 0.28, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Cute round head (RIGHT side)
  const headGradient = ctx.createRadialGradient(
    x + width * 0.75, centerY - height * 0.22, 0,
    x + width * 0.75, centerY - height * 0.22, 12
  );
  headGradient.addColorStop(0, '#A0522D');
  headGradient.addColorStop(1, '#8B4513');

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x + width * 0.75, centerY - height * 0.22, 11, 0, Math.PI * 2);
  ctx.fill();

  // Pointy ear
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.moveTo(x + width * 0.73, centerY - height * 0.32);
  ctx.lineTo(x + width * 0.70, centerY - height * 0.42);
  ctx.lineTo(x + width * 0.76, centerY - height * 0.35);
  ctx.closePath();
  ctx.fill();

  // Long striped tail (curves behind, animated)
  const tailSwing = Math.sin(frameIndex * 0.5) * 12;
  const tailSegments = 9;
  for (let i = 0; i < tailSegments; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#A0522D' : '#654321';
    const progress = i / tailSegments;
    const tailX = x + width * 0.15 - i * 6 + tailSwing * progress;
    const tailY = centerY - height * 0.12 + Math.sin(progress * Math.PI * 1.5) * 18 - tailSwing * 0.4;

    ctx.beginPath();
    ctx.ellipse(tailX, tailY, 3.5, 7, -progress * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Thin legs (2 visible)
  ctx.fillStyle = '#8B4513';
  // Front leg
  ctx.beginPath();
  ctx.ellipse(x + width * 0.6, y + height * 0.78, 3, 13, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Back leg
  ctx.beginPath();
  ctx.ellipse(x + width * 0.35, y + height * 0.8, 3, 12, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Huge adorable eye (signature lemur feature)
  const eyeX = x + width * 0.78;
  const eyeY = centerY - height * 0.24;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
  ctx.fill();

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 1.5, eyeY - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 5, eyeY);
    ctx.lineTo(eyeX + 5, eyeY);
    ctx.stroke();
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
  // PROFILE VIEW - facing RIGHT, adorable kawaii axolotl
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Elongated chubby body
  const bodyGradient = ctx.createRadialGradient(
    centerX - width * 0.1, centerY, 0,
    centerX - width * 0.1, centerY, width * 0.42
  );
  bodyGradient.addColorStop(0, '#FF69B4');
  bodyGradient.addColorStop(1, '#FF1493');

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(centerX - width * 0.1, centerY, width * 0.4, height * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wide cute head (RIGHT side)
  const headGradient = ctx.createRadialGradient(
    x + width * 0.75, centerY - height * 0.12, 0,
    x + width * 0.75, centerY - height * 0.12, 13
  );
  headGradient.addColorStop(0, '#FF69B4');
  headGradient.addColorStop(1, '#FF1493');

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x + width * 0.75, centerY - height * 0.12, 12, 0, Math.PI * 2);
  ctx.fill();

  // Feathery gill fronds (waving, on top of head)
  const time = frameIndex * 0.3;
  ctx.fillStyle = '#FF1493';

  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(time + i * 0.5) * 5;
    const gillX = x + width * 0.72;
    const gillY = centerY - height * 0.22 - i * 3;

    ctx.beginPath();
    ctx.moveTo(gillX, gillY);
    ctx.quadraticCurveTo(
      gillX - 6 + wave, gillY - 8,
      gillX - 9 + wave, gillY - 6
    );
    ctx.lineTo(gillX - 7 + wave, gillY - 4);
    ctx.quadraticCurveTo(
      gillX - 4 + wave, gillY - 5,
      gillX, gillY
    );
    ctx.closePath();
    ctx.fill();
  }

  // Tapered tail fin (LEFT/back)
  ctx.fillStyle = '#FF1493';
  ctx.beginPath();
  ctx.moveTo(x + width * 0.15, centerY - height * 0.15);
  ctx.quadraticCurveTo(
    x - width * 0.05, centerY - height * 0.08,
    x, centerY + height * 0.08
  );
  ctx.quadraticCurveTo(
    x + width * 0.05, centerY,
    x + width * 0.15, centerY + height * 0.12
  );
  ctx.closePath();
  ctx.fill();

  // Stubby legs (2 visible)
  ctx.fillStyle = '#FF69B4';
  // Front leg
  ctx.beginPath();
  ctx.ellipse(x + width * 0.6, centerY + height * 0.28, 3.5, 9, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Back leg
  ctx.beginPath();
  ctx.ellipse(x + width * 0.35, centerY + height * 0.3, 3.5, 8, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Cute spots
  ctx.fillStyle = '#FF1493';
  ctx.globalAlpha = 0.5;
  const spots = [
    {x: centerX - width * 0.05, y: centerY - height * 0.08},
    {x: centerX + width * 0.1, y: centerY + height * 0.05},
    {x: centerX - width * 0.15, y: centerY + height * 0.1},
  ];
  spots.forEach(spot => {
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;

  // Kawaii eye
  const eyeX = x + width * 0.77;
  const eyeY = centerY - height * 0.16;

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 1, eyeY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 3, eyeY);
    ctx.lineTo(eyeX + 3, eyeY);
    ctx.stroke();
  }

  // Sweet smile
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + width * 0.75, eyeY + 6, 5, 0.3, Math.PI - 0.3);
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
