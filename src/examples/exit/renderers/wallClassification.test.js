import test from 'node:test'
import assert from 'node:assert/strict'

import { classifyWallTile } from './wallClassification.js'

test('classifies straight and corner wall connections', () => {
  assert.deepEqual(
    classifyWallTile(neighbors({ north: true, south: true })),
    { type: 'straight', rotation: 0 }
  )
  assert.deepEqual(
    classifyWallTile(neighbors({ north: true, east: true })),
    { type: 'corner', rotation: 0 }
  )
})

test('classifies junctions and wall ends', () => {
  assert.deepEqual(
    classifyWallTile(neighbors({
      north: true,
      east: true,
      south: true,
      west: true,
    })),
    { type: 'fourWay', rotation: 0 }
  )
  assert.deepEqual(
    classifyWallTile(neighbors({ east: true })),
    { type: 'end', rotation: Math.PI / 2 }
  )
})

function neighbors(overrides) {
  return {
    north: false,
    east: false,
    south: false,
    west: false,
    ...overrides,
  }
}
