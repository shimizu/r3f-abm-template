import { useEffect, useState, useRef, useMemo } from "react"
import { OrbitControls, RandomizedLight, Grid, Environment } from "@react-three/drei"
import * as THREE from "three"
import { useControls, button } from "leva"
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import chroma from 'chroma-js';
import { useSpring, animated, config } from '@react-spring/three' // react-spring から config をインポート

import { MenModel } from "./men.jsx"

import { stepSimulation, resetSimulation, model } from './agentScript.js';

// MenModelのアニメーション版を作成する
const AnimatedMenModel = animated(MenModel);

/**
 * 位置と回転をアニメーション化する単一のエージェントコンポーネント。
 * @param {{agent: Object}} props - The agent data.
 */
function Agent({ agent }) {
    const { position, theta } = agent;

    const { springPosition, springRotation } = useSpring({
        to: {
            springPosition: [position[0], -0.5, position[2]], //次の移動位置までアニメーション
            springRotation: [0, theta, 0], // 回転をアニメーションさせる場合
        },
        // バウンスしないように、アニメーションの挙動を 'gentle' (穏やか) に設定
        config: config.gentle,
    });

    return (
        <AnimatedMenModel
            position={springPosition}
            rotation={[0, theta, 0]} //回転は即時反映の方が動きがよい
        />
    );
}


/**
 * すべてのエージェントをレンダリングします。
 * @param {{agents: Array<Object>}} props - エージェントの配列。
 */
function AgentMen({ agents }) {
    return (
        <group>
                        {/* key としてエージェント固有のIDを使用 */}
            {agents.map((agent) => (
                <Agent key={agent.id} agent={agent} />
            ))}
        </group>
    );
}

/**
 * パッチ（壁）をインスタンス化して描画するコンポーネント
 * @param {{patches: Object}} props - パッチデータ
 */
function PatchesSphere({ patches }) {
    const meshRef = useRef();

    // パフォーマンス向上のため、ジオメトリとマテリアルをメモ化
    const geometry = useMemo(() => new THREE.BoxGeometry(1, 2, 1), []);
    const material = useMemo(() => new THREE.MeshPhongMaterial({ color: 0x666666 }), []);

    // AgentScriptモデルから壁のデータを取得
    const wall = patches.breeds.wall;

    useEffect(() => {
        if (meshRef.current) {
            wall.forEach((patch, i) => {
                // 各インスタンス（壁ブロック）の位置を設定
                const matrix = new THREE.Matrix4();
                matrix.makeTranslation(
                    patch.x,  // X座標
                    0.5,      // Y座標（固定）
                    patch.y   // Z座標
                );

                // インスタンスに変換行列を適用
                meshRef.current.setMatrixAt(i, matrix);
            });
            // 位置の変更をGPUに通知
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    }, [wall]); // wallデータが変更されたときにのみ実行

    return (
        // InstancedMeshを使用して多数の壁ブロックを効率的に描画
        <instancedMesh ref={meshRef} args={[geometry, material, wall.length]} />
    );
}

/**
 * メインの3Dシーンコンポーネント
 * シミュレーションの制御、エージェントと環境のレンダリングを管理
 */
function Scene() {
    // シミュレーションのエージェントの状態を管理
    const [agents, setAgents] = useState([]);
    let intervalID; // シミュレーションのインターバルID

    // Leva UIコントロール（開始・リセット・ステップ実行ボタン）
    const {} = useControls({
        start: button(() => {
            // インターバルがなければ、シミュレーションを開始
            if (!intervalID) {
                intervalID = setInterval(() => {
                    setp();
                }, 220); // 110msごとにステップを実行
            }
        }),
        reset: button(() => {
            // シミュレーションを停止し、リセット
            clearInterval(intervalID);
            intervalID = undefined;
            resetSimulation();
            setp(); // 初期状態を反映
        }),
        step: button(() => {
            setp();
        })
    });

    // シミュレーションを1ステップ進め、エージェントの状態を更新する関数
    const setp = () => {
        const updatedAgents = stepSimulation();
        setAgents(updatedAgents);
    };

    // コンポーネントのマウント時にシミュレーションを初期化
    useEffect(() => {
        setp();
    }, []);

    const { camera } = useThree();

    // カメラの位置をデバッグするために使用
    const handleCamera = () => {
        // console.log(camera.position);
    };

    return (
        <>
            {/* カメラコントロール（オービット） */}
            <OrbitControls onChange={handleCamera} />

            <Environment preset="sunset" />

            {/* ランダムな位置に光源を配置 */}
            <RandomizedLight />

            {/* エージェントと壁を含むグループ */}
            <group>
                <AgentMen agents={agents} />
                <PatchesSphere patches={model.patches} />
            </group>

            {/* 地面のグリッド */}
            <group position={[0.5, -0.5, 0.5]}>
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
    );
}

export default Scene;