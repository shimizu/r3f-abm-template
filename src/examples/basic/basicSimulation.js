import BasicModel from './BasicModel.js'
import { createBasicSnapshot, initializeBasicModel } from './adapter.js'
import { basicConfig } from './config.js'

export const basicSimulation = {
  id: 'basic',
  label: 'Basic random walk',
  defaultConfig: basicConfig,
  createModel(config) {
    return new BasicModel(config)
  },
  initialize: initializeBasicModel,
  toSnapshot: createBasicSnapshot,
}
