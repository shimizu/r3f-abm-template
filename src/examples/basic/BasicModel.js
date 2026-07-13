import { Model, World } from 'agentscript'
import {
  createSeededRandom,
  randomBetween,
} from '../../simulation/createSeededRandom.js'

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

function normalizePositiveInteger(value, fallback) {
  const number = Math.floor(Number(value))
  return Number.isFinite(number) && number > 0 ? number : fallback
}
