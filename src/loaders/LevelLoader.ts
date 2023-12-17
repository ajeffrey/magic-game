import * as THREE from "three";
import { ModelCollection } from "src/loaders/ModelLoader";
import { NavMesh } from "src/navigation/NavMesh";
import { NavTile } from "src/navigation/NavTile";
import { Vec3, Dictionary } from "src/types";
import { Level } from "src/Level";
import earcut from "earcut";
import * as turf from "@turf/turf";

function spin(polys: Vec3[][], rotate?: number) {
  const spins = (rotate || 0) / 90;

  if (spins === 0) {
    return polys;
  }

  return polys.map((poly) =>
    poly.map((v) => {
      for (let i = 0; i < spins; i++) {
        v = [-v[2], v[1], v[0]];
      }

      return v;
    })
  );
}

function polysToTurf(polys: Vec3[][]) {
  return turf.polygon(
    polys.map((poly) => {
      const line = poly.map(([x, y, z]) => [x, z]);
      return [...line, line[0]];
    })
  );
}

function coordToVec(coord: turf.helpers.Position, offs: THREE.Vector3) {
  return new THREE.Vector3(coord[0] + offs.x, offs.y, coord[1] + offs.z);
}

function turfToTriangle(poly: turf.Feature<turf.Polygon>, offs: THREE.Vector3) {
  const tris = turf.tesselate(poly);
  const triangles: THREE.Triangle[] = [];
  for (const outTri of tris.features) {
    for (const tri of outTri.geometry.coordinates) {
      triangles.push(
        new THREE.Triangle(
          coordToVec(tri[0], offs),
          coordToVec(tri[1], offs),
          coordToVec(tri[2], offs)
        )
      );
    }
  }
  console.log("TRIS", triangles);
  return triangles;
}

export interface ITile {
  m: string;
  rotate?: number;
  attach?: ITile[];
}

export interface IModel {
  navigable?: {
    polys: Vec3[][];
  };
}

export interface ILevel {
  offset: Vec3;
  tiles: Dictionary<ITile>;
  map: string;
}

export type IModels = Dictionary<IModel>;

export class LevelLoader {
  private levelModels: IModels;
  private models: ModelCollection;
  private navmesh: NavMesh;

  constructor(levelModels: IModels, models: ModelCollection, navmesh: NavMesh) {
    this.levelModels = levelModels;
    this.models = models;
    this.navmesh = navmesh;
  }

  load(level: ILevel) {
    const levelObj = new THREE.Object3D();
    levelObj.position.set(...level.offset);
    const tiles = level.map.split("\n").map((row) => row.split(""));
    for (let dz = 0; dz < tiles.length; dz++) {
      for (let dx = 0; dx < tiles[dz].length; dx++) {
        const index = tiles[dz][dx];
        const tile = level.tiles[index];
        if (!tile) {
          continue;
        }

        const model = this.models.get(tile.m);
        if (tile.rotate) {
          model.rotateY((-tile.rotate * Math.PI) / 180);
        }

        if (tile.attach) {
          for (const attachment of tile.attach) {
            const attModel = this.models.get(attachment.m);
            if (attachment.rotate) {
              attModel.rotateY((-attachment.rotate * Math.PI) / 180);
            }
            model.add(attModel);
          }
        }

        let polys = this.levelModels[tile.m].navigable?.polys ?? [];
        polys = spin(polys, tile.rotate);

        const tileCoord = new THREE.Vector3(
          dx + level.offset[0],
          level.offset[1],
          dz + level.offset[2]
        );

        if (polys.length > 0) {
          let polygon: turf.Feature<turf.Polygon | turf.MultiPolygon> =
            polysToTurf(polys);
          console.log("OLDPOLY", polygon.geometry.coordinates);
          for (const attachment of tile.attach ?? []) {
            let attachPolys =
              this.levelModels[attachment.m].navigable?.polys ?? [];
            attachPolys = spin(attachPolys, attachment.rotate);
            if (!attachPolys.length) continue;
            polygon = turf.difference(polygon, polysToTurf(attachPolys));
            console.log("NEWPOLY", polygon.geometry.coordinates);
          }

          const tris: THREE.Triangle[] = [];
          if (polygon.geometry.type === "Polygon") {
            tris.push(
              ...turfToTriangle(
                polygon as turf.Feature<turf.Polygon>,
                tileCoord
              )
            );
            const turfTris = turf.tesselate(
              polygon as turf.Feature<turf.Polygon>
            );
            for (const turfTri of turfTris.features) {
              console.log(turfTri);
            }
          } else {
            for (const poly of polygon.geometry.coordinates) {
              const p = turf.polygon(poly);
              tris.push(...turfToTriangle(p, tileCoord));
            }
          }

          console.log("TRIS", tris);

          const navTile = new NavTile(tileCoord, tris, [tile.m]);
          this.navmesh.addTile(navTile);
        }
        model.position.set(dx, 0, dz);
        levelObj.add(model);
      }
    }

    return new Level(levelObj);
  }
}
