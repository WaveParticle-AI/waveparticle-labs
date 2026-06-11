export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uWave;
uniform float uPixelRatio;
uniform float uSize;

attribute vec2 aGridUv;
attribute float aSeed;

varying float vMix;
varying float vSeed;

void main() {
  vec3 cloud = position;
  cloud.x += sin(uTime * 0.12 + aSeed * 6.2832) * 0.25;
  cloud.y += cos(uTime * 0.10 + aSeed * 12.566) * 0.20;

  float wx = (aGridUv.x - 0.5) * 14.0;
  float wz = (aGridUv.y - 0.5) * 8.0;
  float wy = sin(wx * 0.9 + uTime * 0.7) * 0.55
           + sin(wz * 1.6 + uTime * 0.45) * 0.25
           + sin((wx + wz) * 0.5 + uTime * 0.3) * 0.15;
  vec3 wave = vec3(wx, wy - 0.6, wz);

  float m = smoothstep(0.0, 1.0, clamp(uWave * 1.4 - aSeed * 0.4, 0.0, 1.0));
  vec3 p = mix(cloud, wave, m);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.6 + aSeed * 0.8) * (1.0 / -mv.z);

  vMix = m;
  vSeed = aSeed;
}
`;

export const fragmentShader = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;

varying float vMix;
varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float disc = smoothstep(0.5, 0.05, d);
  if (disc < 0.01) discard;

  vec3 color = mix(uColorA, uColorB, clamp(vMix * 0.7 + vSeed * 0.3, 0.0, 1.0));
  float twinkle = 0.75 + 0.25 * sin(uTime * 0.8 + vSeed * 40.0);
  gl_FragColor = vec4(color, disc * 0.55 * twinkle);
}
`;
