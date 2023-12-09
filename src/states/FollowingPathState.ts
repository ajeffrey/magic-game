import { IState } from "src/State";
import { IEntity } from "src/World";
import { NavTile } from "src/navigation/NavTile";
import * as THREE from "three";

interface IMovableEntity extends IEntity {
  model: THREE.Object3D;
  speed: number;
}

export class FollowingPathState implements IState {
  constructor(private entity: IMovableEntity, private path: NavTile[]) {}

  isFinished() {
    return this.path.length === 0;
  }

  update(dt: number) {
    const destination = this.path[0];
    
    const dest = new THREE.Vector3(
      destination.coords.x,
      destination.getY(destination.coords.x, destination.coords.z),
      destination.coords.z
    );

    const vectorPt = new THREE.Vector2(
      destination.coords.x - this.entity.model.position.x,
      destination.coords.z - this.entity.model.position.z
    );

    const distance = Math.min(dt * this.entity.speed, vectorPt.length());
    vectorPt.normalize().multiplyScalar(distance);
    this.entity.model.position.set(
      this.entity.model.position.x + vectorPt.x,
      destination.getY(
        this.entity.model.position.x,
        this.entity.model.position.z
      ),
      this.entity.model.position.z + vectorPt.y
    );

    if (this.entity.model.position.distanceTo(dest) < 0.01) {
      this.path.shift();
    }
  }
}
