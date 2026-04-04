/**
 * levels.js — Level definitions for Crow Island
 *
 * Each level represents a chapter of Jack Brown's journey through the island.
 * Levels escalate in difficulty, fear speed, and dark card weight.
 *
 * Shape:
 * {
 *   id:              string
 *   name:            string
 *   number:          number  (1-6)
 *   phase:           'day' | 'dusk' | 'night'
 *   intro:           string  — text shown on LevelIntroScreen before play
 *   handSize:        number  — how many cards the player holds
 *   darkCardWeight:  number  — 0.0 = all light, 1.0 = all dark
 *   fearDecayRate:   number  — fear reduction per card played (day bonus applied separately)
 *   crowMaxPressure: number  — pressure needed for crow capture (lower = more dangerous)
 *   progressGoal:   number  — total progress needed to complete this level
 *   turnsPerPhase:  number  — cards played before day/night shifts (used within level)
 *   shelterNodes:   number[]  — progress% values where shelter actions can trigger
 *   hasShelter:     boolean
 *   dayBonus: {
 *     fearDecayBonus:    number  — extra fear reduction during day
 *     lightCardBonus:    number  — extra effect multiplier for light cards
 *     crowPressureLimit: number  — clamp on crow growth during day
 *   }
 *   nightPenalty: {
 *     extraFearPerTurn:    number
 *     darkCardMultiplier:  number
 *     crowPressureBoost:   number
 *   }
 *   victoryText:     string  — shown on level complete screen
 *   defeatHint:      string  — hint shown on game over for this level
 * }
 */

