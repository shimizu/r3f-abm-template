import React, { useMemo, useEffect } from 'react';
import { sampleMapData, getRoadType, getRoadRotation, TILE_TYPES, coordinateUtils } from '../../data/mapData.js';
import { trafficConfig } from '../../config/trafficConfig.js';
import AssetManager from '../../utils/AssetManager';
import { HEIGHT_LEVELS, GEOMETRY_SIZES } from '../../config/constants.js';

/**
 * RoadNetworkコンポーネント
 * 道路ネットワークの表示と道路タイプ自動判定
 */
const RoadNetwork = ({ mapData = sampleMapData, onRoadDataUpdate, useBoxRoads = false, modelsLoaded = false }) => {
  
  // 道路タイル情報を解析して生成
  const roadTiles = useMemo(() => {
    const roads = [];
    
    for (let y = 0; y < mapData.size; y++) {
      for (let x = 0; x < mapData.size; x++) {
        if (mapData.tiles[y][x] === TILE_TYPES.ROAD) {
          const roadType = getRoadType(mapData, x, y);
          const rotation = getRoadRotation(mapData, x, y);
          const worldPos = coordinateUtils.tileToWorld(x, y);
          
          roads.push({
            id: `road-${x}-${y}`,
            x,
            y,
            worldX: worldPos.x,
            worldZ: worldPos.z,
            roadType,
            rotation
          });
        }
      }
    }
    
    return roads;
  }, [mapData]);

  // 道路データが更新されたときに親コンポーネントに通知
  useEffect(() => {
    if (onRoadDataUpdate && roadTiles.length > 0) {
      onRoadDataUpdate(roadTiles);
    }
  }, [roadTiles, onRoadDataUpdate]);

  // 道路タイプ別の表示コンポーネント
  const RoadTile = ({ road }) => {
    // 道路タイプに応じた色分け
    const getColorByType = (roadType) => {
      switch (roadType) {
        case 'end': return '#ff4757';      // 赤 - 端
        case 'straight': return '#2f3542'; // 黒 - 直線
        case 'corner': return '#ffa502';   // オレンジ - コーナー
        case 'three-way': return '#3742fa'; // 青 - T字路
        case 'four-way': return '#2ed573'; // 緑 - 十字路
        default: return trafficConfig.colors.road;
      }
    };

    // AssetManagerから3Dモデルを取得（直接アクセス）
    const getRoadModel = (roadType) => {
      const modelKey = `roads/${roadType}`;
      return AssetManager.getModel(modelKey);
    };

    // useBoxRoadsがfalseかつ3Dモデルが利用可能で読み込み済みの場合
    if (!useBoxRoads && modelsLoaded) {
      const model = getRoadModel(road.roadType);
      if (model) {
        // デバッグ出力
        console.log(`Road model: ${road.roadType}, position: [${road.worldX}, ${HEIGHT_LEVELS.ROAD_3D_MODEL}, ${road.worldZ}]`);
        
        return (
          <primitive
            object={model}
            position={[road.worldX, HEIGHT_LEVELS.ROAD_3D_MODEL, road.worldZ]}
            rotation={[0, road.rotation, 0]}
            raycast={() => null} // ★クリックイベントの対象外に設定
          />
        );
      }
      // 3Dモデルがない場合は何も表示しない
      return null;
    }

    // useBoxRoadsがtrueの場合のみBox形状での表示
    if (useBoxRoads) {
      return (
        <mesh 
          position={[road.worldX, HEIGHT_LEVELS.ROAD_FALLBACK, road.worldZ]} 
          rotation={[0, road.rotation, 0]}
          raycast={() => null} // ★クリックイベントの対象外に設定
        >
          <boxGeometry args={GEOMETRY_SIZES.ROAD_BOX} />
          <meshLambertMaterial 
            color={getColorByType(road.roadType)}
            transparent={false}
          />
        </mesh>
      );
    }

    // デフォルトは何も表示しない（3Dモデル読み込み待ち）
    return null;
  };

  // デバッグ情報表示
  const DebugInfo = () => {
    if (!trafficConfig.debug.showTileCoordinates) return null;
    
    return roadTiles.map(road => (
      <mesh key={`debug-${road.id}`} position={[road.worldX, HEIGHT_LEVELS.DEBUG_INFO, road.worldZ]}>
        <sphereGeometry args={[GEOMETRY_SIZES.DEBUG_SPHERE_RADIUS, ...GEOMETRY_SIZES.DEBUG_SPHERE_SEGMENTS]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    ));
  };

  return (
    <group name="road-network">
      {/* 道路タイル表示 */}
      {roadTiles.map(road => (
        <RoadTile key={road.id} road={road} />
      ))}
      
      {/* デバッグ情報 */}
      <DebugInfo />
      
      {/* 道路統計情報（コンソール出力） */}
      {(() => {
        if (trafficConfig.debug.logVehicleEvents) {
          const stats = roadTiles.reduce((acc, road) => {
            acc[road.roadType] = (acc[road.roadType] || 0) + 1;
            return acc;
          }, {});
          console.log('Road Statistics:', stats);
        }
        return null;
      })()}
    </group>
  );
};

export default RoadNetwork;