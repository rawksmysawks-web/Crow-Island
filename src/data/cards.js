/**
 * cards.js — Card definitions for Jack Brown's journey.
 * 
 * NO DARK CARDS. Only Movement, Light, and Shield cards as requested.
 */

// ─── MOVEMENT CARDS ──────────────────────────────────────────────────────────
export const MOVEMENT_CARDS = [
  {
    id: 'move_cautious',
    name: 'Cautious Move',
    type: 'movement',
    rarity: 'common',
    description: 'Keep your head down and stay quiet. Slow but safe.',
    flavorText: '"Step lightly. Let the shadows pass."',
    effect: { fearDelta: 12, progressDelta: 60, shieldDelta: 0, crowPressure: -2, special: null },
  },
  {
    id: 'move_jog',
    name: 'Jog',
    type: 'movement',
    rarity: 'common',
    description: 'Make steady progress forward without drawing too much attention.',
    flavorText: '"Just keep putting one foot in front of the other."',
    effect: { fearDelta: 22, progressDelta: 100, shieldDelta: 0, crowPressure: 5, special: null },
  },
  {
    id: 'move_sprint',
    name: 'Sprint',
    type: 'movement',
    rarity: 'rare',
    description: 'Run. Risk drawing the flock for solid progress.',
    flavorText: '"Don\'t look back. Just run."',
    effect: { fearDelta: 45, progressDelta: 200, shieldDelta: 0, crowPressure: 25, special: null },
  },
  {
    id: 'move_map',
    name: 'Consult Map',
    type: 'movement',
    rarity: 'rare',
    description: 'Take a smarter route. Solid progress, no pressure added.',
    flavorText: '"There has to be a path that avoids the open ground..."',
    effect: { fearDelta: 5, progressDelta: 150, shieldDelta: 0, crowPressure: 0, special: null },
  },
  {
    id: 'move_reckless',
    name: 'Reckless Dash',
    type: 'movement',
    rarity: 'legendary',
    description: 'Cover incredible ground completely panicked and blind.',
    flavorText: '"Crashing through the brush, ignoring the scratches!"',
    effect: { fearDelta: 80, progressDelta: 500, shieldDelta: 0, crowPressure: 50, special: null },
  },
];

// ─── LIGHT CARDS (SANITY) ────────────────────────────────────────────────────
export const LIGHT_CARDS = [
  {
    id: 'calm_nerves',
    name: 'Calm Nerves',
    type: 'light',
    rarity: 'common',
    description: 'Take a deep breath and rationalize. Reduce fear.',
    flavorText: '"It\'s just an island. I am a police officer. Get a grip."',
    effect: { fearDelta: -45, progressDelta: 0, shieldDelta: 0, crowPressure: 0, special: null },
  },
  {
    id: 'regain_focus',
    name: 'Regain Focus',
    type: 'light',
    rarity: 'common',
    description: 'Shake off the panic and orient yourself. Slight progress.',
    flavorText: '"Focus on the clues. The scratch marks. Look for the path."',
    effect: { fearDelta: -30, progressDelta: 50, shieldDelta: 0, crowPressure: -5, special: null },
  },
  {
    id: 'steady_yourself',
    name: 'Steady Yourself',
    type: 'light',
    rarity: 'rare',
    description: 'Massive fear reduction. Clear your mind completely.',
    flavorText: '"Jack Brown had faced worse. Or so he told himself."',
    effect: { fearDelta: -80, progressDelta: 0, shieldDelta: 0, crowPressure: 0, special: null },
  },
  {
    id: 'lantern_glare',
    name: 'Lantern Glare',
    type: 'light',
    rarity: 'common',
    description: 'Shine the light into the darkness. Keeps predators away.',
    flavorText: '"The beam cuts through the dark like a knife."',
    effect: { fearDelta: -10, progressDelta: 0, shieldDelta: 0, crowPressure: -25, special: null },
  },
];

