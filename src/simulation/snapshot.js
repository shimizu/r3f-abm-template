export function assertSimulationSnapshot(snapshot) {
  const errors = validateSimulationSnapshot(snapshot)
  if (errors.length > 0) {
    throw new TypeError(`Invalid simulation snapshot: ${errors.join(', ')}`)
  }
  return snapshot
}

export function validateSimulationSnapshot(snapshot) {
  const errors = []

  if (!snapshot || typeof snapshot !== 'object') {
    return ['snapshot must be an object']
  }

  if (!Number.isFinite(snapshot.tick) || snapshot.tick < 0) {
    errors.push('tick must be a non-negative number')
  }
  validateItems(snapshot.agents, 'agents', errors)
  validateItems(snapshot.patches, 'patches', errors)

  if (!snapshot.metrics || typeof snapshot.metrics !== 'object') {
    errors.push('metrics must be an object')
  }

  return errors
}

function validateItems(items, name, errors) {
  if (!Array.isArray(items)) {
    errors.push(`${name} must be an array`)
    return
  }

  const ids = new Set()
  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      errors.push(`${name}[${index}] must be an object`)
      return
    }
    if (item.id === undefined || item.id === null) {
      errors.push(`${name}[${index}] requires an id`)
    } else if (ids.has(item.id)) {
      errors.push(`${name} contains duplicate id "${item.id}"`)
    } else {
      ids.add(item.id)
    }
    if (!isVector3(item.position)) {
      errors.push(`${name}[${index}].position must be a finite Vector3`)
    }
  })
}

function isVector3(value) {
  return Array.isArray(value)
    && value.length === 3
    && value.every(Number.isFinite)
}
