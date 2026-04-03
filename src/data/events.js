/**
 * events.js — Story events for Crow Island
 *
 * Each event is triggered when progress hits a threshold in a specific level.
 * Events show as a StoryPopup overlay.
 *
 * Shape:
 * {
 *   id:           string
 *   levelId:      string  — which level this belongs to (mapped from levels.js)
 *   trigger:      number  — progress% (0-100) to trigger at
 *   title:        string  — popup title
 *   body:         string  — flavour text shown in popup
 *   asset:        string | null — image key from StoryPopup's EVENT_ASSETS map
 *   choices:      array | null — branching story choices [{ text, effect: { fearDelta, progressDelta, crowPressureDelta, journal } }]
 *   icon:         string | null — emoji icon shown if no asset is provided
 *   fearDelta:    number  — instant fear change
 *   crowPressure: number  — instant crow pressure change
 *   isJournal:    boolean — adds a short entry to the Journal
 * }
 */

export const STORY_EVENTS = [
  // ─── LEVEL 1: ARRIVAL ──────────────────────────────────────────────────────
  {
    id: 'arrival_dock',
    levelId: 'arrival',
    trigger: 0,
    title: 'Crow Island',
    body: 'Your boat cuts through grey water. Ahead, an island — a smudge of dark fields and old buildings. You grip the message in your pocket. Someone sent it. Someone wanted you here.\n\nThis place is already wrong.',
    asset: 'event_dock',
    fearDelta: 0,
    crowPressure: 0,
    isJournal: true,
  },
  {
    id: 'arrival_path',
    levelId: 'arrival',
    trigger: 35,
    title: 'The Overgrown Path',
    body: 'A single dirt track leads away from the salt-licked dock. The weeds here are waist-high, clutching at your trousers like desperate hands. You find a discarded boot half-buried in the mud.\n\nIt is empty. But the laces are still knotted.',
    asset: 'event_path',
    fearDelta: 10,
    crowPressure: 5,
    isJournal: true,
  },
  {
    id: 'arrival_shore',
    levelId: 'arrival',
    trigger: 70,
    title: 'First Steps',
    body: 'The island is quiet. Too quiet for a place this size. Farm land stretches ahead — crops unharvested, gates hanging open. A crow watches you from a fence post.\n\nJust a crow.',
    asset: 'event_first_steps',
    fearDelta: 5,
    crowPressure: 3,
    isJournal: true,
  },

  // ─── LEVEL 2: THE FARMS ────────────────────────────────────────────────────
  {
    id: 'farm_silence',
    levelId: 'the_farms',
    trigger: 20,
    title: 'The Farms',
    body: 'The fields are full of food — cabbages, grain, old root vegetables. But no workers. No animals. Just rows and rows of untouched crops and the distant creak of an unlatched gate.',
    asset: 'event_silence',
    fearDelta: 8,
    crowPressure: 3,
    isJournal: true,
  },
  {
    id: 'village_photo',
    levelId: 'the_farms',
    trigger: 25,
    title: 'A Scratched Photo',
    body: 'Inside a discarded mailbox, you find a framed photograph. A family stands before the barn — mother, father, two children. Their eyes have been methodically scratched out with something sharp. On the back, a single word is scrawled in black ink: "CONVERTED."',
    asset: 'event_photo',
    isJournal: true,
    fearDelta: 15,
    clueId: 'clue_village_past',
  },
  {
    id: 'farm_tractor',
    levelId: 'the_farms',
    trigger: 40,
    title: 'The Ruined Tractor',
    body: 'An old rusted tractor sits half-sunk in the mud. Someone has aggressively scratched a crude, spiraling symbol into the rusted metal. Looking at it makes your head ache.',
    asset: 'event_tractor',
    fearDelta: 12,
    crowPressure: 5,
    isJournal: true,
  },
  {
    id: 'farm_supplies',
    levelId: 'the_farms',
    trigger: 50,
    title: 'Hidden Supplies',
    body: 'Tucked beneath a collapsed cart, you find a rusted metal box. The latch is stiff, but inside are untouched provisions. A rare moment of relief.',
    asset: 'event_supplies',
    fearDelta: -15,
    crowPressure: 0,
    cardRewardDelta: 1,
    isJournal: false,
  },
  {
    id: 'farm_crows',
    levelId: 'the_farms',
    trigger: 65,
    title: 'Not Just Crows',
    body: 'There are too many of them now. Dozens of crows line the fences, the rooftops, the bare branches of a dead oak. They are all watching you. None of them have moved. None of them have made a sound.',
    asset: 'event_crows',
    fearDelta: 15,
    crowPressure: 10,
    isJournal: false,
  },

  // ─── LEVEL 3: THE SHED ────────────────────────────────────────────────────
  {
    id: 'shed_entrance',
    levelId: 'the_shed',
    trigger: 10,
    title: 'The Shed: "Day = safe."',
    body: 'The building sits at the centre of the farm. Inside, carved frantic and deep into the floorboards, you find the warning Miller mentioned in his notes:\n\n"DAY = SAFE.\nNIGHT = RUN."\n\nThe air in here is stale, smelling of old oil and something metallic.',
    asset: 'event_shed',
    fearDelta: 20,
    crowPressure: 8,
    isJournal: true,
    clueId: 'clue_warning',
  },
  {
    id: 'shed_map',
    levelId: 'the_shed',
    trigger: 30,
    title: 'The Hand-Drawn Map',
    body: 'Pinned to a workbench under a layer of dust is a crude map of the island. Most of it is marked with frantic "X"s. One spot in the deep forest is circled repeatedly. The label is smudged, but you can make out the words: "THE PIT."',
    asset: 'event_map',
    isJournal: true,
    fearDelta: 10,
    clueId: 'clue_ritual_map',
  },
  {
    id: 'shed_scratches',
    levelId: 'the_shed',
    trigger: 50,
    title: 'Scratch Marks',
    body: 'The walls are covered in scratch marks. Low down at first — knee height, then waist height. Then higher. Much higher than any person should be able to reach.\n\nUnless they were climbing.',
    asset: 'event_scratches',
    fearDelta: 20,
    crowPressure: 8,
    isJournal: true,
  },
  {
    id: 'shed_cellar_door',
    levelId: 'the_shed',
    trigger: 80,
    title: 'Under the Floorboards',
    body: 'You step on a loose plank. It shifts, revealing a dark hollow beneath the shed. A cold draft blows up, carrying the smell of wet earth and copper.\n\nSomething shifts heavily down there in the dark.',
    asset: 'event_floorboards',
    fearDelta: 25,
    crowPressure: 0,
    isJournal: false,
  },

  // ─── LEVEL 4: THE WARNING ─────────────────────────────────────────────────
  {
    id: 'warning_message',
    levelId: 'the_warning',
    trigger: 15,
    title: 'It Finds You in the Dark',
    body: 'The sun is properly gone now. You thought you understood the warning.\n\nYou were wrong.\n\nThe scratching on the walls outside is not random. It follows you room to room.',
    asset: 'event_scratching',
    fearDelta: 25,
    crowPressure: 12,
    isJournal: true,
  },
  {
    id: 'victim_necklace',
    levelId: 'the_warning',
    trigger: 30,
    title: 'The Silver Locket',
    body: 'Hanging from a low branch is a silver locket. Inside is a small, damp portrait of a man in a police uniform. The engraving on the back reads: "To Miller, Love Sarah." This matches the badge you heard about. He didn\'t just vanish; he was hunted.',
    asset: 'event_locket',
    isJournal: true,
    fearDelta: 15,
    clueId: 'clue_miller_connection',
  },
  {
    id: 'warning_feathers',
    levelId: 'the_warning',
    trigger: 45,
    title: 'A Trail of Feathers',
    body: 'A trail of massive black feathers leads off the main path and into the thick bushes. They are wet.\n\nYou hear a low, wet tearing sound in the distance. The air feels freezing.',
    asset: 'event_feathers',
    fearDelta: 18,
    crowPressure: 10,
    isJournal: true,
  },
  {
    id: 'forest_totem',
    levelId: 'the_warning',
    trigger: 60,
    title: 'The Bone Totem',
    body: 'In a small clearing, you find a stack of bleached bones and crow feathers tied together with human hair. It shouldn\'t be able to stand, yet it does. As you approach, your teeth begin to ache, and the air hums with a low, nauseating frequency.',
    asset: 'event_totem',
    isJournal: true,
    fearDelta: 25,
    clueId: 'clue_monstrous_nature',
  },
  {
    id: 'sunset_warning',
    levelId: 'the_warning',
    trigger: 70,
    title: 'The Light is Fading',
    body: 'The sky turns the colour of a bruise. Amber to red to something else. The crows have gone quiet.\n\nThat is somehow worse.',
    asset: 'event_red_sky',
    fearDelta: 20,
    crowPressure: 15,
    isJournal: false,
  },

  // ─── LEVEL 5: NIGHT HUNT ─────────────────────────────────────────────────
  {
    id: 'first_silhouette',
    levelId: 'night_hunt',
    trigger: 10,
    title: 'You See It',
    body: 'At the treeline. A shape. Tall. Wrong. Human shoulders, but a head that tilts sideways like a bird. Arms too long. Fingers too thin.\n\nIt is looking straight at you.\n\nRun.',
    asset: 'event_see_it',
    fearDelta: 30,
    crowPressure: 25,
    isJournal: true,
  },
  {
    id: 'chapel_bell',
    levelId: 'night_hunt',
    trigger: 35,
    title: 'The Cracked Bell',
    body: 'You climb the belfry of the old roadside chapel. The massive bronze bell is cracked down the middle. Inside, someone has stuffed hundreds of black feathers and a tattered police uniform. Not yours...',
    choices: [
      {
        text: 'Climb down quickly',
        effect: { fearDelta: 10, progressDelta: 5, crowPressureDelta: 5 },
      },
      {
        text: 'Search the uniform',
        effect: { 
          fearDelta: 20, 
          progressDelta: 0, 
          crowPressureDelta: 0, 
          journal: 'I found a badge in the belfry. Badge #402. That\'s Miller. He vanished six months ago.',
          clueId: 'clue_missing_officer'
        },
      },
    ],
    asset: 'event_bell',
    isJournal: true,
  },
  {
    id: 'chapel_ledger',
    levelId: 'night_hunt',
    trigger: 65,
    title: 'The Priest\'s Ledger',
    body: 'Beneath the altar, you find a leather-bound book. The entries aren\'t for tithes or prayers. They are a list of names, dates, and "Yields". Your name is on the last page. Dated for tonight.',
    choices: [
      {
        text: 'Take the book as evidence (+Fear)',
        effect: { 
          fearDelta: 25, 
          progressDelta: 10, 
          crowPressureDelta: 15, 
          journal: 'The islanders were sacrificing people. My name is on the list.',
          clueId: 'clue_sacrifices'
        },
      },
      {
        text: 'Leave it and run',
        effect: { fearDelta: 5, progressDelta: 20, crowPressureDelta: 5 },
      },
    ],
    asset: 'event_ledger',
    isJournal: true,
  },
  {
    id: 'ancient_script',
    levelId: 'night_hunt',
    trigger: 75,
    title: 'The Ancient Script',
    body: 'Behind a loose stone in the crypt, you find a carving. It describes the "Crow Men" not as monsters, but as a "Harvest". They were once men, transformed by the island\'s hunger.',
    asset: 'event_script',
    isJournal: true,
    fearDelta: 15,
    crowPressure: 5,
    clueId: 'clue_harvest',
  },
  {
    id: 'night_wings',
    levelId: 'night_hunt',
    trigger: 85,
    title: 'Wings',
    body: 'You hear wings overhead. Not the soft flap of a bird — something heavier. Something that knows where you are.\n\n"Night = run."\n\nYou understand now.',
    asset: 'event_wings',
    fearDelta: 22,
    crowPressure: 20,
    isJournal: false,
  },

  // ─── LEVEL 6: ESCAPE ─────────────────────────────────────────────────────
  {
    id: 'shore_in_sight',
    levelId: 'escape',
    trigger: 30,
    title: 'The Shore',
    body: 'You can see the water. The dock. Your boat.\n\nThe island does not want you to leave.',
    asset: 'event_shore',
    fearDelta: 15,
    crowPressure: 30,
    isJournal: true,
  },
  {
    id: 'final_revelation',
    levelId: 'escape',
    trigger: 60,
    title: 'The Message\'s Source',
    body: 'You realize why you were called here. The message wasn\'t a plea for help. It was an invitation. A replacement was needed.',
    asset: 'event_message',
    isJournal: true,
    fearDelta: 20,
    crowPressure: 10,
    clueId: 'clue_invitation',
  },
  {
    id: 'final_confrontation',
    levelId: 'escape',
    trigger: 80,
    title: 'It Comes',
    body: 'Behind you — the sound of wings and breaking wood. The creature is not hiding now.\n\nThe dock is twenty seconds away.\n\nRun.',
    asset: 'event_it_comes',
    fearDelta: 20,
    crowPressure: 35,
    isJournal: false,
  },
];

/**
 * Get all events for a specific level, sorted by trigger point.
 * @param {string} levelId
 * @returns {object[]}
 */
export const getEventsForLevel = (levelId) =>
  STORY_EVENTS
    .filter((e) => e.levelId === levelId || e.levelId === 'any')
    .sort((a, b) => a.trigger - b.trigger);

/**
 * Find the event that should fire at the given progress threshold.
 * @param {object[]} levelEvents  — events for the current level
 * @param {number}   progress     — current progress 0-100
 * @param {string[]} seen         — ids already triggered
 * @returns {object|null}
 */
export const getNextEvent = (levelEvents, progress, seen) =>
  levelEvents.find((e) => progress >= e.trigger && !seen.includes(e.id)) ?? null;
