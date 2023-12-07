import * as THREE from 'three';
import { Tween } from './Tween';
import { Touch } from './Touch';

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(val, min));
};

export class Camera {
  readonly camera: THREE.OrthographicCamera;
  private zooming: Tween;
  private perspective: 'iso' | 'overhead' = 'iso';

  constructor() {
    this.camera = this.createCamera();
    this.zooming = new Tween(this.camera.zoom, val => this.setZoom(val));
    this.setPerspective('iso');

    window.addEventListener('keypress', e => {
      if(e.key === ' ') {
        this.setPerspective(this.perspective === 'iso' ? 'overhead' : 'iso');
      }
    })

    window.addEventListener('resize', () => {
      const width = window.innerWidth / 2;
      const height = window.innerHeight / 2;
      Object.assign(this.camera, { left: -width, right: width, top: height, bottom: -height });
      this.camera.updateProjectionMatrix();
    });

    window.addEventListener('wheel', (e) => {
      const start = this.camera.zoom;
      const end = clamp(start + (-e.deltaY / 10), 25, 100);
      const duration = Math.max(0.25, Math.abs(end - start) / 50);
      this.zooming.tween(end, duration);
    }, { passive: true });

    Touch.addEventListener('pinchmove', (e: CustomEvent) => {
      console.log(e.detail);
    });
  }

  update(dt: number) {
    this.zooming.update(dt);
  }

  private createCamera() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;
    const camera = new THREE.OrthographicCamera(-width, width, height, -height, 1, 2000);
    camera.zoom = 75;
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    return camera;
  }

  private setZoom(zoom: number) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
  }

  private setPerspective(perspective: 'iso' | 'overhead') {
    if(perspective === 'iso') {
      this.camera.position.set(100, 100, 100);
    } else {
      this.camera.position.set(0, 1000, 0);
    }

    const target = new THREE.Vector3(0, 0, 0);
    if(this.camera.parent) {
      this.camera.parent.getWorldPosition(target);
      this.camera.lookAt(target);
    }

    this.perspective = perspective;
  }
};
