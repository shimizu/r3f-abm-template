import ExitModel from './ExitModel.js'
import { createExitSnapshot, initializeExitModel } from './exitAdapter.js'

export const exitSimulation = {
  id: 'exit',
  label: 'Evacuation',
  defaultConfig: {
    population: 0.25,
    stepsPerSecond: 1000 / 220,
  },
  createModel(config) {
    const model = new ExitModel(config.worldOptions)
    model.population = config.population
    return model
  },
  initialize: initializeExitModel,
  toSnapshot: createExitSnapshot,
}
