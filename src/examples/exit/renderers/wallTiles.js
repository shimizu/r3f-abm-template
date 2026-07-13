import { Curved, Junction, Straight, Tsplit, End } from './WallModels.jsx'

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

// 連結方向の組み合わせから壁タイルの形状タイプと回転角を判定する。
function classifyWallTile(neighbors) {
  const connectedDirs = Object.entries(neighbors)
    .filter(([, isConnected]) => isConnected)
    .map(([dir]) => dir)

  const count = connectedDirs.length

  if (count === 4) {
    return { type: 'fourWay', rotation: 0 }
  }

  if (count === 3) {
    const missing = ['north', 'east', 'south', 'west'].find(dir => !neighbors[dir]) || 'south'
    return { type: 'threeWay', rotation: rotationByMissingSide(missing) }
  }

  if (count === 2) {
    const hasNorthSouth = neighbors.north && neighbors.south
    const hasEastWest = neighbors.east && neighbors.west

    if (hasNorthSouth || hasEastWest) {
      const rotation = hasNorthSouth ? 0 : Math.PI / 2
      return { type: 'straight', rotation }
    }

    return { type: 'corner', rotation: rotationForCorner(neighbors) }
  }

  if (count === 1) {
    const dir = connectedDirs[0]
    return { type: 'end', rotation: directionAngles[dir] ?? 0 }
  }

  return { type: 'end', rotation: 0 }
}

// 単方向接続（終端）で利用する方角→ラジアンの変換テーブル。
const directionAngles = {
  north: 0,
  east: Math.PI / 2,
  south: Math.PI,
  west: -Math.PI / 2
}

// 2方向接続（コーナー）の場合、接続方角の組み合わせに応じて回転角を返す。
function rotationForCorner(neighbors) {
  if (neighbors.north && neighbors.east) return 0
  if (neighbors.east && neighbors.south) return Math.PI / 2
  if (neighbors.south && neighbors.west) return Math.PI
  if (neighbors.west && neighbors.north) return -Math.PI / 2
  return 0
}

// 3方向接続（T字）時に欠けている方角を基準に回転を算出する。
function rotationByMissingSide(missing) {
  switch (missing) {
    case 'south':
      return 0
    case 'west':
      return Math.PI / 2
    case 'north':
      return Math.PI
    case 'east':
      return -Math.PI / 2
    default:
      return 0
  }
}
