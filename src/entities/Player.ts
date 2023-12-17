import * as THREE from "three";
import { Camera } from "../Camera";
import { Keyboard } from "../input/Keyboard";
import { NavMesh } from "../navigation/NavMesh";
import { IEntity, World } from "../world/World";
import { FollowingPathState } from "../states/FollowingPathState";
import { NeutralState } from "../states/NeutralState";
import { NavTile } from "../navigation/NavTile";
import Time from "src/Time";

const PLAYER_SPEED = 4;

export class Player implements IEntity {
  public model: THREE.Object3D;
  public camera: Camera;
  public state: FollowingPathState | NeutralState;
  public speed = PLAYER_SPEED;

  constructor(model: THREE.Object3D, camera: Camera) {
    this.setModel(model);
    this.camera = camera;
    this.model.add(this.camera.camera);
    this.state = new NeutralState();
  }

  setPath(path: NavTile[]) {
    this.state = new FollowingPathState(this, path);
  }

  update() {
    this.camera.update();

    let moveVector = Keyboard.moveVector();
    if (moveVector.length() > 0) {
      this.state = new NeutralState();
    }
    this.state.update();
    if (this.state.isFinished() && this.state instanceof FollowingPathState) {
      this.state = new NeutralState();
    }

    if (Keyboard.keyDown("shift")) {
      this.speed = PLAYER_SPEED / 2;
    } else {
      this.speed = PLAYER_SPEED;
    }

    let speed = Time.deltaTime * this.speed;

    const navmesh = World.getEntity(NavMesh);
    if (navmesh && moveVector.length() > 0) {
      moveVector.normalize();
      moveVector.multiplyScalar(speed);

      let newPos = navmesh.move(this.model.position, moveVector);
      if (newPos) {
        this.model.position.copy(newPos);
      } else {
        const alternatives: THREE.Vector2[] = [];
        if (moveVector.x) alternatives.push(new THREE.Vector2(moveVector.x, 0));
        if (moveVector.y) alternatives.push(new THREE.Vector2(0, moveVector.y));
        for (const alt of alternatives) {
          newPos = navmesh.move(this.model.position, alt);
          if (newPos) {
            this.model.position.copy(newPos);
            this.emitSound();
            break;
          }
        }
      }
    }
  }

  private emitSound() {}

  private setModel(model: THREE.Object3D) {
    model.position.set(3, 0, 3);
    model.castShadow = true;
    this.model = model;
  }
}
