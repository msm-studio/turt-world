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
  // CHIBI STYLE - big head, tiny body, huge eyes
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Shell (main body - large and round)
  const shellGradient = ctx.createRadialGradient(centerX, centerY + height*0.05, 0, centerX, centerY + height*0.05, width*0.5);
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY + height*0.05, width*0.45, 0, Math.PI * 2);
  ctx.fill();

  // Shell pattern
  ctx.strokeStyle = '#1a5c1a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY + height*0.05, 8 + i*6, 0, Math.PI * 2);
    ctx.stroke();
  }

  // HUGE head (chibi style - head is disproportionately large)
  const headGradient = ctx.createRadialGradient(x + width*0.8, centerY - height*0.25, 0, x + width*0.8, centerY - height*0.25, 18);
  headGradient.addColorStop(0, '#4DAF4D');
  headGradient.addColorStop(1, '#3D9B3D');

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x + width*0.8, centerY - height*0.25, 16, 0, Math.PI * 2);
  ctx.fill();

  // HUGE sparkly eyes
  const eyeX = x + width*0.82;
  const eyeY = centerY - height*0.27;

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Big white highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 2, eyeY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 4, eyeY);
    ctx.lineTo(eyeX + 4, eyeY);
    ctx.stroke();
  }

  // Tiny smile
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + width*0.8, centerY - height*0.2, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Stubby little legs
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.arc(x + width*0.7, y + height*0.85, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.35, y + height*0.88, 6, 0, Math.PI * 2);
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
  // CHIBI STYLE - round body, huge snout, tiny legs
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Round body (HUGE)
  const bodyGradient = ctx.createRadialGradient(centerX, centerY + height*0.05, 0, centerX, centerY + height*0.05, width*0.5);
  bodyGradient.addColorStop(0, '#FFB6C1');
  bodyGradient.addColorStop(1, '#FF9BAE');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY + height*0.05, width*0.45, 0, Math.PI * 2);
  ctx.fill();

  // HUGE snout sticking out
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.85, centerY - height*0.05, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#D4909E';
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, centerY - height*0.07, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, centerY - height*0.02, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // HUGE eyes
  const eyeX = x + width*0.62;
  const eyeY = centerY - height*0.15;

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 2, eyeY - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 5, eyeY);
    ctx.lineTo(eyeX + 5, eyeY);
    ctx.stroke();
  }

  // Tiny floppy ear
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, centerY - height*0.2, 10, 15, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Stubby little legs
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, y + height*0.88, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, y + height*0.88, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Curly tail
  ctx.strokeStyle = '#FF9BAE';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + width*0.05, centerY, 8, 0, Math.PI * 1.5);
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
  // REALISTIC CUTE STYLE - natural lemur posture, alert eyes
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Natural lemur body (more vertical)
  const bodyGradient = ctx.createRadialGradient(centerX, centerY + height*0.05, 0, centerX, centerY + height*0.05, width*0.25);
  bodyGradient.addColorStop(0, '#A0522D');
  bodyGradient.addColorStop(0.5, '#8B4513');
  bodyGradient.addColorStop(1, '#6B3410');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + height*0.05, width*0.2, height*0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly patch
  ctx.fillStyle = 'rgba(222, 184, 135, 0.6)';
  ctx.beginPath();
  ctx.ellipse(x + width*0.55, centerY + height*0.08, width*0.12, height*0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.78, centerY - height*0.18, 11, 13, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Face markings
  ctx.fillStyle = '#F5DEB3';
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, centerY - height*0.16, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Alert eyes
  const eyeX = x + width*0.83;
  const eyeY = centerY - height*0.2;

  if (!isBlinking) {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 1, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 3, eyeY);
    ctx.lineTo(eyeX + 3, eyeY);
    ctx.stroke();
  }

  // Ear
  ctx.fillStyle = '#6B3410';
  ctx.beginPath();
  ctx.ellipse(x + width*0.72, centerY - height*0.26, 5, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Realistic ringed tail (animated swing)
  const tailSwing = Math.sin(frameIndex * 0.5) * 8;
  const tailSegments = 10;
  for (let i = 0; i < tailSegments; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#8B4513' : '#F5DEB3';
    const progress = i / tailSegments;
    const tailX = x + width*0.22 - i * 5 + tailSwing * progress;
    const tailY = centerY - height*0.12 + Math.sin(progress * Math.PI * 1.2) * 16;

    ctx.beginPath();
    ctx.ellipse(
      tailX,
      tailY,
      7,
      10,
      0.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Realistic legs (longer)
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.58, y + height*0.85, 5, 16, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.42, y + height*0.85, 5, 16, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Paws
  ctx.fillStyle = '#6B3410';
  ctx.beginPath();
  ctx.ellipse(x + width*0.58, y + height*0.98, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.42, y + height*0.98, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
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
  // CHIBI STYLE - huge head, big eyes, frilly gills
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // HUGE round head (chibi style)
  const headGradient = ctx.createRadialGradient(x + width*0.65, centerY - height*0.1, 0, x + width*0.65, centerY - height*0.1, width*0.35);
  headGradient.addColorStop(0, '#FFB6D9');
  headGradient.addColorStop(1, '#FF69B4');
  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x + width*0.65, centerY - height*0.1, width*0.32, 0, Math.PI * 2);
  ctx.fill();

  // Tiny body
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(x + width*0.45, centerY + height*0.15, width*0.25, height*0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  // HUGE kawaii eyes
  const eyeX = x + width*0.72;
  const eyeY = centerY - height*0.14;

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 2, eyeY - 2, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 6, eyeY);
    ctx.lineTo(eyeX + 6, eyeY);
    ctx.stroke();
  }

  // Big smile
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + width*0.72, centerY - height*0.05, 8, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // HUGE frilly gills (3 on each side) - animated wave
  const time = frameIndex * 0.3;
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(time + i * 0.5) * 3;
    ctx.beginPath();
    ctx.moveTo(x + width*0.82, centerY - height*0.18 + i*6);
    for (let j = 0; j < 4; j++) {
      ctx.lineTo(x + width*0.82 + j*4, centerY - height*0.18 + i*6 + (j % 2) * 3 + wave);
    }
    ctx.stroke();
  }

  // Spots/freckles
  ctx.fillStyle = 'rgba(255, 20, 147, 0.4)';
  for (let i = 0; i < 5; i++) {
    const spotX = x + width*(0.55 + (i * 0.07));
    const spotY = centerY - height*(0.05 + (i % 2) * 0.08);
    ctx.beginPath();
    ctx.arc(spotX, spotY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stubby legs
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(x + width*0.52, y + height*0.82, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.38, y + height*0.82, 5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail fin
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.moveTo(x + width*0.2, centerY + height*0.15);
  ctx.quadraticCurveTo(x + width*0.05, centerY + height*0.05, x + width*0.15, centerY + height*0.2);
  ctx.quadraticCurveTo(x + width*0.05, centerY + height*0.25, x + width*0.2, centerY + height*0.15);
  ctx.fill();
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
