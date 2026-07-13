import { basicSimulation } from './basic/basicSimulation.js'
import { exitSimulation } from './exit/exitSimulation.js'
import {
  ExitAgents,
  ExitMetrics,
  ExitPatches,
} from './exit/renderers/ExitVisualization.jsx'
import {
  DefaultAgents,
  DefaultMetrics,
  DefaultPatches,
} from '../rendering/DefaultRenderers.jsx'

export const simulationRegistry = {
  basic: {
    definition: basicSimulation,
    controls: {
      model: {
        agentCount: {
          value: basicSimulation.defaultConfig.agentCount,
          min: 1,
          max: 5000,
          step: 1,
        },
        seed: {
          value: basicSimulation.defaultConfig.seed,
          min: 1,
          step: 1,
        },
      },
      visualization: {},
    },
    renderers: {
      Agents: DefaultAgents,
      Metrics: DefaultMetrics,
      Patches: DefaultPatches,
    },
  },
  exit: {
    definition: exitSimulation,
    controls: {
      model: {
        seed: {
          value: exitSimulation.defaultConfig.seed,
          min: 1,
          step: 1,
        },
        population: {
          value: exitSimulation.defaultConfig.population,
          min: 0.05,
          max: 0.9,
          step: 0.05,
        },
      },
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

export const simulationOptions = Object.fromEntries(
  Object.values(simulationRegistry).map(entry => [
    entry.definition.label,
    entry.definition.id,
  ])
)

export function getSimulation(id) {
  return simulationRegistry[id] ?? defaultSimulation
}
