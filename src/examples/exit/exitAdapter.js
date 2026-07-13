import { buildExitMetrics } from './exitMetrics.js'

export function initializeExitModel(model) {
  model.startup()
  model.setup()
  model.initialAgentCount = model.turtles.length
  model.visualPatches = model.patches.map(patch => ({
    id: `patch-${patch.x}-${patch.y}`,
    type: getPatchType(model, patch),
    position: [patch.x, -0.5, patch.y],
    x: patch.x,
    y: patch.y,
    properties: {
      map: patch.map,
    },
  }))
}

export function createExitSnapshot(model) {
  const metrics = buildExitMetrics({
    tick: model.ticks ?? 0,
    turtles: model.turtles ?? [],
    insideBreed: model.inside,
    wallBreed: model.wall,
    exitCount: model.exits?.length ?? 0,
    insidePatchCount: model.inside?.length ?? 0,
  })

  const totalAgents = model.initialAgentCount ?? metrics.aliveAgents

  return {
    tick: model.ticks ?? 0,
    agents: model.turtles.map(turtle => ({
      id: turtle.id,
      type: 'person',
      position: [turtle.x, -0.5, turtle.y],
      rotation: [0, 180 - turtle.theta, 0],
      color: '#ffffff',
      state: turtle.patch?.breed === model.inside ? 'inside' : 'exiting',
      properties: {
        exitId: turtle.exit?.id ?? null,
      },
    })),
    patches: model.visualPatches ?? [],
    metrics: {
      ...metrics,
      totalAgents,
      exitedAgents: Math.max(0, totalAgents - metrics.aliveAgents),
    },
  }
}

function getPatchType(model, patch) {
  if (patch.breed === model.wall) return 'wall'
  if (patch.breed === model.exits) return 'exit'
  if (patch.breed === model.inside) return 'inside'
  if (patch.breed === model.empty) return 'empty'
  return 'default'
}
