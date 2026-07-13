import { exitSimulation } from './exit/exitSimulation.js'
import {
  ExitAgents,
  ExitMetrics,
  ExitPatches,
} from './exit/renderers/ExitVisualization.jsx'

export const simulationRegistry = {
  exit: {
    definition: exitSimulation,
    controls: {
      visualization: {
        useBoxWalls: false,
      },
    },
    renderers: {
      Agents: ExitAgents,
      Metrics: ExitMetrics,
      Patches: ExitPatches,
    },
  },
}

export const defaultSimulation = simulationRegistry.exit
