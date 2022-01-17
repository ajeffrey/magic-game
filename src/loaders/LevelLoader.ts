import * as THREE from 'three';
import { ModelCollection } from 'src/loaders/ModelLoader';
import { NavMesh } from 'src/navigation/NavMesh';
import { NavTile } from 'src/navigation/NavTile';
import { Vec3, Dictionary } from 'src/types';
import { Level } from 'src/Level';

export interface ITile {
  m: string;
  rotate?: number;
}

export interface IModel {
  navigable: {
    v: Array<Vec3>;
    t: Array<Vec3>;
  }
}

export interface ILevel {
  offset: Vec3;
  map: string;
}

export interface ITileset {
  models: Dictionary<IModel>;
  tiles: Dictionary<ITile>;
}

export class LevelLoader {
  private tileset: ITileset;
  private models: ModelCollection;
  private navmesh: NavMesh;

  constructor(tileset: ITileset, models: ModelCollection, navmesh: NavMesh) {
    this.tileset = tileset;
    this.models = models;
    this.navmesh = navmesh;
  }

  load(level: ILevel) {
    const levelObj = new THREE.Object3D();
    levelObj.position.set(...level.offset);
    const tiles = level.map.split('\n').map(row => row.split(''));
    for(let dz = 0; dz < tiles.length; dz++) {
      for(let dx = 0; dx < tiles[dz].length; dx++) {
        const index = tiles[dz][dx];
        const tile = this.tileset.tiles[index];
        if(!tile) {
          continue;
        }

        const model = this.models.get(tile.m);
        if(tile.rotate) {
          model.rotateY(-tile.rotate * Math.PI / 180);
        }

        let { v: vertices, t: triangles } = this.tileset.models[tile.m].navigable;
        const spins = (tile.rotate || 0) / 90;

        if(spins > 0) {
          vertices = vertices.map(v => {
            for(let i = 0; i < spins; i++) {
              v = [-v[2], v[1], v[0]];
            }

            return v;
          });
        }

        const tileCoord = new THREE.Vector3(dx + level.offset[0], level.offset[1], dz + level.offset[2]);
        const tileTriangles: THREE.Triangle[] = [];
        for(const [a, b, c] of triangles) {
          tileTriangles.push(new THREE.Triangle(
            new THREE.Vector3(...vertices[a]).add(tileCoord),
            new THREE.Vector3(...vertices[b]).add(tileCoord),
            new THREE.Vector3(...vertices[c]).add(tileCoord),
          ));
        }

        const navTile = new NavTile(tileCoord, tileTriangles);
        this.navmesh.addTile(navTile);
        model.position.set(dx, 0, dz);
        levelObj.add(model);
      }
    }

    return new Level(levelObj);
  }
}
