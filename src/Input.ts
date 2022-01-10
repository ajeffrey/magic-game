export const Input = new class {
  private keys: {[key: string]: boolean};

  constructor() {
    this.keys = {};

    window.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();
      console.log(key);
      this.keys[key] = true;
    });

    window.addEventListener('keyup', e => {
      const key = e.key.toLowerCase();
      this.keys[key] = false;
    });
  }

  keyDown(key: string) {
    return this.keys[key] || false;
  }
};