# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト構造

このリポジトリはReact Three FiberとAgentScriptを使用したエージェントベースモデル（ABM）のテンプレートプロジェクトです。

### ディレクトリ構造
- `/examples/exit/` - 避難シミュレーションの実装例（メインプロジェクト）
- `/dist/` - ビルド出力ディレクトリ  
- ルートディレクトリには`gh-pages`パッケージのみ（GitHubPages公開用）

## 開発コマンド

### examples/exitディレクトリでの作業
```bash
cd examples/exit
npm install          # 依存関係のインストール
npm run dev          # 開発サーバー起動（ホットリロード付き、http://localhost:5173）
npm run build        # プロダクションビルド（distディレクトリに出力）
npm run lint         # ESLintによるコードチェック
npm run preview      # ビルド結果のプレビュー
```

## アーキテクチャ概要

### コア技術スタック
- **React 18** - UIフレームワーク
- **React Three Fiber** - Three.jsのReactラッパー（3Dレンダリング）
- **@react-three/drei** - R3F用ヘルパーコンポーネント（OrbitControls, Grid等）
- **@react-three/postprocessing** - ポストプロセシング効果（Bloom等）
- **AgentScript** - エージェントベースモデリングフレームワーク
- **Leva** - リアルタイムGUIコントロール
- **Vite** - ビルドツール・開発サーバー
- **Chroma.js** - カラー操作ライブラリ

### 主要コンポーネント構成
```
examples/exit/src/
├── main.jsx         - エントリーポイント
├── App.jsx          - メインアプリケーション（Canvas設定、カメラ配置）
├── Scene.jsx        - 3Dシーン管理とシミュレーション制御
│   ├── AgentSphere  - エージェント描画（CapsuleGeometry、インスタンスメッシュ）
│   └── PatchesSphere - 環境描画（壁をBoxGeometryで表現）
├── agentScript.js   - シミュレーションロジック
│   └── ExitModel    - AgentScript.Modelを継承した避難モデルクラス
└── layout.js        - グリッドレイアウト定義（16x16、32x32等）
```

### シミュレーションモデル

#### パッチベースの世界表現
- `0` = 内部/歩行可能エリア（inside）
- `1` = 壁（通行不可、wall）
- `2` = 出口（exits）
- `3` = 外部空間（empty）

#### エージェント動作
1. 初期配置：内部エリアに人口密度（population）に応じて配置
2. 出口割り当て：最寄りの出口を各エージェントに割り当て
3. 経路探索：ユークリッド距離による局所的最短経路選択
4. 移動制約：1パッチに1エージェントのみ（衝突回避）
5. 避難完了：出口到達後は外部へ直進

### レンダリング構成

#### 3Dビジュアライゼーション
- **エージェント**：CapsuleGeometry（カプセル形状）でインスタンス描画
- **出口別色分け**：exitIDに基づく動的カラーリング
  - E15:38/37 → 赤（0xff0000）
  - E37:20/19 → 青（0x0000ff）
  - E0:19/20 → 黄（0xffff00）
  - E34/35:0 → シアン（0x00ffff）
- **環境**：壁をBoxGeometryで表現
- **照明**：RandomizedLightによる動的照明
- **エフェクト**：Bloomポストプロセシング効果

### パフォーマンス最適化

#### ビルド設定（vite.config.js）
```javascript
manualChunks: {
  react: ['react', 'react-dom'],
  three: ['three'],
  fiber: ['@react-three/fiber'],
  drei: ['@react-three/drei'],
  useControls: ['leva'],
  postprocessing: ["@react-three/postprocessing"],
}
```

#### 実行時最適化
- インスタンスレンダリング使用（大量エージェントの効率的描画）
- 110ms間隔のシミュレーション更新制御
- ジオメトリ・マテリアルの再利用（useMemo）
- 差分更新によるReact再レンダリング最小化

### 開発環境設定

#### ESLint設定
- React 18.3対応
- React Hooks推奨ルール適用
- React Refreshサポート
- distディレクトリ除外

#### Vite設定
- ベースパス："./"（相対パス対応）
- チャンクサイズ警告：1000KB
- ホットモジュールリプレースメント対応