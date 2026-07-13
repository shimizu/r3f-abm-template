const DEFAULT_NON_ZERO_SEED = 0x6d2b79f5

export function createSeededRandom(seed) {
  let state = Number(seed) >>> 0
  if (state === 0) state = DEFAULT_NON_ZERO_SEED

  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function randomBetween(random, min, max) {
  return min + random() * (max - min)
}
