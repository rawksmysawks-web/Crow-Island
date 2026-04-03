/**
 * DeckEngine.js — Pure functions for card deck management.
 *
 * No side effects — always returns new arrays/objects.
 * Import these into GameContext reducer to manipulate deck state.
 */

import { buildGlobalDeck, SHIELD_CARDS } from '../data/cards';

/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 * @param {any[]} array
 * @returns {any[]}
 */
export const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Initialize the global deck for the entire game.
 * @param {object} firstLevel - The starting level definition.
 * @param {number} deckSize   - The size of the deck based on difficulty.
 * @returns {{ deck: object[], hand: object[], discardPile: object[] }}
 */
export const initializeGameDeck = (firstLevel, deckSize = 30) => {
  const rawDeck = buildGlobalDeck(deckSize).map((c) => ({
    ...c,
    instanceId: `${c.id}_${Math.random().toString(36).substring(2, 9)}`,
  }));
  
  const shuffled = shuffle(rawDeck);
  const hand = [];
  const pool = [...shuffled];

  // Draw initial hand based on level 1 size
  const handSize = firstLevel?.handSize || 4;
  while (hand.length < handSize && pool.length > 0) {
    hand.push(pool.shift());
  }

  return { deck: pool, hand, discardPile: [] };
};

/**
 * Draw `n` cards from the deck into the hand.
 * @param {object[]} deck
 * @param {object[]} hand
 * @param {object[]} discardPile
 * @param {number}   n
 * @param {boolean}  allowDiscovery — if true, rolls for 10% shield discovery
 * @returns {{ deck: object[], hand: object[], discardPile: object[] }}
 */
export const drawCards = (deck, hand, discardPile, n = 1, allowReshuffle = true, allowDiscovery = false) => {
  let newDeck = [...deck];
  let newDiscard = [...discardPile];
  const drawn = [];

  const SHIELD_DISCOVERY_CHANCE = 0.10; // 10% chance to find a shield on draw

  for (let i = 0; i < n; i++) {
    if (newDeck.length === 0) {
      if (allowReshuffle && newDiscard.length > 0) {
        newDeck = shuffle(newDiscard);
        newDiscard = [];
      } else {
        break; // Truly out of cards or reshuffle disabled
      }
    }
    
    let card = newDeck.shift();

    // DYNAMIC SHIELD DISCOVERY (Only if allowed by the caller)
    if (allowDiscovery && Math.random() < SHIELD_DISCOVERY_CHANCE) {
      const shieldTemplate = SHIELD_CARDS[Math.floor(Math.random() * SHIELD_CARDS.length)];
      card = { 
        ...shieldTemplate, 
        instanceId: `discovered_shield_${Math.random().toString(36).substring(2, 9)}_${Date.now()}` 
      };
    }

    drawn.push(card);
  }

  return {
    deck: newDeck,
    hand: [...hand, ...drawn],
    discardPile: newDiscard,
  };
};

/**
 * Remove a card from the hand by id and put it in the discard pile.
 * @param {object[]} hand
 * @param {object[]} discardPile
 * @param {string}   cardId
 * @returns {{ hand: object[], discardPile: object[] }}
 */
export const discardCard = (hand, discardPile, cardId) => {
  const card = hand.find((c) => c.instanceId === cardId || c.id === cardId);
  if (!card) return { hand, discardPile };
  return {
    hand: hand.filter((c) => c.instanceId !== cardId && c.id !== cardId),
    discardPile: [...discardPile, card],
  };
};
