// エージェント統計を疎結合に収集・配信するためのユーティリティ。
// Scene.jsx や UI コンポーネントとは独立させ、任意の箇所から購読できるように設計している。
class AgentStatsTracker {
  constructor() {
    this.snapshots = []
    this.listeners = new Set()
    this.initialAgentCount = null
  }

  capture(snapshot) {
    // 呼び出し元で計算済みの統計に捕捉タイムスタンプを付与して履歴へ保存
    if (this.initialAgentCount === null && typeof snapshot.aliveAgents === 'number') {
      this.initialAgentCount = snapshot.aliveAgents
    }

    const totalAgents = this.initialAgentCount ?? snapshot.aliveAgents ?? 0
    const aliveAgents = snapshot.aliveAgents ?? totalAgents
    const exitedAgents = Math.max(0, totalAgents - aliveAgents)

    const enriched = {
      ...snapshot,
      totalAgents,
      aliveAgents,
      exitedAgents,
      capturedAt: Date.now()
    }
    this.snapshots.push(enriched)
    this.listeners.forEach(listener => listener(enriched))
    return enriched
  }

  getLatest() {
    // 最新スナップショットのみが必要な場合のショートカット
    return this.snapshots[this.snapshots.length - 1]
  }

  getHistory() {
    // ダイレクト参照による外部からの破壊を防ぐためコピーを返す
    return [...this.snapshots]
  }

  subscribe(listener) {
    // 統計更新時にコールバックを呼び出す。解除用の関数を返却してライフサイクル管理を楽にする。
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  clear() {
    // リセット操作などで履歴を一括破棄したい場合に使用
    this.snapshots = []
    this.initialAgentCount = null
  }
}

export const agentStatsTracker = new AgentStatsTracker()

// AgentScript のモデル情報を元に統計スナップショットを生成。
// モデル本体からは turtles や patch breeds を渡すだけで済むよう、計算はここに閉じ込める。
export function buildAgentSnapshot({
  tick = 0,
  turtles = [],
  insideBreed,
  wallBreed,
  exitCount = 0,
  insidePatchCount = 0
}) {
  let insideAgents = 0
  let blockedAgents = 0
  let distanceSum = 0

  turtles.forEach(turtle => {
    const isInside = turtle.patch && turtle.patch.breed === insideBreed
    if (!isInside) {
      return
    }

    insideAgents += 1
    if (turtle.exit) {
      distanceSum += turtle.distance(turtle.exit)
    }

    const canMove = hasOpenNeighbor(turtle, wallBreed)
    if (!canMove) {
      blockedAgents += 1
    }
  })

  const aliveAgents = turtles.length
  const avgDistanceToExit = insideAgents > 0 ? distanceSum / insideAgents : 0
  const occupancyRatio = insidePatchCount > 0 ? insideAgents / insidePatchCount : 0

  return {
    tick,
    aliveAgents,
    insideAgents,
    blockedAgents,
    avgDistanceToExit,
    occupancyRatio,
    exitCount
  }
}

function hasOpenNeighbor(turtle, wallBreed) {
  if (!turtle.patch || !Array.isArray(turtle.patch.neighbors)) {
    return false
  }

  return turtle.patch.neighbors.some(neighbor => {
    const isWall = neighbor.breed === wallBreed
    const occupied = neighbor.turtlesHere && neighbor.turtlesHere.length > 0
    return !isWall && !occupied
  })
}
