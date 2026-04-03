/**
 * randomEvents.js — Good and bad events triggered upon movement.
 *
 * Replaces the old "Dark Card" system.
 */

export const RANDOM_EVENTS = {
  good: [
    {
      id: 'bonus_movement',
      name: 'Clear Path',
      asset: 'event_clear_path',
      type: 'good',
      message: 'You discover a faster route. You make extra progress.',
      effect: { progressDelta: 150, fearDelta: 0, shieldDelta: 0, crowPressure: 0 }
    },
    {
      id: 'found_supplies',
      name: 'Supplies',
      asset: 'event_supplies',
      type: 'good',
      message: 'You find some old supplies. The sight calms you and you find something useful.',
      effect: { progressDelta: 0, fearDelta: -25, shieldDelta: 0, crowPressure: 0, cardRewardDelta: 1 }
    },
    {
      id: 'campfire_stumbled',
      name: 'Smoldering Ash',
      asset: 'event_ash',
      type: 'good',
      message: 'A campfire, still warm. You take a brief moment of rest.',
      effect: { progressDelta: 0, fearDelta: -35, shieldDelta: 0, crowPressure: -10 }
    },
    {
      id: 'temporary_buff',
      name: 'Adrenaline',
      asset: 'event_adrenaline',
      type: 'good',
      message: 'A sudden burst of energy. You push forward.',
      effect: { progressDelta: 120, fearDelta: -10, shieldDelta: 0, crowPressure: 0 }
    },
    {
      id: 'found_map',
      name: 'Old Map',
      asset: 'event_old_map',
      type: 'good',
      message: 'You find a crude map of the island. You draw an extra card.',
      effect: { progressDelta: 0, fearDelta: 0, shieldDelta: 0, crowPressure: -5, cardRewardDelta: 1 }
    },
    {
      id: 'hidden_cache_legendary',
      name: 'Hidden Cache',
      asset: 'event_cache',
      type: 'good',
      message: 'A legendary cache of top-tier equipment! You found something powerful.',
      effect: { 
        progressDelta: 0, 
        fearDelta: -10, 
        shieldDelta: 0, 
        crowPressure: 0, 
        cardRewardDelta: 1,
        cardRewardType: 'hybrid' // Specialized reward specifically for this event
      }
    },
    {
      id: 'safe_route',
      name: 'Hidden Path',
      asset: 'event_hidden_path',
      type: 'good',
      message: 'The woods offer a brief sanctuary from the eyes above. You make safe progress.',
      effect: { progressDelta: 150, fearDelta: -15, shieldDelta: 0, crowPressure: -20, cardRewardDelta: 0 }
    },
  ],
  bad: [
    {
      id: 'hallucination',
      name: 'Voices',
      asset: 'event_voices',
      type: 'bad',
      message: 'Did someone call your name? The shadows twist and fear grips you.',
      effect: { progressDelta: 0, fearDelta: 25, shieldDelta: 0, crowPressure: 10 }
    },
    {
      id: 'fear_spike',
      name: 'Shadows Stretch',
      asset: 'event_fear_spike',
      type: 'bad',
      message: 'The dark feels suffocating. Panic rises as shadows loom.',
      effect: { progressDelta: 0, fearDelta: 35, shieldDelta: 0, crowPressure: 0 }
    },
    {
      id: 'crow_closer',
      name: 'Wings Above',
      asset: 'event_wings',
      type: 'bad',
      message: 'Feathers fall around you. It knows where you are.',
      effect: { progressDelta: 0, fearDelta: 12, shieldDelta: 0, crowPressure: 35 }
    },
    {
      id: 'stumble',
      name: 'Stumble',
      asset: 'event_stumble',
      type: 'bad',
      message: 'You trip in the dark! Progress lost as you scramble back up.',
      effect: { progressDelta: -120, fearDelta: 15, shieldDelta: 0, crowPressure: 10 }
    },
    {
      id: 'disorientation',
      name: 'Lost',
      asset: 'event_lost',
      type: 'bad',
      message: 'You got turned around in the brush. You waste time.',
      effect: { progressDelta: -80, fearDelta: 18, shieldDelta: 0, crowPressure: 15 }
    },
    {
      id: 'environmental_tension',
      name: 'Rustling',
      asset: 'event_rustling',
      type: 'bad',
      message: 'Something heavy moves through the corn just out of sight.',
      effect: { progressDelta: 0, fearDelta: 25, shieldDelta: 0, crowPressure: 15 }
    },
  ],
};

/**
 * Roll for a random event based on phase probabilities.
 * @param {'day'|'dusk'|'night'} phase 
 * @returns {object|null} The event object, or null if no event occurs.
 */
export const rollRandomEvent = (phase) => {
  const roll = Math.random();
  let goodChance = 0;
  let badChance = 0;

  if (phase === 'day') {
    goodChance = 0.35; // 35% chance for good event
    badChance = 0.10;  // 10% chance for bad event
  } else if (phase === 'dusk') {
    goodChance = 0.20;
    badChance = 0.30;
  } else if (phase === 'night') {
    goodChance = 0.05; // very rare
    badChance = 0.45; // 45% chance for bad event at night
  }

  if (roll < goodChance) {
    const list = RANDOM_EVENTS.good;
    return list[Math.floor(Math.random() * list.length)];
  } else if (roll < goodChance + badChance) {
    const list = RANDOM_EVENTS.bad;
    return list[Math.floor(Math.random() * list.length)];
  }

  return null; // no event
};
