import * as THREE from 'three';

const ARENA_BOUNDS = 42;
const ROOM_SIZE = 100;

export function createWorld(scene) {
  scene.background = new THREE.Color(0x0a0d12);
  scene.fog = new THREE.Fog(0x0a0d12, 40, 130);

  scene.add(new THREE.HemisphereLight(0x8fa3c8, 0x0a0c10, 0.85));
  const sun = new THREE.DirectionalLight(0xc8dcff, 1.15);
  sun.position.set(35, 60, 20);
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    new THREE.MeshStandardMaterial({ color: 0x161b22, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const grid = new THREE.GridHelper(150, 75, 0x2b3648, 0x1b2230);
  grid.position.y = 0.01;
  scene.add(grid);

  addRoom(scene);
  addCover(scene);

  const targets = createTargets(scene);

  function hitTarget(mesh) {
    const target = mesh.userData.target;
    if (!target || !target.alive) return 0;
    target.alive = false;
    target.respawn = 2.2;
    mesh.visible = false;
    return target.points;
  }

  function update(dt) {
    for (const target of targets) {
      if (target.alive) {
        target.phase += dt * target.speed;
        target.mesh.position.x = target.base.x + Math.sin(target.phase) * target.sway;
        target.mesh.position.y = target.base.y + Math.sin(target.phase * 2) * 0.15;
        target.mesh.rotation.y += dt * 0.7;
      } else {
        target.respawn -= dt;
        if (target.respawn <= 0) {
          target.alive = true;
          target.phase = Math.random() * Math.PI * 2;
          target.mesh.visible = true;
        }
      }
    }
  }

  return {
    bounds: ARENA_BOUNDS,
    targetMeshes: targets.map((t) => t.mesh),
    hitTarget,
    update,
  };
}

function addRoom(scene) {
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x232a34,
    roughness: 0.85,
    metalness: 0.1,
  });
  const height = 3.2;
  const half = ROOM_SIZE / 2;

  const walls = [
    [0, half, ROOM_SIZE, 1],
    [0, -half, ROOM_SIZE, 1],
    [-half, 0, 1, ROOM_SIZE],
    [half, 0, 1, ROOM_SIZE],
  ];

  for (const [x, z, width, depth] of walls) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), wallMat);
    wall.position.set(x, height / 2, z);
    scene.add(wall);
  }
}

function addCover(scene) {
  const crateMat = new THREE.MeshStandardMaterial({ color: 0x2f3846, roughness: 0.95 });
  const crates = [
    [-18, -10, 2],
    [18, -12, 2],
    [-24, -26, 2.5],
    [22, -28, 2.5],
    [-8, -20, 1.4],
    [8, -20, 1.4],
    [0, -32, 3],
  ];

  for (const [x, z, size] of crates) {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), crateMat);
    crate.position.set(x, size / 2, z);
    crate.rotation.y = (x * 13 + z * 7) % Math.PI;
    scene.add(crate);
  }
}

function createTargets(scene) {
  const layout = [
    [-12, -14, 0.9, 0x3ddc97],
    [-4, -14, 0.9, 0x3ddc97],
    [6, -14, 0.9, 0x3ddc97],
    [14, -14, 0.9, 0x3ddc97],
    [-10, -24, 0.7, 0xffb347],
    [0, -25, 0.7, 0xffb347],
    [10, -24, 0.7, 0xffb347],
    [-6, -34, 0.55, 0xff5f6d],
    [6, -34, 0.55, 0xff5f6d],
  ];

  const targets = [];

  for (const [x, z, size, color] of layout) {
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.45,
      roughness: 0.4,
      metalness: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, size / 2 + 1, z);
    scene.add(mesh);

    const target = {
      mesh,
      alive: true,
      respawn: 0,
      points: size <= 0.6 ? 30 : size <= 0.75 ? 20 : 10,
      base: mesh.position.clone(),
      sway: 1.5 + Math.random() * 2.5,
      speed: 0.6 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    };

    mesh.userData.target = target;
    targets.push(target);
  }

  return targets;
}
