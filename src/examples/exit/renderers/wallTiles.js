import { Curved, Junction, Straight, Tsplit, End } from './WallModels.jsx'
import { classifyWallTile } from './wallClassification.js'

// 壁タイプと描画に使う GLTF コンポーネントの対応表。
// End だけ専用メッシュを用意しているため straight と分岐させている。
const WALL_COMPONENTS = {
  straight: Straight,
  corner: Curved,
  threeWay: Tsplit,
  fourWay: Junction,
  end: End
}

// デバッグようにタイルタイプでいろわけする。
export const WALL_TYPE_COLORS = {
  end: '#ff4757',
  straight: '#2f3542',
  corner: '#ffa502',
  threeWay: '#3742fa',
  fourWay: '#2ed573'
}

export function buildWallTiles(wallPatches) {
  // 壁パッチが空（初期化前や屋外マップなど）の場合は空配列を返して描画をスキップ。
  if (!wallPatches || wallPatches.length === 0) return []

  const wallLookup = new Set()
  wallPatches.forEach(patch => {
    wallLookup.add(`${patch.x}:${patch.y}`)
  })

  // 各パッチの上下左右に壁が存在するか調べ、タイプ／回転／対応モデルを決定する。
  return wallPatches.map(patch => {
    const neighbors = {
      north: wallLookup.has(`${patch.x}:${patch.y + 1}`),
      east: wallLookup.has(`${patch.x + 1}:${patch.y}`),
      south: wallLookup.has(`${patch.x}:${patch.y - 1}`),
      west: wallLookup.has(`${patch.x - 1}:${patch.y}`)
    }

    const { type, rotation } = classifyWallTile(neighbors)
    const Component = WALL_COMPONENTS[type] ?? WALL_COMPONENTS.straight

    return {
      id: `wall-${patch.x}-${patch.y}`,
      Component,
      rotation,
      position: [patch.x, -0.5, patch.y],
      type
    }
  })
}
