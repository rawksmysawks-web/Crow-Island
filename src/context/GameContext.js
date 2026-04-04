/**
 * GameContext.js — Global game state using React Context + useReducer.
 *
 * ── State shape ──────────────────────────────────────────────────────────────
 * {
 *   screen:           'title' | 'story' | 'level_intro' | 'game' | 'pause' | 'game_over' | 'win'
 *   currentLevel:     object   — full level definition
 *   phase:            'day' | 'dusk' | 'night'
 *   turnCount:        number   — turns played in current level
 *   fear:             number   — 0–100
 *   hasUsedPanic:     boolean  — has the player already had one panic event?
 *   isPanic:          boolean  — is the flashlight minigame active?
 *   crowPressure:     number   — 0–crowMaxPressure
 *   progress:         number   — 0–100 (level progress %)
 *   shield:           number   — shield charges
 *   nextDarkReduced:  boolean  — next dark card has halved effect
 *   isReducedVis:     boolean  — darkness overlay active
 *   isHallucinating:  boolean  — hallucination overlay active
 *   deck:             object[]
 *   hand:             object[]
 *   discardPile:      object[]
 *   seenEvents:       string[] — ids of triggered story events
 *   activeEvent:      object | null — current popup event
 *   journal:          object[] — discovered clues
 *   cardMessage:      string | null — last played card message
 *   loseReason:       'crow_capture' | 'fear_overload' | null
 *   ending:           'good' | 'escape' | 'dark' | null
 *   isForcedDay:      boolean  — Dawn's Light effect active
 * }
 *
 * ── Actions ──────────────────────────────────────────────────────────────────
 *   PLAY_CARD        { card }
 *   DRAW_CARDS       { n }
 *   DISMISS_EVENT    {}
 *   NEXT_LEVEL       {}
 *   START_GAME       {}
 *   BEGIN_LEVEL      { level }
 *   PANIC_SUCCESS    {}
 *   PANIC_FAIL       {}
 *   TOGGLE_PAUSE     {}
 *   SWAP_CARD        { card }
 *   RESTART          {}
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { LEVELS } from '../data/levels';
import { PANIC_CARD } from '../data/cards';
import { getEventsForLevel, getNextEvent } from '../data/events';
import { buildLevelDeck, drawCards, discardCard } from '../game/DeckEngine';
import { rollRandomEvent } from '../data/randomEvents';
import {
  applyFear,
  decayFear,
  checkFearState,
  applyCrowPressure,
  applyNightPenalty,
  FEAR_MAX,
} from '../game/FearSystem';
import { resolveCard, isAtShelterNode } from '../game/CardEffects';
import { getNextLevel } from '../data/levels';
import { playBackgroundMusic, stopBackgroundMusic, setMuted } from '../game/AudioManager';
import { formatInGameTime } from '../game/TimeSystem';

// ─── Constants ──────────────────────────────────────────────────────────────

const PANIC_FEAR_RESET = 40; // Fear value after a successful panic event

// ─── Initial state ──────────────────────────────────────────────────────────

const makeInitialState = () => ({
  screen: 'title',
  currentLevel: null,
  phase: 'day',
  turnCount: 0,
  fear: 0,
  hasUsedPanic: false,
  isPanic: false,
  crowPressure: 0,
  progress: 0,
  shield: 0,
  nextDarkReduced: false,
  isReducedVis: false,
  isHallucinating: false,
  deck: [],
  hand: [],
  discardPile: [],
  seenEvents: [],
  activeEvent: null,
  journal: [],
  cardMessage: null,
  loseReason: null,
  ending: null,
  isMuted: false,
  lastAction: null,
});

// ─── Helpers ────────────────────────────────────────────────────────────────



const computeEnding = (fear) => {
  if (fear <= 30) return 'good';
  if (fear <= 65) return 'escape';
  return 'dark';
};

// ─── Reducer ────────────────────────────────────────────────────────────────

const gameReducer = (state, action) => {
  switch (action.type) {

    // ── START_GAME ────────────────────────────────────────────────────────────
    case 'START_GAME': {
      playBackgroundMusic();
      const firstLevel = LEVELS[0];
      const initialEntry = {
        id: 'arrival_notes',
        title: 'Arrival Notes',
        body: firstLevel.intro,
        timestamp: '6:00 PM',
      };
      return { 
        ...state, 
        screen: 'story',
        journal: [initialEntry]
      };
    }

    // ── BEGIN_LEVEL ───────────────────────────────────────────────────────────
    case 'BEGIN_LEVEL': {
      const level = action.level ?? LEVELS[0];
      const { deck, hand, discardPile } = buildLevelDeck(level);
      return {
        ...state,
        screen: 'game',
        currentLevel: level,
        phase: level.phase === 'night' ? 'night' : 'day',
        turnCount: 0,
        fear: state.fear, // carry over fear between levels
        hasUsedPanic: state.hasUsedPanic,
        isPanic: false,
        crowPressure: 0,   // reset per level
        progress: 0,
        shield: 0,
        nextDarkReduced: false,
        isReducedVis: false,
        isHallucinating: false,
        deck,
        hand,
        discardPile,
        seenEvents: [],
        activeEvent: null,
        cardMessage: null,
        loseReason: null,
      };
    }

    // ── PLAY_CARD ─────────────────────────────────────────────────────────────
    case 'PLAY_CARD': {
      const { card } = action;
      const { currentLevel: level, hand, deck, discardPile, seenEvents } = state;

      if (!level) return state;

      // Resolve the card
      const delta = resolveCard(card, state, level);

      // Compute effective phase
      const effectivePhase = level.phase;

      // Apply fear
      let newFear = applyFear(state.fear, delta.fearDelta, effectivePhase, level);
      // Decay on card play
      newFear = decayFear(newFear, level, effectivePhase);
      // Night penalty
      newFear = applyNightPenalty(newFear, level, effectivePhase);

      // Crow pressure
      let { pressure: newCrowPressure, captured } = applyCrowPressure(
        state.crowPressure,
        delta.crowPressureDelta,
        effectivePhase,
        level,
      );

      // Shield
      let newShield = Math.max(0, state.shield + (delta.shieldDelta ?? 0));

      // Progress (clamp 0-100)
      const rawProgress = state.progress + (delta.progressDelta ?? 0);
      let newProgress = Math.min(100, Math.max(0, rawProgress));

      // Turn count and phase update
      const newTurnCount = state.turnCount + 1;
      const newPhase = level.phase;

      // Discard played card, then draw back up to hand size
      const afterDiscard = discardCard(hand, discardPile, card.instanceId);
      
      const targetHandSize = level.handSize || 4;
      const cardsToDraw = targetHandSize - afterDiscard.hand.length;
      
      // -- CARD SABOTAGE (Panic) --
      // If fear is very high, there's a 50% chance the next card drawn is a Panic card
      const shouldPanic = newFear > 85 && Math.random() > 0.5 && card.id !== 'panic';
      let afterDraw;
      
      if (shouldPanic && cardsToDraw > 0) {
        afterDraw = {
          deck: afterDiscard.deck ?? deck,
          hand: [...afterDiscard.hand, { ...PANIC_CARD, instanceId: `panic_${Date.now()}` }],
          discardPile: afterDiscard.discardPile,
        };
        // If we needed more than 1, draw the rest normally
        if (cardsToDraw > 1) {
          afterDraw = drawCards(afterDraw.deck, afterDraw.hand, afterDraw.discardPile, cardsToDraw - 1);
        }
      } else if (cardsToDraw > 0) {
        afterDraw = drawCards(afterDiscard.deck ?? deck, afterDiscard.hand, afterDiscard.discardPile, cardsToDraw);
      } else {
        afterDraw = {
          deck: afterDiscard.deck ?? deck,
          hand: afterDiscard.hand,
          discardPile: afterDiscard.discardPile,
        };
      }

      // ── Check for Empty Deck/Hand (GameOver) ────────────────────────────────
      // If player has no cards and can't draw more, and hasn't reached 100%
      if (afterDraw.hand.length === 0 && afterDraw.deck.length === 0 && newProgress < 100) {
        return {
          ...state,
          ...delta,
          fear: newFear,
          progress: newProgress,
          crowPressure: newCrowPressure,
          screen: 'game_over',
          loseReason: 'fear_overload', // Generic for now, or 'stranded'
          activeEvent: {
            title: 'STRANDED',
            body: 'You have run out of resources. The island has won.',
            icon: '💀'
          }
        };
      }

      // Handle special effects from card
      let isHallucinating = state.isHallucinating;
      let isReducedVis = state.isReducedVis;
      let nextDarkReduced = state.nextDarkReduced;

      if (delta.special === 'hallucinate') isHallucinating = true;
      if (delta.special === 'reduce_visibility') isReducedVis = true;
      if (delta.special === 'reduce_next_dark') nextDarkReduced = true;

      // Undo hallucination / visibility after one turn if not a dark card
      if (state.isHallucinating && card.type !== 'dark') isHallucinating = false;
      if (state.isReducedVis && card.type !== 'dark') isReducedVis = false;


      // ── Random Events ───────────────────────────────────────────────────────
      let randomEvent = null;
      let eventMessage = null;
      if (card.type === 'movement') {
         randomEvent = rollRandomEvent(newPhase);
         if (randomEvent) {
           if (randomEvent.choices) {
               activeEvent = {
                   ...randomEvent,
                   title: randomEvent.name,
                   text: randomEvent.message,
                   icon: '⚠️'
               };
           } else {
               newFear = applyFear(newFear, randomEvent.effect?.fearDelta ?? 0, effectivePhase, level);
               newProgress = Math.min(100, Math.max(0, newProgress + (randomEvent.effect?.progressDelta ?? 0)));
               const ce = applyCrowPressure(newCrowPressure, randomEvent.effect?.crowPressure ?? 0, effectivePhase, level);
               newCrowPressure = ce.pressure;
               eventMessage = randomEvent.message;
           }
         }
      }

      // ── Check win ──────────────────────────────────────────────────────────
      if (newProgress >= 100) {
        const nextLevel = getNextLevel(level.id);
        if (!nextLevel) {
          // Final level complete → win
          return {
            ...state,
            screen: 'win',
            progress: 100,
            fear: newFear,
            ending: computeEnding(newFear),
          };
        }
        // Advance to next level intro
        return {
          ...state,
          progress: 100,
          fear: newFear,
          screen: 'level_intro',
          currentLevel: nextLevel,
        };
      }

      // ── Check crow capture ────────────────────────────────────────────────
      if (captured) {
        return {
          ...state,
          screen: 'game_over',
          loseReason: 'crow_capture',
          crowPressure: newCrowPressure,
        };
      }

      // ── Check fear state (Panic Redesign) ─────────────────────────────────
      // The fear state triggers a check at 100 fear. If the player has a shield,
      // the shield shatters, fear goes down to 50, and they survive.
      // If no shield, they are captured.
      if (newFear >= FEAR_MAX) {
        if (newShield > 0) {
           newShield -= 1;
           newFear = 50;
           delta.message = "A shield shattered! You narrowly avoided panic.";
        } else {
           return {
             ...state,
             screen: 'game_over',
             loseReason: 'fear_overload',
             fear: FEAR_MAX,
           };
        }
      }

      // ── Check story events ────────────────────────────────────────────────
      const levelEvents = getEventsForLevel(level.id);
      const nextEvent = getNextEvent(levelEvents, newProgress, seenEvents);
      let newSeenEvents = [...seenEvents];
      let activeEvent = state.activeEvent;
      let newJournal = [...state.journal];

      if (nextEvent) {
        // Story event takes precedence
        newSeenEvents = [...seenEvents, nextEvent.id];
        activeEvent = nextEvent;
        if (nextEvent.isJournal) newJournal = [...newJournal, nextEvent];
      } else if (randomEvent) {
        // If no story event triggers, show the random event
        activeEvent = {
           id: randomEvent.id,
           title: randomEvent.name,
           text: randomEvent.message,
           icon: randomEvent.type === 'good' ? '💡' : '⚠️',
           buttons: [{ text: 'Continue', action: 'DISMISS_EVENT' }]
        };
      }

      return {
        ...state,
        fear: newFear,
        crowPressure: newCrowPressure,
        progress: newProgress,
        shield: newShield,
        turnCount: newTurnCount,
        phase: newPhase,
        deck: afterDraw.deck,
        hand: afterDraw.hand,
        discardPile: afterDraw.discardPile,
        seenEvents: newSeenEvents,
        activeEvent,
        journal: newJournal,
        cardMessage: delta.message || eventMessage,
        lastAction: `Played ${card.name}`,
      };
    }

    // ── DRAW_CARDS ────────────────────────────────────────────────────────────
    case 'DRAW_CARDS': {
      const result = drawCards(state.deck, state.hand, state.discardPile, action.n ?? 1);
      return { ...state, ...result };
    }

    // ── SWAP_CARD ─────────────────────────────────────────────────────────────
    case 'SWAP_CARD': {
      const { card } = action;
      const { currentLevel: level, hand, deck, discardPile } = state;
      if (!level) return state;

      // Swap penalty: +2 Fear flat (bypass day bonus for swap), advance turn count.
      let newFear = Math.min(FEAR_MAX, state.fear + 2);
      newFear = applyNightPenalty(newFear, level, level.phase);
      const newTurnCount = state.turnCount + 1;

      // Discard and draw replacement
      const afterDiscard = discardCard(hand, discardPile, card.id);
      const afterDraw = drawCards(afterDiscard.deck ?? deck, afterDiscard.hand, afterDiscard.discardPile, 1);

      return {
        ...state,
        fear: newFear,
        turnCount: newTurnCount,
        deck: afterDraw.deck,
        hand: afterDraw.hand,
        discardPile: afterDraw.discardPile,
        cardMessage: `Swapped away ${card.name}... time is wasting.`,
      };
    }

    // ── THINK ─────────────────────────────────────────────────────────────────
    case 'THINK': {
      const { currentLevel: level, phase, fear, crowPressure, progress, hand, deck, discardPile, seenEvents } = state;
      if (!level) return state;

      let newFear = fear;
      let newCrowPressure = crowPressure;
      let newProgress = progress;
      let message = "";

      // ── Default background effects (The 'Skip Turn' cost/benefit) ──────────
      if (phase === 'day') {
        newFear = Math.max(0, fear - 5);
        message = "You take a moment to breathe. The island feels almost... peaceful.";
      } else {
        newFear = Math.min(FEAR_MAX, fear + 10);
        newCrowPressure = Math.min(level.crowMaxPressure, crowPressure + 5);
        message = "You pause, but the shadows only grow longer. Something is watching.";
      }

      // ── Random Event Roll (The 'Gamble') ───────────────────────────────────
      const randomEvent = rollRandomEvent(phase);
      let activeEvent = state.activeEvent;

      if (randomEvent) {
        if (randomEvent.choices) {
          activeEvent = {
            ...randomEvent,
            title: randomEvent.name,
            text: randomEvent.message,
            icon: '⚠️'
          };
        } else {
          newFear = applyFear(newFear, randomEvent.effect?.fearDelta ?? 0, phase, level);
          newProgress = Math.min(100, Math.max(0, newProgress + (randomEvent.effect?.progressDelta ?? 0)));
          const ce = applyCrowPressure(newCrowPressure, randomEvent.effect?.crowPressure ?? 0, phase, level);
          newCrowPressure = ce.pressure;

          activeEvent = {
            id: randomEvent.id,
            title: randomEvent.name,
            text: randomEvent.message,
            icon: randomEvent.type === 'good' ? '💡' : '⚠️',
            buttons: [{ text: 'Continue', action: 'DISMISS_EVENT' }]
          };
        }
      }

      const afterDraw = drawCards(deck, hand, discardPile, 1);
      const newTurnCount = state.turnCount + 1;

      return {
        ...state,
        fear: newFear,
        crowPressure: newCrowPressure,
        progress: newProgress,
        turnCount: newTurnCount,
        deck: afterDraw.deck,
        hand: afterDraw.hand,
        discardPile: afterDraw.discardPile,
        cardMessage: message,
        activeEvent,
        lastAction: 'Used Tactical Think',
      };
    }

    // ── DISMISS_EVENT ─────────────────────────────────────────────────────────
    case 'DISMISS_EVENT': {
      return { ...state, activeEvent: null };
    }

    // ── MAKE_CHOICE ───────────────────────────────────────────────────────────
    case 'MAKE_CHOICE': {
      const { choice } = action;
      const { effect } = choice;
      const level = state.currentLevel;

      let newFear = applyFear(state.fear, effect.fearDelta ?? 0, state.phase, level);
      let newProgress = Math.min(100, Math.max(0, state.progress + (effect.progressDelta ?? 0)));
      let { pressure: newCrowPressure } = applyCrowPressure(state.crowPressure, effect.crowPressureDelta ?? 0, state.phase, level);

      let newJournal = [...state.journal];
      if (effect.journal) {
        newJournal.push({
          id: `choice_${Date.now()}`,
          title: state.activeEvent.title,
          text: effect.journal,
        });
      }

      return {
        ...state,
        fear: newFear,
        progress: newProgress,
        crowPressure: newCrowPressure,
        journal: newJournal,
        activeEvent: null,
        lastAction: `Chose: ${choice.text}`,
      };
    }

    // ── PANIC_SUCCESS ─────────────────────────────────────────────────────────
    case 'PANIC_SUCCESS': {
      return {
        ...state,
        isPanic: false,
        fear: PANIC_FEAR_RESET,
        isHallucinating: false,
        cardMessage: 'The flashlight flickers back on. You breathe.',
      };
    }

    // ── PANIC_FAIL ────────────────────────────────────────────────────────────
    case 'PANIC_FAIL': {
      return {
        ...state,
        isPanic: false,
        screen: 'game_over',
        loseReason: 'fear_overload',
      };
    }

    // ── NEXT_LEVEL ────────────────────────────────────────────────────────────
    case 'NEXT_LEVEL': {
      const level = state.currentLevel;
      const { deck, hand, discardPile } = buildLevelDeck(level);
      return {
        ...state,
        screen: 'game',
        phase: level.phase === 'night' ? 'night' : 'day',
        turnCount: 0,
        crowPressure: 0,
        progress: 0,
        shield: 0,
        nextDarkReduced: false,
        isReducedVis: false,
        isHallucinating: false,
        deck,
        hand,
        discardPile,
        seenEvents: [],
        activeEvent: null,
        cardMessage: null,
        loseReason: null,
      };
    }

    // ── TOGGLE_PAUSE ──────────────────────────────────────────────────────────
    case 'TOGGLE_MUTE': {
      const newMuted = !state.isMuted;
      setMuted(newMuted);
      return { ...state, isMuted: newMuted };
    }

    case 'TOGGLE_PAUSE': {
      return {
        ...state,
        screen: state.screen === 'pause' ? 'game' : 'pause',
      };
    }

    // ── TOGGLE_JOURNAL ────────────────────────────────────────────────────────
    case 'TOGGLE_JOURNAL': {
      return {
        ...state,
        screen: state.screen === 'journal' ? 'pause' : 'journal',
      };
    }

    // ── RESTART ───────────────────────────────────────────────────────────────
    case 'RESTART': {
      return makeInitialState();
    }

    default:
      return state;
  }
};

// ─── Context + Provider ─────────────────────────────────────────────────────

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, makeInitialState());

  // Convenience action creators
  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), []);
  const beginLevel = useCallback((level) => dispatch({ type: 'BEGIN_LEVEL', level }), []);
  const playCard = useCallback((card) => dispatch({ type: 'PLAY_CARD', card }), []);
  const drawMoreCards = useCallback((n = 1) => dispatch({ type: 'DRAW_CARDS', n }), []);
  const dismissEvent = useCallback(() => dispatch({ type: 'DISMISS_EVENT' }), []);
  const makeChoice = useCallback((choice) => dispatch({ type: 'MAKE_CHOICE', choice }), []);
  const nextLevel = useCallback(() => dispatch({ type: 'NEXT_LEVEL' }), []);
  const panicSuccess = useCallback(() => dispatch({ type: 'PANIC_SUCCESS' }), []);
  const panicFail = useCallback(() => dispatch({ type: 'PANIC_FAIL' }), []);
  const togglePause = useCallback(() => dispatch({ type: 'TOGGLE_PAUSE' }), []);
  const toggleJournal = useCallback(() => dispatch({ type: 'TOGGLE_JOURNAL' }), []);
  const swapCard = useCallback((card) => dispatch({ type: 'SWAP_CARD', card }), []);
  const think = useCallback(() => dispatch({ type: 'THINK' }), []);
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        startGame,
        beginLevel,
        playCard,
        drawMoreCards,
        dismissEvent,
        makeChoice,
        nextLevel,
        panicSuccess,
        panicFail,
        togglePause,
        toggleJournal,
        swapCard,
        think,
        restart,
        toggleMute: useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []),
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

/**
 * Hook to access the game context.
 * Must be used inside <GameProvider>.
 */
export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
};

export default GameContext;
