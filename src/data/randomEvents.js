/**
 * randomEvents.js — Choice-driven events triggered upon movement.
 *
 * This version gives players more agency by offering choices for each triggered event.
 */

export const RANDOM_EVENTS = [
  {
    id: 'voices_in_shadow',
    name: 'Voices',
    message: 'Did someone call your name? A whisper drifts from the tall grass.',
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
      },
      {
        text: 'Shout into the dark',
        effect: { fearDelta: 50, progressDelta: 150, crowPressureDelta: 30 },
        journal: 'I lost my temper and shouted back. The silence that followed was worse than the whispers.'
      }
    ]
  },
  {
    id: 'smoldering_ash',
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
      },
      {
        text: 'Extinguish it safely',
        effect: { fearDelta: 5, progressDelta: 0, crowPressureDelta: -20 },
        journal: 'Put out the fire. Better not to lead the crows straight to a light source.'
      }
    ]
  },
  {
    id: 'the_wings_above',
    name: 'Wings Above',
    message: 'A massive shadow passes over the moon. The flapping is deafening.',
    choices: [
      {
        text: 'Hide in the brush',
        effect: { fearDelta: 15, progressDelta: -50, crowPressureDelta: -30 },
        journal: 'I dove for cover as a shadow passed overhead. I think it missed me.'
      },
      {
        text: 'Keep moving steadily',
        effect: { fearDelta: 10, progressDelta: 100, crowPressureDelta: 20 },
        journal: 'I didn’t let the shadow slow me down, even as the wings beat above.'
      }
    ]
  },
  {
    id: 'abandoned_shed',
    name: 'Dilapidated Shed',
    message: 'A small wooden structure stands alone in the field. The door creaks.',
    choices: [
      {
        text: 'Go inside to rest',
        effect: { fearDelta: -40, progressDelta: 0, crowPressureDelta: -10, journal: 'Rested in a shed. It smelled of old grain and fear.' },
      },
      {
        text: 'Rummage through tools',
        effect: { fearDelta: 10, progressDelta: 0, crowPressureDelta: 15, shieldDelta: 1 },
        journal: 'Found some scrap metal in the shed. I can use this to brace myself.'
      },
      {
        text: 'Check the walls for writing',
        effect: { fearDelta: 20, progressDelta: 0, crowPressureDelta: 0, clueId: 'shed_writing' },
        journal: 'The walls were covered in frantic scribbles: "THEY HEAR THE HEARTBEAT."'
      }
    ]
  },
  {
    id: 'sudden_adrenaline',
    name: 'Panic or Resolve',
    message: 'Your heart hammers against your ribs. You feel a sudden surge of energy.',
    choices: [
      {
        text: 'Run like hell',
        effect: { fearDelta: 40, progressDelta: 300, crowPressureDelta: 40 },
        journal: 'I just ran. I didn’t think. I just ran until my lungs burned.'
      },
      {
        text: 'Breathe and focus',
        effect: { fearDelta: -50, progressDelta: 50, crowPressureDelta: -10 },
        journal: 'I forced myself to breathe. Slow. In. Out. The island felt smaller after that.'
      }
    ]
  }
];

/**
 * Roll for a random event based on phase probabilities.
 */
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
