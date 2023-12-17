import { State } from "src/components/State";
import { IEntity, World } from "src/world/World";
import { NavMesh } from "src/navigation/NavMesh";
import { NavTile } from "src/navigation/NavTile";
import * as THREE from "three";
import Time from "src/Time";

interface IMovableEntity extends IEntity {
  model: THREE.Object3D;
  speed: number;
}

export class FollowingPathState {
  constructor(private entity: IMovableEntity, private path: NavTile[]) {}

  enter(path: NavTile[]) {
    this.path = path;
  }

  isFinished() {
    return this.path.length === 0;
  }

  update() {
    if (this.isFinished()) {
      return;
    }

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

    const distance = Math.min(
      Time.deltaTime * this.entity.speed,
      vectorPt.length()
    );

    vectorPt.normalize().multiplyScalar(distance);
    const navMesh = World.getEntity(NavMesh);
    const newPos = navMesh.move(this.entity.model.position, vectorPt);
    if (!newPos) {
      this.path.shift();
      console.log("bonk");
      return;
    }
    this.entity.model.position.copy(newPos);

    if (this.entity.model.position.distanceTo(dest) < 0.01) {
      this.path.shift();
    }
  }
}
