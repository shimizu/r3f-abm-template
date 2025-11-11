import { useEffect, useState, useMemo } from "react"
import { OrbitControls, RandomizedLight, Grid, Environment } from "@react-three/drei"
import { useControls, button } from "leva"
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring, animated, config } from '@react-spring/three' // react-spring から config をインポート

import { MenModel } from "./agents/men.jsx"

import { stepSimulation, resetSimulation, model } from './agentScript.js';


//テスト読み込み
import {Curved, Junction, Straight, Tsplit } from "./walls/index.jsx"

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
    const wall = patches.breeds.wall;
    const wallTiles = useMemo(() => {
        if (!wall || wall.length === 0) return [];

        const wallLookup = new Set();
        wall.forEach(patch => {
            wallLookup.add(`${patch.x}:${patch.y}`);
        });

        const tiles = [];
        wall.forEach(patch => {
            const neighbors = {
                north: wallLookup.has(`${patch.x}:${patch.y + 1}`),
                east: wallLookup.has(`${patch.x + 1}:${patch.y}`),
                south: wallLookup.has(`${patch.x}:${patch.y - 1}`),
                west: wallLookup.has(`${patch.x - 1}:${patch.y}`)
            };

            const { type, rotation } = classifyWallTile(neighbors);
            const Component = WALL_COMPONENTS[type] ?? WALL_COMPONENTS.straight;

            tiles.push({
                id: `wall-${patch.x}-${patch.y}`,
                Component,
                rotation,
                position: [patch.x, 0, patch.y]
            });
        });

        return tiles;
    }, [wall]);

    return (
        <group>
            {wallTiles.map(tile => {
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

const WALL_COMPONENTS = {
    straight: Straight,
    corner: Curved,
    threeWay: Tsplit,
    fourWay: Junction,
    end: Straight
};

const directionAngles = {
    north: 0,
    east: Math.PI / 2,
    south: Math.PI,
    west: -Math.PI / 2
};

function classifyWallTile(neighbors) {
    const connectedDirs = Object.entries(neighbors)
        .filter(([, isConnected]) => isConnected)
        .map(([dir]) => dir);

    const count = connectedDirs.length;

    if (count === 4) {
        return { type: 'fourWay', rotation: 0 };
    }

    if (count === 3) {
        const missing = ['north', 'east', 'south', 'west'].find(dir => !neighbors[dir]) || 'south';
        return { type: 'threeWay', rotation: rotationByMissingSide(missing) };
    }

    if (count === 2) {
        const hasNorthSouth = neighbors.north && neighbors.south;
        const hasEastWest = neighbors.east && neighbors.west;

        if (hasNorthSouth || hasEastWest) {
            const rotation = hasNorthSouth ? 0 : Math.PI / 2;
            return { type: 'straight', rotation };
        }

        return { type: 'corner', rotation: rotationForCorner(neighbors) };
    }

    if (count === 1) {
        const dir = connectedDirs[0];
        return { type: 'end', rotation: directionAngles[dir] ?? 0 };
    }

    return { type: 'end', rotation: 0 };
}

function rotationForCorner(neighbors) {
    if (neighbors.north && neighbors.east) return 0;
    if (neighbors.east && neighbors.south) return Math.PI / 2;
    if (neighbors.south && neighbors.west) return Math.PI;
    if (neighbors.west && neighbors.north) return -Math.PI / 2;
    return 0;
}

function rotationByMissingSide(missing) {
    switch (missing) {
        case 'south':
            return 0;
        case 'west':
            return Math.PI / 2;
        case 'north':
            return Math.PI;
        case 'east':
            return -Math.PI / 2;
        default:
            return 0;
    }
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
