import * as THREE from 'three';

export class Rat {
  public model: THREE.Object3D;
  private speed = 5;

  constructor(model: THREE.Object3D) {
    this.setModel(model);
  }

  update(dt: number) {
  }

  private setModel(model: THREE.Object3D) {
    model.position.set(3, -1, 3);
    model.castShadow = true;
    this.model = model;
  }
}