import { View, Image, ImageBackground, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path, G } from 'react-native-svg';
import Constants from './Constants';

export const WALLS = [];
export const SAFE_ZONES = [];
export const MAP_RENDERABLES = [];
export const CLUES = [];
export const LIGHTS = [];

const WALL_THICKNESS = 10;

function addWall(id, x, y, width, height, color = '#111', type = 'WALL') {
  const wall = { id, x, y, width, height };
  WALLS.push(wall);
  MAP_RENDERABLES.push({ ...wall, type, color });
}

function addObstacle(id, type, x, y, width, height) {
   // Check if any part of the obstacle overlaps a building (SAFE_ZONE)
   // Use a buffer of 20px to keep trees away from walls
   const buffer = 20;
   const or = { l: x - width/2 - buffer, r: x + width/2 + buffer, t: y - height/2 - buffer, b: y + height/2 + buffer };
   for (const sz of SAFE_ZONES) {
      const sr = { l: sz.x - sz.width/2, r: sz.x + sz.width/2, t: sz.y - sz.height/2, b: sz.y + sz.height/2 };
      // AABB overlap check
      if (or.l < sr.r && or.r > sr.l && or.t < sr.b && or.b > sr.t) return;
   }
   WALLS.push({ id, x, y, width, height });
   MAP_RENDERABLES.push({ id, type, x, y, width, height });
}

function createBuilding(id, cx, cy, w, h, doorSide, doorSize, floorColor) {
  // floor (safe zone)
  SAFE_ZONES.push({ id, x: cx, y: cy, width: w, height: h });
  MAP_RENDERABLES.push({ id: id + '_floor', type: 'FLOOR', x: cx, y: cy, width: w, height: h, color: floorColor });
  
  // Campfire in the center
  LIGHTS.push({ id: id + '_light', x: cx, y: cy, active: true, safeZoneId: id });
  MAP_RENDERABLES.push({ id: id + '_campfire', type: 'CAMPFIRE', x: cx, y: cy, width: 40, height: 40 });

  // top wall
  if (doorSide === 'top') {
    const w1 = (w - doorSize) / 2;
    addWall(id + '_t1', cx - w/2 + w1/2, cy - h/2 + WALL_THICKNESS/2, w1, WALL_THICKNESS);
    addWall(id + '_t2', cx + w/2 - w1/2, cy - h/2 + WALL_THICKNESS/2, w1, WALL_THICKNESS);
  } else {
    addWall(id + '_t', cx, cy - h/2 + WALL_THICKNESS/2, w, WALL_THICKNESS);
  }
  
  // bottom wall
  if (doorSide === 'bottom') {
    const w1 = (w - doorSize) / 2;
    addWall(id + '_b1', cx - w/2 + w1/2, cy + h/2 - WALL_THICKNESS/2, w1, WALL_THICKNESS);
    addWall(id + '_b2', cx + w/2 - w1/2, cy + h/2 - WALL_THICKNESS/2, w1, WALL_THICKNESS);
  } else {
    addWall(id + '_b', cx, cy + h/2 - WALL_THICKNESS/2, w, WALL_THICKNESS);
  }

  // left wall
  if (doorSide === 'left') {
    const h1 = (h - doorSize) / 2;
    addWall(id + '_l1', cx - w/2 + WALL_THICKNESS/2, cy - h/2 + h1/2, WALL_THICKNESS, h1);
    addWall(id + '_l2', cx - w/2 + WALL_THICKNESS/2, cy + h/2 - h1/2, WALL_THICKNESS, h1);
  } else {
    addWall(id + '_l', cx - w/2 + WALL_THICKNESS/2, cy, WALL_THICKNESS, h - WALL_THICKNESS*2);
  }
  
  // right wall
  if (doorSide === 'right') {
    const h1 = (h - doorSize) / 2;
    addWall(id + '_r1', cx + w/2 - WALL_THICKNESS/2, cy - h/2 + h1/2, WALL_THICKNESS, h1);
    addWall(id + '_r2', cx + w/2 - WALL_THICKNESS/2, cy + h/2 - h1/2, WALL_THICKNESS, h1);
  } else {
    addWall(id + '_r', cx + w/2 - WALL_THICKNESS/2, cy, WALL_THICKNESS, h - WALL_THICKNESS*2);
  }
}

// Build Map
// Starting Shed (Spawn)
createBuilding('spawn_shed', 0, 0, 150, 150, 'bottom', 60, '#432');

// North Area: The Chapel and Graveyard
createBuilding('chapel', -200, -800, 300, 400, 'bottom', 80, '#222');
// Add pews inside chapel
for (let i=0; i<3; i++) {
  MAP_RENDERABLES.push({ id: `pew_l_${i}`, type: 'PEW', x: -280, y: -900 + (i*80), width: 80, height: 20 });
  MAP_RENDERABLES.push({ id: `pew_r_${i}`, type: 'PEW', x: -120, y: -900 + (i*80), width: 80, height: 20 });
}

addObstacle('g1', 'ROCK', -350, -850, 40, 40); // Gravestones
addObstacle('g2', 'ROCK', -350, -750, 40, 40);
addObstacle('g3', 'ROCK', -50, -850, 50, 50);

// East Area: The Lighthouse Point
createBuilding('lighthouse', 1000, -1000, 120, 120, 'left', 50, '#555');
addWall('water_edge', 1200, -1000, 400, 1200, '#134', 'WATER');

