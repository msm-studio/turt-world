import RAPIER from '@dimforge/rapier2d-compat';

export class PhysicsWorld {
  private world: RAPIER.World | null = null;
  private eventQueue: RAPIER.EventQueue | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;

    await RAPIER.init();
    const gravity = { x: 0.0, y: 30.0 }; // Positive Y is down
    this.world = new RAPIER.World(gravity);
    this.eventQueue = new RAPIER.EventQueue(true);
    this.initialized = true;
  }

  getWorld(): RAPIER.World {
    if (!this.world) {
      throw new Error('Physics world not initialized');
    }
    return this.world;
  }

  step(deltaTime: number) {
    if (this.world && this.eventQueue) {
      try {
        this.world.step(this.eventQueue);
      } catch (e) {
        console.error('Physics step error:', e);
      }
    }
  }

  createRigidBody(desc: RAPIER.RigidBodyDesc): RAPIER.RigidBody {
    return this.getWorld().createRigidBody(desc);
  }

  createCollider(desc: RAPIER.ColliderDesc, body: RAPIER.RigidBody): RAPIER.Collider {
    return this.getWorld().createCollider(desc, body);
  }

  removeRigidBody(body: RAPIER.RigidBody) {
    this.getWorld().removeRigidBody(body);
  }
}

// Character physics parameters
export interface CharacterPhysics {
  speed: number;
  jumpForce: number;
  mass: number;
  airControl: number;
  floatTime: number;
}

export class PhysicsBody {
  private body: RAPIER.RigidBody;
  private collider: RAPIER.Collider;
  private world: PhysicsWorld;
  private physics: CharacterPhysics;
  private jumpTimeRemaining: number = 0;
  private floatTimeRemaining: number = 0;
  private lastGrounded: boolean = false;

  constructor(
    world: PhysicsWorld,
    x: number,
    y: number,
    width: number,
    height: number,
    physics: CharacterPhysics
  ) {
    this.world = world;
    this.physics = physics;

    // Create dynamic rigid body
    const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(x, y)
      .setLinearDamping(0.5)
      .setCanSleep(false);

    this.body = world.createRigidBody(bodyDesc);

    // Create collider
    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2)
      .setMass(physics.mass)
      .setFriction(0.3)
      .setRestitution(0.0);

    this.collider = world.createCollider(colliderDesc, this.body);
  }

  getPosition(): { x: number; y: number } {
    const pos = this.body.translation();
    return { x: pos.x, y: pos.y };
  }

  getVelocity(): { x: number; y: number } {
    const vel = this.body.linvel();
    return { x: vel.x, y: vel.y };
  }

  setVelocity(x: number, y: number) {
    this.body.setLinvel({ x, y }, true);
  }

  moveHorizontal(direction: number, deltaTime: number) {
    const isGrounded = this.isGrounded();
    const controlFactor = isGrounded ? 1.0 : this.physics.airControl;
    const targetVelX = direction * this.physics.speed;
    const currentVel = this.getVelocity();

    // Smooth acceleration
    const newVelX = currentVel.x + (targetVelX - currentVel.x) * controlFactor * 10 * deltaTime;
    this.body.setLinvel({ x: newVelX, y: currentVel.y }, true);
  }

  jump(isJumpHeld: boolean, deltaTime: number) {
    const isGrounded = this.isGrounded();
    const currentVel = this.getVelocity();

    // Start jump from ground
    if (isGrounded && isJumpHeld && this.jumpTimeRemaining <= 0) {
      this.jumpTimeRemaining = 0.2; // 200ms jump buffer
      this.body.setLinvel({ x: currentVel.x, y: -this.physics.jumpForce }, true);
    }

    // Variable jump height - release button to reduce upward velocity
    if (this.jumpTimeRemaining > 0) {
      this.jumpTimeRemaining -= deltaTime;

      if (!isJumpHeld) {
        // Cut jump short if button released
        if (currentVel.y < 0) {
          this.body.setLinvel({ x: currentVel.x, y: currentVel.y * 0.5 }, true);
        }
        this.jumpTimeRemaining = 0;
      }
    }

    // Character-specific floating (Axolotl)
    if (!isGrounded && this.physics.floatTime > 0) {
      if (this.lastGrounded) {
        this.floatTimeRemaining = this.physics.floatTime;
      }

      if (this.floatTimeRemaining > 0 && currentVel.y > 0) {
        this.floatTimeRemaining -= deltaTime;
        // Apply slight upward force to slow fall
        this.body.setLinvel({ x: currentVel.x, y: currentVel.y * 0.8 }, true);
      }
    } else {
      this.floatTimeRemaining = this.physics.floatTime;
    }

    this.lastGrounded = isGrounded;
  }

  isGrounded(): boolean {
    const world = this.world.getWorld();
    const pos = this.body.translation();
    const colliderShape = this.collider.shape as RAPIER.Cuboid;
    const halfHeight = colliderShape.halfExtents.y;

    // Cast a ray downward slightly beyond the bottom of the collider
    const rayOrigin = { x: pos.x, y: pos.y };
    const rayDir = { x: 0, y: 1 };
    const maxToi = halfHeight + 0.1;

    const ray = new RAPIER.Ray(rayOrigin, rayDir);
    const hit = world.castRay(ray, maxToi, true, undefined, undefined, this.collider);

    return hit !== null;
  }

  getRigidBody(): RAPIER.RigidBody {
    return this.body;
  }

  destroy() {
    this.world.removeRigidBody(this.body);
  }
}

// Platform physics body
export class Platform {
  private body: RAPIER.RigidBody;
  private collider: RAPIER.Collider;

  constructor(
    world: PhysicsWorld,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    // Create static rigid body
    const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y);
    this.body = world.createRigidBody(bodyDesc);

    // Create collider
    const colliderDesc = RAPIER.ColliderDesc.cuboid(width / 2, height / 2).setFriction(0.8);
    this.collider = world.createCollider(colliderDesc, this.body);
  }

  getPosition(): { x: number; y: number; width: number; height: number } {
    const pos = this.body.translation();
    const shape = this.collider.shape as RAPIER.Cuboid;
    return {
      x: pos.x,
      y: pos.y,
      width: shape.halfExtents.x * 2,
      height: shape.halfExtents.y * 2,
    };
  }
}
