import * as THREE from 'three';

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(val, min));
};

// https://easings.net/#easeOutQuart
function easeOutQuart(x: number): number {
  return 1 - Math.pow(1 - x, 4);
};

interface IZoom {
  start: number;
  change: number;
  elapsed: number;
  duration: number;
}

export class Camera {
  readonly camera: THREE.OrthographicCamera;
  private zooming: IZoom | null;

  constructor() {
    this.zooming = null;
    this.camera = this.createCamera();

    window.addEventListener('resize', () => {
      const width = window.innerWidth / 2;
      const height = window.innerHeight / 2;
      Object.assign(this.camera, { left: -width, right: width, top: height, bottom: -height });
      this.camera.updateProjectionMatrix();
    });

    window.addEventListener('wheel', (e) => {
      const change = clamp(this.camera.zoom + (-e.deltaY / 10), 25, 100) - this.camera.zoom;
      console.log(change);
      this.zooming = {
        start: this.camera.zoom,
        change,
        elapsed: 0,
        duration: 0.5,
      };
    }, { passive: true });
  }

  update(dt: number) {
    // console.log(dt);
    if(this.zooming) {
      this.zooming.elapsed += dt;
      if(this.zooming.elapsed >= this.zooming.duration) {
        this.setZoom(this.zooming.start + this.zooming.change);
        this.zooming = null;

      } else {
        this.setZoom(this.zooming.start + (easeOutQuart(this.zooming.elapsed / this.zooming.duration) * this.zooming.change));
      }
    }
  }

  private createCamera() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;
    const camera = new THREE.OrthographicCamera(-width, width, height, -height, 1, 2000);
    camera.zoom = 75;
    camera.position.set(100, 100, 100);
    // camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    return camera;
  }

  private setZoom(zoom: number) {
    this.camera.zoom = zoom;
    this.camera.updateProjectionMatrix();
    const dims = (({ left, right, top, bottom }) => ({ left, right, top, bottom}))(this.camera);
    console.log(dims);
  }
};
