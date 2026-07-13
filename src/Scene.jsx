import { useEffect, useMemo } from 'react'
import { Environment, Grid, OrbitControls, RandomizedLight } from '@react-three/drei'
import { button, useControls } from 'leva'

import { defaultSimulation } from './examples/registry.js'
import { createSimulationRuntime } from './simulation/createSimulationRuntime.js'
import { useSimulation } from './simulation/useSimulation.js'

const { controls, definition, renderers } = defaultSimulation
const {
  Agents: AgentsRenderer,
  Metrics: MetricsRenderer,
  Patches: PatchesRenderer,
} = renderers

function Scene() {
  const runtime = useMemo(
    () => createSimulationRuntime(definition),
    []
  )
  const {
    isRunning,
    snapshot,
    start,
    step,
    stop,
    reset,
  } = useSimulation(runtime)

  useControls('Simulation', {
    start: button(start),
    pause: button(stop),
    reset: button(reset),
    step: button(step),
  })

  const visualizationOptions = useControls(
    'Visualization',
    controls.visualization ?? {}
  )

  useEffect(() => {
    return () => runtime.stop()
  }, [runtime])

  return (
    <>
      <MetricsRenderer
        metrics={snapshot.metrics}
        isRunning={isRunning}
      />

      <OrbitControls />
      <Environment preset="sunset" />
      <RandomizedLight />

      <group>
        <AgentsRenderer agents={snapshot.agents} />
        <PatchesRenderer
          patches={snapshot.patches}
          options={visualizationOptions}
        />
      </group>

      <group position={[0.5, -0.5, 0.5]}>
        <Grid
          gridSize={[1, 1]}
          cellSize={1}
          cellThickness={1}
          cellColor={0x666666}
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />
      </group>
    </>
  )
}

export default Scene
