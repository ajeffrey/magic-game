import * as THREE from "three";
import { Tween } from "./Tween";

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(val, min));
}

export class Camera {
  readonly camera: THREE.OrthographicCamera;
  private _perspective: "iso" | "overhead";
  private zooming: Tween;

  public get perspective() {
    return this._perspective;
  }

  constructor() {
    this.camera = this.createCamera();
    this.setPerspective("iso");

    this.zooming = new Tween(this.camera.zoom, (zoom) => {
      this.camera.zoom = zoom;
      this.camera.updateProjectionMatrix();
    });
  }

  update(dt: number) {
    this.zooming.update(dt);
  }

  setWindowSize(width: number, height: number) {
    const w = width / 2;
    const h = height / 2;
    Object.assign(this.camera, { left: -w, right: w, top: h, bottom: -h });
    this.camera.updateProjectionMatrix();
  }

  addZoom(dz: number) {
    const start = this.camera.zoom;
    const end = clamp(start + dz, 1, 100);
    const duration = Math.max(0.25, Math.abs(end - start) / 50);
    this.zooming.tween(end, duration);
  }

  setPerspective(perspective: "iso" | "overhead") {
    this._perspective = perspective;

    if (perspective === "iso") {
      this.camera.position.set(100, 100, 100);
    } else {
      this.camera.position.set(0, 1000, 0);
    }

    const target = new THREE.Vector3(0, 0, 0);
    if (this.camera.parent) {
      this.camera.parent.getWorldPosition(target);
      this.camera.lookAt(target);
    }
  }

  private createCamera() {
    const width = window.innerWidth / 2;
    const height = window.innerHeight / 2;
    const camera = new THREE.OrthographicCamera(
      -width,
      width,
      height,
      -height,
      1,
      2000
    );
    camera.zoom = 75;
    camera.position.set(100, 100, 100);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    return camera;
  }
}
