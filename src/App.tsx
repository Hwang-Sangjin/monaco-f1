import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import { Water } from "./components/Water";
import { SkyBackground } from "./components/SkyBackground";
import { Model } from "./components/Model";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [-15, 1.5, -30], fov: 55 }}>
        <SkyBackground
          gradientStart={0.53} // 50%부터 시작 (기본값)
          colorHorizon="#c8deff" // 지평선 밝은 파랑-흰색
          colorZenith="#7ea1ec" // 꼭대기 진한 파랑
          colorGlow="#fff3dd" // 태양 글로우
        />
        <directionalLight />
        <Model />
        <Water
          size={100}
          segments={512}
          waveScale={1.0}
          waveHeight={0.05}
          fresnel={1.0}
          waterDepth={0.5}
        />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
