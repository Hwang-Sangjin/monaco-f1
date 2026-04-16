import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Water } from "./components/Water";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 30, 60], fov: 55 }}>
        <ambientLight />
        <OrbitControls />
        <Water
          size={200}
          segments={512}
          waveScale={1.0}
          waveHeight={0.2}
          fresnel={1.0}
          waterDepth={0.7}
        />
      </Canvas>
    </div>
  );
}
