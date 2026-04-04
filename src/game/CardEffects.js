/**
 * CardEffects.js — Resolve a played card against the current game state.
 *
 * `resolveCard` is a pure function that takes the current state and a card,
 * and returns a state DELTA (not a full new state — handled by GameContext reducer).
 *
 * Special effects:
 *   'journal_entry'    — add story note to journal
 *   'shelter_reset'    — if at shelterNode, reset fear to 0 + show campfire
 *   'hallucinate'      — temporarily distorts UI (flag set)
 *   'force_day'        — temporarily revert phase to 'day'
 *   'reduce_next_dark' — next dark card has halved effect
 *   'reduce_visibility'— adds dark overlay flag
 *   'corrupt_card'     — randomly corrupts a light card in hand
 *   'nightmare'        — breaks shields + fear spike (handled via deltas)
 */

import { FEAR_MAX } from './FearSystem';

/**
 * Resolve a card and return state deltas.
 *
 * @param {object} card       — card definition from cards.js
 * @param {object} state      — current game state from GameContext
 * @param {object} level      — current level definition from levels.js
 * @returns {object}          — delta object to merge into state
 */
export const resolveCard = (card, state, level) => {
  if (card.corrupted) {
    // Corrupted cards are discarded without effect
    return { message: 'The card crumbles. It does nothing.', fearDelta: 0, progressDelta: 0 };
  }

  const isNight = state.phase === 'night';
  const isDay = state.phase === 'day';

  let { fearDelta, progressDelta, shieldDelta, crowPressure, special } = card.effect;

  // ── Phase multipliers ──────────────────────────────────────────────────────
  if (card.type === 'dark') {
    const mult = isNight ? (level.nightPenalty?.darkCardMultiplier ?? 1.0) : 1.0;
    fearDelta = Math.round(fearDelta * mult);
    crowPressure = Math.round((crowPressure ?? 0) * mult);
    progressDelta = Math.round(progressDelta * mult);
  }

  if (card.type === 'light' && isDay) {
    const mult = level.dayBonus?.lightCardBonus ?? 1.0;
    progressDelta = Math.round(progressDelta * mult);
    fearDelta = Math.round(fearDelta * mult); // negative × multiplier = more fear reduction
  }

  // ── Shield absorption ──────────────────────────────────────────────────────
  if (card.type === 'dark' && state.shield > 0 && shieldDelta === 0) {
    // Shield blocks this dark card's fear — absorb it
    return {
      fearDelta: 0,
      progressDelta: 0,
      crowPressureDelta: 0,
      shieldDelta: -1,                // consume one shield charge
      special: null,
      message: 'Your shield absorbs the danger.',
      corruptCardId: null,
    };
  }

  // ── Next-dark reduction flag ────────────────────────────────────────────────
  if (card.type === 'dark' && state.nextDarkReduced) {
    fearDelta = Math.round(fearDelta * 0.5);
    crowPressure = Math.round((crowPressure ?? 0) * 0.5);
  }

  // ── Shelter special ────────────────────────────────────────────────────────
  if (special === 'shelter_reset') {
    const atShelter = isAtShelterNode(state.progress, level.shelterNodes);
    if (atShelter) {
      return {
        fearDelta: -FEAR_MAX,          // full reset (will be clamped to 0)
        progressDelta: progressDelta,
        crowPressureDelta: crowPressure ?? 0,
        shieldDelta,
        special: 'shelter_reset',
        message: 'The firelight drives back the dark. Fear fades.',
        corruptCardId: null,
      };
    } else {
      // Minor effect only — not at a shelter
      return {
        fearDelta: Math.round(fearDelta * 0.3), // only partial effect
        progressDelta: 5,
        crowPressureDelta: -5,
        shieldDelta: 0,
        special: null,
        message: 'No shelter here. The card has little effect.',
        corruptCardId: null,
      };
    }
  }

  // ── Corrupt card special ────────────────────────────────────────────────────
  let corruptCardId = null;
  if (special === 'corrupt_card') {
    const lightCards = state.hand.filter(
      (c) => c.id !== card.id && c.type === 'light' && !c.corrupted,
    );
    if (lightCards.length > 0) {
      const target = lightCards[Math.floor(Math.random() * lightCards.length)];
      corruptCardId = target.id;
    }
  }

  return {
    fearDelta,
    progressDelta,
    crowPressureDelta: crowPressure ?? 0,
    shieldDelta: shieldDelta ?? 0,
    special,
    message: getCardMessage(card, state),
    corruptCardId,
  };
};

/**
 * Preview effective card values without applying state changes or specials.
 * @param {object} card 
 * @param {object} state 
 * @param {object} level 
 * @returns {object} { fearDelta, progressDelta, crowPressureDelta }
 */
export const previewCard = (card, state, level) => {
  if (card.corrupted) return { fearDelta: 0, progressDelta: 0, crowPressureDelta: 0, shieldDelta: 0 };
  
  const isNight = state.phase === 'night';
  const isDay = state.phase === 'day';
  let { fearDelta, progressDelta, shieldDelta, crowPressure } = card.effect;

  if (card.type === 'dark') {
    const mult = isNight ? (level.nightPenalty?.darkCardMultiplier ?? 1.0) : 1.0;
    fearDelta = Math.round(fearDelta * mult);
    crowPressure = Math.round((crowPressure ?? 0) * mult);
    progressDelta = Math.round(progressDelta * mult);
    
    if (state.nextDarkReduced) {
        fearDelta = Math.round(fearDelta * 0.5);
        crowPressure = Math.round((crowPressure ?? 0) * 0.5);
    }
  }

  if (card.type === 'light' && isDay) {
    const mult = level.dayBonus?.lightCardBonus ?? 1.0;
    progressDelta = Math.round(progressDelta * mult);
    fearDelta = Math.round(fearDelta * mult);
  }

  return {
    fearDelta,
    progressDelta,
    crowPressureDelta: crowPressure ?? 0,
    shieldDelta: shieldDelta ?? 0,
  };
};

/**
 * Check if the current progress is within range of any shelter node (±8%).
 * @param {number}   progress      0-100
 * @param {number[]} shelterNodes
 * @returns {boolean}
 */
export const isAtShelterNode = (progress, shelterNodes = []) =>
  shelterNodes.some((node) => Math.abs(progress - node) <= 8);

/**
 * Get a short atmospheric message for the card play.
 * @param {object} card
 * @param {object} state
 * @returns {string}
 */
const getCardMessage = (card, state) => {
  if (card.type === 'light') {
    const msgs = [
      card.description,
      'The light helps.',
      'You feel more certain.',
      'Forward.',
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  if (card.type === 'dark') {
    const msgs = [
      card.description,
      'Something is wrong.',
      'The darkness presses closer.',
      state.phase === 'night' ? 'Night = run.' : 'The day is fading.',
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
  return card.description;
};
