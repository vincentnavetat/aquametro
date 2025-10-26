import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(0, 1, 5); // fixed position

// === Lights ===
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(1, 1, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
renderer.setClearColor(0x202020);

// === Model ===
const loader = new GLTFLoader();
loader.load(
  "/public/models/station.glb",
  (gltf) => {
    gltf.scene.scale.set(10, 10, 10);
    gltf.scene.position.set(0, 0, 0);
    scene.add(gltf.scene);
  },
  undefined,
  (error) => console.error(error),
);

// === Mouse look setup ===
let mouseX = 0;
let mouseY = 0;
const rotationSpeed = 0.002; // sensitivity

document.addEventListener("mousemove", (event) => {
  // Normalize mouse position to [-1, 1]
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = (event.clientY / window.innerHeight) * 2 - 1;
});

// === Animation loop ===
function animate() {
  requestAnimationFrame(animate);

  // Rotate camera based on mouse
  camera.rotation.y = -mouseX * Math.PI * rotationSpeed * 100;
  camera.rotation.x = -mouseY * Math.PI * rotationSpeed * 50;

  renderer.render(scene, camera);
}
animate();

// === Resize handling ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
