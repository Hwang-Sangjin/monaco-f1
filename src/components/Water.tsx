import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveScale;
  uniform float uWaveHeight;

  varying vec3 vWorldPos;
  varying vec3 vNormal;

  vec3 mod289(vec3 x) { return x - floor(x*(1.0/289.0))*289.0; }
  vec4 mod289(vec4 x) { return x - floor(x*(1.0/289.0))*289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314*r; }

  float noise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_*D.wyz - D.xzx;
    vec4 j  = p - 49.0*floor(p*ns.z*ns.z);
    vec4 x_ = floor(j*ns.z);
    vec4 y_ = floor(j - 7.0*x_);
    vec4 x  = x_*ns.x + ns.yyyy;
    vec4 y  = y_*ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 nm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=nm.x; p1*=nm.y; p2*=nm.z; p3*=nm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0);
    m = m*m;
    return 42.0*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  float fnoise(vec3 p) {
    float t = uTime * uWaveScale;
    float sum = 0.0;
    float add = noise(p + vec3( 0.13*t, 0.0,  0.09*t));
    float msc = clamp(add+0.7, 0.0, 1.0);
    sum += 0.6*add;
    p *= 2.0;
    add = noise(p + vec3(-0.17*t, 0.0,  0.11*t)) * msc;
    sum += 0.5*add;
    msc = clamp(msc*(add+0.7), 0.0, 1.0);
    p.xy *= 2.0;
    add = noise(p + vec3( 0.07*t, 0.0, -0.19*t)) * msc;
    sum += 0.25*abs(add);
    msc = clamp(msc*(add+0.7), 0.0, 1.0);
    p *= 2.0;
    add = noise(p + vec3(-0.23*t, 0.0,  0.05*t)) * msc;
    sum += 0.125*abs(add);
    msc = clamp(msc*(add+0.2), 0.0, 1.0);
    p *= 2.0;
    add = noise(p + vec3( 0.11*t, 0.0, -0.13*t)) * msc;
    sum += 0.0625*abs(add);
    return sum*0.516129;
  }

  // PlaneGeometry 로컬 좌표: x=수평X, y=수평Z(회전 후), z=0(항상)
  // → x, y를 수평 좌표로, z축으로 변위
  float getHeight(float px, float py) {
    return uWaveHeight - (uWaveHeight*2.0)
      * fnoise(vec3(0.5*px, 0.5*py, 0.4*uTime*uWaveScale));
  }

  void main() {
    vec3 pos = position; // PlaneGeometry: x,y = 수평, z = 0

    float eps = 0.1;
    float h   = getHeight(pos.x,       pos.y      );
    float hx  = getHeight(pos.x + eps, pos.y      );
    float hy  = getHeight(pos.x,       pos.y + eps);

    // z축으로 변위 (회전 후 Y축 = 위 방향)
    pos.z += h;

    // normal: PlaneGeometry XY 평면 기준
    vec3 tx = normalize(vec3(eps, 0.0, hx - h));
    vec3 ty = normalize(vec3(0.0, eps, hy - h));
    vec3 n  = normalize(cross(tx, ty));

    vNormal   = normalize(normalMatrix * n);
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3  uCamPos;
  uniform float uFresnel;
  uniform float uDepth;

  varying vec3 vWorldPos;
  varying vec3 vNormal;

  vec4 getSky(vec3 rd) {
    if (rd.y > 0.3)  return vec4(0.5, 0.8, 1.5, 1.0);
    if (rd.y < 0.0)  return vec4(0.0, 0.2, 0.4, 1.0);
    if (rd.z > 0.9 && rd.x > 0.3) {
      if (rd.y > 0.2) return 1.5*vec4(2.0, 1.0, 1.0, 1.0);
      return 1.5*vec4(2.0, 1.0, 0.5, 1.0);
    }
    return vec4(0.5, 0.8, 1.5, 1.0);
  }

  void main() {
    vec3 N  = normalize(vNormal);
    vec3 rd = normalize(vWorldPos - uCamPos);

    float fresnel = uFresnel * pow(1.0 - clamp(dot(-rd, N), 0.0, 1.0), 5.0)
                  + (1.0 - uFresnel);

    vec3 refVec     = reflect(rd, N);
    vec4 reflection = getSky(refVec);
    float deep      = 1.0 + 0.5*vWorldPos.y;

    vec4 col  = fresnel * reflection;
         col += deep * uDepth * vec4(0.0, 0.3, 0.4, 1.0);

    gl_FragColor = clamp(col, 0.0, 1.0);
  }
`;

interface WaterProps {
  size?: number;
  segments?: number;
  waveScale?: number;
  waveHeight?: number;
  fresnel?: number;
  waterDepth?: number;
  position?: [number, number, number];
}

export function Water({
  size = 200,
  segments = 128,
  waveScale = 1.0,
  waveHeight = 0.15,
  fresnel = 1.0,
  waterDepth = 1.0,
  position = [0, 0, 0],
}: WaterProps) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uWaveScale: { value: waveScale },
          uWaveHeight: { value: waveHeight },
          uFresnel: { value: fresnel },
          uDepth: { value: waterDepth },
          uCamPos: { value: new THREE.Vector3() },
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
      }),
    [],
  );

  material.uniforms.uWaveScale.value = waveScale;
  material.uniforms.uWaveHeight.value = waveHeight;
  material.uniforms.uFresnel.value = fresnel;
  material.uniforms.uDepth.value = waterDepth;

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    material.uniforms.uCamPos.value.copy(state.camera.position);
  });

  return (
    <mesh
      ref={meshRef}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
    >
      <planeGeometry args={[size, size, segments, segments]} />
    </mesh>
  );
}
