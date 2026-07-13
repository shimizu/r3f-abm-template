// AgentScriptライブラリから必要なクラスをインポート
import { Model, World, DataSet } from 'agentscript';
import { exitDemoLayout } from './layout.js'

// パッチレイアウトデータ（16x16グリッド）
// 0: 内部（歩行可能）, 1: 壁（通行不可）, 2: 出口
// DataSetオブジェクトを生成（幅16、高さ16）
// AgentScriptで使用するマップデータを作成
const map = new DataSet(
    exitDemoLayout[0].length,
    exitDemoLayout.length,
    exitDemoLayout.flat()
)


// 避難シミュレーションモデルクラス
// AgentScriptのModelクラスを継承してカスタムシミュレーションを作成
export default class ExitModel extends Model {
    population = 0.25  // エージェント配置密度（内部エリアの25%にエージェントを配置）

    // コンストラクタ: シミュレーション世界を初期化
    // デフォルトで8x8の世界サイズを設定
    constructor(worldOptions = World.defaultOptions(8, 8)) {
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
