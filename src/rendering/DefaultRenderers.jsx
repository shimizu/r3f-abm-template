import { useLayoutEffect, useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { Color, Object3D } from 'three'

export function DefaultAgents({ agents }) {
  const meshRef = useRef()
  const transform = useMemo(() => new Object3D(), [])
  const color = useMemo(() => new Color(), [])
  const capacity = Math.max(agents.length, 1)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    agents.forEach((agent, index) => {
      transform.position.fromArray(agent.position)
      transform.rotation.fromArray(agent.rotation)
      transform.updateMatrix()
      mesh.setMatrixAt(index, transform.matrix)
      mesh.setColorAt(index, color.set(agent.color ?? '#4dabf7'))
    })

    mesh.count = agents.length
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [agents, color, transform])

  return (
    <instancedMesh
      key={`agents-${capacity}`}
      ref={meshRef}
      args={[null, null, capacity]}
      castShadow
    >
      <sphereGeometry args={[0.22, 16, 12]} />
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  )
}

export function DefaultPatches({ patches }) {
  const meshRef = useRef()
  const transform = useMemo(() => new Object3D(), [])
  const color = useMemo(() => new Color(), [])
  const capacity = Math.max(patches.length, 1)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    patches.forEach((patch, index) => {
      transform.position.fromArray(patch.position)
      transform.rotation.set(0, 0, 0)
      transform.updateMatrix()
      mesh.setMatrixAt(index, transform.matrix)
      mesh.setColorAt(index, color.set(patch.color ?? '#273142'))
    })

    mesh.count = patches.length
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [patches, color, transform])

  return (
    <instancedMesh
      key={`patches-${capacity}`}
      ref={meshRef}
      args={[null, null, capacity]}
      receiveShadow
    >
      <boxGeometry args={[0.96, 0.08, 0.96]} />
      <meshStandardMaterial vertexColors />
    </instancedMesh>
  )
}

export function DefaultMetrics({ metrics, isRunning, performance }) {
  const rows = [
    ['status', isRunning ? 'Running' : 'Paused'],
    ...Object.entries(metrics),
    ['renderFps', performance.renderFps],
    ['simulationSps', performance.actualStepsPerSecond],
    ['stepDurationMs', performance.stepDurationMs],
  ]

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div
        className="panel"
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          minWidth: 200,
          padding: '12px 16px',
          borderRadius: 12,
          background: 'rgba(16, 18, 32, 0.85)',
          color: '#f5f5f5',
          fontFamily: '"Inter", sans-serif',
          fontSize: 13,
          lineHeight: 1.5,
          boxShadow: '0 12px 24px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>
          Simulation
        </div>
        {rows.map(([key, value]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 20,
              marginBottom: 4,
            }}
          >
            <span style={{ opacity: 0.7 }}>{formatLabel(key)}</span>
            <span>{formatValue(value)}</span>
          </div>
        ))}
      </div>
    </Html>
  )
}

function formatLabel(value) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, character => character.toUpperCase())
}

function formatValue(value) {
  if (typeof value === 'number' && !Number.isInteger(value)) {
    return value.toFixed(2)
  }
  return String(value)
}
