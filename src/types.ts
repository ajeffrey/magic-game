export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Dictionary<T> = {[key: string]: T};

export namespace Vec3 {
  export function toString(vec: Vec3): string {
    return vec.join(',');
  }

  export function isEqual(a: Vec3, b: Vec3): boolean {
    return a[0] == b[0] && a[1] == b[1] && a[2] == b[2];
  }

  export function add(...vecs: Vec3[]): Vec3 {
    return vecs.reduce((a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]);
  }

  export function round(vec: Vec3): Vec3 {
    return vec.map(v => Math.round(v)) as Vec3;
  }
}

export namespace Vec2 {
  export function normalize(vec: Vec2): Vec2 {
    const mag = magnitude(vec);
    return vec.map(c => c / mag) as Vec2;
  }

  export function magnitude(vec: Vec2): number {
    return Math.sqrt((vec[0] * vec[0]) + (vec[1] * vec[1]));
  }
}