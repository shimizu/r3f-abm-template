import { useCallback, useEffect, useMemo } from 'react'
import { Environment, Grid, OrbitControls, RandomizedLight } from '@react-three/drei'
import { button, useControls } from 'leva'

import {
  defaultSimulation,
  getSimulation,
  simulationOptions,
} from './examples/registry.js'
import { createSimulationRuntime } from './simulation/createSimulationRuntime.js'
import { useSimulation } from './simulation/useSimulation.js'
import { useRenderPerformance } from './rendering/useRenderPerformance.js'

function Scene() {
  const { simulationId } = useControls('Template', {
    simulationId: {
      label: 'Model',
      value: defaultSimulation.definition.id,
      options: simulationOptions,
    },
  })
  const activeSimulation = getSimulation(simulationId)
  const { controls, definition, renderers } = activeSimulation
  const {
    Agents: AgentsRenderer,
    Metrics: MetricsRenderer,
    Patches: PatchesRenderer,
  } = renderers

  const runtime = useMemo(
    () => createSimulationRuntime(definition),
    [definition]
  )
  const {
    isRunning,
    performance,
    snapshot,
    start,
    step,
    stop,
    reset,
    setStepsPerSecond,
    stepsPerSecond,
  } = useSimulation(runtime)
  const renderFps = useRenderPerformance()

  const modelConfig = useControls(
    'Model Parameters',
    controls.model ?? {},
    [definition.id]
  )
  const resetWithConfig = useCallback(
    () => reset(modelConfig),
    [modelConfig, reset]
  )

  useControls(
    'Simulation',
    {
      speed: {
        value: stepsPerSecond,
        min: 1,
        max: 30,
        step: 1,
        onChange: setStepsPerSecond,
      },
      start: button(start),
      pause: button(stop),
      reset: button(resetWithConfig),
      step: button(step),
    },
    [runtime, resetWithConfig]
  )

  const visualizationOptions = useControls(
    'Visualization',
    controls.visualization ?? {},
    [definition.id]
  )

  useEffect(() => {
    return () => runtime.stop()
  }, [runtime])

  return (
    <>
      <MetricsRenderer
        metrics={snapshot.metrics}
        isRunning={isRunning}
        performance={{
          ...performance,
          renderFps,
        }}
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
