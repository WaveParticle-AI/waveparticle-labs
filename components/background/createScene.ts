import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";
import { fragmentShader, vertexShader } from "./shaders";

export type SceneHandle = {
  setWaveTarget(value: number): void;
  setColors(a: string, b: string): void;
  setPointer(x: number, y: number): void;
  start(): void;
  stop(): void;
  dispose(): void;
};

export type SceneOptions = {
  particleCount: number;
  dprCap: number;
};

export function createScene(
  container: HTMLElement,
  { particleCount, dprCap }: SceneOptions
): SceneHandle {
  const renderer = new WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(
    50,
    container.clientWidth / Math.max(container.clientHeight, 1),
    0.1,
    50
  );
  camera.position.set(0, 1.2, 9);
  camera.lookAt(0, 0, 0);

  const positions = new Float32Array(particleCount * 3);
  const gridUvs = new Float32Array(particleCount * 2);
  const seeds = new Float32Array(particleCount);
  const cols = Math.ceil(Math.sqrt(particleCount * (14 / 8)));
  const rows = Math.ceil(particleCount / cols);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    gridUvs[i * 2] = ((i % cols) + Math.random() * 0.6) / cols;
    gridUvs[i * 2 + 1] = (Math.floor(i / cols) + Math.random() * 0.6) / rows;
    seeds[i] = Math.random();
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aGridUv", new BufferAttribute(gridUvs, 2));
  geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uWave: { value: 0 },
      uColorA: { value: new Color("#ff735a") },
      uColorB: { value: new Color("#ffb000") },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, dprCap) },
      uSize: { value: 38 },
    },
  });

  scene.add(new Points(geometry, material));

  const clock = new Clock();
  let raf = 0;
  let running = false;
  let waveTarget = 0.25;
  const colorATarget = new Color("#ff735a");
  const colorBTarget = new Color("#ffb000");
  const pointer = { x: 0, y: 0 };

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const ease = 1 - Math.exp(-dt * 2.5);

    const u = material.uniforms;
    u.uTime.value += dt;
    u.uWave.value += (waveTarget - u.uWave.value) * ease;
    (u.uColorA.value as Color).lerp(colorATarget, ease);
    (u.uColorB.value as Color).lerp(colorBTarget, ease);

    camera.position.x += (pointer.x * 0.5 - camera.position.x) * ease;
    camera.position.y += (1.2 + pointer.y * 0.3 - camera.position.y) * ease;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    clock.start();
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
  }

  function onResize() {
    const w = container.clientWidth;
    const h = Math.max(container.clientHeight, 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);

  return {
    setWaveTarget(value) {
      waveTarget = Math.min(1, Math.max(0, value));
    },
    setColors(a, b) {
      colorATarget.set(a);
      colorBTarget.set(b);
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    start,
    stop,
    dispose() {
      stop();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
