export function classifyWallTile(neighbors) {
  const connectedDirections = Object.entries(neighbors)
    .filter(([, isConnected]) => isConnected)
    .map(([direction]) => direction)

  const count = connectedDirections.length

  if (count === 4) return { type: 'fourWay', rotation: 0 }

  if (count === 3) {
    const missing = ['north', 'east', 'south', 'west']
      .find(direction => !neighbors[direction]) ?? 'south'
    return { type: 'threeWay', rotation: rotationByMissingSide(missing) }
  }

  if (count === 2) {
    const hasNorthSouth = neighbors.north && neighbors.south
    const hasEastWest = neighbors.east && neighbors.west

    if (hasNorthSouth || hasEastWest) {
      return {
        type: 'straight',
        rotation: hasNorthSouth ? 0 : Math.PI / 2,
      }
    }

    return { type: 'corner', rotation: rotationForCorner(neighbors) }
  }

  if (count === 1) {
    return {
      type: 'end',
      rotation: directionAngles[connectedDirections[0]] ?? 0,
    }
  }

  return { type: 'end', rotation: 0 }
}

const directionAngles = {
  north: 0,
  east: Math.PI / 2,
  south: Math.PI,
  west: -Math.PI / 2,
}

function rotationForCorner(neighbors) {
  if (neighbors.north && neighbors.east) return 0
  if (neighbors.east && neighbors.south) return Math.PI / 2
  if (neighbors.south && neighbors.west) return Math.PI
  if (neighbors.west && neighbors.north) return -Math.PI / 2
  return 0
}

function rotationByMissingSide(missing) {
  switch (missing) {
    case 'south':
      return 0
    case 'west':
      return Math.PI / 2
    case 'north':
      return Math.PI
    case 'east':
      return -Math.PI / 2
    default:
      return 0
  }
}
