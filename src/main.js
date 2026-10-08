import * as THREE from 'three';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createHud } from './hud.js';
import './style.css';

const canvas = document.getElementById('game');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);
camera.rotation.order = 'YXZ';
scene.add(camera); // camera is added because the weapon model is attached to it

const hud = createHud();
const world = createWorld(scene);

const player = createPlayer({
  camera,
  canvas,
  world,
  hud,
  onScore: (points) => hud.addScore(points),
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  player.update(dt);
  world.update(dt);
  renderer.render(scene, camera);
});
