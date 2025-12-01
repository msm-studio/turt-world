// Keyboard input handling system

export class InputManager {
  private keys: Map<string, boolean> = new Map();
  private keyJustPressed: Map<string, boolean> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.keys.get(e.key)) {
      this.keyJustPressed.set(e.key, true);
    }
    this.keys.set(e.key, true);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.set(e.key, false);
    this.keyJustPressed.set(e.key, false);
  };

  isKeyDown(key: string): boolean {
    return this.keys.get(key) || false;
  }

  isKeyJustPressed(key: string): boolean {
    const justPressed = this.keyJustPressed.get(key) || false;
    if (justPressed) {
      this.keyJustPressed.set(key, false);
    }
    return justPressed;
  }

  // Convenience methods for common controls
  get left(): boolean {
    return this.isKeyDown('ArrowLeft') || this.isKeyDown('a');
  }

  get right(): boolean {
    return this.isKeyDown('ArrowRight') || this.isKeyDown('d');
  }

  get jump(): boolean {
    return this.isKeyDown('ArrowUp') || this.isKeyDown('w') || this.isKeyDown(' ');
  }

  get jumpPressed(): boolean {
    return (
      this.isKeyJustPressed('ArrowUp') ||
      this.isKeyJustPressed('w') ||
      this.isKeyJustPressed(' ')
    );
  }

  cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
    }
  }

  update() {
    // Reset just-pressed states each frame
    // This is called after the game logic has read the input
  }
}
