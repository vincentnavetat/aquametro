import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

const loader = new GLTFLoader();

loader.load(
  "/public/models/station.glb",
  function (gltf) {
    gltf.scene.scale.set(2, 2, 2);
    gltf.scene.position.set(0, 0, 0);
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  },
);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(1, 1, 1);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
renderer.setClearColor(0x202020);
