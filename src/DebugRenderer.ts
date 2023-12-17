import * as THREE from "three";
import { MeshLine, MeshLineMaterial } from "three.meshline";

export const DebugRenderer = new (class {
  outline(geo: THREE.BufferGeometry) {
    const edges = new THREE.EdgesGeometry(geo);
    const line = new MeshLine();
    line.setGeometry(edges);
    return new THREE.Mesh(
      line,
      new MeshLineMaterial({
        color: 0,
        lineWidth: 0.02,
      })
    );
  }
})();
