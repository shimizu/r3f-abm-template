import test from 'node:test'
import assert from 'node:assert/strict'

import { createSeededRandom, randomBetween } from './createSeededRandom.js'

test('the same seed produces the same sequence', () => {
  const first = createSeededRandom(1234)
  const second = createSeededRandom(1234)

  assert.deepEqual(
    Array.from({ length: 10 }, first),
    Array.from({ length: 10 }, second)
  )
})

test('randomBetween keeps values inside the requested range', () => {
  const random = createSeededRandom(42)
  const values = Array.from({ length: 100 }, () => (
    randomBetween(random, -10, 20)
  ))

  assert.ok(values.every(value => value >= -10 && value < 20))
})
