import * as THREE from "three";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { Sky } from "three/addons/objects/Sky.js";

let camera, scene, renderer;
let sky, sun;
let mixer;
const clock = new THREE.Clock();

init();
animate();

// === Animation loop ===
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  render();
}

function initSky() {
  sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);

  sun = new THREE.Vector3();

  /// GUI

  const effectController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.7,
    elevation: 2,
    azimuth: 180,
    exposure: renderer.toneMappingExposure,
  };

  function guiChanged() {
    const uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = effectController.turbidity;
    uniforms["rayleigh"].value = effectController.rayleigh;
    uniforms["mieCoefficient"].value = effectController.mieCoefficient;
    uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    const theta = THREE.MathUtils.degToRad(effectController.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms["sunPosition"].value.copy(sun);

    renderer.toneMappingExposure = effectController.exposure;
    render();
  }

  // const gui = new GUI();

  // gui.add(effectController, "turbidity", 0.0, 20.0, 0.1).onChange(guiChanged);
  // gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
  // gui
  //   .add(effectController, "mieCoefficient", 0.0, 0.1, 0.001)
  //   .onChange(guiChanged);
  // gui
  //   .add(effectController, "mieDirectionalG", 0.0, 1, 0.001)
  //   .onChange(guiChanged);
  // gui.add(effectController, "elevation", 0, 90, 0.1).onChange(guiChanged);
  // gui.add(effectController, "azimuth", -180, 180, 0.1).onChange(guiChanged);
  // gui.add(effectController, "exposure", 0, 1, 0.0001).onChange(guiChanged);

  guiChanged();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

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
      const model = gltf.scene;

      console.log(
        "Available animations:",
        gltf.animations.map((a) => a.name),
      );

      mixer = new THREE.AnimationMixer(model);

      const clip = gltf.animations[0];
      const action = mixer.clipAction(clip);
      action.play();

      model.scale.set(10, 10, 10);
      model.position.set(0, 0, 0);
      scene.add(model);
    },
    undefined,
    (error) => console.error(error),
  );

  // === Camera setup ===
  camera.position.set(-2.5, 1, -1.5);
  const target = new THREE.Vector3(0, 0, 0); // center of the scene
  const camPos = camera.position.clone();

  const dir = new THREE.Vector3().subVectors(target, camPos).normalize();

  // Yaw (rotation around Y axis)
  let yaw = Math.atan2(-dir.x, -dir.z);

  // Pitch (rotation around X axis)
  let pitch = Math.asin(dir.y);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  // === Mouse look variables ===
  let isMouseDown = false;
  const sensitivity = 0.002;
  const maxPitch = Math.PI / 2 - 0.01;

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

    yaw -= (event.movementX || 0) * sensitivity;
    pitch -= (event.movementY || 0) * sensitivity;

    // Clamp vertical look
    pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));

    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  });

  initSky();
  window.addEventListener("resize", onWindowResize);
}

function render() {
  renderer.render(scene, camera);
}
