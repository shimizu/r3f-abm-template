// AgentScriptライブラリから必要なクラスをインポート
import { Model, World, DataSet, RGBADataSet } from 'agentscript';

// レイアウトデータをインポート（部屋の構造定義）
import { layout, layout2 } from './layout';




// パッチレイアウトデータ（16x16グリッド）
// 0: 内部（歩行可能）, 1: 壁（通行不可）, 2: 出口
const data = [
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
].reverse()

console.log(data)

// DataSetオブジェクトを生成（幅16、高さ16）
// AgentScriptで使用するマップデータを作成
const map = new DataSet(data[0].length, data.length, data.flat())


// 避難シミュレーションモデルクラス
// AgentScriptのModelクラスを継承してカスタムシミュレーションを作成
export default class ExitModel extends Model {
    population = 0.25  // エージェント配置密度（内部エリアの25%にエージェントを配置）

    // コンストラクタ: シミュレーション世界を初期化
    // デフォルトで8x8の世界サイズを設定
    constructor(worldOptions = World.defaultOptions(8, 8)) {
        console.log("worldOptions", worldOptions)
        super(worldOptions)  // 親クラスModelのコンストラクタを呼び出し
    }

    // シミュレーションのセットアップメソッド
    // 初期状態の設定を行う
    setup() {
        // パッチの種類を定義（exits: 出口, inside: 内部, wall: 壁, empty: 空白）
        this.patchBreeds('exits inside wall empty')
        // エージェントが世界の端に到達したら削除する設定
        this.turtles.setDefault('atEdge', turtle => turtle.die())

        // マップデータをパッチにインポート
        this.patches.importDataSet(map, "map", true)
        this.setupPatches()  // パッチ（地形）の設定を実行
        this.setupTurtles()  // エージェント（タートル）の設定を実行
    }

    // パッチ（地形）の設定メソッド
    // マップデータに基づいて各パッチの種類を設定
    setupPatches() {
        // const { maxX, maxY } = this.world  // ワールドの最大X・Y座標を取得（未使用）

        // 全パッチに対してマップデータに基づいて種類を設定
        this.patches.ask(p => {
            if (p.map === 0) {
                // マップ値0: 内部エリア（エージェントが歩行可能）
                p.setBreed(this.inside);
            }else if(p.map === 1) {
                // マップ値1: 壁（通行不可）
                p.setBreed(this.wall);
            }else if(p.map === 2){
                // マップ値2: 出口（避難目標地点）
                console.log([p.x, p.y])
                p.setBreed(this.exits);
            }else if (p.map === 3){
                // マップ値3: 空白エリア（外部空間）
                p.setBreed(this.empty)
            }
        })

    }

    // エージェント（タートル）の初期配置設定
    setupTurtles() {
        // 内部パッチからランダムに選択してエージェントを配置
        // 配置数 = 内部パッチ数 × population（密度）
        const turtlePatches = this.inside.nOf(
            this.population * this.inside.length
        )

        // 選択されたパッチにエージェントを1体ずつ配置
        turtlePatches.ask(p => {
            p.sprout(1, this.turtles, t => {
                // 各エージェントに最も近い出口を割り当て（避難目標として設定）
                t.exit = this.exits.minOneOf(e => t.distance(e))
            })
        })
    }

    // シミュレーションの1ステップ実行メソッド
    // 各エージェントの行動を更新
    step() {
        // エージェントが移動可能な隣接パッチを取得する関数
        // 壁でなく、かつ他のエージェントがいない場所を選択
        const emptyNeighbors = turtle =>
            turtle.patch.neighbors.filter(
                n => n.breed !== this.wall && n.turtlesHere.length === 0
            )

        // 全エージェントに対して移動処理を実行
        this.turtles.ask(t => {
            if (t.patch.breed === this.inside) {
                // エージェントが内部エリアにいる場合の避難行動
                const empty = emptyNeighbors(t)
                if (empty.length > 0) {
                    // 目標の出口に最も近い空いているパッチを選択
                    const min = empty.minOneOf(n => n.distance(t.exit))
                    // 現在位置より出口に近づける場合のみ移動
                    if (t.distance(t.exit) > min.distance(t.exit)) {
                        t.face(min)  // 移動先に向きを変更
                        t.setxy(min.x, min.y)  // 実際に移動実行
                    }
                }
            } else {
                // 内部エリアを出た場合は直進して避難完了
                t.forward(1)
            }
        })
    }
}

// シミュレーションモデルのインスタンスを作成
let model = new ExitModel()

// モデルの起動と初期設定を実行
model.startup()  // AgentScriptの基本初期化
model.setup()    // カスタム設定の実行

// デバッグ用ログ（コメントアウト）
// console.log("patches", model.exits)  // 出口パッチの確認
// console.log("turtles", model.turtles)  // エージェントの確認



// シミュレーションを1ステップ進める関数
// React Three Fiberでの描画用にエージェントデータを取得
function stepSimulation() {
    model.step()  // シミュレーション計算を1ステップ実行

    // 全エージェントの現在状態を3D描画用に変換
    const agents = model.turtles.map(t => {
        return {
            id: t.id, // Add this
            position: [t.x, 0, t.y],  // 3D座標（Y軸は高さ0で固定）
            theta: 180 -t.theta,            // エージェントの向き（角度）
            exitID: t.exit.id      // 目標とする出口のID
        }
    })

    return agents;  // エージェント状態データを返す
}

// シミュレーションを初期状態にリセットする関数
function resetSimulation() {
    // 新しいモデルインスタンスを作成（完全リセット）
    model = new ExitModel()
    model.startup()  // AgentScriptの基本初期化
    model.setup()    // カスタム設定の再実行
}


// React側で使用する関数とモデルをエクスポート
export { stepSimulation, resetSimulation, model };
