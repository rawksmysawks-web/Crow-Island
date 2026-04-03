/**
 * FearSystem.js — Fear state management and panic event logic.
 *
 * Fear is a 0–100 value. When it hits FEAR_MAX:
 *   1. First time → triggers PANIC event (flashlight minigame)
 *   2. Second time (or panic failed) → game over (FEAR_OVERLOAD)
 *
 * Crow pressure is separate: hits crowMaxPressure → CROW_CAPTURE game over.
 */

export const FEAR_MAX = 100;

/**
 * Apply a fear delta, clamped to [0, FEAR_MAX].
 * During day phase, positive fear is reduced by dayBonus.
 * @param {number} current
 * @param {number} delta
 * @param {string} phase  'day' | 'dusk' | 'night'
 * @param {object} level  level definition
 * @returns {number} new fear value (not yet clamped — caller should handle panic check)
 */
export const applyFear = (current, delta, phase, level) => {
  let adjusted = delta;

  // During day, reduce positive fear gain
  if (delta > 0 && phase === 'day') {
    adjusted = Math.max(0, delta - (level.dayBonus?.fearDecayBonus ?? 0));
  }

  return Math.min(FEAR_MAX, Math.max(0, current + adjusted));
};

/**
 * Apply natural fear decay (called after each card play, not during panic).
 * @param {number} current
 * @param {object} level
 * @param {string} phase
 * @returns {number}
 */
export const decayFear = (current, level, phase) => {
  const baseDecay = level.fearDecayRate ?? 2;
  const bonus = phase === 'day' ? (level.dayBonus?.fearDecayBonus ?? 0) : 0;
  return Math.max(0, current - (baseDecay + bonus));
};



/**
 * Apply a crow pressure delta, clamped to [0, crowMaxPressure].
 * During day, crow pressure growth is limited.
 * @param {number} current
 * @param {number} delta
 * @param {string} phase
 * @param {object} level
 * @returns {{ pressure: number, captured: boolean }}
 */
export const applyCrowPressure = (current, delta, phase, level) => {
  let adjusted = delta;

  if (delta > 0 && phase === 'day') {
    adjusted = Math.min(delta, level.dayBonus?.crowPressureLimit ?? 30);
  }
  if (delta > 0 && phase === 'night') {
    adjusted += level.nightPenalty?.crowPressureBoost ?? 0;
  }

  const pressure = Math.min(level.crowMaxPressure, Math.max(0, current + adjusted));
  const captured = pressure >= level.crowMaxPressure;
  return { pressure, captured };
};

/**
 * Natural night fear penalty — added each turn during night phase.
 * @param {number} current
 * @param {object} level
 * @param {string} phase
 * @returns {number}
 */
export const applyNightPenalty = (current, level, phase) => {
  if (phase !== 'night') return current;
  const penalty = level.nightPenalty?.extraFearPerTurn ?? 0;
  return Math.min(FEAR_MAX, current + penalty);
};
