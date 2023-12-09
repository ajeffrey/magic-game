import * as THREE from "three";
import { Dictionary } from "../types";
import { NavTile } from "./NavTile";
import { shortestPath } from "./shortestPath";

const NEIGHBOUR_RANGE = [0, -1, 1];

function connectsTo(a: NavTile, b: NavTile): boolean {
  let ints = 0;
  for (const av of a.vertices) {
    const aid = av.toArray().join(",");
    for (const bv of b.vertices) {
      const bid = bv.toArray().join(",");
      if (aid === bid) {
        ints += 1;
      }
    }
  }

  return ints >= 2;
}

export class NavMesh {
  private tiles: Dictionary<NavTile>;

  constructor() {
    this.tiles = {};
  }

  addTile(tile: NavTile) {
    this.tiles[this.pointToIndex(tile.coords)] = tile;
    for (const x of NEIGHBOUR_RANGE) {
      for (const z of NEIGHBOUR_RANGE) {
        for (const y of NEIGHBOUR_RANGE) {
          if (x === 0 && z === 0) continue;
          const ncoords = new THREE.Vector3(x, y, z).add(tile.coords);
          const neighbour = this.getTile(ncoords);
          if (neighbour && connectsTo(tile, neighbour)) {
            tile.addNeighbour(new THREE.Vector2(x, z), neighbour);
            neighbour.addNeighbour(new THREE.Vector2(-x, -z), tile);
          }
        }
      }
    }
  }

  route(start: THREE.Vector3, end: THREE.Vector3) {
    const startTile = this.tiles[this.pointToIndex(start)];
    const endTile = this.tiles[this.pointToIndex(end)];
    if (startTile === endTile) {
      return [];
    }

    return shortestPath(startTile, endTile);
  }

  move(start: THREE.Vector3, change: THREE.Vector2): THREE.Vector3 | null {
    const dest = new THREE.Vector2(start.x + change.x, start.z + change.y);
    const changeX = Math.round(dest.x) - Math.round(start.x);
    const changeY = Math.round(dest.y) - Math.round(start.z);
    const startTile = this.getTile(start);
    let toTile: NavTile | null = null;

    // stayed on same tile
    if (changeX || changeY) {
      const neighbour = startTile.neighbour(
        new THREE.Vector2(changeX, changeY)
      );
      if (neighbour) {
        toTile = neighbour;
      }
    } else {
      toTile = startTile;
    }

    let y: number | null;
    if (toTile) {
      y = toTile.getY(dest.x, dest.y);
      if (y !== null) {
        const end = new THREE.Vector3(dest.x, y, dest.y);
        return end;
      }
    }
    return null;
  }

  triangles() {
    return Object.values(this.tiles).flatMap((t) => {
      const geo = new THREE.BufferGeometry();
      const verts = t.triangles
        .flatMap((tri) => [tri.a.toArray(), tri.b.toArray(), tri.c.toArray()])
        .flatMap(([x, y, z]) => [x, y, z]);
      geo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(verts), 3)
      );
      const mat = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.tile = t;
      return mesh;
    });
  }

  getTile(point: THREE.Vector3) {
    const id = this.pointToIndex(point);
    return this.tiles[id] || null;
  }

  private pointToIndex(point: THREE.Vector3) {
    return point
      .toArray()
      .map((n, i) => (i == 1 ? Math.floor(n) : Math.round(n)))
      .join(",");
  }
}
