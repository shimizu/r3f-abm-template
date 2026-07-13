import { Model, World } from 'agentscript'

export default class BasicModel extends Model {
  constructor(config) {
    const radius = normalizePositiveInteger(config.worldRadius, 10)
    super(World.defaultOptions(radius, radius))
    this.agentCount = normalizePositiveInteger(config.agentCount, 40)
    this.random = createSeededRandom(config.seed)
  }

  setup() {
    this.turtles.create(this.agentCount, turtle => {
      turtle.setxy(
        randomBetween(this.random, this.world.minX, this.world.maxX),
        randomBetween(this.random, this.world.minY, this.world.maxY)
      )
      turtle.heading = this.random() * 360
      turtle.atEdge = 'bounce'
    })
  }

  step() {
    this.turtles.ask(turtle => {
      turtle.rotate((this.random() - 0.5) * 30)
      turtle.forward(0.2)
    })
  }
}

function createSeededRandom(seed) {
  let state = Number(seed) >>> 0
  if (state === 0) state = 0x6d2b79f5

  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function randomBetween(random, min, max) {
  return min + random() * (max - min)
}

function normalizePositiveInteger(value, fallback) {
  const number = Math.floor(Number(value))
  return Number.isFinite(number) && number > 0 ? number : fallback
}