export const LEVELS = [
  // ─── LEVEL 1: ARRIVAL ──────────────────────────────────────────────────────
  {
    id: 'arrival',
    name: 'Arrival',
    number: 1,
    bannerKey: 'pano_arrival',   // artwork: dock, first view of island
    phase: 'day',
    intro:
      'Your boat touches the dock. The island smells of salt and something else — something older.\n\nYou are Police Officer Jack Brown. You received a message and you came. That is what you do.\n\nThe farms stretch ahead. Start moving.',
    handSize: 5,
    darkCardWeight: 0.2,   // mostly light cards — tutorial level
    fearDecayRate: 1,
    crowMaxPressure: 100,   // forgiving
    progressGoal: 100,
    shelterNodes: [60],
    hasShelter: true,
    dayBonus: {
      fearDecayBonus: 2,
      lightCardBonus: 1.2,
      crowPressureLimit: 15,
    },
    nightPenalty: {
      extraFearPerTurn: 0,  // no night phase this level
      darkCardMultiplier: 1.0,
      crowPressureBoost: 0,
    },
    victoryText: 'You reach the edge of the first farm. The island feels manageable. For now.',
    defeatHint: 'Tip: Play Lantern Glow and Safe Path cards early to build progress fast.',
  },

  // ─── LEVEL 2: THE FARMS ────────────────────────────────────────────────────
  {
    id: 'the_farms',
    name: 'The Farms',
    number: 2,
    bannerKey: 'pano_farms',     // artwork: eerie farmland, crows on fence
    phase: 'day',
    intro:
      'The farms are strange. Everything is growing. Everything is ready to harvest. But there is nobody here.\n\nCrows watch from every fence post. Something scratched at the barn doors.\n\nKeep your lantern close.',
    handSize: 5,
    darkCardWeight: 0.35,
    fearDecayRate: 2,
    crowMaxPressure: 85,
    progressGoal: 100,
    shelterNodes: [40, 80],
    hasShelter: true,
    dayBonus: {
      fearDecayBonus: 3,
      lightCardBonus: 1.15,
      crowPressureLimit: 20,
    },
    nightPenalty: {
      extraFearPerTurn: 5,
      darkCardMultiplier: 1.2,
      crowPressureBoost: 5,
    },
    victoryText: 'You pass through the last farm gate. In the centre of the island: a large shed.',
    defeatHint: 'Tip: The Raised Shield card blocks the next dark card completely.',
  },

  // ─── LEVEL 3: THE SHED ─────────────────────────────────────────────────────
  {
    id: 'the_shed',
    name: 'The Shed',
    number: 3,
    bannerKey: 'pano_shed',      // artwork: old wooden food shed
    phase: 'dusk',
    intro:
      'The shed is full of food. Too much food. Enough to last months.\n\nThere is a hole in the roof. Scratch marks cover every wall — low at first, then higher than any person should reach.\n\nSomething lives here. Or visits.',
    handSize: 5,
    darkCardWeight: 0.45,
    fearDecayRate: 1,
    crowMaxPressure: 70,
    progressGoal: 100,
    shelterNodes: [50],
    hasShelter: true,
    dayBonus: {
      fearDecayBonus: 2,
      lightCardBonus: 1.1,
      crowPressureLimit: 25,
    },
    nightPenalty: {
      extraFearPerTurn: 8,
      darkCardMultiplier: 1.3,
      crowPressureBoost: 8,
    },
    victoryText: 'You have seen enough. You search the floor and find three words carved deep into the wood.',
    defeatHint: 'Tip: Use shelter cards at the 50% node to reset your fear completely.',
  },

  // ─── LEVEL 4: THE WARNING ──────────────────────────────────────────────────
  {
    id: 'the_warning',
    name: 'The Warning',
    number: 4,
    bannerKey: 'pano_forest',   // artwork: dusk island, amber sky
    phase: 'dusk',
    intro:
      '"DAY = SAFE. NIGHT = RUN."\n\nThe words were carved by someone who knew. The sun is low now. The shadows are stretching.\n\nYou have to move. Now.',
    handSize: 5,
    darkCardWeight: 0.55,
    fearDecayRate: 1,
    crowMaxPressure: 45,
    progressGoal: 100,
    shelterNodes: [35, 70],
    hasShelter: true,
    dayBonus: {
      fearDecayBonus: 1,
      lightCardBonus: 1.1,
      crowPressureLimit: 30,
    },
    nightPenalty: {
      extraFearPerTurn: 10,
      darkCardMultiplier: 1.4,
      crowPressureBoost: 12,
    },
    victoryText:
      'Night falls. Full, thick, island dark. You saw it — just for a moment — at the treeline. That shape.',
    defeatHint: 'Tip: Dawn\'s Light is a legendary card that forces a day phase. Save it for night.',
  },

  // ─── LEVEL 5: NIGHT HUNT ───────────────────────────────────────────────────
  {
    id: 'night_hunt',
    name: 'Night Hunt',
    number: 5,
    bannerKey: 'pano_night',     // artwork: full dark night, treeline
    phase: 'night',
    intro:
      'Full dark. The island has no streetlights, no cars, no other people. Just you, a failing torch, and something that hunts in the night.\n\nIt has seen you. It is coming.\n\nRun.',
    handSize: 5,
    darkCardWeight: 0.65,
    fearDecayRate: 0,     // fear does not naturally go down at night
    crowMaxPressure: 35,  // much more dangerous
    progressGoal: 100,
    shelterNodes: [30, 65],
    hasShelter: true,
    dayBonus: {
      fearDecayBonus: 0,
      lightCardBonus: 1.05,
      crowPressureLimit: 50,
    },
    nightPenalty: {
      extraFearPerTurn: 12,
      darkCardMultiplier: 1.5,
      crowPressureBoost: 15,
    },
    victoryText: 'You reach the far shore. You can see the dock. Almost there.',
    defeatHint: 'Tip: Shelter cards and Police Radio are your lifelines. Keep them until you need them.',
  },

  // ─── LEVEL 6: ESCAPE ───────────────────────────────────────────────────────
  {
    id: 'escape',
    name: 'Escape from Crow Island',
    number: 6,
    bannerKey: 'pano_escape',    // artwork: night shore, running to dock
    phase: 'night',
    intro:
      'The dock. Your boat. The mainland.\n\nIt is right behind you. The creature is not hiding anymore. It is coming — wings loud, steps wrong, too fast.\n\nThis is the last run. Make it count.',
    handSize: 6,
    darkCardWeight: 0.7,
    fearDecayRate: 0,
    crowMaxPressure: 25,  // one mistake and it's over
    progressGoal: 100,
    shelterNodes: [50],
    hasShelter: true,
    dayBonus: {
      fearDecayBonus: 0,
      lightCardBonus: 1.1,
      crowPressureLimit: 60,
    },
    nightPenalty: {
      extraFearPerTurn: 15,
      darkCardMultiplier: 1.6,
      crowPressureBoost: 18,
    },
    victoryText: 'You made it.',
    defeatHint: 'Tip: You are almost free. Discard dark cards fast and chain progress cards.',
  },
];

/**
 * Get a level by ID
 * @param {string} id
 * @returns {object|undefined}
 */
export const getLevelById = (id) => LEVELS.find((l) => l.id === id);

/**
 * Get the next level after the current one
 * @param {string} currentId
 * @returns {object|undefined}
 */
export const getNextLevel = (currentId) => {
  const idx = LEVELS.findIndex((l) => l.id === currentId);
  return idx >= 0 && idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
};

