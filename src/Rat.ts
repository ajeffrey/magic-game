import * as THREE from 'three';
import { NavMesh } from './navigation/NavMesh';
import { NavTile } from './navigation/NavTile';
import { IEntity, World } from './World';

class RatIdleState {
  private remaining: number;
  constructor(private rat: Rat) {
    this.remaining = 1 + (Math.random() * 3);
  }

  isFinished() {
    return this.remaining <= 0;
  }

  update(dt: number) {
    this.remaining -= dt;
    if(this.isFinished()) {
      this.rat.state = new RatExploringState(this.rat);
    }
  }
}

class RatExploringState {
  private path: NavTile[];

  constructor(private rat: Rat) {
    this.path = [];
  }

  isFinished() {
    return this.path.length === 0;
  }

  update(dt: number, world: World) {
    if(this.path.length > 0) {
      const destination = this.path[this.path.length - 1];
      const vector = destination.coords.clone().sub(this.rat.model.position);
      const distance = Math.min(dt * this.rat.speed, vector.length());
      this.rat.model.position.add(vector.normalize().multiplyScalar(distance));
      if(this.rat.model.position.distanceTo(destination.coords) < 0.01) {
        this.path.pop();
      }
      
      if(this.isFinished()) {
        this.rat.state = new RatIdleState(this.rat);
      }

    } else {
      const navmesh = world.getEntity(NavMesh);
      const tile = navmesh.getTile(this.rat.model.position);
      if(tile) {
        while(1) {
          let succeeded = true;
          const steps = [];
          let current = tile;
          for(let i = 0; i < 3; i++) {
            const candidates = current.neighbours.filter(n => {
              if(steps.includes(n.tile)) {
                return false;
              }

              if(n.tile.tags.includes('stairs')) {
                return false;
              }

              return true;
            });
            
            if(candidates.length === 0) {
              succeeded = false;
              break;
            }

            current = candidates[Math.floor(Math.random() * candidates.length)].tile;
            steps.push(current);
          }

          if(succeeded) {
            this.path = steps;
            break;
          }
        }
      }
    }
  }
}

type RatState = RatExploringState | RatIdleState;

export class Rat implements IEntity {
  public model: THREE.Object3D;
  public state: RatState;
  public speed = 5;

  constructor(model: THREE.Object3D, position: THREE.Vector3) {
    this.setModel(model);
    this.model.position.copy(position);
    this.state = new RatExploringState(this);
  }

  update(dt: number, world: World) {
    this.state.update(dt, world);
  }

  private setModel(model: THREE.Object3D) {
    model.castShadow = true;
    this.model = model;
  }
}