// ─── SHIELD CARDS (PROTECTION) ───────────────────────────────────────────────
export const SHIELD_CARDS = [
  {
    id: 'brace',
    name: 'Brace for Impact',
    type: 'shield',
    rarity: 'rare',
    description: 'Gain 1 Shield. Protects against capture or devastation.',
    flavorText: '"Stand your ground. Whatever it is, it bleeds."',
    effect: { fearDelta: 0, progressDelta: 0, shieldDelta: 1, crowPressure: 0, special: null },
  },
  {
    id: 'hide_shadows',
    name: 'Hide in Shadows',
    type: 'shield',
    rarity: 'legendary',
    description: 'Gain 1 Shield. The crow loses your scent completely.',
    flavorText: '"Hold your breath. Don\'t even blink."',
    effect: { fearDelta: -10, progressDelta: 0, shieldDelta: 1, crowPressure: -25, special: null },
  },
  {
    id: 'barricade',
    name: 'Barricade',
    type: 'shield',
    rarity: 'rare',
    description: 'Gain 1 Shield, but lose some progress setting it up.',
    flavorText: '"Pull the heavy wooden door shut. Let it scratch."',
    effect: { fearDelta: -5, progressDelta: -5, shieldDelta: 1, crowPressure: -10, special: null },
  },
];

// ─── PANIC CARDS (CURSES) ────────────────────────────────────────────────────
export const PANIC_CARD = {
  id: 'panic',
  name: 'PANIC',
  type: 'dark',
  rarity: 'common',
  description: 'Fear has taken hold. You waste time trying to breathe.',
  flavorText: '"Your hands are shaking too much to hold the map."',
  effect: { fearDelta: -5, progressDelta: -5, shieldDelta: 0, crowPressure: 5, special: null },
};

// ─── HYBRID CARDS (RARE COMBOS) ────────────────────────────────────────────────
export const HYBRID_CARDS = [
  {
    id: 'hybrid_torch',
    name: 'Ultra Bright Torch',
    type: 'shield', // Treated visually as a shield card
    rarity: 'legendary',
    image: require('../../assets/images/cards/card_art_torch.png'),
    description: 'Dazzle whatever is crossing your path. Progress, defend, and calm down.',
    flavorText: '"The halogen beam briefly blinded whatever was waiting in the shadows."',
    effect: { fearDelta: -15, progressDelta: 50, shieldDelta: 1, crowPressure: -20, special: null },
  },
  {
    id: 'hybrid_adrenaline',
    name: 'Adrenaline Surge',
    type: 'movement', // Treated visually as a movement card
    rarity: 'legendary',
    image: require('../../assets/images/cards/card_art_adrenaline.png'),
    description: 'A burst of terrified speed. Massive progress without the panic.',
    flavorText: '"His heart hammered, but his legs knew exactly what to do."',
    effect: { fearDelta: -10, progressDelta: 800, shieldDelta: 0, crowPressure: -5, special: null },
  },
];

// ─── ALL CARDS COMBINED ───────────────────────────────────────────────────────
export const ALL_CARDS = [...MOVEMENT_CARDS, ...LIGHT_CARDS, ...SHIELD_CARDS, ...HYBRID_CARDS, PANIC_CARD];

/**
 * Get a card by ID
 */
export const getCardById = (id) => ALL_CARDS.find((c) => c.id === id);

/**
 * Build a global deck for the entire game.
 * HARDCORE RULES:
 * - Exactly 1 'move_reckless' (Legendary)
 * - Exactly 1 Shield card (user choice)
 * - Exactly 1 Hybrid Card (Legendary)
 * - High density of Movement cards
 */
export const buildGlobalDeck = (deckSize = 30) => {
  const deck = [];
  
  // 1. Mandatory Legendary Movement
  const reckless = MOVEMENT_CARDS.find(c => c.id === 'move_reckless');
  deck.push({ ...reckless });

  // 2. Exact Shield Scarcity (Exactly 1)
  const startingShield = SHIELD_CARDS[Math.floor(Math.random() * SHIELD_CARDS.length)];
  deck.push({ ...startingShield });

  // 3. Guaranteed Hybrid Card (Exactly 1)
  const hybrid = HYBRID_CARDS[Math.floor(Math.random() * HYBRID_CARDS.length)];
  deck.push({ ...hybrid });

  // 4. High Density Movement (Remaining up to 75% total movement/legendary/shield)
  const movePool = MOVEMENT_CARDS.filter(c => c.id !== 'move_reckless');
  while (deck.length < Math.floor(deckSize * 0.75)) { 
    const m = movePool[Math.floor(Math.random() * movePool.length)];
    deck.push({ ...m });
  }

  // 5. Trace Sanity Relief (Remainder filled with common cards)
  const commonPool = [...movePool, ...LIGHT_CARDS.filter(c => c.rarity === 'common')];
  while (deck.length < deckSize) {
    const c = commonPool[Math.floor(Math.random() * commonPool.length)];
    deck.push({ ...c });
  }

  return deck;
};
