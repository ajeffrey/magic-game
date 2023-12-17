import * as THREE from "three";
import { NavMesh } from "../navigation/NavMesh";
import { NavTile } from "../navigation/NavTile";
import { World } from "../world/World";
import { FollowingPathState } from "../states/FollowingPathState";
import Time from "src/Time";
import { Entity } from "src/world/Entity";

class RatIdleState {
  private remaining: number = 0;

  constructor(private entity: Rat) {
    this.enter();
  }

  enter() {
    this.remaining = 1 + Math.random() * 3;
  }

  isFinished() {
    return this.remaining <= 0;
  }

  update() {
    this.remaining -= Time.deltaTime;
  }
}

class RatChoosingRandomTileState {
  public path: NavTile[];

  constructor(private entity: Rat) {
    this.path = [];
  }

  isFinished() {
    return this.path.length > 0;
  }

  update() {
    const navmesh = World.getEntity(NavMesh);
    const tile = navmesh.getTile(this.entity.model.position);
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

type RatState = RatIdleState | RatChoosingRandomTileState | FollowingPathState;

export class Rat extends Entity {
  public model: THREE.Object3D;
  private state: RatState;
  public speed = 5;

  constructor(model: THREE.Object3D, position: THREE.Vector3) {
    super();
    this.setModel(model);
    this.model.position.copy(position);
    this.state = new RatIdleState(this);
  }

  update() {
    this.state.update();

    if (this.state.isFinished()) {
      if (this.state instanceof RatIdleState) {
        this.state = new RatChoosingRandomTileState(this);
      } else if (this.state instanceof RatChoosingRandomTileState) {
        this.state = new FollowingPathState(this, this.state.path);
      } else if (this.state instanceof FollowingPathState) {
        this.state = new RatIdleState(this);
      }
    }
  }

  private setModel(model: THREE.Object3D) {
    model.castShadow = true;
    this.model = model;
  }
}
