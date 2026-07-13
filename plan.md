# R3F + AgentScript 汎用 ABM 可視化テンプレート実装計画

## 目的

現在の避難シミュレーションをデモとして維持しながら、AgentScript のモデル実装と React Three Fiber の可視化実装を疎結合にする。新しい ABM を追加するときに、実行ループやシーン全体を書き換えず、モデル定義・Snapshot 変換・必要に応じた専用 Renderer の追加だけで動作するテンプレートを目指す。

## 設計原則

データフローを次の一方向に統一する。

```text
AgentScript Model
  -> Model Adapter
  -> Serializable Snapshot
  -> Simulation Runtime
  -> React Hook / Store
  -> React Three Fiber Renderer / Metrics UI
```

- AgentScript のオブジェクトを React コンポーネントから直接参照しない。
- タイマー、実行状態、モデルのライフサイクルは React の外側で管理する。
- Renderer はプレーンな Snapshot のみを入力として受け取る。
- 避難モデル固有の breed、統計、GLTF、壁分類はサンプル実装側に置く。
- モデル固有 Renderer がなくても、球と箱による標準 Renderer で可視化できるようにする。
- 乱数 seed と決定的な step 実行をサポートし、再現可能な検証を可能にする。

## 目標ディレクトリ構成

```text
src/
├── app/
│   ├── App.jsx
│   └── SimulationCanvas.jsx
├── simulation/
│   ├── createSimulationRuntime.js
│   ├── createAgentScriptAdapter.js
│   ├── snapshot.js
│   └── useSimulation.js
├── rendering/
│   ├── SimulationScene.jsx
│   ├── AgentRenderer.jsx
│   ├── PatchRenderer.jsx
│   ├── InstancedAgents.jsx
│   └── DefaultEnvironment.jsx
├── controls/
│   ├── SimulationControls.jsx
│   └── MetricsPanel.jsx
├── examples/
│   ├── registry.js
│   ├── basic/
│   │   ├── model.js
│   │   ├── adapter.js
│   │   └── config.js
│   └── exit/
│       ├── ExitModel.js
│       ├── exitSimulation.js
│       ├── exitAdapter.js
│       ├── exitMetrics.js
│       ├── layout.js
│       └── renderers/
└── main.jsx
```

ディレクトリ移動は一括で行わず、動作を維持したまま段階的に進める。

## 共通インターフェース

各シミュレーションは次の形式で定義する。

```js
export const simulationDefinition = {
  id: 'example',
  label: 'Example model',
  defaultConfig: {
    seed: 1234,
    stepsPerSecond: 5,
  },
  createModel(config) {},
  initialize(model, config) {},
  toSnapshot(model, config) {},
}
```

描画層へ渡す Snapshot は次を基本形とする。

```js
{
  tick: 0,
  agents: [
    {
      id: 'agent-1',
      type: 'default',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      color: '#ffffff',
      state: 'active',
      properties: {},
    },
  ],
  patches: [
    {
      id: 'patch-0-0',
      type: 'default',
      position: [0, 0, 0],
      properties: {},
    },
  ],
  metrics: {},
}
```

## 実装フェーズ

### Phase 1: 実行基盤の分離 ✅

- `createSimulationRuntime` を追加する。
- `start`、`stop`、`step`、`reset`、`subscribe`、`getSnapshot`、`dispose` を提供する。
- 二重起動を防止し、タイマーを Runtime 内で一元管理する。
- React 連携用の `useSimulation` hook を追加する。
- 現在の避難モデルを Snapshot に変換する adapter を追加する。
- `Scene.jsx` から `intervalID` と AgentScript モデルの直接操作を除去する。

完了条件:

- Start を複数回押してもタイマーが重複しない。
- Pause、Step、Reset が一貫して動作する。
- Scene が AgentScript の turtle / patch オブジェクトを直接参照しない。
- 現在の避難デモの表示と統計が維持される。

### Phase 2: 避難モデルのサンプル化 ✅

- `ExitModel`、レイアウト、統計計算を `examples/exit/` へ移す。
- `agentScript.js` のグローバルな可変モデルを廃止する。
- 避難モデル固有の Renderer と壁タイル処理をサンプル側へ移す。
- `examples/registry.js` からモデルを選択可能にする。

完了条件:

- テンプレート本体に `exit`、`wall`、`blocked` などの避難固有概念が残らない。
- Registry の定義を切り替えるだけでモデルを変更できる。

### Phase 3: 標準モデルと標準 Renderer

- 最小の `examples/basic/` を追加する。
- 球による Agent Renderer と箱による Patch Renderer を用意する。
- Renderer の指定がないモデルは標準 Renderer を使用する。
- モデル選択、速度、seed、reset を共通 UI から操作可能にする。

完了条件:

- 新規モデルが専用 GLTF なしで可視化できる。
- basic と exit を UI から切り替えられる。

### Phase 4: パフォーマンス対応

- 標準 Agent Renderer を `instancedMesh` 化する。
- Snapshot の不要な再生成と React コンポーネントの大量生成を抑える。
- 必要に応じて固定 timestep と描画補間を分離する。
- 大規模モデル向けに Web Worker 実行を追加できる境界を用意する。

完了条件:

- 標準 Renderer で数千エージェントを描画できる。
- シミュレーション速度と描画 FPS を独立して計測できる。

### Phase 5: 再現性・テスト・ドキュメント

- seed 付き乱数生成をモデル設定へ追加する。
- Runtime、Snapshot validator、adapter、壁分類のテストを追加する。
- ESLint 対象から `reflence/` と生成済みコードを除外し、`src/` の lint を通す。
- README をテンプレート利用者向けに更新する。
- 「新しいモデルの追加方法」と「専用 Renderer の追加方法」を記載する。

完了条件:

- 同じ seed と設定から同じ Snapshot 列を再現できる。
- build、lint、テストが成功する。
- README の手順だけで新規サンプルを追加できる。

## 初回実装範囲

最初の実装では Phase 1 に集中する。

1. Runtime を追加する。
2. 避難モデル用 definition / adapter を作る。
3. `useSimulation` で React と接続する。
4. `Scene.jsx` のタイマー管理を置き換える。
5. build と Runtime の基本動作を検証する。

大規模なファイル移動、モデルRegistry、instanced renderingは、この境界が安定してから後続コミットで行う。

## リスクと対策

- AgentScript のモデルは mutable であるため、Reactへ渡す値は毎回プレーンオブジェクトへ変換する。
- GLTF Renderer の一括変更は見た目の回帰を起こしやすいため、Phase 1では既存コンポーネントを再利用する。
- Layout と World サイズが一致しない可能性を adapter 初期化時に検証する。
- Runtime の購読解除と `dispose` を徹底し、Hot Reload時のタイマー残留を防ぐ。
- AgentScript が内包する古い Three.js コードへの依存を最小化し、将来的なadapter差し替えを可能にする。
