import { useMemo } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;

  uniform vec3  uColorZenith;
  uniform vec3  uColorMid;
  uniform vec3  uColorHorizon;
  uniform vec3  uColorGlow;
  uniform float uGradientStart;

  void main() {
    float y = vUv.y;
    float t = clamp((y - uGradientStart) / (1.0 - uGradientStart), 0.0, 1.0);

    float t1 = smoothstep(0.0, 0.5, t);
    float t2 = smoothstep(0.35, 1.0, t);
    vec3 col = mix(uColorHorizon, uColorMid, t1);
         col = mix(col, uColorZenith, t2);

    // 지평선 글로우
    float glow = pow(max(0.0, 1.0 - t / 0.1), 2.0);
    col = mix(col, uColorGlow, glow * 0.6);

    gl_FragColor = vec4(col, 1.0);
  }
`;

interface SkyBackgroundProps {
  colorZenith?: string;
  colorMid?: string;
  colorHorizon?: string;
  colorGlow?: string;
  gradientStart?: number;
}

export function SkyBackground({
  colorZenith = "#abc3f5", // 깊고 선명한 하늘 파랑
  colorMid = "#96cdf1", // 청량한 하늘색
  colorHorizon = "#d4eeff", // 지평선 연한 하늘
  colorGlow = "#fff4e0", // 태양 글로우
  gradientStart = 0.5,
}: SkyBackgroundProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uColorZenith: { value: new THREE.Color(colorZenith) },
          uColorMid: { value: new THREE.Color(colorMid) },
          uColorHorizon: { value: new THREE.Color(colorHorizon) },
          uColorGlow: { value: new THREE.Color(colorGlow) },
          uGradientStart: { value: gradientStart },
        },
        vertexShader,
        fragmentShader,
        depthWrite: false,
        depthTest: false,
      }),
    [],
  );

  material.uniforms.uColorZenith.value.set(colorZenith);
  material.uniforms.uColorMid.value.set(colorMid);
  material.uniforms.uColorHorizon.value.set(colorHorizon);
  material.uniforms.uColorGlow.value.set(colorGlow);
  material.uniforms.uGradientStart.value = gradientStart;

  return (
    <mesh material={material} renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
