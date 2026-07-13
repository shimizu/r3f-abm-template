import { useEffect, useMemo } from "react"
import { OrbitControls, RandomizedLight, Grid, Environment, Html } from "@react-three/drei"
import { useControls, button } from "leva"
import { useSpring, animated, config } from '@react-spring/three' // react-spring から config をインポート

import { MenModel } from "./agents/men.jsx"

import { exitSimulationDefinition } from './agentScript.js';
import { createSimulationRuntime } from './simulation/createSimulationRuntime.js'
import { useSimulation } from './simulation/useSimulation.js'


//テスト読み込み
import { buildWallTiles, WALL_TYPE_COLORS } from "./walls/wallTiles.js"

// MenModelのアニメーション版を作成する
const AnimatedMenModel = animated(MenModel);

/**
 * 位置と回転をアニメーション化する単一のエージェントコンポーネント。
 * @param {{agent: Object}} props - The agent data.
 */
function Agent({ agent }) {
    const { position, rotation } = agent;

    const { springPosition } = useSpring({
        to: {
            springPosition: position, //次の移動位置までアニメーション
        },
        // バウンスしないように、アニメーションの挙動を 'gentle' (穏やか) に設定
        config: config.gentle,
    });

    return (
        <AnimatedMenModel
            position={springPosition}
            rotation={rotation} //回転は即時反映の方が動きがよい
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
function PatchesSphere({ patches, debugOptions = {} }) {
    const { useBoxWalls = false } = debugOptions;

    // 壁パッチ配列からタイプ判定済みの描画タイル情報を生成
    const wallTiles = useMemo(
        () => buildWallTiles(patches.filter(patch => patch.type === 'wall')),
        [patches]
    );

    return (
        <group>
            {wallTiles.map(tile => {
                if (useBoxWalls) {
                    // デバッグモード：インスタンス化されたボックスで壁を可視化
                    return (
                        <mesh key={tile.id} position={tile.position} rotation={[0, tile.rotation, 0]}>
                            <boxGeometry args={[1, 2, 1]} />
                            <meshStandardMaterial color={WALL_TYPE_COLORS[tile.type] ?? '#666666'} />
                        </mesh>
                    );
                }

                // 通常モード：GLTF モデルで壁タイプごとのアセットを描画
                const TileComponent = tile.Component;
                return (
                    <TileComponent
                        key={tile.id}
                        position={tile.position}
                        rotation={[0, tile.rotation, 0]}
                    />
                );
            })}

        </group>
    );
}


/**
 * メインの3Dシーンコンポーネント
 * シミュレーションの制御、エージェントと環境のレンダリングを管理
 */
function Scene() {
    const runtime = useMemo(
        () => createSimulationRuntime(exitSimulationDefinition),
        []
    );
    const {
        isRunning,
        snapshot,
        start,
        step,
        stop,
        reset,
    } = useSimulation(runtime);

    // Leva UIコントロール（開始・停止・リセット・ステップ実行ボタン）
    useControls('Simulation', {
        start: button(start),
        pause: button(stop),
        reset: button(reset),
        step: button(step),
    });

    const wallDebugControls = useControls('Wall Debug', {
        useBoxWalls: false
    });

    useEffect(() => {
        return () => runtime.stop();
    }, [runtime]);

    return (
        <>
            <AgentStatsPanel stats={snapshot.metrics} isRunning={isRunning} />


            {/* カメラコントロール（オービット） */}
            <OrbitControls />

            <Environment preset="sunset" />

            {/* ランダムな位置に光源を配置 */}
            <RandomizedLight />

            {/* エージェントと壁を含むグループ */}
            <group>
                <AgentMen agents={snapshot.agents} />
                <PatchesSphere patches={snapshot.patches} debugOptions={wallDebugControls} />
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

function AgentStatsPanel({ stats, isRunning }) {
    if (!stats) return null;

    const rows = [
        { label: 'Status', value: isRunning ? 'Running' : 'Paused' },
        { label: 'Tick', value: stats.tick },
        { label: 'Agents', value: stats.totalAgents },
        { label: 'Inside', value: stats.insideAgents },
        { label: 'Exited', value: stats.exitedAgents },
        { label: 'Blocked', value: stats.blockedAgents },
        { label: 'Avg Dist', value: stats.avgDistanceToExit.toFixed(2) },
        { label: 'Occupancy', value: `${(stats.occupancyRatio * 100).toFixed(1)}%` }
    ];

    return (
        <Html
            fullscreen 
            style={{
                pointerEvents:"none",
            }}
        >
            <div
               className="panel"
                style={{
                    position: 'absolute',
                    top:10,
                    left:10,
                    minWidth: 200,
                    padding: '12px 16px',
                    borderRadius: 12,
                    background: 'rgba(16, 18, 32, 0.85)',
                    color: '#f5f5f5',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: 13,
                    lineHeight: 1.5,
                    boxShadow: '0 12px 24px rgba(0,0,0,0.35)'
                }}
            >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Agent Stats</div>
                {rows.map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ opacity: 0.7 }}>{row.label}</span>
                        <span>{row.value}</span>
                    </div>
                ))}
            </div>
        </Html>
    );
}

export default Scene;
