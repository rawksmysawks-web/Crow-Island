/**
 * randomEvents.js — Choice-driven events triggered upon movement.
 *
 * RESTORED V2 DATA with Choice Agency.
 */

export const RANDOM_EVENTS = [
  {
    id: 'voices_v2',
    name: 'Voices',
    message: 'Did someone call your name? The shadows twist and fear grips you.',
    choices: [
      {
        text: 'Ignore and push forward',
        effect: { fearDelta: 5, progressDelta: 80, crowPressureDelta: 15 },
        journal: 'I heard voices in the grass. I didn’t stop to find out whose they were.'
      },
      {
        text: 'Stop and listen',
        effect: { fearDelta: 25, progressDelta: 0, crowPressureDelta: -5 },
        journal: 'I stopped to listen to the whispers. They sounded... familiar. It chilled me to the bone.'
      }
    ]
  },
  {
    id: 'wings_above_v2',
    name: 'Wings Above',
    message: 'Feathers fall around you. A massive shadow passes over the moon. It knows where you are.',
    choices: [
      {
        text: 'Hide in the corn',
        effect: { fearDelta: 15, progressDelta: -40, crowPressureDelta: -30 },
        journal: 'I dove for cover as a shadow passed overhead. I think it missed me.'
      },
      {
        text: 'Keep moving steadily',
        effect: { fearDelta: 10, progressDelta: 100, crowPressureDelta: 25 },
        journal: 'I didn’t let the shadow slow me down, even as the wings beat above.'
      }
    ]
  },
  {
    id: 'ash_v2',
    name: 'Smoldering Ash',
    message: 'A campfire, still warm. Someone was just here.',
    choices: [
      {
        text: 'Warm your hands',
        effect: { fearDelta: -30, progressDelta: 0, crowPressureDelta: 5 },
        journal: 'Found a warm campfire. The heat was real, even if the person who made it was gone.'
      },
      {
        text: 'Search for clues',
        effect: { fearDelta: 10, progressDelta: 50, crowPressureDelta: 10, clueId: 'camp_clue' },
        journal: 'Searched the campsite. Found a scrap of a uniform. One of ours?'
      }
    ]
  },
  {
    id: 'stumble_v2',
    name: 'Stumble',
    message: 'You trip in the dark! Progress lost as you scramble back up.',
    choices: [
      {
        text: 'Scramble up quickly',
        effect: { fearDelta: 20, progressDelta: -50, crowPressureDelta: 20 },
        journal: 'I fell and bruised my knee. The sound of my fall seemed so loud.'
      },
      {
        text: 'Recover carefully',
        effect: { fearDelta: 10, progressDelta: -100, crowPressureDelta: 5 },
        journal: 'I took my time getting back up. Slow is smooth, smooth is fast.'
      }
    ]
  },
  {
    id: 'supplies_v2',
    name: 'Abandoned Supplies',
    message: 'You find some old supplies. The sight calms you.',
    choices: [
      {
        text: 'Take medical kit',
        effect: { fearDelta: -40, progressDelta: 0, crowPressureDelta: 0 },
        journal: 'Found a medical kit. I feel a bit more prepared for whatever is out here.'
      },
      {
        text: 'Take protective gear',
        effect: { fearDelta: 0, progressDelta: 0, crowPressureDelta: 0, shieldDelta: 1 },
        journal: 'Found a reinforced jacket. It won’t stop a bullet, but it might stop a beak.'
      }
    ]
  }
];

export const rollRandomEvent = (phase) => {
  const roll = Math.random();
  let eventChance = 0;

  if (phase === 'day') eventChance = 0.15;
  else if (phase === 'dusk') eventChance = 0.25;
  else if (phase === 'night') eventChance = 0.40;

  if (roll < eventChance) {
    return RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  }

  return null;
};
