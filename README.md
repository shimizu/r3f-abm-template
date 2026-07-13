# React Three Fiber + AgentScript ABM Template

AgentScriptで構築したエージェントベースモデルを、React Three Fiberでインタラクティブに可視化するためのテンプレートです。

モデル、実行ループ、React状態、3D Rendererを分離しているため、新しいABMはモデル定義とSnapshot adapterを追加するだけで動かせます。専用3Dアセットがないモデルには、`instancedMesh`を使った標準Rendererを利用できます。

## 主な機能

- AgentScriptモデルのstart / pause / step / reset
- モデルごとの速度、seed、パラメータ設定
- シリアライズ可能なSnapshotを介した描画層との分離
- basic / exitサンプルの実行時切り替え
- 球と箱による標準Renderer
- モデル固有GLTF Rendererへの差し替え
- 数千エージェント向けのinstanced rendering
- 描画FPS、シミュレーションSPS、step処理時間の計測
- seedによる決定的なシミュレーション
- Runtime、adapter、Snapshot、壁分類の自動テスト

## セットアップ

```bash
npm install
npm run dev
```

開発サーバーは通常 `http://localhost:5173` で起動します。

## コマンド

```bash
npm run dev      # 開発サーバー
npm run build    # production build
npm run preview  # build結果の確認
npm run lint     # ESLint
npm test         # Node標準テスト
```

## アーキテクチャ

```text
AgentScript Model
  -> Model Adapter
  -> Serializable Snapshot
  -> Simulation Runtime
  -> useSimulation
  -> React Three Fiber Renderer / Metrics UI
```

### Simulation definition

各モデルは共通のdefinitionを公開します。

```js
export const exampleSimulation = {
  id: 'example',
  label: 'Example',
  defaultConfig: {
    seed: 1234,
    stepsPerSecond: 8,
  },
  createModel(config) {
    return new ExampleModel(config)
  },
  initialize(model, config) {
    model.startup()
    model.setup()
  },
  toSnapshot(model, config) {
    return createExampleSnapshot(model)
  },
}
```

Runtimeは次の操作を提供します。

```js
const runtime = createSimulationRuntime(exampleSimulation)

runtime.start()
runtime.stop()
runtime.step()
runtime.reset({ seed: 999 })
runtime.setStepsPerSecond(10)
runtime.subscribe(() => runtime.getState())
runtime.dispose()
```

### Snapshot contract

ReactとRendererにはAgentScriptオブジェクトを渡さず、プレーンなSnapshotへ変換します。

```js
{
  tick: 0,
  agents: [
    {
      id: 'agent-1',
      type: 'default',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      color: '#4dabf7',
      state: 'active',
      properties: {},
    },
  ],
  patches: [
    {
      id: 'patch-0-0',
      type: 'ground',
      position: [0, -0.5, 0],
      color: '#273142',
      properties: {},
    },
  ],
  metrics: {
    agents: 1,
  },
}
```

`assertSimulationSnapshot`を使うと、adapterが返すSnapshotの基本構造を検証できます。

## ディレクトリ構成

```text
src/
├── examples/
│   ├── registry.js
│   ├── basic/
│   │   ├── BasicModel.js
│   │   ├── adapter.js
│   │   ├── basicSimulation.js
│   │   └── config.js
│   └── exit/
│       ├── ExitModel.js
│       ├── exitAdapter.js
│       ├── exitMetrics.js
│       ├── exitSimulation.js
│       ├── layout.js
│       └── renderers/
├── rendering/
│   ├── DefaultRenderers.jsx
│   └── useRenderPerformance.js
├── simulation/
│   ├── createSeededRandom.js
│   ├── createSimulationRuntime.js
│   ├── snapshot.js
│   └── useSimulation.js
├── App.jsx
├── Scene.jsx
└── main.jsx
```

`reflence/` はAgentScriptの資料・入力置き場であり、アプリケーションコードやlintの対象ではありません。

