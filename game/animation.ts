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
  // CLASSIC CARTOON STYLE - balanced proportions, friendly
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Shell (dome shape)
  const shellGradient = ctx.createLinearGradient(x, centerY - height*0.1, x, centerY + height*0.3);
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + height*0.1, width*0.4, height*0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell pattern (hexagons)
  ctx.strokeStyle = '#1a5c1a';
  ctx.lineWidth = 2;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.beginPath();
      ctx.arc(x + width*0.35 + col*15, centerY + height*0.05 + row*12, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Head (oval, sticking out)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, centerY - height*0.15, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (on sides of head)
  const eyeX = x + width*0.85;
  const eyeY = centerY - height*0.18;

  if (!isBlinking) {
    ctx.fillStyle = '#FFFFFF';
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

  // Mouth
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + width*0.78, centerY - height*0.1);
  ctx.quadraticCurveTo(x + width*0.82, centerY - height*0.08, x + width*0.86, centerY - height*0.1);
  ctx.stroke();

  // Legs (flipper-like)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, centerY + height*0.32, 7, 11, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, centerY + height*0.35, 7, 10, -0.2, 0, Math.PI * 2);
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
  // CLASSIC CARTOON STYLE - chubby and friendly, curly tail
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Oval body
  const bodyGradient = ctx.createLinearGradient(x, centerY - height*0.1, x, centerY + height*0.3);
  bodyGradient.addColorStop(0, '#FFB6C1');
  bodyGradient.addColorStop(1, '#FF9BAE');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + height*0.1, width*0.38, height*0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head/snout area
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.8, centerY - height*0.12, 15, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snout detail
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width*0.88, centerY - height*0.1, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#D4909E';
  ctx.beginPath();
  ctx.arc(x + width*0.86, centerY - height*0.12, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.86, centerY - height*0.08, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  const eyeX = x + width*0.78;
  const eyeY = centerY - height*0.18;

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 1, eyeY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 2, eyeY);
    ctx.lineTo(eyeX + 2, eyeY);
    ctx.stroke();
  }

  // Floppy ear
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width*0.62, centerY - height*0.2, 8, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Legs
  ctx.fillStyle = '#FFB6C1';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, centerY + height*0.35, 7, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, centerY + height*0.35, 7, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Curly tail
  ctx.strokeStyle = '#FF9BAE';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + width*0.1, centerY + height*0.05, 10, -0.5, Math.PI);
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
  // MINIMALIST STYLE - simple silhouette with striped tail
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Simple oval body
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.ellipse(x + width*0.55, centerY + height*0.08, width*0.2, height*0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Simple circle head
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.arc(x + width*0.75, centerY - height*0.18, 13, 0, Math.PI * 2);
  ctx.fill();

  // Large simple eyes
  const eyeX = x + width*0.78;
  const eyeY = centerY - height*0.2;

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 3, eyeY);
    ctx.lineTo(eyeX + 3, eyeY);
    ctx.stroke();
  }

  // Simple striped tail (alternating circles)
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#8B4513' : '#DEB887';
    ctx.beginPath();
    ctx.arc(x + width*0.25, centerY - height*0.1 + i * 12, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Simple leg ovals
  ctx.fillStyle = '#A0522D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.6, centerY + height*0.35, 6, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.48, centerY + height*0.35, 6, 14, 0, 0, Math.PI * 2);
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
  // CLASSIC CARTOON STYLE - smooth body, cute gill fronds
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Smooth body
  const bodyGradient = ctx.createLinearGradient(x + width*0.2, centerY + height*0.05, x + width*0.8, centerY + height*0.05);
  bodyGradient.addColorStop(0, '#FF69B4');
  bodyGradient.addColorStop(0.5, '#FFB6D9');
  bodyGradient.addColorStop(1, '#FF69B4');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + height*0.05, width*0.38, height*0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head bump
  ctx.fillStyle = '#FFB6D9';
  ctx.beginPath();
  ctx.ellipse(x + width*0.75, centerY - height*0.08, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Friendly eyes
  const eyeX = x + width*0.78;
  const eyeY = centerY - height*0.1;

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 1, eyeY - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeX - 3, eyeY);
    ctx.lineTo(eyeX + 3, eyeY);
    ctx.stroke();
  }

  // Happy smile
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + width*0.78, centerY - height*0.04, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Cute gill fronds (wavy)
  const time = frameIndex * 0.3;
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(time + i * 0.5) * 2;
    ctx.beginPath();
    ctx.moveTo(x + width*0.88, centerY - height*0.12 + i*5);
    ctx.quadraticCurveTo(x + width*0.92, centerY - height*0.14 + i*5 + wave, x + width*0.95, centerY - height*0.12 + i*5);
    ctx.stroke();
  }

  // Legs
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, centerY + height*0.25, 6, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, centerY + height*0.25, 6, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Tail with fin
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.moveTo(x + width*0.12, centerY + height*0.05);
  ctx.quadraticCurveTo(x, centerY - height*0.05, x + width*0.08, centerY + height*0.1);
  ctx.quadraticCurveTo(x, centerY + height*0.15, x + width*0.12, centerY + height*0.05);
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
