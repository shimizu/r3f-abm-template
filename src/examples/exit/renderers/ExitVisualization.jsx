import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { animated, config, useSpring } from '@react-spring/three'

import { MenModel } from './MenModel.jsx'
import { buildWallTiles, WALL_TYPE_COLORS } from './wallTiles.js'

const AnimatedMenModel = animated(MenModel)

function ExitAgent({ agent }) {
  const { springPosition } = useSpring({
    to: {
      springPosition: agent.position,
    },
    config: config.gentle,
  })

  return (
    <AnimatedMenModel
      position={springPosition}
      rotation={agent.rotation}
    />
  )
}

export function ExitAgents({ agents }) {
  return (
    <group>
      {agents.map(agent => (
        <ExitAgent key={agent.id} agent={agent} />
      ))}
    </group>
  )
}

export function ExitPatches({ patches, options = {} }) {
  const wallTiles = useMemo(
    () => buildWallTiles(patches.filter(patch => patch.type === 'wall')),
    [patches]
  )

  return (
    <group>
      {wallTiles.map(tile => {
        if (options.useBoxWalls) {
          return (
            <mesh
              key={tile.id}
              position={tile.position}
              rotation={[0, tile.rotation, 0]}
            >
              <boxGeometry args={[1, 2, 1]} />
              <meshStandardMaterial
                color={WALL_TYPE_COLORS[tile.type] ?? '#666666'}
              />
            </mesh>
          )
        }

        const TileComponent = tile.Component
        return (
          <TileComponent
            key={tile.id}
            position={tile.position}
            rotation={[0, tile.rotation, 0]}
          />
        )
      })}
    </group>
  )
}

export function ExitMetrics({ metrics, isRunning, performance }) {
  const rows = [
    { label: 'Status', value: isRunning ? 'Running' : 'Paused' },
    { label: 'Tick', value: metrics.tick },
    { label: 'Agents', value: metrics.totalAgents },
    { label: 'Inside', value: metrics.insideAgents },
    { label: 'Exited', value: metrics.exitedAgents },
    { label: 'Blocked', value: metrics.blockedAgents },
    { label: 'Avg Dist', value: metrics.avgDistanceToExit.toFixed(2) },
    { label: 'Occupancy', value: `${(metrics.occupancyRatio * 100).toFixed(1)}%` },
    { label: 'Render FPS', value: performance.renderFps.toFixed(1) },
    { label: 'Simulation SPS', value: performance.actualStepsPerSecond.toFixed(1) },
    { label: 'Step Time', value: `${performance.stepDurationMs.toFixed(2)} ms` },
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
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Agent Stats</div>
        {rows.map(row => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <span style={{ opacity: 0.7 }}>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
      </div>
    </Html>
  )
}
