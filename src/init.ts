import * as THREE from 'three';

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);
  (window as any).THREE = THREE;

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return renderer;
};

export function createScene() {
  const scene = new THREE.Scene();
  scene.name = 'Scene';
  scene.background = new THREE.Color(0xddddff);
  (window as any).scene = scene;
  const axes = new THREE.AxesHelper(10);
  axes.position.set(0, 0, 0);
  scene.add(axes);
  
  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(10, 100, 10);
  light.lookAt(0, 0, 0);
  scene.add(light);
  
  const amb = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(amb);
  return scene;
};
