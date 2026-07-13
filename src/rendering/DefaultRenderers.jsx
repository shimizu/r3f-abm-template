import { Html } from '@react-three/drei'

export function DefaultAgents({ agents }) {
  return (
    <group>
      {agents.map(agent => (
        <mesh
          key={agent.id}
          position={agent.position}
          rotation={agent.rotation}
          castShadow
        >
          <sphereGeometry args={[0.22, 16, 12]} />
          <meshStandardMaterial color={agent.color ?? '#4dabf7'} />
        </mesh>
      ))}
    </group>
  )
}

export function DefaultPatches({ patches }) {
  return (
    <group>
      {patches.map(patch => (
        <mesh key={patch.id} position={patch.position} receiveShadow>
          <boxGeometry args={[0.96, 0.08, 0.96]} />
          <meshStandardMaterial color={patch.color ?? '#273142'} />
        </mesh>
      ))}
    </group>
  )
}

export function DefaultMetrics({ metrics, isRunning }) {
  const rows = [
    ['status', isRunning ? 'Running' : 'Paused'],
    ...Object.entries(metrics),
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
