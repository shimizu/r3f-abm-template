import React, { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function MenModel(props) {
  const { nodes, materials } = useGLTF('./model/men.glb')

  useEffect(() => {
    // Make the model brighter
    Object.values(materials).forEach(material => {
      material.emissive = new THREE.Color(0xffffff);
      material.emissiveIntensity = 0;
    });
  }, [materials]);

  return (
    <group {...props} dispose={null} scale={2}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0.geometry}
        material={materials['skin(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_1.geometry}
        material={materials['foliage(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_2.geometry}
        material={materials['metalGreenDark(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_3.geometry}
        material={materials['shoes(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_4.geometry}
        material={materials['stone(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_5.geometry}
        material={materials['_defaultMat(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_6.geometry}
        material={materials['woodDark(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_7.geometry}
        material={materials['hair(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_8.geometry}
        material={materials['skinDark(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_9.geometry}
        material={materials['wood(Clone)']}
      />
    </group>
  )
}

useGLTF.preload('./model/men.glb')
