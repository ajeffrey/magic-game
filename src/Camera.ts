import * as THREE from 'three';

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(val, min));
};

// https://easings.net/#easeOutExpo
function ease(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

interface IZoom {
  start: number;
  end: number;
  elapsed: number;
  duration: number;
}

export class Camera {
  readonly camera: THREE.OrthographicCamera;
  private zooming: IZoom | null;
  private perspective: 'iso' | 'overhead' = 'iso';

  constructor() {
    this.zooming = null;
    this.camera = this.createCamera();
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
      const startFrom = this.camera.zoom;
      const end = clamp(startFrom + (-e.deltaY / 10), 25, 100);
      const duration = Math.max(0.25, Math.abs(end - start) / 50);
      this.zooming = {
        start,
        end,
        elapsed: 0,
        duration,
      };
    }, { passive: true });
  }

  update(dt: number) {
    if(this.zooming) {
      this.zooming.elapsed += dt;
      if(this.zooming.elapsed >= this.zooming.duration) {
        this.setZoom(this.zooming.end);
        this.zooming = null;

      } else {
        const change = this.zooming.end - this.zooming.start;
        this.setZoom(this.zooming.start + (ease(this.zooming.elapsed / this.zooming.duration) * change));
      }
    }
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
