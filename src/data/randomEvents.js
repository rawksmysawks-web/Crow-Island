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
      type: 'good',
      message: 'You discover a faster route. You make extra progress.',
      effect: { progressDelta: 15, fearDelta: 0, shieldDelta: 0, crowPressure: 0 }
    },
    {
      id: 'found_supplies',
      name: 'Supplies',
      type: 'good',
      message: 'You find some old supplies. The sight calms you.',
      effect: { progressDelta: 0, fearDelta: -10, shieldDelta: 0, crowPressure: 0 }
    },
    {
      id: 'campfire_stumbled',
      name: 'Smoldering Ash',
      type: 'good',
      message: 'A campfire, still warm. You take a brief moment of rest.',
      effect: { progressDelta: 0, fearDelta: -15, shieldDelta: 0, crowPressure: -5 }
    },
    {
      id: 'temporary_buff',
      name: 'Adrenaline',
      type: 'good',
      message: 'A sudden burst of energy. You push forward.',
      effect: { progressDelta: 10, fearDelta: -5, shieldDelta: 0, crowPressure: 0 }
    },
    {
      id: 'found_map',
      name: 'Old Map',
      type: 'good',
      message: 'You find a crude map of the island. You draw an extra card.',
      effect: { progressDelta: 0, fearDelta: 0, shieldDelta: 0, crowPressure: -5, cardRewardDelta: 1 }
    },
    {
      id: 'extra_supplies',
      name: 'Hidden Cache',
      type: 'good',
      message: 'A small cache of useful items. You draw an extra card.',
      effect: { progressDelta: 0, fearDelta: -5, shieldDelta: 0, crowPressure: 0, cardRewardDelta: 1 }
    },
    {
      id: 'safe_route',
      name: 'Hidden Path',
      type: 'good',
      message: 'The woods offer a brief sanctuary from the eyes above.',
      effect: { progressDelta: 15, fearDelta: 0, shieldDelta: 0, crowPressure: -15, cardRewardDelta: 0 }
    },
  ],
  bad: [
    {
      id: 'hallucination',
      name: 'Voices',
      type: 'bad',
      message: 'Did someone call your name? The shadows twist. What do you do?',
      choices: [
        { text: 'Run away blind', effect: { progressDelta: -10, fearDelta: 5, crowPressure: 0 } },
        { text: 'Listen closer', effect: { progressDelta: 0, fearDelta: 15, crowPressure: 5 } }
      ]
    },
    {
      id: 'fear_spike',
      name: 'Shadows Stretch',
      type: 'bad',
      message: 'The dark feels suffocating. Panic rises. How do you respond?',
      choices: [
        { text: 'Take a deep breath', effect: { progressDelta: 0, fearDelta: 20, crowPressure: 0 } },
        { text: 'Hurry forward', effect: { progressDelta: 10, fearDelta: 25, crowPressure: 5 } }
      ]
    },
    {
      id: 'crow_closer',
      name: 'Wings Above',
      type: 'bad',
      message: 'Feathers fall around you. It knows where you are. Do you hide or run?',
      choices: [
        { text: 'Hide quietly', effect: { progressDelta: -10, fearDelta: 5, crowPressure: 10 } },
        { text: 'Run fast', effect: { progressDelta: 0, fearDelta: 10, crowPressure: 20 } }
      ]
    },
    {
      id: 'stumble',
      name: 'Stumble',
      type: 'bad',
      message: 'You trip in the dark! What do you do?',
      choices: [
        { text: 'Lose ground', effect: { progressDelta: -15, fearDelta: 5, crowPressure: 5 } },
        { text: 'Panic to recover', effect: { progressDelta: 0, fearDelta: 15, crowPressure: 10 } }
      ]
    },
    {
      id: 'disorientation',
      name: 'Lost',
      type: 'bad',
      message: 'You got turned around in the brush. You waste time. Which way?',
      choices: [
        { text: 'Guess wildly', effect: { progressDelta: -10, fearDelta: 12, crowPressure: 10 } },
        { text: 'Stop and reorient', effect: { progressDelta: -20, fearDelta: 5, crowPressure: 5 } }
      ]
    },
    {
      id: 'environmental_tension',
      name: 'Rustling',
      type: 'bad',
      message: 'Something heavy moves through the corn just out of sight. Do you look?',
      choices: [
        { text: 'Look into the dark', effect: { progressDelta: 0, fearDelta: 15, crowPressure: 2 } },
        { text: 'Ignore and push on', effect: { progressDelta: 0, fearDelta: 5, crowPressure: 15 } }
      ]
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
