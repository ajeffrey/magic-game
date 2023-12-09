import * as THREE from "three";

interface INeighbour {
  direction: THREE.Vector2;
  tile: NavTile;
}

export class NavTile {
  readonly coords: THREE.Vector3;
  readonly triangles: THREE.Triangle[];
  readonly tags: string[];
  readonly vertices: THREE.Vector3[];
  readonly neighbours: INeighbour[];
  readonly id: string;

  constructor(
    coords: THREE.Vector3,
    triangles: THREE.Triangle[],
    tags: string[]
  ) {
    this.id = coords.toArray().join(",");
    this.tags = tags;
    this.coords = coords;
    this.triangles = triangles;
    this.vertices = this.uniqueVertices(triangles);
    this.neighbours = [];
  }

  neighbour(direction: THREE.Vector2): NavTile | null {
    for (const n of this.neighbours) {
      if (n.direction.equals(direction)) {
        return n.tile;
      }
    }

    return null;
  }

  getY(x: number, z: number): number | null {
    for (const tri of this.triangles) {
      const div =
        tri.a.x * (tri.c.z - tri.b.z) +
        tri.b.x * (tri.a.z - tri.c.z) +
        tri.c.x * (tri.b.z - tri.a.z);
      var w1 =
        (x * (tri.c.z - tri.b.z) +
          tri.b.x * (z - tri.c.z) +
          tri.c.x * (tri.b.z - z)) /
        div;
      var w2 =
        -(
          x * (tri.c.z - tri.a.z) +
          tri.a.x * (z - tri.c.z) +
          tri.c.x * (tri.a.z - z)
        ) / div;
      var w3 = 1 - w1 - w2;

      if (w1 < 0 || w2 < 0 || w3 < 0) {
        continue;
      }

      return w1 * tri.a.y + w2 * tri.b.y + w3 * tri.c.y;
    }

    return null;
  }

  addNeighbour(direction: THREE.Vector2, tile: NavTile) {
    this.neighbours.push({ direction, tile });
  }

  private uniqueVertices(triangles: THREE.Triangle[]) {
    const unique: THREE.Vector3[] = [];
    const ids = new Set<string>();
    const vertices = triangles.flatMap((t) => [t.a, t.b, t.c]);

    for (const v of vertices) {
      const id = v.toArray().join(",");
      if (!ids.has(id)) {
        ids.add(id);
        unique.push(v);
      }
    }

    return unique;
  }
}
