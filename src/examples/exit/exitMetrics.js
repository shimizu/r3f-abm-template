// AgentScript の避難モデル情報から統計を生成する。
export function buildExitMetrics({
  tick = 0,
  turtles = [],
  insideBreed,
  wallBreed,
  exitCount = 0,
  insidePatchCount = 0
}) {
  let insideAgents = 0
  let blockedAgents = 0
  let distanceSum = 0

  turtles.forEach(turtle => {
    const isInside = turtle.patch && turtle.patch.breed === insideBreed
    if (!isInside) {
      return
    }

    insideAgents += 1
    if (turtle.exit) {
      distanceSum += turtle.distance(turtle.exit)
    }

    const canMove = hasOpenNeighbor(turtle, wallBreed)
    if (!canMove) {
      blockedAgents += 1
    }
  })

  const aliveAgents = turtles.length
  const avgDistanceToExit = insideAgents > 0 ? distanceSum / insideAgents : 0
  const occupancyRatio = insidePatchCount > 0 ? insideAgents / insidePatchCount : 0

  return {
    tick,
    aliveAgents,
    insideAgents,
    blockedAgents,
    avgDistanceToExit,
    occupancyRatio,
    exitCount
  }
}

function hasOpenNeighbor(turtle, wallBreed) {
  if (!turtle.patch || !Array.isArray(turtle.patch.neighbors)) {
    return false
  }

  return turtle.patch.neighbors.some(neighbor => {
    const isWall = neighbor.breed === wallBreed
    const occupied = neighbor.turtlesHere && neighbor.turtlesHere.length > 0
    return !isWall && !occupied
  })
}
