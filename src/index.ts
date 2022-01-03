import Stats = require('stats.js');
import * as THREE from 'three';
import { createRenderer, createScene } from './init';
import { Camera } from './Camera';
import { ModelLoader } from './loader';
import * as level from './level';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const loader = new ModelLoader();

const modelNames = new Set(Object.values(level.tiles).map(o => o.m));

loader.loadGLTF('player', 'models/player.glb');

for(const modelName of modelNames) {
  loader.loadGLTF(modelName, `models/${modelName}.glb`);
}

loader.onReady(models => {
  const renderer = createRenderer();
  const scene = createScene();
  
  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(0, 100, 0);
  light.lookAt(0, 0, 0);
  scene.add(light);
  
  const amb = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(amb);

  const tiles = level.map.split('\n').map(row => row.split(''));
  for(let y = 0; y < tiles.length; y++) {
    for(let x = 0; x < tiles[y].length; x++) {
      const index = tiles[y][x];
      const tile = level.tiles[index];
      const model = models.get(tile.m);
      if(tile.rotate) {
        model.rotateY(-tile.rotate * Math.PI / 180);
      }

      model.position.set(x, 0, y);
      scene.add(model);
    }
  }

  const human = models.get('player');
  human.position.set(3, 0, 3);
  human.scale.setScalar(0.3);
  scene.add(human);

  const camera = new Camera();
  human.add(camera.camera);
  
  let prevTime = performance.now();
  let dt: number;
  function step(t) {
    stats.begin();
    dt = (t - prevTime) / 1000;
    prevTime = t;
    
    camera.update(dt)
    renderer.render(scene, camera.camera);
    stats.end();
    requestAnimationFrame(step);
  }
  
  requestAnimationFrame(step);
  
});