// Outside Campfire near Lighthouse
LIGHTS.push({ id: 'outside_fire_1', x: 800, y: -800, active: true });
MAP_RENDERABLES.push({ id: 'outside_fire_1_asset', type: 'CAMPFIRE', x: 800, y: -800, width: 40, height: 40 });

// West Area: Deep Forest Cabins
createBuilding('cabin1', -1000, 200, 180, 150, 'right', 60, '#321');
createBuilding('cabin2', -900, 700, 200, 180, 'top', 60, '#321');

// South Area: Abandoned Farm
createBuilding('barn', 400, 900, 400, 300, 'top', 100, '#422');

// Obstacles (Trees and Rocks) - Grouped for "Forests"
const BUILDING_RECTS = [
  { x: 0, y: 0, w: 250, h: 250 }, // spawn_shed + buffer
  { x: -200, y: -800, w: 400, h: 500 }, // chapel + buffer
  { x: 1000, y: -1000, w: 250, h: 250 }, // lighthouse
  { x: -1000, y: 200, w: 300, h: 250 }, // cabin1
  { x: -900, y: 700, w: 300, h: 300 }, // cabin2
  { x: 400, y: 900, w: 500, h: 400 }, // barn
  { x: 800, y: -800, w: 100, h: 100 }, // outside campfire
];

function isOverlappingBuilding(x, y, w, h) {
   const r = { l: x - w/2, r: x + w/2, t: y - h/2, b: y + h/2 };
   for (const b of BUILDING_RECTS) {
      const br = { l: b.x - b.w/2, r: b.x + b.w/2, t: b.y - b.h/2, b: b.y + b.h/2 };
      if (r.l < br.r && r.r > br.l && r.t < br.b && r.b > br.t) return true;
   }
   return false;
}

console.log('Generating procedural forest...');
for (let i=0; i<200; i++) {
   const rx = -1500 + (Math.random()*3000);
   const ry = -1500 + (Math.random()*3000);
   if (isOverlappingBuilding(rx, ry, 100, 100)) continue;
   addObstacle(`tree_forest_${i}`, 'TREE', rx, ry, 80, 80);
}
for (let i=0; i<100; i++) {
   const rx = -1500 + (Math.random()*3000);
   const ry = -1500 + (Math.random()*3000);
   if (isOverlappingBuilding(rx, ry, 60, 60)) continue;
   addObstacle(`rock_forest_${i}`, 'ROCK', rx, ry, 40, 40);
}

const wallImg = require('../../assets/images/wall.png');
const floorImg = require('../../assets/images/floor.png');
const startFloorImg = require('../../assets/images/start_floor.png');
const treeImg = require('../../assets/images/tree.png');
const rockImg = require('../../assets/images/rock.png');
const paperClueImg = require('../../assets/images/paper_clue.png');
const campfireImg = require('../../assets/images/campfire.png');

export function renderMapObjects() {
  return (
    <>
      {MAP_RENDERABLES.map((obj) => {
        const style = {
            position: 'absolute',
            left: Constants.MAP_WIDTH / 2 + obj.x - obj.width / 2,
            top: Constants.MAP_HEIGHT / 2 + obj.y - obj.height / 2,
            width: obj.width,
            height: obj.height,
        };

        if (obj.type === 'FLOOR') {
           const isSpawn = obj.id.startsWith('spawn_shed');
           const isChapel = obj.id.startsWith('chapel');
           const floorSource = isSpawn ? startFloorImg : floorImg;
           const floorColor = isChapel ? '#444' : (isSpawn ? '#432' : 'transparent');
           
           return (
             <View key={obj.id} style={[style, { backgroundColor: floorColor }]}>
               {!isChapel && (
                 <ImageBackground 
                    source={floorSource} 
                    style={StyleSheet.absoluteFill} 
                    imageStyle={{ resizeMode: isSpawn ? 'contain' : 'repeat', opacity: 1 }} 
                 />
               )}
               {isChapel && (
                 <Svg style={StyleSheet.absoluteFill}>
                    <Rect width="100%" height="100%" fill="#444" />
                    {/* Fake stone tiles */}
                    <Path d="M0 50 h300 M0 100 h300 M0 150 h300 M0 200 h300 M50 0 v400 M100 0 v400 M150 0 v400 M200 0 v400" stroke="#222" strokeWidth="2" />
                 </Svg>
               )}
             </View>
           );
        }
        if (obj.type === 'PEW') {
           return <View key={obj.id} style={[style, { backgroundColor: '#4a3721', borderRadius: 4, borderWidth: 1, borderColor: '#2d1f11' }]} />;
        }
        if (obj.type === 'WALL') {
           return <ImageBackground key={obj.id} source={wallImg} style={style} imageStyle={{resizeMode: 'repeat'}} />;
        }
        if (obj.type === 'TREE') {
           return <Image key={obj.id} source={treeImg} style={style} resizeMode="contain" />;
        }
        if (obj.type === 'ROCK') {
           return <Image key={obj.id} source={rockImg} style={style} resizeMode="contain" />;
        }
        if (obj.type === 'CAMPFIRE') {
           const light = LIGHTS.find(l => l.id === obj.id.replace('_campfire', '').replace('_asset', ''));
           if (light && !light.active) return null; // Don't render extinguished fires
           return (
             <View key={obj.id} style={style}>
                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: obj.width / 2 }} />
                <Image source={campfireImg} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
             </View>
           );
        }
        if (obj.type === 'WATER') {
           return <View key={obj.id} style={[style, { backgroundColor: obj.color }]} />;
        }
        return <View key={obj.id} style={[style, { backgroundColor: obj.color || '#f0f' }]} />;
      })}
    </>
  );
}
