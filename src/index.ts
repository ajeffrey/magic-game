import * as THREE from "three";
import Stats from "stats.js";
import * as dat from "dat.gui";
import { createRenderer, createScene } from "./init";
import { ModelLoader } from "./loaders/ModelLoader";
import { LevelLoader } from "./loaders/LevelLoader";
import { NavMesh } from "./navigation/NavMesh";
import { Player } from "./entities/Player";
import { levelData, models as levelModels } from "./map";
import { Rat } from "./entities/Rat";
import { World } from "./world/World";
import { Touch } from "./input/Touch";
import { Camera } from "./Camera";
import { NavTile } from "./navigation/NavTile";
import { DebugRenderer } from "./DebugRenderer";
import Time from "./Time";

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const gui = new dat.GUI();

const modelLoader = new ModelLoader();
const modelNames = new Set(Object.keys(levelModels));

modelLoader.loadGLTF("player", "models/player.glb");
modelLoader.loadGLTF("rat", "models/rat.glb");

for (const modelName of modelNames) {
  modelLoader.loadGLTF(modelName, `models/${modelName}.glb`);
}

modelLoader.onReady((models) => {
  const renderer = createRenderer();
  const scene = createScene();
  const navmesh = new NavMesh();
  World.addEntity(navmesh);
  const levelLoader = new LevelLoader(levelModels, models, navmesh);

  for (const levelObj of levelData) {
    const level = levelLoader.load(levelObj);
    World.addEntity(level);
    scene.add(level.obj);
  }

  const navmeshGeo = navmesh.geometry();
  const dbg = navmesh.triangles();
  const parent = new THREE.Group();
  parent.visible = false;
  const lines = new THREE.Group();
  lines.add(...navmeshGeo.map((tile) => DebugRenderer.outline(tile)));
  parent.add(...dbg, lines);
  parent.position.y += 0.01;
  lines.position.y += 0.01;
  scene.add(parent);
  const navmeshGui = gui.addFolder("NavMesh");
  navmeshGui.add(parent, "visible").name("polys");

  const rc = new THREE.Raycaster();
  const raypt = new THREE.Vector2();
  window.addEventListener("click", (e) => {
    raypt.x = (e.clientX / window.innerWidth) * 2 - 1;
    raypt.y = -(e.clientY / window.innerHeight) * 2 + 1;
    rc.setFromCamera(raypt, camera.camera);
    const navmeshTriangles = navmesh.triangles();
    const intersects = rc.intersectObjects(navmeshTriangles);
    if (intersects.length > 0) {
      const destination = intersects[0].object.userData.tile as NavTile;
      const route = navmesh.route(player.model.position, destination.coords);
      console.log("route", route);
      player.setPath(route);
    }
  });

  // scene.add(navmesh.debug());
  const camera = new Camera();

  window.addEventListener("keypress", (e) => {
    if (e.key === " ") {
      camera.setPerspective(camera.perspective === "iso" ? "overhead" : "iso");
    }
  });

  window.addEventListener("resize", () => {
    camera.setWindowSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener(
    "wheel",
    (e) => {
      camera.addZoom(-e.deltaY / 10);
    },
    {
      passive: true,
    }
  );

  Touch.addEventListener("pinchmove", (e: CustomEvent) => {
    camera.addZoom(e.detail as number);
  });

  const player = new Player(models.get("player"), camera);
  World.addEntity(player);
  scene.add(player.model);

  const rat = new Rat(models.get("rat"), new THREE.Vector3(3, -1, 3));
  World.addEntity(rat);
  scene.add(rat.model);

  const rat2 = new Rat(models.get("rat"), new THREE.Vector3(1, -1, 3));
  World.addEntity(rat2);
  scene.add(rat2.model);

  let blurred = false;

  window.addEventListener("blur", () => {
    blurred = true;
    console.log("lost window focus...");
  });

  window.addEventListener("focus", () => {
    blurred = false;
    console.log("regained window focus...");
  });

  let prevTime = performance.now();
  let dt: number;
  function step(t) {
    stats.begin();
    dt = (t - prevTime) / 1000;
    prevTime = t;
    Time.update(dt);

    if (!blurred) {
      World.update();
      renderer.render(scene, player.camera.camera);
    }

    stats.end();
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
});
