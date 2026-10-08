import * as THREE from 'three';

const EYE_HEIGHT = 1.7;
const WALK_SPEED = 6.5;
const SPRINT_SPEED = 10.5;
const ACCEL = 12;
const JUMP_VELOCITY = 6.5;
const GRAVITY = 20;
const MAG_SIZE = 30;
const FIRE_RATE = 0.11;
const RELOAD_TIME = 1.4;
const MAX_RANGE = 90;

export function createPlayer({ camera, canvas, world, hud, onScore }) {
  const keys = new Set();
  const velocity = new THREE.Vector3();
  const wish = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();

  let yaw = 0;
  let pitch = 0;
  let grounded = true;
  let ammo = MAG_SIZE;
  let reloadTimer = 0;
  let fireTimer = 0;
  let recoil = 0;
  let flashTimer = 0;
  let locked = false;
  let firing = false;

  const gun = createWeapon();
  camera.add(gun);
  camera.position.set(0, EYE_HEIGHT, 6);

  raycaster.far = MAX_RANGE;

  canvas.addEventListener('click', () => {
    if (!locked) canvas.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    locked = document.pointerLockElement === canvas;
    firing = false;
    if (!locked) keys.clear();
    hud.setPlaying(locked);
  });

  document.addEventListener('mousemove', (event) => {
    if (!locked) return;
    yaw -= event.movementX * 0.0022;
    pitch -= event.movementY * 0.0022;
    pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, pitch));
  });

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') event.preventDefault();
    if (event.repeat) return;
    keys.add(event.code);
    if (event.code === 'KeyR') startReload();
  });

  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
  });

  document.addEventListener('mousedown', (event) => {
    if (!locked || event.button !== 0) return;
    firing = true;
    tryFire();
  });

  document.addEventListener('mouseup', (event) => {
    if (event.button === 0) firing = false;
  });

  function startReload() {
    if (reloadTimer > 0 || ammo === MAG_SIZE) return;
    reloadTimer = RELOAD_TIME;
    hud.setReloading(true);
  }

  function tryFire() {
    if (reloadTimer > 0 || fireTimer > 0) return;
    if (ammo <= 0) {
      startReload();
      return;
    }

    ammo -= 1;
    fireTimer = FIRE_RATE;
    recoil = Math.min(recoil + 0.06, 0.16);
    flashTimer = 0.05;
    hud.setAmmo(ammo, MAG_SIZE);

    raycaster.setFromCamera({ x: 0, y: 0 }, camera);
    const hits = raycaster.intersectObjects(world.targetMeshes, false);

    if (hits.length > 0) {
      const points = world.hitTarget(hits[0].object);
      if (points > 0) {
        onScore(points);
        hud.hitMarker(points);
      }
    }

    if (ammo === 0) startReload();
  }

  function update(dt) {
    if (firing) tryFire();

    if (fireTimer > 0) fireTimer -= dt;
    if (flashTimer > 0) flashTimer -= dt;

    if (reloadTimer > 0) {
      reloadTimer -= dt;
      if (reloadTimer <= 0) {
        ammo = MAG_SIZE;
        hud.setAmmo(ammo, MAG_SIZE);
        hud.setReloading(false);
      }
    }

    move(dt);

    camera.rotation.set(pitch, yaw, 0);

    // Weapon recoil + sway settle back to the resting pose.
    recoil += (0 - recoil) * Math.min(1, dt * 12);
    gun.position.z = -0.45 + recoil;
    gun.rotation.x = recoil * 2.2;
    gun.userData.flash.material.opacity = flashTimer > 0 ? 0.9 : 0;
  }

  function move(dt) {
    wish.set(0, 0, 0);
    if (keys.has('KeyW')) wish.z -= 1;
    if (keys.has('KeyS')) wish.z += 1;
    if (keys.has('KeyA')) wish.x -= 1;
    if (keys.has('KeyD')) wish.x += 1;
    wish.normalize();

    const sprinting = keys.has('ShiftLeft') || keys.has('ShiftRight');
    const speed = sprinting ? SPRINT_SPEED : WALK_SPEED;

    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const dirX = wish.x * cos + wish.z * sin;
    const dirZ = -wish.x * sin + wish.z * cos;

    const blend = Math.min(1, ACCEL * dt);
    velocity.x += (dirX * speed - velocity.x) * blend;
    velocity.z += (dirZ * speed - velocity.z) * blend;

    if (keys.has('Space') && grounded) {
      velocity.y = JUMP_VELOCITY;
      grounded = false;
    }
    velocity.y -= GRAVITY * dt;

    camera.position.x += velocity.x * dt;
    camera.position.z += velocity.z * dt;
    camera.position.y += velocity.y * dt;

    if (camera.position.y <= EYE_HEIGHT) {
      camera.position.y = EYE_HEIGHT;
      velocity.y = 0;
      grounded = true;
    }

    const bounds = world.bounds;
    camera.position.x = Math.max(-bounds, Math.min(bounds, camera.position.x));
    camera.position.z = Math.max(-bounds, Math.min(bounds, camera.position.z));
  }

  return { update };
}

function createWeapon() {
  const gun = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x2a2f36,
    roughness: 0.6,
    metalness: 0.4,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1b1f24, roughness: 0.7 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.6), bodyMat);
  body.position.set(0, 0, -0.1);

  const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.4), darkMat);
  barrel.position.set(0, 0.02, -0.5);

  const magazine = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.12), darkMat);
  magazine.position.set(0, -0.16, -0.05);

  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0 })
  );
  flash.position.set(0, 0.02, -0.72);

  gun.add(body, barrel, magazine, flash);
  gun.userData.flash = flash;
  gun.position.set(0.22, -0.22, -0.45);

  return gun;
}
