import * as THREE from 'three';
import { Player } from './Player';
import { Tween } from './Tween';
import { World } from './World';
export class Level {
  obj: THREE.Object3D;
  private opacity: Tween;

  constructor(obj: THREE.Object3D) {
    this.obj = obj;
    this.opacity = new Tween(100, opacity => {
      this.obj.traverse(obj => {
        if(obj instanceof THREE.Mesh) {
          if(opacity === 0) {
            obj.visible = false;
          } else {
            obj.visible = true;
            const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
            mat.transparent = true;
            mat.opacity = opacity;
          }
        }
      });
    })
  }

  update(dt: number, world: World) {
    const player = world.getEntity(Player);
    if(player) {
      const isVisible = player.model.position.y >= (this.obj.position.y - 0.5);
      const opacity = isVisible ? 1 : 0;
      if(opacity !== this.opacity.target) {
        this.opacity.tween(opacity, 0.5);
      }

      this.opacity.update(dt);
    }
  }
}