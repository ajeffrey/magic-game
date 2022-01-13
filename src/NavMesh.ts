import * as THREE from 'three';
import { Dictionary, Vec2, Vec3 } from './types';

export interface ITileMesh {
  coords: Vec2;
  vertices: Vec3[];
  triangles: Vec3[];
}

type NavTile = THREE.Triangle[];

function isWithinTriangle(tri: THREE.Triangle, point: THREE.Vector2) {
  var A = 1/2 * (-tri.b.z * tri.c.x + tri.a.z * (-tri.b.x + tri.c.x) + tri.a.x * (tri.b.z - tri.c.z) + tri.b.x * tri.c.z);
  var sign = A < 0 ? -1 : 1;
  var s = (tri.a.z * tri.c.x - tri.a.x * tri.c.z + (tri.c.z - tri.a.z) * point.x + (tri.a.x - tri.c.x) * point.y) * sign;
  var t = (tri.a.x * tri.b.z - tri.a.z * tri.b.x + (tri.a.z - tri.b.z) * point.x + (tri.b.x - tri.a.x) * point.y) * sign;
  
  return s >= 0 && t >= 0 && (s + t) <= 2 * A * sign;
}

function lerpTriangle(p: THREE.Vector2, tri: THREE.Triangle) {
  const div = (tri.a.x * (tri.c.z - tri.b.z) + tri.b.x * (tri.a.z - tri.c.z) + tri.c.x * (tri.b.z - tri.a.z));
  var w1 = (p.x * (tri.c.z - tri.b.z) + tri.b.x * (p.y-tri.c.z) + tri.c.x * (tri.b.z-p.y)) / div;
  var w2 = -(p.x * (tri.c.z - tri.a.z) + tri.a.x * (p.y - tri.c.z) + tri.c.x * (tri.a.z - p.y)) / div;
  var w3 = 1 - w1 - w2;

  if(w1 < 0 || w2 < 0 || w3 < 0) {
    return null;
  }

  return w1 * tri.a.y + w2 * tri.b.y + w3 * tri.c.y;
}

function dedupeVertices(vertices: THREE.Vector3[]) {
  const uniq: THREE.Vector3[] = [];
  const ids = new Set<string>();
  for(const v of vertices) {
    const id = v.toArray().join(',');
    if(!ids.has(id)) {
      ids.add(id);
      uniq.push(v);
    }
  }


  return uniq;
}

function connectsTo(a: NavTile, b: NavTile): boolean {
  const avs = dedupeVertices(a.flatMap(at => [at.a, at.b, at.c]));
  const bvs = dedupeVertices(b.flatMap(bt => [bt.a, bt.b, bt.c]));
  let ints = 0;
  for(const av of avs) {
    const aid = av.toArray().join(',');
    for(const bv of bvs) {
      const bid = bv.toArray().join(',');
      if(aid === bid) {
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
    const dest = new THREE.Vector2(start.x + change.x, start.z + change.y);
    const changeX = Math.round(dest.x) - Math.round(start.x);
    const changeY = Math.round(dest.y) - Math.round(start.z);
    const startTile = this.getTile(start);
    let toTile: NavTile | null = null;

    // stayed on same tile
    if(changeX || changeY) {
      for(const y of [start.y, start.y - 1, start.y + 1]) {
        const newTile = this.getTile(new THREE.Vector3(Math.round(dest.x), y, Math.round(dest.y)));
        if(newTile && connectsTo(newTile, startTile)) {
          toTile = newTile;
          break;
        }
      }
    } else {
      toTile = startTile;
    }

    if(toTile) {
      const toTri = toTile.find(t => isWithinTriangle(t, dest));
      if(toTri) {
        // just lerp the Y position from the triangle
        const y = lerpTriangle(dest, toTri);
        if(y !== null) {
          const end = new THREE.Vector3(dest.x, y, dest.y);
          return end;
        }
      }
    }

    return null;
  }

  debug() {
    const navmeshGeo = new THREE.BufferGeometry();
    const vertices = Object.values(this.tiles).flat().flatMap(tri => [tri.a.toArray(), tri.b.toArray(), tri.c.toArray()]).flatMap(([x, y, z]) => [x, y + 0.1, z]);
    navmeshGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    const navmeshMat = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.75, transparent: true });
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