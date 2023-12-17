import * as THREE from "three";

export const Keyboard = new (class {
  private keys: { [key: string]: boolean };

  constructor() {
    this.keys = {};

    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      this.keys[key] = true;
    });

    window.addEventListener("keyup", (e) => {
      const key = e.key.toLowerCase();
      this.keys[key] = false;
    });
  }

  keyDown(key: string) {
    return this.keys[key] || false;
  }

  moveVector() {
    const moveVector = new THREE.Vector2();
    if (this.keyDown("w")) {
      moveVector.y -= 1;
    }
    if (this.keyDown("s")) {
      moveVector.y += 1;
    }
    if (this.keyDown("a")) {
      moveVector.x -= 1;
    }
    if (this.keyDown("d")) {
      moveVector.x += 1;
    }

    return moveVector;
  }
})();
