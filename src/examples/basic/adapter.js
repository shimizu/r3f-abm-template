export function initializeBasicModel(model) {
  model.startup()
  model.setup()
  model.visualPatches = model.patches.map(patch => ({
    id: `patch-${patch.x}-${patch.y}`,
    type: 'ground',
    position: [patch.x, -0.55, patch.y],
    color: (patch.x + patch.y) % 2 === 0 ? '#273142' : '#202938',
    properties: {},
  }))
}

export function createBasicSnapshot(model) {
  return {
    tick: model.ticks ?? 0,
    agents: model.turtles.map(turtle => ({
      id: turtle.id,
      type: 'default',
      position: [turtle.x, 0, turtle.y],
      rotation: [0, -turtle.theta, 0],
      color: '#4dabf7',
      state: 'active',
      properties: {},
    })),
    patches: model.visualPatches ?? [],
    metrics: {
      tick: model.ticks ?? 0,
      agents: model.turtles.length,
      worldWidth: model.world.width,
      worldHeight: model.world.height,
    },
  }
}
