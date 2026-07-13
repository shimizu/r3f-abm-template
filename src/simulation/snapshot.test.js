import test from 'node:test'
import assert from 'node:assert/strict'

import {
  assertSimulationSnapshot,
  validateSimulationSnapshot,
} from './snapshot.js'

test('accepts a serializable simulation snapshot', () => {
  const snapshot = {
    tick: 1,
    agents: [{ id: 1, position: [0, 0, 0] }],
    patches: [{ id: '0:0', position: [0, -0.5, 0] }],
    metrics: { agents: 1 },
  }

  assert.equal(assertSimulationSnapshot(snapshot), snapshot)
})

test('reports malformed vectors and duplicate ids', () => {
  const errors = validateSimulationSnapshot({
    tick: 0,
    agents: [
      { id: 1, position: [0, 0] },
      { id: 1, position: [0, 0, 0] },
    ],
    patches: [],
    metrics: {},
  })

  assert.ok(errors.some(error => error.includes('Vector3')))
  assert.ok(errors.some(error => error.includes('duplicate id')))
})
