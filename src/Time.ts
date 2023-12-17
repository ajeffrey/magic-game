export default class Time {
  public static deltaTime: number;

  static update(dt: number) {
    this.deltaTime = dt;
  }
}
