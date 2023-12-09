import * as THREE from "three";
import { NavMesh } from "./navigation/NavMesh";
import { NavTile } from "./navigation/NavTile";
import { IEntity, World } from "./World";
import { FollowingPathState } from "./states/FollowingPathState";

class RatIdleState {
  private remaining: number;
  
  constructor() {
    this.remaining = 1 + Math.random() * 3;
  }

  isFinished() {
    return this.remaining <= 0;
  }

  update(dt: number) {
    this.remaining -= dt;
  }
}

class RatChoosingRandomTileState {
  public path: NavTile[];

  constructor(private rat: Rat) {
    this.path = [];
  }

  isFinished() {
    return this.path.length > 0;
  }

  update(dt: number, world: World) {
    const navmesh = world.getEntity(NavMesh);
    const tile = navmesh.getTile(this.rat.model.position);
    if (tile) {
      while (1) {
        let succeeded = true;
        const steps = [];
        let current = tile;
        for (let i = 0; i < 3; i++) {
          const candidates = current.neighbours.filter((n) => {
            if (steps.includes(n.tile)) {
              return false;
            }

            if (n.tile.tags.includes("stairs")) {
              return false;
            }

            return true;
          });

          if (candidates.length === 0) {
            succeeded = false;
            break;
          }

          current =
            candidates[Math.floor(Math.random() * candidates.length)].tile;
          steps.push(current);
        }

        if (succeeded) {
          this.path = steps;
          break;
        }
      }
    }
  }
}

type RatState = RatChoosingRandomTileState | FollowingPathState | RatIdleState;

export class Rat implements IEntity {
  public model: THREE.Object3D;
  public state: RatState;
  public speed = 5;

  constructor(model: THREE.Object3D, position: THREE.Vector3) {
    this.setModel(model);
    this.model.position.copy(position);
    this.state = new RatChoosingRandomTileState(this);
  }

  update(dt: number, world: World) {
    this.state.update(dt, world);

    if (this.state.isFinished()) {
      if (this.state instanceof RatIdleState) {
        this.state = new RatChoosingRandomTileState(this);
      } else if (this.state instanceof RatChoosingRandomTileState) {
        this.state = new FollowingPathState(this, this.state.path);
      } else if (this.state instanceof FollowingPathState) {
        this.state = new RatIdleState();
      }
    }
  }

  private setModel(model: THREE.Object3D) {
    model.castShadow = true;
    this.model = model;
  }
}
