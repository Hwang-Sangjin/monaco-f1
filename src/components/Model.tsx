import { Box3 } from "three";
import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

export function Model(props) {
  const { nodes, materials } = useGLTF("/monaco_new-opt.glb");

  return (
    <group
      position={[0, -0.15, 0]}
      rotation={[0, Math.PI, 0]}
      scale={[0.02, 0.02, 0.02]}
      {...props}
      dispose={null}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.EXPORT_GOOGLE_MAP_WM.geometry}
        material={materials["__GLTFLoader._default"]}
      />
    </group>
  );
}
