# Road Network Rendering Guide

## コンポーネント概要
`RoadNetwork.jsx` はタイルマップから道路タイルを抽出し、React Three Fiber上に道路ジオメトリを配置するコンポーネントです。入力は `mapData`（デフォルトは `sampleMapData`）で、解析結果は `onRoadDataUpdate` で親へ通知され、車両スポーン等の下流ロジックが利用できます。`useBoxRoads` と `modelsLoaded` のフラグにより、表示手段をGLTFモデルかボックスメッシュのいずれかに切り替えます。

## データフロー
1. `useMemo` 内で `mapData.size` 分ループし、`TILE_TYPES.ROAD` のみを対象とします。
2. 各タイルで `getRoadType(mapData, x, y)` により道路タイプ (`end`, `straight`, `corner`, `three-way`, `four-way`) を判定し、`getRoadRotation` で Y 軸回転角を取得します。
3. `coordinateUtils.tileToWorld` がタイル座標を Three.js ワールド座標に変換。結果は `{ id, x, y, worldX, worldZ, roadType, rotation }` として `roadTiles` に挿入されます。
4. `useEffect` が `roadTiles` を `onRoadDataUpdate` に渡し、他システムが同期可能になります。

## 道路タイプ判定とアセット切り替え
- **判定ロジック**: `mapData.tiles[y][x]` のクロスチェックにより、周囲タイルの接続性を見て5種類の道路タイプを返します。これにより T 字路やコーナーを自動的に選別し、手動モデリング不要で道路形状を切り替えられます。
- **モデルキー命名**: 取得した `roadType` はそのまま `AssetManager.getModel('roads/${roadType}')` のキーに利用され、`roads/straight`, `roads/corner` などの GLTF が返ります。AssetManager 側でプリロード済みであれば `modelsLoaded=true` として渡すことで即描画されます。
- **描画分岐**:
  - `!useBoxRoads && modelsLoaded`: GLTF を `<primitive>` で配置。位置は `[worldX, HEIGHT_LEVELS.ROAD_3D_MODEL, worldZ]`、回転は `[0, rotation, 0]`。`raycast={() => null}` によりクリック対象外とし、UI 操作への干渉を防ぎます。
  - `useBoxRoads === true`: `<mesh>` + `<boxGeometry>` のフォールバックを使用。`getColorByType` により道路タイプ別のデバッグカラー（終端:赤、直線:黒、コーナー:オレンジ、T字:青、十字:緑）を割り当て、`HEIGHT_LEVELS.ROAD_FALLBACK` に配置します。
  - `modelsLoaded === false`: 読み込み待ち中は `null` を返し、ミスレンダリングを回避します。
- **拡張ポイント**: 新しい道路タイプを追加する場合は `mapData` 判定ロジック・AssetManagerのキー・`getColorByType` の3箇所を同時に更新し、GLTF のスケールと `GEOMETRY_SIZES` を一致させます。

## デバッグ機能
- `trafficConfig.debug.showTileCoordinates`: タイル中心に白いスフィアを描画 (`HEIGHT_LEVELS.DEBUG_INFO`) し、座標整合性を視覚的にチェックできます。
- `trafficConfig.debug.logVehicleEvents`: レンダリングごとに `roadTiles` の統計を `console.log('Road Statistics:', stats)` で出力。道路タイプごとの枚数がモデリング意図と一致するか即座に確認可能です。

## 利用時の注意
- 新しいマップデータを投入する際は `mapData.size`, `mapData.tiles` のフォーマットを既存と合わせること。
- モデル表示を使う場合は、`AssetManager` がロード完了を通知するタイミングで `modelsLoaded` を true に切り替えます。
- ボックス描画モードはアセット準備前のデバッグや、軽量プロファイリング時に便利です。開発中は Leva から `useBoxRoads` を切り替えられるようにしておくと作業効率が上がります。
