import * as THREE from 'three';
import { Dictionary, Vec2, Vec3 } from './types';

type Triangle = [Vec3, Vec3, Vec3];

export interface ITileMesh {
  coords: Vec2;
  vertices: Vec3[];
  triangles: Vec3[];
}

function isWithinTriangle(tri: THREE.Triangle, point: THREE.Vector2) {
  var A = 1/2 * (-tri.b.z * tri.c.x + tri.a.z * (-tri.b.x + tri.c.x) + tri.a.x * (tri.b.z - tri.c.z) + tri.b.x * tri.c.z);
  var sign = A < 0 ? -1 : 1;
  var s = (tri.a.z * tri.c.x - tri.a.x * tri.c.z + (tri.c.z - tri.a.z) * point.x + (tri.a.x - tri.c.x) * point.y) * sign;
  var t = (tri.a.x * tri.b.z - tri.a.z * tri.b.x + (tri.a.z - tri.b.z) * point.x + (tri.b.x - tri.a.x) * point.y) * sign;
  
  return s > 0 && t > 0 && (s + t) < 2 * A * sign;
}

function lerpTriangle(tri: THREE.Triangle, point: THREE.Vector2) {
  const div = (tri.b.z - tri.c.z) * (tri.a.x - tri.c.x) + (tri.c.x - tri.b.x) * (tri.a.z - tri.c.z);
  const w1 = (tri.b.z - tri.c.z) * (point.x - tri.c.x) + (tri.c.x - tri.b.x) * (point.y - tri.c.z);
  const w2 = (tri.c.z - tri.a.z) * (point.x - tri.c.x) + (tri.a.x - tri.c.x) * (point.y  - tri.c.z);
  const w3 = 1 - w1 - w2;
  return ((w1 * tri.a.y) + (w2 * tri.b.y) + (w3 * tri.c.y)) / (w1 + w2 + w3);
}

const tri = new THREE.Triangle(
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(1, 1, 0),
  new THREE.Vector3(0, 0, 1),
);
console.log('lerptest', lerpTriangle(tri, new THREE.Vector2(0, 0.5)));
console.log('lerptest', lerpTriangle(tri, new THREE.Vector2(0.25, 0.5)));

export class NavMesh {
  private tiles: Dictionary<THREE.Triangle[]>;

  constructor() {
    this.tiles = {};
  }

  addLevel(offset: Vec3, tiles: ITileMesh[]) {
    for(const { coords, vertices, triangles } of tiles) {
      const coords3: Vec3 = Vec3.add(offset, [coords[0], 0, coords[1]]);
      const indices: THREE.Vector3[] = [];
      for(const v of vertices) {
        const vAbs = Vec3.add(coords3, v);
        indices.push(new THREE.Vector3(...vAbs));
      }

      const tile = triangles.map(([a, b, c]) => new THREE.Triangle(indices[a], indices[b], indices[c]));
      const id = Vec3.toString(Vec3.round(coords3));
      this.tiles[id] = tile;
    }
  }

  move(start: THREE.Vector3, change: THREE.Vector2): THREE.Vector3 | null {
    const dest = start.clone();
    dest.x += change.x;
    dest.z += change.y;
    const destxz = new THREE.Vector2(dest.x, dest.z);

    const toTile = this.getTile(dest);
    if(toTile) {
      console.log('ok');
      const toTri = toTile.find(t => isWithinTriangle(t, destxz));
      if(toTri) {
        dest.y = lerpTriangle(toTri, destxz);
        return dest;
      }

    } else {

    }

    return null;
  }

  debug() {
    const navmeshGeo = new THREE.BufferGeometry();
    const vertices = Object.values(this.tiles).flat().flatMap(tri => [tri.a.toArray(), tri.b.toArray(), tri.c.toArray()]).flatMap(([x, y, z]) => [x, y + 0.1, z]);
    navmeshGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    const navmeshMat = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.75, transparent: true, side: THREE.DoubleSide });
    const navmesh = new THREE.Mesh(navmeshGeo, navmeshMat);
    return navmesh;
  }

  private pointToIndex(point: THREE.Vector3) {
    return point.toArray().map((n, i) => i == 1 ? Math.floor(n) : Math.round(n)).join(',');
  }

  private getTile(point: THREE.Vector3) {
    const id = this.pointToIndex(point);
    return this.tiles[id] || null;
  }
}