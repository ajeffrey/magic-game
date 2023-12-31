import * as THREE from 'three';
import { Camera } from './Camera';
import { Input } from './Input';
import { NavMesh } from './navigation/NavMesh';
import { IEntity, World } from './World';

export class Player implements IEntity {
  public model: THREE.Object3D;
  public camera: Camera;
  private speed = 2;

  constructor(model: THREE.Object3D) {
    this.setModel(model);
    this.camera = new Camera();
    this.model.add(this.camera.camera);
  }

  update(dt: number, world: World) {
    this.camera.update(dt);
    let moveVector = Input.moveVector();

    let speed = dt * this.speed;
    if(Input.keyDown('shift')) {
      speed *= 2;
    }

    const navmesh = world.getEntity(NavMesh);
    if(navmesh && moveVector.length() > 0) {
      moveVector.normalize();
      moveVector.multiplyScalar(speed);

      let newPos = navmesh.move(this.model.position, moveVector);
      if(newPos) {
        this.model.position.copy(newPos);
        
      } else {
        const alternatives: THREE.Vector2[] = [];
        if(moveVector.x) alternatives.push(new THREE.Vector2(moveVector.x, 0));
        if(moveVector.y) alternatives.push(new THREE.Vector2(0, moveVector.y));
        for(const alt of alternatives) {
          newPos = navmesh.move(this.model.position, alt);
          if(newPos) {
            this.model.position.copy(newPos);
            this.emitSound();
            break;
          }
        }
      }
    }
  }

  private emitSound() {
    
  }

  private setModel(model: THREE.Object3D) {
    model.position.set(3, 0, 3);
    model.castShadow = true;
    this.model = model;
  }
}