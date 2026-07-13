import { useSyncExternalStore } from 'react'

export function useSimulation(runtime) {
  const state = useSyncExternalStore(
    runtime.subscribe,
    runtime.getState,
    runtime.getState
  )

  return {
    ...state,
    reset: runtime.reset,
    setStepsPerSecond: runtime.setStepsPerSecond,
    start: runtime.start,
    step: runtime.step,
    stop: runtime.stop,
  }
}
