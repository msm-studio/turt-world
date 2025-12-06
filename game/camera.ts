// Camera system for side-scrolling

export class Camera {
  private x: number = 0;
  private y: number = 0;
  private canvasWidth: number;
  private canvasHeight: number;
  private worldWidth: number;
  private worldHeight: number;

  constructor(canvasWidth: number, canvasHeight: number, worldWidth: number, worldHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  // Follow a target (player)
  follow(targetX: number, targetY: number) {
    // Center camera on target horizontally
    this.x = targetX - this.canvasWidth / 2;

    // Keep camera within world bounds
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.canvasWidth));

    // Keep vertical camera relatively static (or centered)
    this.y = Math.max(0, Math.min(targetY - this.canvasHeight / 2, this.worldHeight - this.canvasHeight));
  }

  // Get camera position
  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  // Apply camera transform to canvas context
  apply(ctx: CanvasRenderingContext2D) {
    ctx.translate(-this.x, -this.y);
  }

  // Reset camera transform
  reset(ctx: CanvasRenderingContext2D) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Update canvas/world dimensions
  resize(canvasWidth: number, canvasHeight: number, worldWidth: number, worldHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }
}
