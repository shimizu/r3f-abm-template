const DEFAULT_STEPS_PER_SECOND = 5

export function createSimulationRuntime(definition, options = {}) {
  validateDefinition(definition)

  const scheduler = {
    setInterval: options.setInterval
      ?? ((callback, delay) => globalThis.setInterval(callback, delay)),
    clearInterval: options.clearInterval
      ?? (timerId => globalThis.clearInterval(timerId)),
  }
  const now = options.now
    ?? (() => globalThis.performance?.now?.() ?? Date.now())

  let config = {
    ...definition.defaultConfig,
    ...options.config,
  }
  let model = createModel()
  let timerId = null
  let disposed = false
  let lastStepCompletedAt = null
  let performanceMetrics = createPerformanceMetrics()
  const listeners = new Set()
  let state = createState()

  function createModel() {
    const nextModel = definition.createModel(config)
    definition.initialize?.(nextModel, config)
    return nextModel
  }

  function createState() {
    return {
      definitionId: definition.id,
      isRunning: timerId !== null,
      performance: performanceMetrics,
      stepsPerSecond: getStepsPerSecond(config),
      snapshot: definition.toSnapshot(model, config),
    }
  }

  function publish({ refreshSnapshot = true, snapshot } = {}) {
    state = {
      ...state,
      isRunning: timerId !== null,
      performance: performanceMetrics,
      stepsPerSecond: getStepsPerSecond(config),
      snapshot: snapshot
        ?? (refreshSnapshot
          ? definition.toSnapshot(model, config)
          : state.snapshot),
    }
    listeners.forEach(listener => listener())
    return state
  }

  function assertActive() {
    if (disposed) {
      throw new Error(`Simulation runtime "${definition.id}" has been disposed`)
    }
  }

  function step() {
    assertActive()
    const startedAt = now()
    model.step()
    const snapshot = definition.toSnapshot(model, config)
    const completedAt = now()
    recordStepPerformance(startedAt, completedAt)
    return publish({ refreshSnapshot: false, snapshot })
  }

  function start() {
    assertActive()
    if (timerId !== null) return state

    const delay = 1000 / getStepsPerSecond(config)
    timerId = scheduler.setInterval(step, delay)
    return publish({ refreshSnapshot: false })
  }

  function stop() {
    if (timerId === null) return state

    scheduler.clearInterval(timerId)
    timerId = null
    return publish({ refreshSnapshot: false })
  }

  function reset(nextConfig = {}) {
    assertActive()
    stop()
    config = {
      ...config,
      ...nextConfig,
    }
    lastStepCompletedAt = null
    performanceMetrics = createPerformanceMetrics()
    model = createModel()
    return publish()
  }

  function setStepsPerSecond(stepsPerSecond) {
    assertActive()
    const wasRunning = timerId !== null
    stop()
    config = {
      ...config,
      stepsPerSecond: normalizeStepsPerSecond(stepsPerSecond),
    }
    publish({ refreshSnapshot: false })
    if (wasRunning) start()
    return state
  }

  function subscribe(listener) {
    assertActive()
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function recordStepPerformance(startedAt, completedAt) {
    const stepDurationMs = Math.max(0, completedAt - startedAt)
    const instantStepsPerSecond = lastStepCompletedAt === null
      ? 0
      : 1000 / Math.max(completedAt - lastStepCompletedAt, 0.001)
    const actualStepsPerSecond = performanceMetrics.actualStepsPerSecond === 0
      ? instantStepsPerSecond
      : performanceMetrics.actualStepsPerSecond * 0.8
        + instantStepsPerSecond * 0.2

    performanceMetrics = {
      actualStepsPerSecond,
      stepDurationMs,
      totalSteps: performanceMetrics.totalSteps + 1,
    }
    lastStepCompletedAt = completedAt
  }

  function dispose() {
    if (disposed) return
    stop()
    listeners.clear()
    definition.dispose?.(model, config)
    disposed = true
  }

  return {
    dispose,
    getConfig: () => ({ ...config }),
    getSnapshot: () => state.snapshot,
    getState: () => state,
    reset,
    setStepsPerSecond,
    start,
    step,
    stop,
    subscribe,
  }
}

function validateDefinition(definition) {
  if (!definition || typeof definition !== 'object') {
    throw new TypeError('A simulation definition is required')
  }

  if (typeof definition.id !== 'string' || definition.id.length === 0) {
    throw new TypeError('Simulation definition is missing "id"')
  }

  for (const property of ['createModel', 'toSnapshot']) {
    if (typeof definition[property] !== 'function') {
      throw new TypeError(`Simulation definition requires "${property}"`)
    }
  }
}

function getStepsPerSecond(config) {
  return normalizeStepsPerSecond(
    config.stepsPerSecond ?? DEFAULT_STEPS_PER_SECOND
  )
}

function normalizeStepsPerSecond(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return DEFAULT_STEPS_PER_SECOND
  }
  return numericValue
}

function createPerformanceMetrics() {
  return {
    actualStepsPerSecond: 0,
    stepDurationMs: 0,
    totalSteps: 0,
  }
}
