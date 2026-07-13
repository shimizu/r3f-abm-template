import test from 'node:test'
import assert from 'node:assert/strict'

import { assertSimulationSnapshot } from '../simulation/snapshot.js'

globalThis.OffscreenCanvas = class OffscreenCanvas {
  constructor(width, height) {
    this.width = width
    this.height = height
  }

  getContext() {
    return { canvas: this }
  }
}

test('basic model is reproducible with the same seed', async () => {
  const { basicSimulation } = await import('./basic/basicSimulation.js')
  const { createSimulationRuntime } = await import(
    '../simulation/createSimulationRuntime.js'
  )

  const first = createSimulationRuntime(basicSimulation)
  const second = createSimulationRuntime(basicSimulation)

  assert.deepEqual(first.getSnapshot(), second.getSnapshot())
  first.step()
  second.step()
  assert.deepEqual(first.getSnapshot(), second.getSnapshot())
  assertSimulationSnapshot(first.getSnapshot())

  first.dispose()
  second.dispose()
})

test('exit model is reproducible with the same seed', async () => {
  const { exitSimulation } = await import('./exit/exitSimulation.js')
  const { createSimulationRuntime } = await import(
    '../simulation/createSimulationRuntime.js'
  )

  const first = createSimulationRuntime(exitSimulation)
  const second = createSimulationRuntime(exitSimulation)

  assert.deepEqual(first.getSnapshot(), second.getSnapshot())
  first.step()
  second.step()
  assert.deepEqual(first.getSnapshot(), second.getSnapshot())
  assertSimulationSnapshot(first.getSnapshot())

  first.dispose()
  second.dispose()
})
