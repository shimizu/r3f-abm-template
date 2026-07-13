import test from 'node:test'
import assert from 'node:assert/strict'

import { createSimulationRuntime } from './createSimulationRuntime.js'

test('runtime prevents duplicate timers and resets its model', () => {
  let nextTimerId = 0
  let time = 0
  const timers = new Map()
  const runtime = createSimulationRuntime(createDefinition(), {
    clearInterval: id => timers.delete(id),
    now: () => {
      time += 2
      return time
    },
    setInterval: callback => {
      const id = ++nextTimerId
      timers.set(id, callback)
      return id
    },
  })

  runtime.start()
  runtime.start()
  assert.equal(timers.size, 1)

  timers.values().next().value()
  timers.values().next().value()
  assert.equal(runtime.getSnapshot().tick, 2)
  assert.equal(runtime.getState().performance.totalSteps, 2)
  assert.equal(runtime.getState().performance.stepDurationMs, 2)

  runtime.reset()
  assert.equal(timers.size, 0)
  assert.equal(runtime.getSnapshot().tick, 0)
  assert.equal(runtime.getState().performance.totalSteps, 0)

  runtime.dispose()
})

function createDefinition() {
  return {
    id: 'runtime-test',
    defaultConfig: { stepsPerSecond: 5 },
    createModel: () => ({
      ticks: 0,
      step() {
        this.ticks += 1
      },
    }),
    toSnapshot: model => ({
      tick: model.ticks,
      agents: [],
      patches: [],
      metrics: {},
    }),
  }
}
