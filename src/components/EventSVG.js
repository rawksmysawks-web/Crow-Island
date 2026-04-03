import React from 'react';
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop, Polygon, Line } from 'react-native-svg';

export const EventSVG = ({ name, width = 100, height = 100 }) => {
  switch (name) {
    case 'svg_overgrown_path':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#1b2614" />
          <Polygon points="30,100 70,100 55,20 45,20" fill="#2d2b1f" />
          {/* Weeds */}
          <Path d="M 10 100 Q 20 50 15 30 M 20 100 Q 30 60 28 40 M 80 100 Q 75 40 85 30" stroke="#25381c" strokeWidth="4" fill="none" />
        </Svg>
      );
    case 'svg_farms_gate':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#201c18" />
          <Rect x="20" y="30" width="8" height="60" fill="#3a2a20" />
          <Rect x="70" y="30" width="8" height="60" fill="#3a2a20" />
          <Rect x="15" y="45" width="68" height="6" fill="#3a2a20" />
          <Rect x="15" y="65" width="68" height="6" fill="#3a2a20" />
          <Path d="M 20 30 L 78 80 M 70 30 L 22 80" stroke="#2f1c0d" strokeWidth="4" />
        </Svg>
      );
    case 'svg_photo_frame':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#111" />
          <Rect x="15" y="10" width="70" height="80" fill="#4a3e20" />
          <Rect x="25" y="20" width="50" height="60" fill="#d0b98a" />
          {/* Tear/scratch */}
          <Path d="M 25 40 L 40 50 L 50 20 L 60 70 L 75 60 L 65 30 L 75 80 L 25 80" fill="#111" />
        </Svg>
      );
    case 'svg_ruined_tractor':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#181e18" />
          {/* Tractor body */}
          <Rect x="50" y="30" width="40" height="40" fill="#8c3b21" />
          <Rect x="20" y="50" width="40" height="20" fill="#a04d2c" />
          {/* Wheels */}
          <Circle cx="80" cy="70" r="20" fill="#2a2a2a" stroke="#8c3b21" strokeWidth="2" />
          <Circle cx="30" cy="70" r="15" fill="#2a2a2a" stroke="#8c3b21" strokeWidth="2" />
        </Svg>
      );
    case 'svg_hidden_cache':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#1a1c17" />
          <Rect x="20" y="40" width="60" height="40" fill="#3c2f21" stroke="#231a11" strokeWidth="3" />
          <Rect x="20" y="35" width="60" height="15" fill="#4b3b28" stroke="#231a11" strokeWidth="3" />
          <Rect x="45" y="45" width="10" height="15" fill="#a4843b" />
          <Circle cx="50" cy="55" r="2" fill="#231a11" />
        </Svg>
      );
    case 'svg_hand_drawn_map':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#131313" />
          <Polygon points="10,15 80,10 90,90 20,85" fill="#cebd93" />
          <Path d="M 30 30 C 50 20, 60 50, 40 70" stroke="#333" strokeWidth="2" fill="none" strokeDasharray="4,4" />
          <Path d="M 35 65 L 45 75 M 45 65 L 35 75" stroke="#a32424" strokeWidth="6" strokeLinecap="round" />
        </Svg>
      );
    case 'svg_scratch_marks':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#191515" />
          <Path d="M 20 20 Q 25 50 15 80" stroke="#5a0000" strokeWidth="5" fill="none" strokeLinecap="round" />
          <Path d="M 40 10 Q 45 50 35 85" stroke="#7a0000" strokeWidth="6" fill="none" strokeLinecap="round" />
          <Path d="M 60 15 Q 65 55 55 90" stroke="#6a0000" strokeWidth="5" fill="none" strokeLinecap="round" />
          <Path d="M 80 25 Q 85 50 75 75" stroke="#4a0000" strokeWidth="4" fill="none" strokeLinecap="round" />
        </Svg>
      );
    case 'svg_under_floorboards':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#000" />
          <Rect x="0" y="0" width="100" height="30" fill="#352414" />
          <Rect x="0" y="70" width="100" height="30" fill="#352414" />
          <Line x1="0" y1="15" x2="100" y2="15" stroke="#1c1108" strokeWidth="2" />
          <Line x1="0" y1="85" x2="100" y2="85" stroke="#1c1108" strokeWidth="2" />
          <Path d="M 10 30 L 20 40 L 40 25 L 60 50 L 80 28 L 90 30" fill="#000" />
          <Path d="M 15 70 L 30 55 L 50 75 L 70 50 L 85 70" fill="#000" />
        </Svg>
      );
    case 'svg_finds_you':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#050505" />
          <Path d="M 20 80 Q 50 30 80 80 Q 50 100 20 80" fill="#111" />
          <Circle cx="40" cy="65" r="4" fill="#ff0000" opacity="0.9" />
          <Circle cx="60" cy="65" r="4" fill="#ff0000" opacity="0.9" />
          <Circle cx="40" cy="65" r="8" fill="#ff0000" opacity="0.3" />
          <Circle cx="60" cy="65" r="8" fill="#ff0000" opacity="0.3" />
        </Svg>
      );
    case 'svg_silver_locket':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#131518" />
          {/* Chain */}
          <Path d="M 10 10 Q 50 50 50 30" stroke="#778" strokeWidth="2" fill="none" strokeDasharray="2,2" />
          <Path d="M 90 10 Q 50 50 50 30" stroke="#778" strokeWidth="2" fill="none" strokeDasharray="2,2" />
          {/* Locket halves */}
          <Circle cx="40" cy="50" r="15" fill="#667" />
          <Circle cx="60" cy="50" r="15" fill="#889" />
          <Circle cx="40" cy="50" r="8" fill="#111" />
        </Svg>
      );
    case 'svg_trail_feathers':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#1c1918" />
          {/* Feathers */}
          <Path d="M 20 80 Q 30 60 15 40 Q 10 60 20 80" fill="#1a1c22" />
          <Path d="M 50 70 Q 65 50 45 30 Q 30 50 50 70" fill="#15171d" />
          <Path d="M 80 50 Q 90 30 75 10 Q 65 30 80 50" fill="#1a1c22" />
        </Svg>
      );
    case 'svg_bone_totem':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#1e1614" />
          <Line x1="50" y1="20" x2="50" y2="80" stroke="#cfc7b8" strokeWidth="6" strokeLinecap="round" />
          <Line x1="30" y1="40" x2="70" y2="40" stroke="#cfc7b8" strokeWidth="6" strokeLinecap="round" />
          <Line x1="40" y1="60" x2="60" y2="60" stroke="#cfc7b8" strokeWidth="5" strokeLinecap="round" />
          <Circle cx="50" cy="30" r="8" fill="#1e1614" stroke="#cfc7b8" strokeWidth="4" />
        </Svg>
      );
    case 'svg_light_fading':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="100%">
              <Stop offset="0" stopColor="#000" stopOpacity="1" />
              <Stop offset="0.7" stopColor="#400" stopOpacity="1" />
              <Stop offset="1" stopColor="#a00" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100" height="100" fill="url(#grad)" />
          {/* Trees silhouetted */}
          <Path d="M 20 100 L 25 60 L 30 100 M 70 100 L 75 50 L 80 100" fill="#000" />
          <Path d="M 0 80 Q 50 60 100 85 L 100 100 L 0 100 Z" fill="#000" />
        </Svg>
      );
    case 'svg_cracked_bell':
      return (
        <Svg width={width} height={height} viewBox="0 0 100 100">
          <Rect width="100" height="100" fill="#1b1c20" />
          <Path d="M 30 80 Q 50 20 70 80 Z" fill="#695c47" />
          {/* Crack */}
          <Path d="M 50 80 L 45 60 L 55 50 L 48 30" stroke="#111" strokeWidth="3" fill="none" />
          {/* Crows */}
          <Circle cx="35" cy="40" r="3" fill="#000" />
          <Circle cx="65" cy="50" r="3" fill="#000" />
        </Svg>
      );
    default:
      return null;
  }
};
