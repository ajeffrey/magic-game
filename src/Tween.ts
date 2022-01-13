
// https://easings.net/#easeOutExpo
function ease(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

type ITweenVal = number;
interface ITweenRun {
  start: ITweenVal;
  target: ITweenVal;
  duration: number;
  elapsed: number;
}

export class Tween {
  private state: ITweenRun | null;

  constructor(private value: ITweenVal, private onChange: (val: ITweenVal) => any) {
    this.state = null;
  }

  get target() {
    return this.state ? this.state.target : this.value;
  }

  tween(target: ITweenVal, duration: number) {
    this.state = { start: this.value, target, duration, elapsed: 0 };
  }

  private setVal(val: ITweenVal) {
    this.value = val;
    this.onChange(val);
  }

  update(dt: number) {
    if(this.state) {
      this.state.elapsed += dt;
      const ratio = Math.min(1, this.state.elapsed / this.state.duration);
      const change = this.state.target - this.state.start;
      this.setVal(this.state.start + (ease(ratio) * change));

      if(this.state.elapsed >= this.state.duration) {
        this.state = null;
      }
    }
  }
}
