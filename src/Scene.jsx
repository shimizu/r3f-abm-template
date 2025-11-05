import { useEffect, useState, useRef, useMemo } from "react"
import { OrbitControls, RandomizedLight, Grid } from "@react-three/drei"
import * as THREE from "three"
import { useControls, button } from "leva"
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import chroma from 'chroma-js';

import { stepSimulation, resetSimulation, model } from './agentScript.js';


function AgentSphere({ agents }) {
    const meshRef = useRef();

    //exitIDの確認
    //console.log(Array.from(new Set(agents.map(a=>a.exitID))))

    const colors = {
        'E15:38': 0xff0000,
        'E15:37': 0xff0000,

        'E37:20': 0x0000ff,
        'E37:19': 0x0000ff,

        'E0:19': 0xffff00,
        'E0:20': 0xffff00,

        'E34:0': 0x00ffff,
        'E35:0': 0x00ffff,
    }


    // 一度だけジオメトリとマテリアルを作成
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 16)//useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
    const material = new THREE.MeshPhongMaterial({  
        vertexColors: true 
    })

    useEffect(() => {
        if (meshRef.current) {

            const colorArray = new Float32Array(agents.length * 3);

            agents.forEach((agent, i) => {

                // 各インスタンスのポジションを設定
                meshRef.current.setMatrixAt(i, new THREE.Matrix4().makeTranslation(
                    agent.position[0],
                    0.8,
                    agent.position[2]
                ));

                // 各インスタンスの色を設定
                const materialColor = colors[agent.exitID];
                const color = new THREE.Color(materialColor);
                colorArray.set(color.toArray(), i * 3); // 色をcolorArrayに格納

            });
            // 変更を通知
            meshRef.current.instanceMatrix.needsUpdate = true;
            geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colorArray, 3));

        }
    }, [agents]);

    return (
        <group >
            <instancedMesh ref={meshRef} args={[geometry, material, agents.length]} />
        </group>
    );
}


function PatchesSphere({ patches }) {
    const meshRef = useRef();

    // 一度だけジオメトリとマテリアルを作成
    const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
    const material = useMemo(() => new THREE.MeshPhongMaterial({ color: 0x666666 }), []);


    const world = patches.model.world 
    const wall = patches.breeds.wall


    useEffect(() => {
        if (meshRef.current) {
            wall.forEach((patch, i) => {
                // 各インスタンスの位置を設定
                const matrix = new THREE.Matrix4();
                matrix.makeTranslation(
                    patch.x,  // X軸の位置
                    1.5,        // Y軸の位置（固定）
                    patch.y   // Z軸の位置
                );

                // インスタンスに変換行列を適用
                meshRef.current.setMatrixAt(i, matrix);
            });
            // 位置の変更を通知
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [wall]);

    return (
        <instancedMesh ref={meshRef} args={[geometry, material, wall.length]} />
    );
}




function Scene() {
    const [agents, setAgents] = useState([]);
    let intervalID


    const { start ,reset } = useControls({
        start: button(() => {
            if (!intervalID) intervalID = setInterval(() => {
                setp()
            }, 110)
        }),
        reset:button(()=>{
            clearInterval(intervalID)
            intervalID = undefined;
            resetSimulation()
            setp()
        })
    })

    const setp = ()=>{
        const updatedAgents = stepSimulation();
        setAgents(updatedAgents); 
    }

    useEffect(() => {
        setp()        
    }, [])


    const { camera } = useThree()

    //カメラ位置取得
    const handleCamera = () => {
        //console.log(camera.position)
    }



    return (
        <>

            <OrbitControls 
                onChange={handleCamera} 
            />

            <RandomizedLight />


            <group>
                <AgentSphere agents={agents} />
                <PatchesSphere patches={model.patches} />
            </group>
            
            <mesh>
                <boxGeometry args={[1,1,1]} />
                <meshBasicMaterial color={0xff0000} />
            </mesh>

            <group position={[0.5,-0.5,0.5]}>
                <Grid
                    gridSize={[1, 1]}
                    cellSize={1}
                    cellThickness={1}
                    cellColor={0x666666}
                    fadeDistance={50}
                    fadeStrength={1}
                    followCamera={false}
                    infiniteGrid={true}
                />
            </group>

        </>
    )
}

export default Scene