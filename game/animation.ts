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
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Shell (dome-shaped, main body)
  const shellGradient = ctx.createRadialGradient(
    centerX, centerY + height * 0.1, 0,
    centerX, centerY + height * 0.1, width * 0.5
  );
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(1, '#1a5c1a');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + height * 0.1, width * 0.45, height * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell hexagon pattern
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const size = 4 + i * 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY + height * 0.1, size, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Head (round, sticking out front)
  const headGradient = ctx.createRadialGradient(
    centerX, y + height * 0.25, 2,
    centerX, y + height * 0.25, 10
  );
  headGradient.addColorStop(0, '#3D9B3D');
  headGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(centerX, y + height * 0.25, 10, 0, Math.PI * 2);
  ctx.fill();

  // Neck connecting head to shell
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(centerX, y + height * 0.35, 6, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Four legs (stubby ovals)
  ctx.fillStyle = '#2D7B2D';
  // Front left
  ctx.beginPath();
  ctx.ellipse(x + width * 0.2, y + height * 0.7, 4, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  // Front right
  ctx.beginPath();
  ctx.ellipse(x + width * 0.8, y + height * 0.7, 4, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Back left
  ctx.beginPath();
  ctx.ellipse(x + width * 0.25, y + height * 0.85, 4, 7, 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Back right
  ctx.beginPath();
  ctx.ellipse(x + width * 0.75, y + height * 0.85, 4, 7, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Eyes on head
  const eyeY = y + height * 0.22;
  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - 4, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 4, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 6, eyeY);
    ctx.lineTo(centerX - 2, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX + 2, eyeY);
    ctx.lineTo(centerX + 6, eyeY);
    ctx.stroke();
  }

  // Smile
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(centerX, y + height * 0.26, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

function drawPig(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isBlinking: boolean
) {
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Round body (pig shape - wide oval)
  const bodyGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, width * 0.5
  );
  bodyGradient.addColorStop(0, '#FFB6C1');
  bodyGradient.addColorStop(1, '#FF9BAE');

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, width * 0.45, height * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Floppy ears
  ctx.fillStyle = '#FF9BAE';
  // Left ear
  ctx.beginPath();
  ctx.ellipse(x + width * 0.15, y + height * 0.2, 7, 12, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Right ear
  ctx.beginPath();
  ctx.ellipse(x + width * 0.85, y + height * 0.2, 7, 12, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Snout (prominent oval sticking out)
  const snoutGradient = ctx.createRadialGradient(
    centerX, centerY + height * 0.18, 0,
    centerX, centerY + height * 0.18, 12
  );
  snoutGradient.addColorStop(0, '#FFE4E1');
  snoutGradient.addColorStop(1, '#FFB6C1');

  ctx.fillStyle = snoutGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + height * 0.18, 11, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils on snout
  ctx.fillStyle = '#FF69B4';
  ctx.beginPath();
  ctx.ellipse(centerX - 4, centerY + height * 0.18, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(centerX + 4, centerY + height * 0.18, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Four little legs
  ctx.fillStyle = '#FF9BAE';
  ctx.beginPath();
  ctx.ellipse(x + width * 0.28, y + height * 0.9, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width * 0.45, y + height * 0.9, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width * 0.55, y + height * 0.9, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width * 0.72, y + height * 0.9, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Curly tail
  ctx.strokeStyle = '#FF9BAE';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x + width * 0.92, centerY - height * 0.05, 4, 0, Math.PI * 1.8);
  ctx.stroke();

  // Eyes above snout
  const eyeY = centerY - height * 0.08;
  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - 6, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 6, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();
    // Highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - 5, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 7, eyeY - 1, 1, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 8, eyeY);
    ctx.lineTo(centerX - 4, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX + 4, eyeY);
    ctx.lineTo(centerX + 8, eyeY);
    ctx.stroke();
  }
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
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Slim, tall body (lemur shape - vertical oval)
  const bodyGradient = ctx.createRadialGradient(
    centerX, centerY + height * 0.1, 0,
    centerX, centerY + height * 0.1, width * 0.4
  );
  bodyGradient.addColorStop(0, '#A0522D');
  bodyGradient.addColorStop(1, '#6B3410');

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + height * 0.1, width * 0.35, height * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly patch (cream colored)
  ctx.fillStyle = '#D2B48C';
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + height * 0.15, width * 0.22, height * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head (round, on top)
  const headGradient = ctx.createRadialGradient(
    centerX, y + height * 0.22, 2,
    centerX, y + height * 0.22, 11
  );
  headGradient.addColorStop(0, '#A0522D');
  headGradient.addColorStop(1, '#8B4513');

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(centerX, y + height * 0.22, 11, 0, Math.PI * 2);
  ctx.fill();

  // Large pointy ears
  ctx.fillStyle = '#8B4513';
  // Left ear
  ctx.beginPath();
  ctx.moveTo(centerX - 9, y + height * 0.15);
  ctx.lineTo(centerX - 12, y + height * 0.05);
  ctx.lineTo(centerX - 6, y + height * 0.12);
  ctx.closePath();
  ctx.fill();
  // Right ear
  ctx.beginPath();
  ctx.moveTo(centerX + 9, y + height * 0.15);
  ctx.lineTo(centerX + 12, y + height * 0.05);
  ctx.lineTo(centerX + 6, y + height * 0.12);
  ctx.closePath();
  ctx.fill();

  // Long striped tail (curved)
  const tailSwing = Math.sin(frameIndex * 0.5) * 8;
  const tailSegments = 7;
  for (let i = 0; i < tailSegments; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#A0522D' : '#654321';
    const tailX = x + width * 0.85 + i * 5 + (tailSwing * (i / tailSegments));
    const tailY = centerY - height * 0.2 + i * 6;
    const curve = Math.sin(i * 0.5) * 3;

    ctx.beginPath();
    ctx.ellipse(tailX + curve, tailY, 3, 7, 0.3 + i * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arms and legs (thin)
  ctx.fillStyle = '#8B4513';
  // Arms
  ctx.beginPath();
  ctx.ellipse(x + width * 0.12, centerY + height * 0.05, 3, 9, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width * 0.88, centerY + height * 0.05, 3, 9, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Legs
  ctx.beginPath();
  ctx.ellipse(x + width * 0.35, y + height * 0.85, 3, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width * 0.65, y + height * 0.85, 3, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Huge eyes (lemur signature)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(centerX - 5, y + height * 0.22, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX + 5, y + height * 0.22, 6, 0, Math.PI * 2);
  ctx.fill();

  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - 5, y + height * 0.22, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 5, y + height * 0.22, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - 4, y + height * 0.21, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 6, y + height * 0.21, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 8, y + height * 0.22);
    ctx.lineTo(centerX - 2, y + height * 0.22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX + 2, y + height * 0.22);
    ctx.lineTo(centerX + 8, y + height * 0.22);
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
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Elongated body (salamander shape - horizontal oval with tail)
  const bodyGradient = ctx.createRadialGradient(
    centerX - width * 0.1, centerY, 0,
    centerX - width * 0.1, centerY, width * 0.5
  );
  bodyGradient.addColorStop(0, '#FF69B4');
  bodyGradient.addColorStop(1, '#FF1493');

  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(centerX - width * 0.1, centerY, width * 0.4, height * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head (rounded front)
  const headGradient = ctx.createRadialGradient(
    centerX - width * 0.25, centerY - height * 0.08, 2,
    centerX - width * 0.25, centerY - height * 0.08, 12
  );
  headGradient.addColorStop(0, '#FF69B4');
  headGradient.addColorStop(1, '#FF1493');

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(centerX - width * 0.25, centerY - height * 0.08, 12, 0, Math.PI * 2);
  ctx.fill();

  // Tail (tapered)
  ctx.fillStyle = '#FF1493';
  ctx.beginPath();
  ctx.moveTo(centerX + width * 0.25, centerY - height * 0.15);
  ctx.quadraticCurveTo(
    centerX + width * 0.45, centerY,
    centerX + width * 0.4, centerY + height * 0.2
  );
  ctx.lineTo(centerX + width * 0.3, centerY + height * 0.15);
  ctx.lineTo(centerX + width * 0.25, centerY + height * 0.15);
  ctx.closePath();
  ctx.fill();

  // Animated gill fronds (feathery, on head)
  const time = frameIndex * 0.3;
  ctx.fillStyle = '#FF1493';

  // Left gills (3 fronds)
  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(time + i * 0.5) * 3;
    const gillY = centerY - height * 0.15 + i * 4;
    ctx.beginPath();
    ctx.moveTo(centerX - width * 0.3, gillY);
    ctx.quadraticCurveTo(
      centerX - width * 0.4 + wave, gillY - 3,
      centerX - width * 0.45 + wave, gillY
    );
    ctx.lineTo(centerX - width * 0.42 + wave, gillY + 2);
    ctx.quadraticCurveTo(
      centerX - width * 0.38 + wave, gillY,
      centerX - width * 0.3, gillY + 1
    );
    ctx.closePath();
    ctx.fill();
  }

  // Right gills (3 fronds)
  for (let i = 0; i < 3; i++) {
    const wave = Math.sin(time + i * 0.5) * 3;
    const gillY = centerY - height * 0.15 + i * 4;
    ctx.beginPath();
    ctx.moveTo(centerX - width * 0.2, gillY);
    ctx.quadraticCurveTo(
      centerX - width * 0.1 - wave, gillY - 3,
      centerX - width * 0.05 - wave, gillY
    );
    ctx.lineTo(centerX - width * 0.08 - wave, gillY + 2);
    ctx.quadraticCurveTo(
      centerX - width * 0.12 - wave, gillY,
      centerX - width * 0.2, gillY + 1
    );
    ctx.closePath();
    ctx.fill();
  }

  // Four stubby legs
  ctx.fillStyle = '#FF69B4';
  // Front legs
  ctx.beginPath();
  ctx.ellipse(centerX - width * 0.15, centerY + height * 0.25, 3, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(centerX - width * 0.05, centerY + height * 0.25, 3, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Back legs
  ctx.beginPath();
  ctx.ellipse(centerX + width * 0.1, centerY + height * 0.28, 3, 7, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(centerX + width * 0.2, centerY + height * 0.28, 3, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Cute spots
  ctx.fillStyle = '#FF1493';
  ctx.globalAlpha = 0.5;
  const spots = [
    {x: centerX - width * 0.15, y: centerY - height * 0.05},
    {x: centerX, y: centerY + height * 0.05},
    {x: centerX + width * 0.1, y: centerY - height * 0.02},
    {x: centerX + width * 0.15, y: centerY + height * 0.1},
  ];
  spots.forEach(spot => {
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;

  // Kawaii eyes on head
  const eyeY = centerY - height * 0.12;
  if (!isBlinking) {
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - width * 0.3, eyeY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX - width * 0.2, eyeY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX - width * 0.29, eyeY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX - width * 0.19, eyeY - 1, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - width * 0.33, eyeY);
    ctx.lineTo(centerX - width * 0.27, eyeY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX - width * 0.23, eyeY);
    ctx.lineTo(centerX - width * 0.17, eyeY);
    ctx.stroke();
  }

  // Smile
  ctx.strokeStyle = '#FF1493';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(centerX - width * 0.25, eyeY + 8, 6, 0.3, Math.PI - 0.3);
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
