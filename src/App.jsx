import { useState } from 'react'
import { Canvas } from '@react-three/fiber'

import Scene from './Scene'


import './App.css'

function App() {

  return (
    <>
     <Canvas 
      shadows
      camera={{
        position: [0.6973766503794323, 24.209815598943365, 25.26654892288738]
      }
    }>
        <Scene />
     </Canvas>
    </>
  )
}

export default App
