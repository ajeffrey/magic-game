import * as THREE from 'three';
import Stats = require('stats.js');
import { createRenderer, createScene } from './init';
import { ModelLoader } from './loaders/ModelLoader';
import { LevelLoader } from './loaders/LevelLoader';
import { NavMesh } from './navigation/NavMesh';
import { Player } from './Player';
import { levelData, tileset } from './map';
import { Rat } from './Rat';
import { World } from './World';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const modelLoader = new ModelLoader();
const modelNames = new Set(Object.values(tileset.tiles).map(o => o.m));

modelLoader.loadGLTF('player', 'models/player.glb');
modelLoader.loadGLTF('rat', 'models/rat.glb');

for(const modelName of modelNames) {
  modelLoader.loadGLTF(modelName, `models/${modelName}.glb`);
}

modelLoader.onReady(models => {
  const world = new World();
  const renderer = createRenderer();
  const scene = createScene();
  const navmesh = new NavMesh();
  world.addEntity(navmesh);
  const levelLoader = new LevelLoader(tileset, models, navmesh);

  for(const levelObj of levelData) {
    const level = levelLoader.load(levelObj);
    world.addEntity(level);
    scene.add(level.obj);
  }
  
  // scene.add(navmesh.debug());

  const player = new Player(models.get('player'));
  world.addEntity(player);
  scene.add(player.model);

  const rat = new Rat(models.get('rat'), new THREE.Vector3(3, -1, 3));
  world.addEntity(rat);
  scene.add(rat.model);

  const rat2 = new Rat(models.get('rat'), new THREE.Vector3(1, -1, 3));
  world.addEntity(rat2);
  scene.add(rat2.model);

  let blurred = false;

  window.addEventListener('blur', () => {
    blurred = true;
    console.log('lost window focus...');
  });

  window.addEventListener('focus', () => {
    blurred = false;
    console.log('regained window focus...');
  })
  
  let prevTime = performance.now();
  let dt: number;
  function step(t) {
    stats.begin();
    dt = (t - prevTime) / 1000;
    prevTime = t;
    
    if(!blurred) {
      world.update(dt);
      renderer.render(scene, player.camera.camera);
    }
    
    stats.end();
      requestAnimationFrame(step);
  }
  
  requestAnimationFrame(step);
  
});
