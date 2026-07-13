import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

const SAMPLE_SECONDS = 1

export function useRenderPerformance() {
  const [framesPerSecond, setFramesPerSecond] = useState(0)
  const sampleRef = useRef({
    elapsed: 0,
    frames: 0,
  })

  useFrame((_, delta) => {
    const sample = sampleRef.current
    sample.elapsed += delta
    sample.frames += 1

    if (sample.elapsed >= SAMPLE_SECONDS) {
      setFramesPerSecond(sample.frames / sample.elapsed)
      sample.elapsed = 0
      sample.frames = 0
    }
  })

  return framesPerSecond
}