## 新しいモデルの追加方法

### 1. AgentScriptモデルを作成する

`src/examples/my-model/MyModel.js` を追加します。

```js
import { Model, World } from 'agentscript'

export default class MyModel extends Model {
  constructor(config) {
    super(World.defaultOptions(10, 10))
    this.config = config
  }

  setup() {
    this.turtles.create(this.config.agentCount)
  }

  step() {
    this.turtles.ask(turtle => turtle.forward(0.1))
  }
}
```

再現可能な乱数が必要な場合は `createSeededRandom(config.seed)` を利用してください。モデル内で直接 `Math.random()` を使わないことが重要です。

### 2. Snapshot adapterを作成する

`src/examples/my-model/adapter.js` を追加します。

```js
export function initializeMyModel(model) {
  model.startup()
  model.setup()
}

export function createMySnapshot(model) {
  return {
    tick: model.ticks,
    agents: model.turtles.map(turtle => ({
      id: turtle.id,
      type: 'default',
      position: [turtle.x, 0, turtle.y],
      rotation: [0, -turtle.theta, 0],
      color: '#4dabf7',
      state: 'active',
      properties: {},
    })),
    patches: [],
    metrics: {
      agents: model.turtles.length,
    },
  }
}
```

### 3. Definitionを作成する

```js
import MyModel from './MyModel.js'
import { createMySnapshot, initializeMyModel } from './adapter.js'

export const mySimulation = {
  id: 'my-model',
  label: 'My model',
  defaultConfig: {
    agentCount: 100,
    seed: 1234,
    stepsPerSecond: 10,
  },
  createModel: config => new MyModel(config),
  initialize: initializeMyModel,
  toSnapshot: createMySnapshot,
}
```

### 4. Registryへ登録する

`src/examples/registry.js` にentryを追加します。

```js
myModel: {
  definition: mySimulation,
  controls: {
    model: {
      agentCount: { value: 100, min: 1, max: 5000, step: 1 },
      seed: { value: 1234, min: 1, step: 1 },
    },
    visualization: {},
  },
  renderers: {
    Agents: DefaultAgents,
    Patches: DefaultPatches,
    Metrics: DefaultMetrics,
  },
}
```

登録後、LevaのModelメニューから選択できます。

## 専用Rendererの追加方法

標準Rendererを使わない場合は、次のpropsを受け取るReact Three Fiberコンポーネントを作成します。

```jsx
export function MyAgents({ agents }) {
  return <group>{/* agent visualization */}</group>
}

export function MyPatches({ patches, options }) {
  return <group>{/* environment visualization */}</group>
}

export function MyMetrics({ metrics, isRunning, performance }) {
  return null
}
```

作成したコンポーネントをRegistryの `renderers` に指定します。exitサンプルは人物・壁のGLTFを利用する専用Rendererの例です。

## パフォーマンス

標準Agent/Patch Rendererは `instancedMesh` を利用します。Agent数を増やしても、React要素やdraw callがAgent数に比例して増えません。

Metricsには次の値が表示されます。

- Render FPS: R3Fの描画フレームレート
- Simulation SPS: Runtimeの実測step数/秒
- Step Time: モデルstepとSnapshot生成に要した時間

大規模モデルではSnapshot生成自体が負荷になるため、`properties` には描画・分析に必要な値だけを含めてください。

## テスト

テストはNode標準の `node:test` を使用しています。

```bash
npm test
```

新しいモデルでは最低限、次を確認してください。

- 同じseedと設定から同じ初期Snapshotが生成される
- 同じstep列から同じSnapshot列が生成される
- Snapshot validatorを通過する
- resetでtickと性能値が初期化される
- RendererへAgentScriptオブジェクトが漏れていない

## サンプル

- `basic`: seed付きランダムウォーク。標準instanced Rendererを使用
- `exit`: パッチベースの避難モデル。人物・壁の専用GLTF Rendererを使用
