import * as THREE from 'three';
import { ModelCollection } from './ModelLoader';
import { ITileMesh, NavMesh } from './NavMesh';
import { Player } from './Player';
import { Vec3, Dictionary } from './types';

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
    const navTiles: ITileMesh[] = [];

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

        navTiles.push({ coords: [dx, dz], vertices, triangles });
        model.position.set(dx, 0, dz);
        levelObj.add(model);
      }
    }

    this.navmesh.addLevel(level.offset, navTiles);
    return new Level(levelObj);
  }
}

export class Level {
  obj: THREE.Object3D;

  constructor(obj: THREE.Object3D) {
    this.obj = obj;
  }

  update(dt: number, player: Player) {
    this.obj.visible = player.model.position.y >= this.obj.position.y;
  }
}