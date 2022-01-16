import Stats = require('stats.js');
import * as THREE from 'three';
import { createRenderer, createScene } from './init';
import { ModelLoader } from './ModelLoader';
import { ITileMesh, NavMesh } from './NavMesh';
import { Player } from './Player';
import { Level, LevelLoader } from './Level';
import { levelData, tileset } from './map';
import { Rat } from './Rat';

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
  const renderer = createRenderer();
  const scene = createScene();
  const navmesh = new NavMesh();
  const levelLoader = new LevelLoader(tileset, models, navmesh);

  const levels: Level[] = [];
  for(const levelObj of levelData) {
    const level = levelLoader.load(levelObj);
    levels.push(level);
    scene.add(level.obj);
  }
  
  // scene.add(navmesh.debug());

  const player = new Player(models.get('player'));
  scene.add(player.model);

  const rat = new Rat(models.get('rat'));
  scene.add(rat.model);

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
      player.update(dt, navmesh);
      for(const level of levels) {
        level.update(dt, player);
      }
      renderer.render(scene, player.camera.camera);
    }
    
    stats.end();
      requestAnimationFrame(step);
  }
  
  requestAnimationFrame(step);
  
});
