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
    handSize: 4,
    fearDecayRate: 1,
    crowMaxPressure: 100,
    progressGoal: 600,
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
    defeatHint: 'Tip: Use Lantern Glare and Cautious Move cards early to manage the crow level.',
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
    handSize: 4,
    fearDecayRate: 1,
    crowMaxPressure: 100,
    progressGoal: 750,
    shelterNodes: [40, 80],
    hasShelter: true,
    dayBonus: {
      fearDecayBonus: 3,
      lightCardBonus: 1.15,
      crowPressureLimit: 30,
    },
    nightPenalty: {
      extraFearPerTurn: 5,
      darkCardMultiplier: 1.2,
      crowPressureBoost: 5,
    },
    victoryText: 'You pass through the last farm gate. In the centre of the island: a large shed.',
    defeatHint: 'Tip: Have a clogged hand? Use the Swap mechanic to discard bad cards, even if it adds fear.',
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
    fearDecayRate: 1,
    crowMaxPressure: 100,
    progressGoal: 1000,
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
    defeatHint: 'Tip: Look out for shelter nodes (🔥). Reaching them heals your fear drastically.',
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
    fearDecayRate: 1,
    crowMaxPressure: 100,
    progressGoal: 1250,
    shelterNodes: [35, 70],
    hasShelter: true,
    dayBonus: {
      fearDecayBonus: 1,
      lightCardBonus: 1.1,
      crowPressureLimit: 30,
    },
    nightPenalty: {
      extraFearPerTurn: 5,
      darkCardMultiplier: 1.4,
      crowPressureBoost: 12,
    },
    victoryText:
      'Night falls. Full, thick, island dark. You saw it — just for a moment — at the treeline. That shape.',
    defeatHint: 'Tip: Brace for Impact is a powerful shield card. Play it when you know a high-risk event is coming.',
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
    fearDecayRate: 0,
    crowMaxPressure: 90,
    progressGoal: 1800,
    shelterNodes: [30, 65],
    hasShelter: true,
    dayBonus: {
      fearDecayBonus: 0,
      lightCardBonus: 1.05,
      crowPressureLimit: 50,
    },
    nightPenalty: {
      extraFearPerTurn: 6,
      darkCardMultiplier: 1.3,
      crowPressureBoost: 8,
    },
    victoryText: 'You reach the far shore. You can see the dock. Almost there.',
    defeatHint: 'Tip: Fear doesn\'t naturally decay at night. You must use Light cards like Calm Nerves to stay sane.',
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
    fearDecayRate: 0,
    crowMaxPressure: 90,
    progressGoal: 2500,
    shelterNodes: [50],
    hasShelter: true,
    dayBonus: {
      fearDecayBonus: 0,
      lightCardBonus: 1.1,
      crowPressureLimit: 60,
    },
    nightPenalty: {
      extraFearPerTurn: 7,
      darkCardMultiplier: 1.5,
      crowPressureBoost: 10,
    },
    victoryText: 'You made it.',
    defeatHint: 'Tip: You are almost free. Sacrifice your fear points to Swap aggressively and push for the end.',
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

