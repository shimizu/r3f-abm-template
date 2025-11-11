import React from 'react'
import { useGLTF } from '@react-three/drei'

export function Curved(props) {
  const { nodes, materials } = useGLTF('/model/walls/corner_curved.glb')
  return (
    <group {...props} dispose={null} scale={[0.5,1,0.5]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.road_corner_curved.geometry}
        material={materials['citybits_texture.002']}
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
    <group {...props} dispose={null} scale={[0.5,1,0.5]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.road_straight.geometry}
        material={materials['citybits_texture.001']}
      />
    </group>
  )
}

export function Tsplit(props) {
  const { nodes, materials } = useGLTF('/model/walls/tsplit.glb')
  return (
    <group {...props} dispose={null}  scale={[0.5,1,0.5]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.road_tsplit.geometry}
        material={materials['citybits_texture.003']}
      />
    </group>
  )
}

useGLTF.preload('/model/walls/corner_curved.glb')
useGLTF.preload('/model/walls/junction.glb')
useGLTF.preload('/model/walls/straight.glb')
useGLTF.preload('/model/walls/tsplit.glb')
