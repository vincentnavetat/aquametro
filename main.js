import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

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

// === Camera setup ===
camera.position.set(0, 1.6, 5); // fixed position, like eye level

// === Lighting ===
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(1, 1, 1);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
renderer.setClearColor(0x202020);

// === Load model ===
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
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

// === Mouse look variables ===
let yaw = 0;
let pitch = 0;
let isMouseDown = false;
const sensitivity = 0.002;
const maxPitch = Math.PI / 3; // 60° up/down limit

// === Mouse events ===
document.addEventListener("mousedown", () => {
  isMouseDown = true;
  document.body.requestPointerLock(); // lock cursor for smooth movement
});

document.addEventListener("mouseup", () => {
  isMouseDown = false;
  document.exitPointerLock();
});

document.addEventListener("mousemove", (event) => {
  if (!isMouseDown) return;

  const movementX = event.movementX || 0;
  const movementY = event.movementY || 0;

  yaw -= movementX * sensitivity;
  pitch -= movementY * sensitivity;

  // Clamp vertical look
  pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
});

// === Animation loop ===
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// === Handle window resize ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
