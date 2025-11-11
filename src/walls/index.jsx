import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Curved(props) {
  const { nodes, materials } = useGLTF('/model/walls/curved.glb')
  return (
    <group {...props} dispose={null} scale={[1,1,1]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0.geometry}
        material={materials['bricks(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_1.geometry}
        material={materials['foliage(Clone)']}
      />
    </group>
  )
}

export function Junction(props) {
  const { nodes, materials } = useGLTF('/model/walls/junction.glb')
  return (
    <group {...props} dispose={null}  scale={[0.5,1,0.5]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.road_junction.geometry}
        material={materials.citybits_texture}
      />
    </group>
  )
}

export function Straight(props) {
  const { nodes, materials } = useGLTF('/model/walls/straight.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0.geometry}
        material={materials['bricks(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_1.geometry}
        material={materials['foliage(Clone)']}
      />
    </group>
  )
}

export function Tsplit(props) {
  const { nodes, materials } = useGLTF('/model/walls/tsplit.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0.geometry}
        material={materials['bricks(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_1.geometry}
        material={materials['foliage(Clone)']}
      />
    </group>
  )
}

export function End(props) {
  const { nodes, materials } = useGLTF('/model/walls/end.glb')
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0.geometry}
        material={materials['bricks(Clone)']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.mesh_0_1.geometry}
        material={materials['foliage(Clone)']}
      />
    </group>
  )
}

useGLTF.preload('/model/walls/corner_curved.glb')
useGLTF.preload('/model/walls/junction.glb')
useGLTF.preload('/model/walls/straight.glb')
useGLTF.preload('/model/walls/tsplit.glb')
