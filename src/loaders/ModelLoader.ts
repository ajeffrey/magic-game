import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import SkeletonUtils = require("three/examples/jsm/utils/SkeletonUtils");

const gltfLoader = new GLTFLoader();
const colladaLoader = new ColladaLoader();
const fbxLoader = new FBXLoader();

export class ModelCollection {
  private models: {[key: string]: THREE.Object3D};

  constructor() {
    this.models = {};
  }

  get(name: string): THREE.Object3D {
    if(name in this.models) {
      const skele = (SkeletonUtils as any).clone(this.models[name]);
      skele.traverse(obj => {
        if(obj instanceof THREE.Mesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          obj.material.format = THREE.RGBAFormat;
          obj.material = obj.material.clone();
        }
      });

      return skele;
      
    } else {
      throw new Error(`model "${name}" not loaded`);
    }
  }

  add(name: string, model: THREE.Object3D) {
    this.models[name] = model;
  }
}

export class ModelLoader {
  private models: ModelCollection;
  private loaders: Promise<any>[];

  constructor() {
    this.models = new ModelCollection();
    this.loaders = [];
  }

  loadGLTF(name: string, path: string) {
    this.loaders.push(new Promise(resolve => {
      gltfLoader.load(path, ({ scene }) => {
        scene.traverse(obj => {
          if(obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });
        
        this.models.add(name, scene);
        resolve(null);
      });
    }));
  }

  loadFBX(name: string, path: string, animations: string[] = []) {
    this.loaders.push(new Promise(resolve => {
      fbxLoader.load(path, (group) => {
        group.traverse(obj => {
          if(obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });

        this.models.add(name, group);
        resolve(null);
      });
    }));
  }

  loadCollada(name: string, path: string) {
    this.loaders.push(new Promise(resolve => {
      colladaLoader.load(path, ({ scene }) => {
        scene.traverse(obj => {
          if(obj instanceof THREE.Mesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
          }
        });

        this.models.add(name, scene);
        resolve(null);
      });
    }));
  }

  onReady(cb: (models: ModelCollection) => any) {
    Promise.all(this.loaders).then(() => cb(this.models));
  }
}